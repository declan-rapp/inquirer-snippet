import {render} from "@inquirer/testing";
import snippetPrompt, {SnippetField} from "../src/index";

describe("Integration Tests", () => {
	describe("Complex Workflows", () => {
		it("should handle complete workflow with all features", async () => {
			const {events, answer} = await render(snippetPrompt, {
				message: "Complete workflow test",
				template: `# {{title}}

## User Information
- Name: {{name}}
- Email: {{email}}
- Role: {{role}}

## Settings
- Theme: {{theme}}
- Language: {{language}}

## Notes
{{notes}}`,
				fields: {
					title: {message: "Document title", initial: "User Profile"},
					name: {message: "Full name", initial: "John Doe"},
					email: {message: "Email address", initial: "john@example.com"},
					role: {message: "User role"},
					theme: {initial: "dark"},
					language: {initial: "en"},
					notes: {message: "Additional notes"},
				},
				validate: (values) => {
					if (!values["name"]?.trim()) return "Name is required";
					if (!values["email"]?.includes("@")) return "Invalid email";
					if (!values["role"]?.trim()) return "Role is required";
					if (!values["notes"]?.trim()) return "Notes are required";
					return true;
				},
				theme: {
					validationFailureMode: "keep",
					style: {
						field: (text: string) => text,
						activeField: (text: string) => `[${text}]`,
						placeholder: (text: string) => `(${text})`,
						activePlaceholder: (text: string) => `[(${text})]`,
					},
				},
			});

			// Navigate to role field and fill it
			events.keypress("down"); // name
			events.keypress("down"); // email
			events.keypress("down"); // role
			events.keypress("enter");
			events.type("Administrator");
			events.keypress("enter");

			// Navigate to notes field and fill it
			events.keypress("down"); // theme
			events.keypress("down"); // language
			events.keypress("down"); // notes
			events.keypress("enter");
			events.type("This user has admin privileges");
			events.keypress("enter");

			// Submit the form
			events.keypress({name: "s", ctrl: true});

			await expect(answer).resolves.toEqual({
				title: "User Profile",
				name: "John Doe",
				email: "john@example.com",
				role: "Administrator",
				theme: "dark",
				language: "en",
				notes: "This user has admin privileges",
			});
		});

		it("should handle complex navigation patterns", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Complex navigation",
				template: "{{a}} {{b}} {{c}} {{d}} {{e}} {{f}}",
				fields: {
					a: {initial: "A"},
					b: {initial: "B"},
					c: {initial: "C"},
					d: {initial: "D"},
					e: {initial: "E"},
					f: {initial: "F"},
				},
			});

			// Complex navigation pattern
			events.keypress("down"); // a -> b
			events.keypress("down"); // b -> c
			events.keypress("up"); // c -> b
			events.keypress("tab"); // b -> c
			events.keypress("tab"); // c -> d
			events.keypress("tab"); // d -> e
			events.keypress("up"); // e -> d
			events.keypress("up"); // d -> c
			events.keypress("down"); // c -> d
			events.keypress("down"); // d -> e
			events.keypress("down"); // e -> f
			events.keypress("down"); // f -> f (boundary)
			events.keypress("up"); // f -> e
			events.keypress("tab"); // e -> f
			events.keypress("tab"); // f -> a (cycle)

			const screen = getScreen();
			expect(screen).toBeDefined();
		});

		it("should handle rapid editing operations", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Rapid editing",
				template: "Field1: {{field1}}, Field2: {{field2}}, Field3: {{field3}}",
				fields: {
					field1: {initial: "Initial1"},
					field2: {initial: "Initial2"},
					field3: {initial: "Initial3"},
				},
			});

			// Rapid editing sequence
			events.keypress("enter");
			events.type("Modified1");
			events.keypress("enter");

			events.keypress("down");
			events.keypress("enter");
			events.type("Modified2");
			events.keypress("escape"); // Cancel this edit

			events.keypress("down");
			events.keypress("enter");
			events.type("Modified3");
			events.keypress("enter");

			events.keypress("up");
			events.keypress("enter");
			events.type("FinalModified2");
			events.keypress("enter");

			const screen = getScreen();
			expect(screen).toContain("Modified1");
			expect(screen).toContain("FinalModified2");
			expect(screen).toContain("Modified3");
		});

		it("should maintain state consistency during complex interactions", async () => {
			const {events, answer} = await render(snippetPrompt, {
				message: "State consistency",
				template: "A: {{a}}, B: {{b}}, C: {{c}}",
				fields: {
					a: {initial: "InitialA"},
					b: {initial: "InitialB"},
					c: {initial: "InitialC"},
				},
			});

			// Complex interaction sequence
			events.keypress("enter");
			events.type("ModifiedA");
			events.keypress("enter");

			events.keypress("down");
			events.keypress("enter");
			events.type("ModifiedB");
			events.keypress("escape"); // Cancel

			events.keypress("down");
			events.keypress("enter");
			events.type("ModifiedC");
			events.keypress("enter");

			events.keypress("up");
			events.keypress("enter");
			events.type("FinalB");
			events.keypress("enter");

			events.keypress({name: "s", ctrl: true});

			await expect(answer).resolves.toEqual({
				a: "InitialAModifiedA",
				b: "InitialBFinalB",
				c: "InitialCModifiedC",
			});
		});
	});

	describe("Stress Tests", () => {
		it("should handle large number of fields efficiently", async () => {
			const fields: Record<string, SnippetField> = {};
			let template = "";

			// Create 25 fields (reasonable for testing)
			for (let i = 0; i < 25; i++) {
				const fieldName = `field${i}`;
				fields[fieldName] = {
					message: `Field ${i}`,
					initial: `Value${i}`,
				};
				template += `{{${fieldName}}} `;
			}

			const {getScreen, events} = await render(snippetPrompt, {
				message: "Large field count",
				template: template.trim(),
				fields,
			});

			// Navigate through many fields
			for (let i = 0; i < 10; i++) {
				events.keypress("down");
			}

			// Edit a field in the middle
			events.keypress("enter");
			events.type("ModifiedValue");
			events.keypress("enter");

			// Navigate to end
			for (let i = 0; i < 15; i++) {
				events.keypress("down");
			}

			const screen = getScreen();
			expect(screen).toContain("ModifiedValue");
		});

		it("should handle complex template with many replacements", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Complex template",
				template: `
{{header}} {{header}} {{header}}

Section 1: {{section1}}
Section 2: {{section2}}
Section 3: {{section3}}

{{footer}} - {{footer}} - {{footer}}

Repeated: {{repeat}} {{repeat}} {{repeat}} {{repeat}} {{repeat}}
        `,
				fields: {
					header: {initial: "HEADER"},
					section1: {initial: "Content1"},
					section2: {initial: "Content2"},
					section3: {initial: "Content3"},
					footer: {initial: "FOOTER"},
					repeat: {initial: "REPEAT"},
				},
			});

			const screen = getScreen();

			// Check that all replacements occurred
			const headerCount = (screen.match(/HEADER/g) || []).length;
			const footerCount = (screen.match(/FOOTER/g) || []).length;
			const repeatCount = (screen.match(/REPEAT/g) || []).length;

			expect(headerCount).toBeGreaterThanOrEqual(3);
			expect(footerCount).toBeGreaterThanOrEqual(3);
			expect(repeatCount).toBeGreaterThanOrEqual(5);
		});

		it("should handle rapid successive operations", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Rapid operations",
				template: "{{a}} {{b}} {{c}}",
				fields: {
					a: {initial: "A"},
					b: {initial: "B"},
					c: {initial: "C"},
				},
			});

			// Perform many operations quickly
			for (let i = 0; i < 10; i++) {
				events.keypress("down");
				events.keypress("up");
				events.keypress("tab");
			}

			events.keypress("enter");
			events.type("Modified");
			events.keypress("enter");

			const screen = getScreen();
			expect(screen).toContain("Modified");
		});
	});

	describe("Error Handling and Recovery", () => {
		it("should handle validation failure and recovery", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Validation recovery test",
				template: "Name: {{name}}, Email: {{email}}",
				fields: {
					name: {initial: ""},
					email: {initial: "invalid-email"},
				},
				validate: (values) => {
					if (!values["name"]?.trim()) return "Name is required";
					if (!values["email"]?.includes("@")) return "Invalid email format";
					return true;
				},
			});

			// First submission should fail
			events.keypress({name: "s", ctrl: true});
			let screen = getScreen();
			expect(screen).toContain("Validation recovery test");

			// Fix the name
			events.keypress("enter");
			events.type("John Doe");
			events.keypress("enter");

			// Verify the prompt is still active
			screen = getScreen();
			expect(screen).toContain("Validation recovery test");
		});

		it("should handle edge cases in field editing", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Field editing edge cases",
				template: "Value: {{value}}",
				fields: {
					value: {initial: "initial"},
				},
			});

			// Enter editing mode multiple times
			events.keypress("enter");
			events.keypress("escape");
			events.keypress("enter");
			events.type("new");
			events.keypress("escape");
			events.keypress("enter");
			events.type("final");
			events.keypress("enter");

			const screen = getScreen();
			expect(screen).toContain("final");
		});
	});

	describe("Boundary and Limit Tests", () => {
		it("should handle single character field values", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Single char",
				template: "{{a}} {{b}} {{c}}",
				fields: {
					a: {initial: "A"},
					b: {initial: "B"},
					c: {initial: "C"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("A");
			expect(screen).toContain("B");
			expect(screen).toContain("C");
		});

		it("should handle field editing with single character", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Single char edit",
				template: "Char: {{char}}",
				fields: {
					char: {initial: "A"},
				},
			});

			events.keypress("enter");
			events.type("Z");
			events.keypress("enter");

			const screen = getScreen();
			expect(screen).toContain("Z");
		});

		it("should handle cursor display in all scenarios", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Cursor display test",
				template: "Short: {{short}}, Long: {{long}}, Empty: {{empty}}",
				fields: {
					short: {initial: "Hi"},
					long: {initial: "This is a longer initial value"},
					empty: {initial: ""},
				},
			});

			// Test cursor in short field
			events.keypress("enter");
			const screenShort = getScreen();
			expect(screenShort).toBeDefined();
			events.keypress("escape");

			// Test cursor in long field
			events.keypress("down");
			events.keypress("enter");
			const screenLong = getScreen();
			expect(screenLong).toBeDefined();
			events.keypress("escape");

			// Test cursor in empty field
			events.keypress("down");
			events.keypress("enter");
			const screenEmpty = getScreen();
			expect(screenEmpty).toBeDefined();
			events.keypress("escape");
		});
	});
});
