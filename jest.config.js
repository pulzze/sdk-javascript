module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',  // This tells Jest to use Babel for transpiling
  },
  testEnvironment: 'node', // or 'jsdom' depending on your environment
  transformIgnorePatterns: [
    '/node_modules/(?!your-module-name)/' // This handles node_modules if needed
  ],
};
