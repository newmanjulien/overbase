import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // ❌ Prevent AI placeholder artifacts
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value='...']",
          message: "Do not leave placeholder `...` in source files.",
        },
      ],
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-console": "off",
      semi: ["warn", "always"],
      quotes: ["warn", "double"],
    },
  },
];

export default eslintConfig;
