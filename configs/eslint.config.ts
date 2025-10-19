import {includeIgnoreFile} from "@eslint/compat";
import eslint from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import eslintPrettier from "eslint-config-prettier/flat";
import eslintImports from "eslint-plugin-import";
import eslintJest from "eslint-plugin-jest";
import {defineConfig} from "eslint/config";
import path from "node:path";
import tseslint from "typescript-eslint";

const gitignorePath = path.join(import.meta.dirname, "..", ".gitignore");

export default defineConfig(
	includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
	{
		name: "Base",
		files: ["**/*.{ts,js}"],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: "latest",
				projectService: true,
				tsconfigRootDir: path.join(import.meta.dirname, ".."),
			},
		},
		rules: {
			"@typescript-eslint/restrict-template-expressions": [
				"error",
				{
					allowArray: true,
					allowBoolean: true,
					allowNullish: true,
					allowNumber: true,
				},
			],
		},
	},
	{
		name: "MJS Files",
		files: ["**/*.mjs"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
		},
		rules: {
			// Disable TypeScript-specific rules for .mjs files
		},
	},
	{
		name: "Eslint",
		...eslint.configs.recommended,
	},
	defineConfig(...tseslint.configs.strictTypeChecked, {
		files: ["**/*.ts"], // Only apply to TypeScript files
		rules: {
			"@typescript-eslint/restrict-template-expressions": [
				"error",
				{
					allowArray: true,
					allowBoolean: true,
					allowNullish: true,
					allowNumber: true,
				},
			],
		},
	}),
	{
		name: "Jest",
		...eslintJest.configs["flat/recommended"],
		files: ["**/*.test.ts"],
	},
	{
		name: "Imports",
		...eslintImports.flatConfigs.typescript,
		files: ["**/**.ts"],
	},
	{
		...eslintPrettier,
		name: "Prettier",
	}
);
