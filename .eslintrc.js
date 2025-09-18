module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-env'],
    },
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
  settings: {
    'import/resolver': {
      alias: {
        map: [['svelte', 'svelte']],
        extensions: ['.js', '.svelte'],
      },
    },
  },
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-param-reassign': [
      'error',
      { props: true, ignorePropertyModificationsFor: ['draft', 'acc'] },
    ],
    // Disable problematic rules for Svelte imports
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
      extends: ['plugin:svelte/recommended', 'prettier'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@babel/eslint-parser',
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env'],
        },
      },
      rules: {
        'prefer-const': 'off',
        // Disable rules that don't work correctly with Svelte
        'import/first': 'off',
        'import/no-duplicates': 'off',
        'import/no-mutable-exports': 'off',
        'import/no-unresolved': 'off',
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
