const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    // Apply to all JS files in src/ and scripts/
    files: ["src/**/*.js", "scripts/**/*.js"],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        // Node.js globals
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
      },
    },

    rules: {
      // Catch real bugs
      "no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
      "no-undef": "error",
      "no-unreachable": "error",

      // Keep code consistent
      "eqeqeq": ["error", "always"],        // always use === not ==
      "no-var": "error",                     // use const/let, not var
      "prefer-const": "warn",               // use const when variable is never reassigned
      "no-console": "off",                  // console.log is fine in a backend
    },
  },
];
