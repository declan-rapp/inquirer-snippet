import {render} from "@inquirer/testing";
import snippetPrompt from "../src/index";

describe("Select Fields", () => {
	describe("Basic Select Functionality", () => {
		it("should render select field with string options", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Select field test",
				template: "Environment: {{env}}",
				fields: {
					env: {
						message: "Environment",
						options: ["development", "staging", "production"],
						initial: "development",
					},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("Environment: development");
		});

		it("should render select field with object options", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Select with objects",
				template: "Size: {{size}}",
				fields: {
					size: {
						message: "T-shirt size",
						options: [
							{name: "Small", value: "S"},
							{name: "Medium", value: "M"},
							{name: "Large", value: "L"},
						],
						initial: "M",
					},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("Size: M");
		});

		it("should open select options when pressing enter on select field", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Open select options",
				template: "Color: {{color}}",
				fields: {
					color: {
						message: "Color",
						options: ["red", "green", "blue"],
						initial: "red",
					},
				},
			});

			// Press enter to open select options
			events.keypress("enter");

			const screen = getScreen();
			expect(screen).toContain("❯ red");
			expect(screen).toContain("  green");
			expect(screen).toContain("  blue");
		});

		it("should navigate through select options with arrow keys", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Navigate options",
				template: "Option: {{option}}",
				fields: {
					option: {
						options: ["first", "second", "third"],
						initial: "first",
					},
				},
			});

			// Open select options
			events.keypress("enter");

			// Navigate down
			events.keypress("down");
			let screen = getScreen();
			expect(screen).toContain("  first");
			expect(screen).toContain("❯ second");

			// Navigate down again
			events.keypress("down");
			screen = getScreen();
			expect(screen).toContain("❯ third");

			// Navigate up
			events.keypress("up");
			screen = getScreen();
			expect(screen).toContain("❯ second");
		});

		it("should select option with enter key", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Select option",
				template: "Choice: {{choice}}",
				fields: {
					choice: {
						options: ["option1", "option2", "option3"],
						initial: "option1",
					},
				},
			});

			// Open select options
			events.keypress("enter");

			// Navigate to second option
			events.keypress("down");

			// Select the option
			events.keypress("enter");

			const screen = getScreen();
			expect(screen).toContain("Choice: option2");
		});

		it("should cancel selection with escape key", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Cancel selection",
				template: "Value: {{value}}",
				fields: {
					value: {
						options: ["a", "b", "c"],
						initial: "a",
					},
				},
			});

			// Open select options
			events.keypress("enter");

			// Navigate to different option
			events.keypress("down");

			// Cancel with escape
			events.keypress("escape");

			const screen = getScreen();
			expect(screen).toContain("Value: a"); // Should remain original value
		});
	});

	describe("Mixed Field Types", () => {
		it("should handle mix of text and select fields", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Mixed fields",
				template: "Name: {{name}}, Environment: {{env}}, Version: {{version}}",
				fields: {
					name: {
						message: "Project name",
						initial: "MyProject",
					},
					env: {
						message: "Environment",
						options: ["dev", "prod"],
						initial: "dev",
					},
					version: {
						message: "Version",
						initial: "1.0.0",
					},
				},
			});

			// Test navigation between different field types
			events.keypress("down"); // Move to env (select field)
			events.keypress("down"); // Move to version (text field)
			events.keypress("up"); // Back to env (select field)

			// Test editing select field
			events.keypress("enter");
			events.keypress("down"); // Navigate to "prod"
			events.keypress("enter"); // Select "prod"

			const screen = getScreen();
			expect(screen).toContain("Environment: prod");
		});

		it("should handle navigation between text and select fields", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Navigation test",
				template: "{{text1}} {{select}} {{text2}}",
				fields: {
					text1: {initial: "Text1"},
					select: {options: ["A", "B"], initial: "A"},
					text2: {initial: "Text2"},
				},
			});

			// Navigate to select field
			events.keypress("down");

			// Open select options
			events.keypress("enter");
			let screen = getScreen();
			expect(screen).toContain("❯ A");

			// Cancel selection
			events.keypress("escape");

			// Navigate to text field
			events.keypress("down");

			// Edit text field
			events.keypress("enter");
			events.type("Modified");
			events.keypress("enter");

			screen = getScreen();
			expect(screen).toContain("Text2Modified");
		});
	});

	describe("Select Field Edge Cases", () => {
		it("should handle empty options array", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Empty options",
				template: "Value: {{value}}",
				fields: {
					value: {
						options: [],
						initial: "default",
					},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("Value: default");
		});

		it("should handle select field without initial value", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "No initial value",
				template: "Choice: {{choice}}",
				fields: {
					choice: {
						message: "Make a choice",
						options: ["yes", "no"],
					},
				},
			});

			// Open select options
			events.keypress("enter");

			// Select first option
			events.keypress("enter");

			const screen = getScreen();
			expect(screen).toContain("Choice: yes");
		});

		it("should handle object options with same names but different values", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Object options",
				template: "Code: {{code}}",
				fields: {
					code: {
						options: [
							{name: "Success", value: "200"},
							{name: "Not Found", value: "404"},
							{name: "Server Error", value: "500"},
						],
					},
				},
			});

			// Open select options
			events.keypress("enter");

			// Navigate to second option
			events.keypress("down");

			// Select it
			events.keypress("enter");

			const screen = getScreen();
			expect(screen).toContain("Code: 404");
		});

		it("should handle boundary navigation in select options", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Boundary test",
				template: "Item: {{item}}",
				fields: {
					item: {
						options: ["first", "second", "third"],
					},
				},
			});

			// Open select options
			events.keypress("enter");

			// Try to navigate up from first option (should stay at first)
			events.keypress("up");
			let screen = getScreen();
			expect(screen).toContain("❯ first");

			// Navigate to last option
			events.keypress("down");
			events.keypress("down");

			// Try to navigate down from last option (should stay at last)
			events.keypress("down");
			screen = getScreen();
			expect(screen).toContain("❯ third");
		});
	});

	describe("Select Field Integration", () => {
		it("should work with form submission", async () => {
			const {answer, events} = await render(snippetPrompt, {
				message: "Form submission",
				template: "Environment: {{env}}, Debug: {{debug}}",
				fields: {
					env: {
						options: ["development", "production"],
						initial: "development",
					},
					debug: {
						options: [
							{name: "Enabled", value: "true"},
							{name: "Disabled", value: "false"},
						],
						initial: "true",
					},
				},
			});

			// Change environment
			events.keypress("enter");
			events.keypress("down");
			events.keypress("enter");

			// Change debug setting
			events.keypress("down");
			events.keypress("enter");
			events.keypress("down");
			events.keypress("enter");

			// Submit form
			events.keypress({name: "s", ctrl: true});

			await expect(answer).resolves.toEqual({
				env: "production",
				debug: "false",
			});
		});

		it("should work with validation", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Validation test",
				template: "Level: {{level}}",
				fields: {
					level: {
						options: ["beginner", "intermediate", "advanced"],
						initial: "beginner",
					},
				},
				validate: (values) => {
					if (values["level"] === "beginner") {
						return "Please select a higher level";
					}
					return true;
				},
			});

			// Try to submit with beginner (should fail validation)
			events.keypress({name: "s", ctrl: true});
			const screen = getScreen();
			expect(screen).toContain("Please select a higher level");

			// Change to intermediate
			events.keypress("enter");
			events.keypress("down");
			events.keypress("enter");

			// Submit again (should work)
			events.keypress({name: "s", ctrl: true});
		});
	});
});
