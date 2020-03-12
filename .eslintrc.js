module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  env: {
    browser: true,
    es6: true,
  },
  extends: ["airbnb-base"],
  plugins: ["jest", "svelte3"],
  rules: {
    "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    "no-param-reassign": [
      "error",
      { props: true, ignorePropertyModificationsFor: ["draft"] },
    ],
  },
  overrides: [
    {
      files: ["**/*.svelte"],
      processor: "svelte3/svelte3",
      rules: {
        "import/first": "off",
        "import/no-mutable-exports": "off",
        "prefer-const": "off",
        "import/prefer-default-export": "off",
      },
    },
    {
      files: ["**/*.test.js"],
      env: {
        jest: true,
      },
    },
  ]
};
