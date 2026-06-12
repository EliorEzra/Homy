// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const tseslint = require('typescript-eslint');
const js = require('@eslint/js');


module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    files: ["**/*.js", "**/*.jsx", "**/*.tsx", "**/*.ts"],
    ignores: ["**/eslint.config.js"],
    rules: {
      "@typescript-eslint/no-deprecated": "error",
      "react/no-unescaped-entities": 0,
      '@typescript-eslint/no-unused-vars': ['warn', { caughtErrors: 'none' }],
      "no-empty": ["warn", { "allowEmptyCatch": true }]
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  }
]);
