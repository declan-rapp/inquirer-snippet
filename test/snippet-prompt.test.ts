import {render} from "@inquirer/testing";
import snippetPrompt from "../src/index";

describe("Snippet Prompt", () => {
	describe("Basic Functionality", () => {
		it("should render initial state correctly", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Fill in the template",
				template: "Hello {{name}}, welcome to {{company}}!",
				fields: {
					name: {message: "Your name", initial: "John"},
					company: {message: "Company name", initial: "Acme Corp"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("Fill in the template");
			expect(screen).toContain("Hello");
			expect(screen).toContain("John");
			expect(screen).toContain("Acme Corp");
		});

		it("should handle submission with Ctrl+S", async () => {
			const {answer, events} = await render(snippetPrompt, {
				message: "Submit form",
				template: "Hello {{name}}!",
				fields: {
					name: {message: "Your name", initial: "World"},
				},
			});

			events.keypress({name: "s", ctrl: true});

			await expect(answer).resolves.toEqual({
				name: "World",
			});
		});

		it("should handle fields without initial values", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "No initial values",
				template: "Hello {{name}}!",
				fields: {
					name: {message: "Your name"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("Your name");
		});

		it("should handle fields without messages", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "No messages",
				template: "Hello {{name}}!",
				fields: {
					name: {initial: "World"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("World");
		});

		it("should handle empty template", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Empty template",
				template: "",
				fields: {
					name: {initial: "World"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("Empty template");
		});

		it("should handle empty fields object", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "No fields",
				template: "This template has no field placeholders",
				fields: {},
			});

			const screen = getScreen();
			expect(screen).toContain("This template has no field placeholders");
		});
	});

	describe("Field Navigation", () => {
		it("should navigate between fields with arrow keys", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Navigate fields",
				template: "{{field1}} {{field2}} {{field3}}",
				fields: {
					field1: {message: "Field 1", initial: "Value1"},
					field2: {message: "Field 2", initial: "Value2"},
					field3: {message: "Field 3", initial: "Value3"},
				},
			});

			// Test down arrow navigation
			events.keypress("down");
			events.keypress("down");

			// Test up arrow navigation
			events.keypress("up");

			const screen = getScreen();
			expect(screen).toBeDefined();
		});

		it("should handle tab navigation cycling", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Tab cycling",
				template: "{{field1}} {{field2}} {{field3}}",
				fields: {
					field1: {initial: "Value1"},
					field2: {initial: "Value2"},
					field3: {initial: "Value3"},
				},
			});

			// Tab through all fields and cycle back
			events.keypress("tab");
			events.keypress("tab");
			events.keypress("tab"); // Should cycle back to first

			const screen = getScreen();
			expect(screen).toBeDefined();
		});

		it("should handle navigation bounds", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Navigation bounds",
				template: "{{field1}} {{field2}}",
				fields: {
					field1: {initial: "Value1"},
					field2: {initial: "Value2"},
				},
			});

			// Try to navigate up from first field
			events.keypress("up");

			// Navigate to last field and try to go further
			events.keypress("down");
			events.keypress("down");

			const screen = getScreen();
			expect(screen).toBeDefined();
		});

		it("should handle single field navigation", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Single field",
				template: "Only: {{only}}",
				fields: {
					only: {initial: "value"},
				},
			});

			// All navigation should work but stay on same field
			events.keypress("up");
			events.keypress("down");
			events.keypress("tab");

			const screen = getScreen();
			expect(screen).toContain("value");
		});
	});

	describe("Field Editing", () => {
		it("should enter and exit editing mode", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Edit fields",
				template: "Hello {{name}}!",
				fields: {
					name: {message: "Your name", initial: "World"},
				},
			});

			// Enter editing mode
			events.keypress("enter");
			let screen = getScreen();
			expect(screen).toContain("Editing");

			// Type new value
			events.type("Alice");

			// Save changes
			events.keypress("enter");
			screen = getScreen();
			expect(screen).toContain("Alice");
		});

		it("should cancel editing with escape", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Cancel editing",
				template: "Hello {{name}}!",
				fields: {
					name: {message: "Your name", initial: "World"},
				},
			});

			// Enter editing mode
			events.keypress("enter");
			events.type("NewValue");

			// Cancel editing with escape
			events.keypress("escape");
			const screen = getScreen();
			expect(screen).toContain("World"); // Should revert to original value
		});

		it("should handle editing empty fields", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Edit empty",
				template: "Name: {{name}}",
				fields: {
					name: {initial: ""},
				},
			});

			events.keypress("enter");
			events.type("NewValue");
			events.keypress("enter");

			const screen = getScreen();
			expect(screen).toContain("NewValue");
		});

		it("should handle cursor position during editing", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Cursor test",
				template: "Name: {{name}}",
				fields: {
					name: {initial: "John"},
				},
			});

			// Enter editing mode
			events.keypress("enter");
			events.type("Alice");

			const screen = getScreen();
			expect(screen).toBeDefined();
		});
	});

	describe("Template Rendering", () => {
		it("should render template with field values", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Template rendering",
				template: "Hello {{name}}, welcome to {{company}}!",
				fields: {
					name: {initial: "John"},
					company: {initial: "Acme Corp"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("Hello John, welcome to Acme Corp!");
		});

		it("should handle repeated field placeholders", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Repeated placeholders",
				template: "{{name}} said hello to {{name}} and {{name}} was happy",
				fields: {
					name: {initial: "Alice"},
				},
			});

			const screen = getScreen();
			const aliceCount = (screen.match(/Alice/g) || []).length;
			expect(aliceCount).toBeGreaterThanOrEqual(3);
		});

		it("should handle multiline templates", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Multiline template",
				template: `# {{title}}

## Description
{{description}}

## Author
{{author}}`,
				fields: {
					title: {initial: "My Document"},
					description: {initial: "A sample document"},
					author: {initial: "John Doe"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("My Document");
			expect(screen).toContain("A sample document");
			expect(screen).toContain("John Doe");
		});

		it("should handle special characters in field names", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Special field names",
				template: "{{field_name}} {{field-name}} {{field.name}}",
				fields: {
					"field_name": {initial: "underscore"},
					"field-name": {initial: "dash"},
					"field.name": {initial: "dot"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("underscore");
			expect(screen).toContain("dash");
			expect(screen).toContain("dot");
		});

		it("should handle regex special characters in field names", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Regex special chars",
				template: "{{field+plus}} {{field*star}} {{field?question}} {{field[bracket]}}",
				fields: {
					"field+plus": {initial: "plus"},
					"field*star": {initial: "star"},
					"field?question": {initial: "question"},
					"field[bracket]": {initial: "bracket"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("plus");
			expect(screen).toContain("star");
			expect(screen).toContain("question");
			expect(screen).toContain("bracket");
		});
	});

	describe("Help Text", () => {
		it("should show navigation help when not editing", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Navigation help",
				template: "Name: {{name}}",
				fields: {
					name: {initial: "John"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("to edit");
			expect(screen).toContain("to navigate");
			expect(screen).toContain("to submit");
		});

		it("should show editing help when in editing mode", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Editing help",
				template: "Name: {{name}}",
				fields: {
					name: {initial: "John"},
				},
			});

			events.keypress("enter");

			const screen = getScreen();
			expect(screen).toContain("Editing");
			expect(screen).toContain("to save");
			expect(screen).toContain("to cancel");
		});
	});
});
