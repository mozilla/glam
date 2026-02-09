module.exports = {
  moduleFileExtensions: ['js', 'svelte'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!svelte)'],
  moduleNameMapper: {
    '\\.(svelte)$': '<rootDir>/tests/__mocks__/svelte-component-stub.js',
  },
  moduleDirectories: ['node_modules', 'src'],
};
