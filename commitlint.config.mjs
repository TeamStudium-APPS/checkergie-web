export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "refactor", "style", "chore", "note", "docs"],
    ],
    "header-max-length": [2, "always", 100],
    "subject-case": [0],
  },
};
