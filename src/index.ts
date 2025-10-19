import {
	createPrompt,
	isDownKey,
	isEnterKey,
	isUpKey,
	KeypressEvent,
	makeTheme,
	useKeypress,
	usePrefix,
	useState,
	type Status,
} from "@inquirer/core";
import {InquirerReadline} from "@inquirer/type";
import {SnippetConfig, SnippetField, SnippetResult, SnippetTheme, StyleFunction, ValidationFunction} from "./types";

// Export all types for external use
export type {SnippetConfig, SnippetField, SnippetResult, SnippetTheme, StyleFunction, ValidationFunction};

const snippetTheme: SnippetTheme = {
	validationFailureMode: "keep",
	style: {
		field: (text: string) => text,
		activeField: (text: string) => `\x1b[7m${text}\x1b[27m`, // Inverted colors
		placeholder: (text: string) => `\x1b[2m${text}\x1b[22m`, // Dim
		activePlaceholder: (text: string) => `\x1b[7m\x1b[2m${text}\x1b[22m\x1b[27m`, // Inverted + dim
	},
};

/**
 * Creates an interactive snippet prompt for editing multiline templates with placeholders.
 *
 * @param config - Configuration object containing message, template, fields, and optional validation
 * @returns Promise that resolves to an object containing all field values
 *
 * @example
 * ```typescript
 * import snippetPrompt from 'inquirer-snippet-question';
 *
 * const result = await snippetPrompt({
 *   message: 'Fill in the template:',
 *   template: 'Hello {{name}}, welcome to {{company}}!',
 *   fields: {
 *     name: { message: 'Your name', initial: 'John', required: true },
 *     company: { message: 'Company name', initial: 'Acme Corp' }
 *   },
 *   validate: (values) => {
 *     if (!values.name.trim()) return 'Name is required';
 *     return true;
 *   }
 * });
 *
 * console.log(result); // { name: 'John', company: 'Acme Corp' }
 * ```
 */
const snippetPrompt = createPrompt<SnippetResult, SnippetConfig>((config, done) => {
	const {validate} = config;
	const theme = makeTheme<SnippetTheme>(snippetTheme, config.theme);

	const [status, setStatus] = useState<Status>("idle");
	const [errorMsg, setError] = useState<string>();

	// Initialize field values
	const fieldNames = Object.keys(config.fields);
	const initialValues: Record<string, string> = {};
	fieldNames.forEach((name) => {
		initialValues[name] = config.fields[name]?.initial || "";
	});

	const [values, setValues] = useState<Record<string, string>>(initialValues);
	const [activeFieldIndex, setActiveFieldIndex] = useState(0);
	const [editingField, setEditingField] = useState<string | null>(null);
	const [fieldInput, setFieldInput] = useState("");
	const [cursorPosition, setCursorPosition] = useState(0);

	const prefix = usePrefix({status, theme});

	// eslint-disable-next-line @typescript-eslint/require-await
	const userHandler = async (key: KeypressEvent, rl: InquirerReadline) => {
		if (editingField) {
			// Handle field editing mode
			if (isEnterKey(key)) {
				// Save field value and exit editing mode
				setValues({...values, [editingField]: fieldInput} as Record<string, string>);
				setEditingField(null);
				setFieldInput("");
				setCursorPosition(0);
				rl.write(""); // Clear the line
			} else if (key.name === "escape") {
				// Cancel editing
				setEditingField(null);
				setFieldInput("");
				setCursorPosition(0);
				rl.write(""); // Clear the line
			} else {
				// Update field input and cursor position
				setFieldInput(rl.line);
				setCursorPosition(rl.line.length);
			}
		} else {
			// Handle navigation mode
			// Handle Ctrl+S for submission (when not editing)
			if (key.ctrl && key.name === "s") {
				// Ctrl+S submits the form
				setStatus("loading");
				const isValid = validate?.(values) ?? true;
				if (isValid === true) {
					setStatus("done");
					done(values);
				} else {
					setError(typeof isValid === "string" ? isValid : "Invalid values provided");
					setStatus("idle");
				}
			} else if (isEnterKey(key)) {
				// Enter starts editing the current field
				const fieldName = fieldNames[activeFieldIndex];
				if (fieldName) {
					setEditingField(fieldName);
					const currentValue = values[fieldName] || "";
					setFieldInput(currentValue);
					setCursorPosition(currentValue.length);
					rl.write(currentValue); // Pre-fill the input
				}
			} else if (isUpKey(key)) {
				setActiveFieldIndex(Math.max(0, activeFieldIndex - 1));
			} else if (isDownKey(key)) {
				setActiveFieldIndex(Math.min(fieldNames.length - 1, activeFieldIndex + 1));
			} else if (key.name === "tab") {
				// Tab moves to next field
				setActiveFieldIndex((activeFieldIndex + 1) % fieldNames.length);
			}
		}
	};

	useKeypress(userHandler);

	// Render the snippet with field values
	const renderSnippet = (): string => {
		let rendered = config.template;

		fieldNames.forEach((fieldName, index) => {
			const field = config.fields[fieldName];
			// Use fieldInput if currently editing this field, otherwise use saved value
			const value = editingField === fieldName ? fieldInput : values[fieldName] || "";
			const isActive = index === activeFieldIndex && !editingField;
			const isEditing = editingField === fieldName;
			const placeholder = `{{${fieldName}}}`;

			let displayValue: string;
			if (value) {
				if (isEditing) {
					// Show cursor when editing
					const beforeCursor = value.slice(0, cursorPosition);
					const atCursor = value.slice(cursorPosition, cursorPosition + 1) || " ";
					const afterCursor = value.slice(cursorPosition + 1);
					displayValue = beforeCursor + `\x1b[7m${atCursor}\x1b[27m` + afterCursor;
				} else {
					displayValue = isActive ? theme.style.activeField(value) : theme.style.field(value);
				}
			} else {
				const placeholderText = field?.message || fieldName;
				if (isEditing) {
					// Show cursor on empty field when editing
					displayValue = `\x1b[7m \x1b[27m`;
				} else {
					displayValue = isActive ? theme.style.activePlaceholder(placeholderText) : theme.style.placeholder(placeholderText);
				}
			}

			rendered = rendered.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), displayValue);
		});

		return rendered;
	};

	const message = theme.style.message(config.message, status);
	const snippet = renderSnippet();

	let helpText = "";
	if (editingField) {
		const enterKey = theme.style.key("enter");
		const escKey = theme.style.key("esc");
		const helpMsg = `Editing ${editingField} - Press ${enterKey} to save, ${escKey} to cancel`;
		helpText = theme.style.help(helpMsg);
	} else {
		const enterKey = theme.style.key("enter");
		const submitKey = theme.style.key("ctrl+s");
		const arrowKeys = theme.style.key("↑↓");
		const helpMsg = `${enterKey} to edit, ${arrowKeys} to navigate, ${submitKey} to submit`;
		helpText = theme.style.help(helpMsg);
	}

	let error = "";
	if (errorMsg) {
		error = theme.style.error(errorMsg);
	}

	const output = [prefix, message].filter(Boolean).join(" ");
	const content = [snippet, helpText, error].filter(Boolean).join("\n");

	return [output, content];
});

export default snippetPrompt;
