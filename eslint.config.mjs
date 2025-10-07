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

  // 🧩 Base project-wide rules
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
    },
  },

  // 🧠 Lexical-specific exception
  {
    files: ["src/components/blocks/RichTextarea/**/*.tsx"],
    rules: {
      /**
       * ⚠️ Disable exhaustive-deps for Lexical-based editor components.
       *
       * Lexical uses an imperative editor API inside React hooks (e.g. editor.update()).
       * These effects intentionally run only once or when resetKey changes.
       * The linter cannot infer this pattern, so it flags false positives.
       *
       * Disabling here keeps warnings out of legitimate use-cases
       * without turning off the rule for the entire project.
       */
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
