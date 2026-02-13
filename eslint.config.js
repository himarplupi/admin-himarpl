import next from "eslint-config-next";
import tseslint from "typescript-eslint";

export default [
  ...next,

  // Non type-aware rules (safe for all files)
  ...tseslint.configs.recommended,

  // Type-aware rules ONLY for TS files
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...tseslint.configs.recommendedTypeChecked[0],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },

  // Custom rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: { attributes: false },
        },
      ],
    },
  },

  // Ignore config file itself
  {
    ignores: ["eslint.config.js"],
  },
];
