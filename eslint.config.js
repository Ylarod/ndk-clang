const eslint = require("@eslint/js")
const ts = require("typescript-eslint")
const prettier = require("eslint-config-prettier")
const simpleImportSort = require("eslint-plugin-simple-import-sort")

module.exports = ts.config(
  { ignores: ["node_modules/", "dist/"] },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...ts.configs.strictTypeChecked,
      ...ts.configs.stylisticTypeChecked,
      prettier,
    ],

    plugins: {
      "simple-import-sort": simpleImportSort,
    },

    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
    },

    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
)
