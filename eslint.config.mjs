import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";

export default defineConfig({
  ignores: ["dist"],
  extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {},
});
