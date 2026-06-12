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
    rules: {
      "@typescript-eslint/no-deprecated": "error"
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  }
]);
