import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import eslintPluginMocha from 'eslint-plugin-mocha'
// Optional: import globals if you want standard env globals
import globals from 'globals'

export default defineConfig([
  // Base config applied to all JavaScript files:
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021
      },
      parserOptions: {
        allowImportExportEverywhere: true
      }
    },
    plugins: {
      mocha: eslintPluginMocha
    },
    extends: [js.configs.recommended],
    rules: {
      'no-prototype-builtins': 'off', // complaining about our proxies :(
      'no-unused-vars': 'off', // complaining about our proxies :(
      semi: ['error', 'never'],
      quotes: ['error', 'single']
    }
  }
])
