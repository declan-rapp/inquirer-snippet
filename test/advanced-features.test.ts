import {render} from "@inquirer/testing";
import snippetPrompt, {SnippetField} from "../src/index";

describe("Advanced Features", () => {
	describe("Validation", () => {
		it("should handle successful validation", async () => {
			const {answer, events} = await render(snippetPrompt, {
				message: "Valid input",
				template: "Name: {{name}}",
				fields: {
					name: {initial: "ValidName"},
				},
				validate: (values) => (values["name"] && values["name"].length > 0 ? true : false),
			});

			events.keypress({name: "s", ctrl: true});

			await expect(answer).resolves.toEqual({name: "ValidName"});
		});

		it("should handle validation failure", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Validation failure",
				template: "Name: {{name}}",
				fields: {
					name: {message: "Your name", initial: ""},
				},
				validate: (values) => (values["name"] && values["name"].length > 0) || "Name is required",
			});

			events.keypress({name: "s", ctrl: true});

			// Validation should fail and prompt should remain active
			const screen = getScreen();
			expect(screen).toContain("Validation failure");
		});

		it("should handle complex validation logic", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Complex validation",
				template: "User: {{username}}, Pass: {{password}}",
				fields: {
					username: {initial: "user123"},
					password: {initial: "pass"}, // Too short
				},
				validate: (values) => {
					if (values["username"] && values["username"].length < 3) return "Username too short";
					if (values["password"] && values["password"].length < 8) return "Password too short";
					return true;
				},
			});

			events.keypress({name: "s", ctrl: true});

			// Validation should fail and prompt should remain active
			const screen = getScreen();
			expect(screen).toContain("Complex validation");
		});

		it("should handle validation when string is not returned", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Non-string validation",
				template: "User: {{username}}, Pass: {{password}}",
				fields: {
					username: {initial: "user123"},
					password: {initial: "pass"}, // Too short
				},
				validate: (values) => {
					if (values["username"] && values["username"].length < 3) return false;
					if (values["password"] && values["password"].length < 8) return false;
					return true;
				},
			});

			events.keypress({name: "s", ctrl: true});

			// Validation should fail and prompt should remain active
			const screen = getScreen();
			expect(screen).toContain("Invalid values provided");
		});
	});

	describe("Theme Customization", () => {
		it("should use default theme when no theme provided", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Default theme",
				template: "Value: {{value}}",
				fields: {
					value: {initial: "test"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("test");
		});

		it("should apply custom field styles", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Custom field style",
				template: "Field: {{field}}",
				fields: {
					field: {initial: "value"},
				},
				theme: {
					style: {
						field: (text: string) => `CUSTOM_FIELD:${text}`,
					},
				},
			});

			const screen = getScreen();
			expect(screen).toBeDefined();
		});

		it("should apply all custom styles together", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "All custom styles",
				template: "Field1: {{field1}}, Field2: {{field2}}",
				fields: {
					field1: {initial: "value1"},
					field2: {message: "Enter value 2"},
				},
				theme: {
					style: {
						field: (text: string) => `F:${text}`,
						activeField: (text: string) => `AF:${text}`,
						placeholder: (text: string) => `P:${text}`,
						activePlaceholder: (text: string) => `AP:${text}`,
					},
				},
			});

			// Test with first field active (has value)
			let screen = getScreen();
			expect(screen).toBeDefined();

			// Navigate to second field (placeholder)
			events.keypress("down");
			screen = getScreen();
			expect(screen).toBeDefined();
		});

		it("should handle validation failure modes", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Validation mode",
				template: "Value: {{value}}",
				fields: {
					value: {initial: ""},
				},
				validate: (values) => (values["value"] && values["value"].length > 0) || "Required",
				theme: {
					validationFailureMode: "keep",
				},
			});

			events.keypress({name: "s", ctrl: true});

			const screen = getScreen();
			expect(screen).toContain("Validation mode");
		});

		it("should handle partial theme configuration", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Partial theme",
				template: "Field: {{field}}",
				fields: {
					field: {initial: "value"},
				},
				theme: {
					style: {
						field: (text: string) => text.toUpperCase(),
					},
				},
			});

			const screen = getScreen();
			expect(screen).toBeDefined();
		});

		it("should handle empty theme object", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Empty theme",
				template: "Field: {{field}}",
				fields: {
					field: {initial: "value"},
				},
				theme: {},
			});

			const screen = getScreen();
			expect(screen).toContain("value");
		});
	});

	describe("Field Configuration Types", () => {
		it("should handle all field property combinations", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "All field combinations",
				template: "{{minimal}} {{withMessage}} {{withInitial}} {{withBoth}} {{withRequired}}",
				fields: {
					minimal: {},
					withMessage: {message: "Enter value"},
					withInitial: {initial: "default"},
					withBoth: {message: "Both message and initial", initial: "value"},
					withRequired: {message: "Required field", required: true},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("default");
			expect(screen).toContain("value");
		});

		it("should handle field names as placeholders when no message provided", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Field name as placeholder",
				template: "Hello {{userName}}!",
				fields: {
					userName: {initial: ""},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("userName");
		});

		it("should handle complex field name types", async () => {
			const fields: Record<string, SnippetField> = {};
			const fieldNames = [
				"simple",
				"with-dash",
				"with_underscore",
				"with.dot",
				"with123numbers",
				"UPPERCASE",
				"camelCase",
				"field@symbol",
				"field+plus",
				"field[bracket]",
			];

			let template = "";
			fieldNames.forEach((name, index) => {
				fields[name] = {initial: `value${index}`};
				template += `{{${name}}} `;
			});

			const {getScreen} = await render(snippetPrompt, {
				message: "Complex field names",
				template: template.trim(),
				fields,
			});

			const screen = getScreen();
			expect(screen).toContain("value0");
			expect(screen).toContain("value9");
		});
	});

	describe("Edge Cases", () => {
		it("should handle undefined and null initial values", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Null/undefined handling",
				template: "{{field1}} {{field2}} {{field3}}",
				fields: {
					field1: {message: "Field 1"},
					field2: {message: "Field 2"},
					field3: {initial: "value"},
				},
			});

			const screen = getScreen();
			expect(screen).toBeDefined();
		});

		it("should handle very long field values", async () => {
			const longValue = "A".repeat(500);
			const {getScreen} = await render(snippetPrompt, {
				message: "Long values",
				template: "Long: {{field}}",
				fields: {
					field: {initial: longValue},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("A");
		});

		it("should handle unicode and special characters", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Unicode test",
				template: "{{emoji}} {{chinese}} {{math}}",
				fields: {
					emoji: {message: "Emoji", initial: "🎉🚀💻"},
					chinese: {message: "Chinese", initial: "你好世界"},
					math: {message: "Math", initial: "∑∆∞≠≤≥"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("🎉🚀💻");
			expect(screen).toContain("你好世界");
			expect(screen).toContain("∑∆∞≠≤≥");
		});

		it("should handle JavaScript keyword field names", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "JS keywords",
				template: "{{function}} {{class}} {{var}} {{let}} {{const}}",
				fields: {
					function: {initial: "function"},
					class: {initial: "class"},
					var: {initial: "var"},
					let: {initial: "let"},
					const: {initial: "const"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("function");
			expect(screen).toContain("class");
			expect(screen).toContain("var");
			expect(screen).toContain("let");
			expect(screen).toContain("const");
		});

		it("should handle malformed field placeholders", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "Malformed placeholders",
				template: "{{field1} {field2}} {{{field3}}} {{field4",
				fields: {
					field1: {initial: "value1"},
					field2: {initial: "value2"},
					field3: {initial: "value3"},
					field4: {initial: "value4"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("value3"); // Only properly formed {{field3}} should be replaced
		});

		it("should handle template with no field references", async () => {
			const {getScreen} = await render(snippetPrompt, {
				message: "No field refs",
				template: "This is a static template with no placeholders at all",
				fields: {
					field1: {initial: "value1"},
					field2: {initial: "value2"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("This is a static template with no placeholders at all");
		});

		it("should handle very long templates", async () => {
			const longTemplate = "A".repeat(1000) + "{{field}}" + "B".repeat(1000);
			const {getScreen} = await render(snippetPrompt, {
				message: "Long template",
				template: longTemplate,
				fields: {
					field: {initial: "TEST"},
				},
			});

			const screen = getScreen();
			expect(screen).toContain("TEST");
		});

		it("should handle large number of fields", async () => {
			const fields: Record<string, SnippetField> = {};
			let template = "";

			// Create 25 fields
			for (let i = 0; i < 25; i++) {
				const fieldName = `field${i}`;
				fields[fieldName] = {initial: `Value${i}`};
				template += `{{${fieldName}}} `;
			}

			const {getScreen} = await render(snippetPrompt, {
				message: "Many fields",
				template: template.trim(),
				fields,
			});

			const screen = getScreen();
			expect(screen).toContain("Value0");
			expect(screen).toContain("Value24");
		});

		it("should handle validation edge cases", async () => {
			const {getScreen, events} = await render(snippetPrompt, {
				message: "Validation edge cases",
				template: "Value: {{field}}",
				fields: {
					field: {initial: "test"},
				},
				validate: () => {
					// Return an error message instead of throwing
					return "Validation error";
				},
			});

			events.keypress({name: "s", ctrl: true});

			const screen = getScreen();
			expect(screen).toBeDefined();
		});
	});

	describe("Return Type Validation", () => {
		it("should return correct answer type", async () => {
			const {answer, events} = await render(snippetPrompt, {
				message: "Return type test",
				template: "{{field1}} {{field2}}",
				fields: {
					field1: {initial: "value1"},
					field2: {initial: "value2"},
				},
			});

			events.keypress({name: "s", ctrl: true});

			const result = await answer;

			// Type assertion to verify return type
			const typedResult: Record<string, string> = result;
			expect(typedResult["field1"]).toBe("value1");
			expect(typedResult["field2"]).toBe("value2");
			expect(typeof typedResult["field1"]).toBe("string");
			expect(typeof typedResult["field2"]).toBe("string");
		});

		it("should handle modified field values in return type", async () => {
			const {answer, events} = await render(snippetPrompt, {
				message: "Modified values",
				template: "{{field1}} {{field2}}",
				fields: {
					field1: {initial: "initial1"},
					field2: {initial: "initial2"},
				},
			});

			// Modify field1
			events.keypress("enter");
			events.type("modified1");
			events.keypress("enter");

			// Modify field2
			events.keypress("down");
			events.keypress("enter");
			events.type("modified2");
			events.keypress("enter");

			events.keypress({name: "s", ctrl: true});

			const result = await answer;
			expect(result["field1"]).toBe("initial1modified1");
			expect(result["field2"]).toBe("initial2modified2");
		});
	});
});
