import typescriptEslint from "@typescript-eslint/eslint-plugin";
import stylisticTs from '@stylistic/eslint-plugin-ts';
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends(
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
        "@stylistic/ts": stylisticTs,
    },

    languageOptions: {
        parser: tsParser,
    },

    rules: {
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-explicit-any": "error",
        "@stylistic/ts/semi": "warn",

        "@typescript-eslint/no-empty-interface": ["error", {
            allowSingleExtends: true,
        }],
    },
}, {
    files: ["**/*.ts"],

    rules: {
        "@typescript-eslint/explicit-function-return-type": ["error"],
    },
}];
