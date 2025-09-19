import js from "@eslint/js"
import prettierConfig from "eslint-config-prettier"
import prettier from "eslint-plugin-prettier"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import unusedImports from "eslint-plugin-unused-imports"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config([
  {
    ignores: ["dist"]
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react: react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
      prettier: prettier
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,

      // Import sorting
      "simple-import-sort/imports": "error",

      // TypeScript specific
      "@typescript-eslint/ban-ts-comment": "off",

      // Unused imports and variables
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true
        }
      ],

      // React specific rules
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",

      // Prettier integration - must be last to override conflicting rules
      ...prettierConfig.rules,
      "prettier/prettier": "error"
    }
  }
])
