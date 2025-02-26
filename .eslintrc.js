module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
  },
  extends: ['airbnb-base'],
  globals: {
    gtag: 'readonly',
  },
  plugins: ['jest', 'svelte3'],
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['draft', 'acc'] },
    ],
  },
  overrides: [
    {
      files: ['**/*.js'],
      extends: ['prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
      },
    },
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
      extends: ['prettier'],
      rules: {
        'prefer-const': 'off',
        // Disable rules that don't work correctly with Svelte
        // https://github.com/sveltejs/eslint-plugin-svelte3/blob/master/OTHER_PLUGINS.md
        'import/first': 'off',
        'import/no-duplicates': 'off',
        'import/no-mutable-exports': 'off',
        'import/no-unresolved': 'off',
        'import/no-unresolved': 'off',

        // Temporarily work around a bug in eslint-plugin-svelte3.
        //
        // https://github.com/sveltejs/eslint-plugin-svelte3/issues/41#issuecomment-572503966
        'no-multiple-empty-lines': ['error', { max: 2, maxBOF: 2, maxEOF: 0 }],
      },
    },
    {
      files: ['**/*.test.js'],
      env: {
        jest: true,
      },
    },
  ],
};
