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
import {SelectOption, SnippetConfig, SnippetField, SnippetResult, SnippetTheme, StyleFunction, ValidationFunction} from "./types";

// Export all types for external use
export type {SelectOption, SnippetConfig, SnippetField, SnippetResult, SnippetTheme, StyleFunction, ValidationFunction};

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
	const [selectingField, setSelectingField] = useState<string | null>(null);
	const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

	const prefix = usePrefix({status, theme});

	// Helper function to normalize select options
	const normalizeOptions = (options: string[] | SelectOption[]): SelectOption[] => {
		return options.map((option) => (typeof option === "string" ? {name: option, value: option} : option));
	};

	// Helper function to check if a field is a select field
	const isSelectField = (fieldName: string): boolean => {
		const field = config.fields[fieldName];
		return !!(field?.options && field.options.length > 0);
	};

	// eslint-disable-next-line @typescript-eslint/require-await
	const userHandler = async (key: KeypressEvent, rl: InquirerReadline) => {
		if (selectingField) {
			// Handle select field mode
			const field = config.fields[selectingField];
			const options = normalizeOptions(field?.options || []);

			if (isEnterKey(key)) {
				// Select the current option
				const selectedOption = options[selectedOptionIndex];
				if (selectedOption) {
					setValues({...values, [selectingField]: selectedOption.value} as Record<string, string>);
				}
				setSelectingField(null);
				setSelectedOptionIndex(0);
			} else if (key.name === "escape") {
				// Cancel selection
				setSelectingField(null);
				setSelectedOptionIndex(0);
			} else if (isUpKey(key)) {
				setSelectedOptionIndex(Math.max(0, selectedOptionIndex - 1));
			} else if (isDownKey(key)) {
				setSelectedOptionIndex(Math.min(options.length - 1, selectedOptionIndex + 1));
			}
		} else if (editingField) {
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
				// Enter starts editing the current field or opens select options
				const fieldName = fieldNames[activeFieldIndex];
				if (fieldName) {
					if (isSelectField(fieldName)) {
						// Open select options
						setSelectingField(fieldName);
						const field = config.fields[fieldName];
						const options = normalizeOptions(field?.options || []);
						// Find current value index or default to 0
						const currentValue = values[fieldName] || "";
						const currentIndex = options.findIndex((opt) => opt.value === currentValue);
						setSelectedOptionIndex(currentIndex >= 0 ? currentIndex : 0);
					} else {
						// Start text editing
						setEditingField(fieldName);
						const currentValue = values[fieldName] || "";
						setFieldInput(currentValue);
						setCursorPosition(currentValue.length);
						// Clear the line first, then write the current value
						rl.line = "";
						rl.write(currentValue); // Pre-fill the input
					}
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
			const isActive = index === activeFieldIndex && !editingField && !selectingField;
			const isSelecting = selectingField === fieldName;
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
				} else if (isSelecting) {
					// Show value with selection indicator
					displayValue = `\x1b[7m${value}\x1b[27m`;
				} else {
					displayValue = isActive ? theme.style.activeField(value) : theme.style.field(value);
				}
			} else {
				const placeholderText = field?.message || fieldName;
				if (isEditing) {
					// Show cursor on empty field when editing
					displayValue = `\x1b[7m \x1b[27m`;
				} else if (isSelecting) {
					// Show placeholder with selection indicator
					displayValue = `\x1b[7m\x1b[2m${placeholderText}\x1b[22m\x1b[27m`;
				} else {
					displayValue = isActive ? theme.style.activePlaceholder(placeholderText) : theme.style.placeholder(placeholderText);
				}
			}

			rendered = rendered.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), displayValue);
		});

		return rendered;
	};

	// Render select options when in selection mode
	const renderSelectOptions = (): string => {
		if (!selectingField) return "";

		const field = config.fields[selectingField];
		const options = normalizeOptions(field?.options || []);

		const optionLines = options.map((option, index) => {
			const isSelected = index === selectedOptionIndex;
			const prefix = isSelected ? "❯ " : "  ";
			const text = isSelected ? `\x1b[7m${option.name}\x1b[27m` : option.name;
			return `${prefix}${text}`;
		});

		return optionLines.join("\n");
	};

	const message = theme.style.message(config.message, status);
	const snippet = renderSnippet();

	let helpText = "";
	if (selectingField) {
		const enterKey = theme.style.key("enter");
		const escKey = theme.style.key("esc");
		const arrowKeys = theme.style.key("↑↓");
		const helpMsg = `Selecting ${selectingField} - ${arrowKeys} to navigate, ${enterKey} to select, ${escKey} to cancel`;
		helpText = theme.style.help(helpMsg);
	} else if (editingField) {
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
	const selectOptions = renderSelectOptions();
	const content = [snippet, selectOptions, helpText, error].filter(Boolean).join("\n");

	return [output, content];
});

export default snippetPrompt;
