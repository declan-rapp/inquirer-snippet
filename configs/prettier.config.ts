import {type Config} from "prettier";

const config: Config = {
	experimentalTernaries: true,
	trailingComma: "es5",
	printWidth: 140,
	useTabs: true,
	tabWidth: 4,
	quoteProps: "consistent",
	bracketSpacing: false,
	plugins: ["prettier-plugin-organize-imports"],
};

export default config;
