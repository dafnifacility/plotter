module.exports = {
  globalSetup: '<rootDir>/jest.setup.js',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
  },
  moduleFileExtensions: ['js', 'vue', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/components/**/*.vue',
    '<rootDir>/pages/**/*.vue',
  ],
  forceExit: !!process.env.CI,

  testPathIgnorePatterns: [
    '<rootDir>/architecture/',
    '<rootDir>/assets/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    '<rootDir>/glossary-of-terms/',
    '<rootDir>/node_modules/',
    '<rootDir>/release-notes/',
    '<rootDir>/tests/',
  ],
}
