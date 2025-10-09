import tsJestPresets from "ts-jest/presets/index.js";

const { defaultsESM: tsjPreset } = tsJestPresets;

/** @type {import('jest').Config} */
const config = {
  ...tsjPreset,
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["<rootDir>/src/**/*.ts", "!<rootDir>/src/**/*.d.ts"],
  extensionsToTreatAsEsm: [".ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.cjs"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.jest.json",
      },
    ],
  },
};

export default config;
