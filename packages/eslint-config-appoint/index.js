/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  extends: ["next", "turbo", "prettier"],
  overrides: [
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
