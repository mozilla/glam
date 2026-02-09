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
  plugins: ['jest', 'svelte'],
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['draft', 'acc'] },
    ],
    // Allow Svelte virtual imports to resolve
    'import/no-unresolved': ['error', { ignore: ['^svelte/'] }],
  },
  overrides: [
    {
      files: ['**/*.js'],
      parser: '@babel/eslint-parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env'],
        },
      },
      extends: ['prettier'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
      },
    },
    {
      files: ['**/*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@babel/eslint-parser',
        extraFileExtensions: ['.svelte'],
        sourceType: 'module',
        ecmaVersion: 2018,
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env'],
        },
      },
      extends: ['plugin:svelte/recommended', 'prettier'],
      rules: {
        'prefer-const': 'off',
        'no-unused-vars': 'warn',
        'no-shadow': 'warn',
        'no-use-before-define': 'off',
        'no-console': 'warn',
        'no-alert': 'warn',
        'svelte/valid-compile': 'warn',
        'svelte/no-at-html-tags': 'warn',
        // Disable rules that don't work correctly with Svelte
        'import/first': 'off',
        'import/no-duplicates': 'off',
        'import/no-mutable-exports': 'off',
        'import/no-unresolved': 'off',
        'import/no-named-as-default': 'off',
        'import/no-named-as-default-member': 'off',
        'import/extensions': 'off',
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
  settings: {
    'import/resolver': {
      alias: {
        map: [['svelte', 'svelte']],
        extensions: ['.js', '.svelte'],
      },
    },
  },
  ignorePatterns: ['venv/**', '.venv/**', '**/site-packages/**'],
};
