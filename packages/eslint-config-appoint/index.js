/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  extends: ["next", "turbo", "prettier"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint", "simple-import-sort", "unused-imports"],
      extends: [
        "next",
        "next/core-web-vitals",
        "eslint:recommended",
        "turbo",
        "prettier",
      ],
      rules: {
        "no-unused-vars": "off",
        "no-console": "warn",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "react/no-unescaped-entities": "off",
        "react/display-name": "off",
        "react/jsx-curly-brace-presence": [
          "warn",
          {
            props: "never",
            children: "never",
          },
        ],
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "warn",
        "unused-imports/no-unused-vars": [
          "warn",
          {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            argsIgnorePattern: "^_",
          },
        ],
        "simple-import-sort/exports": "warn",
        "simple-import-sort/imports": [
          "warn",
          {
            groups: [
              ["server-only"],
              ["^@?\\w", "^\\u0000"],
              ["^.+\\.s?css$"],
              ["^@/lib", "^@/hooks"],
              ["^@/data"],
              ["^@/components", "^@/container"],
              ["^@/store"],
              ["^@/"],
              [
                "^\\./?$",
                "^\\.(?!/?$)",
                "^\\.\\./?$",
                "^\\.\\.(?!/?$)",
                "^\\.\\./\\.\\./?$",
                "^\\.\\./\\.\\.(?!/?$)",
                "^\\.\\./\\.\\./\\.\\./?$",
                "^\\.\\./\\.\\./\\.\\.(?!/?$)",
              ],
              ["^@/types"],
              ["^"],
            ],
          },
        ],
      },
    },
    {
      files: ["*.js"],
      parser: "espree",
      parserOptions: {
        ecmaVersion: 2020,
      },
    },
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
  },
}
