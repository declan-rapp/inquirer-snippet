import {type JestConfigWithTsJest} from "ts-jest";

const config: JestConfigWithTsJest = {
	clearMocks: true,
	collectCoverage: true,
	collectCoverageFrom: ["<rootDir>/src/**/*.{ts,js}"],
	coveragePathIgnorePatterns: ["<rootDir>/node_modules", "<rootDir>/dist"],
	coverageReporters: ["text"],
	coverageThreshold: {
		global: {
			branches: 90,
			functions: 90,
			lines: 90,
			statements: 90,
		},
	},
	errorOnDeprecated: true,
	injectGlobals: true,
	maxWorkers: "50%",
	rootDir: "..",
	testMatch: ["**/test/**/*.test.[jt]s"],
	testEnvironment: "node",
	preset: "ts-jest",
	testTimeout: 30000,
	transform: {
		"^.+\\.(ts|tsx)?$": "ts-jest",
	},
};

export default config;
