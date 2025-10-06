import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import security from "eslint-plugin-security";

const isCI = process.env.CI === "true";

export default [
  js.configs.recommended,
  {
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      "unused-imports": unusedImports,
      security,
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: process.cwd(),
        project: [
          "./tsconfig.base.json",
          "./tsconfig.tools.json",
          "./backend/tsconfig.json",
          "./frontend/tsconfig.json",
          "./packages/shared/tsconfig.json",
        ],
        warnOnUnsupportedTypeScriptVersion: false,
      },
      globals: {
        process: "readonly",
        globalThis: "readonly",
        window: "readonly",
        document: "readonly",
        crypto: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: {
          project: [
            "./tsconfig.base.json",
            "./backend/tsconfig.json",
            "./frontend/tsconfig.json",
            "./packages/shared/tsconfig.json",
          ],
        },
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      },
    },
    rules: {
      "no-console": isCI ? "warn" : "off",
      "no-debugger": "warn",
      eqeqeq: ["error", "always"],
      // prefer TypeScript-aware unused-vars rule
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    rules: {
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    rules: {
      "security/detect-object-injection": "off",
    },
  },
  {
    files: ["backend/**/*.{ts,js}"],
    rules: {
      "no-process-exit": "off",
    },
  },
  {
    ignores: [
      "eslint.config.*",
      "**/dist/**",
      "**/node_modules/**",
      "**/*.d.ts",
      "**/coverage/**",
    ],
  },
];
