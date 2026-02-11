module.exports = {
  moduleFileExtensions: ['js', 'svelte'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // d3 v3 packages ship as ESM; let babel-jest transpile them (and svelte) for Jest
  transformIgnorePatterns: ['node_modules/(?!(svelte|d3-[^/]+)/)'],
  moduleNameMapper: {
    '\\.(svelte)$': '<rootDir>/tests/__mocks__/svelte-component-stub.js',
  },
  moduleDirectories: ['node_modules', 'src'],
};
