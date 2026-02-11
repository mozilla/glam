module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  env: {
    test: {
      // Keep test transforms simple to avoid requiring @babel/runtime for transpiled deps
      plugins: [],
    },
  },
};
