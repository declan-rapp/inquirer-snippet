import {type Theme} from "@inquirer/core";
import type {PartialDeep} from "@inquirer/type";

/**
 * Configuration for individual template fields
 */
export interface SnippetField {
	/** Display message for the field (defaults to field name if not provided) */
	message?: string;
	/** Default/initial value for the field */
	initial?: string;
	/** Whether the field is required (used for validation and documentation) */
	required?: boolean;
	/** Options for select fields - when provided, field becomes a select dropdown */
	options?: string[] | SelectOption[];
}

/**
 * Configuration for select field options
 */
export interface SelectOption {
	/** Display name for the option */
	name: string;
	/** Value to use when this option is selected */
	value: string;
}

/**
 * Main configuration object for the snippet prompt
 */
export interface SnippetConfig {
	/** The question message displayed to the user */
	message: string;
	/** Template string containing {{fieldName}} placeholders */
	template: string;
	/** Object defining all template fields, keys must match placeholder names */
	fields: Record<string, SnippetField>;
	/**
	 * Optional validation function called before form submission
	 * @param values - Object containing all current field values
	 * @returns true if valid, error message string if invalid
	 */
	validate?: ValidationFunction;
	/** Optional theme customization */
	theme?: PartialDeep<Theme<SnippetTheme>>;
}

/**
 * Theme configuration for customizing visual appearance
 */
export interface SnippetTheme {
	/** How to handle validation failures */
	validationFailureMode: "keep" | "clear";
	/** Styling functions for different UI elements */
	style: {
		/** Style for filled field values in the template */
		field: StyleFunction;
		/** Style for the currently active field that has a value */
		activeField: StyleFunction;
		/** Style for empty field placeholders */
		placeholder: StyleFunction;
		/** Style for the active empty field placeholder */
		activePlaceholder: StyleFunction;
		/** Optional style for the main prompt message */
		message?: StyleFunction;
	};
}

/**
 * Result type returned by the snippet prompt
 */
export type SnippetResult = Record<string, string>;

/**
 * Validation function type
 */
export type ValidationFunction = (values: Record<string, string>) => string | boolean;

/**
 * Style function type for theme customization
 */
export type StyleFunction = (text: string) => string;
