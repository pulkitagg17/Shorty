/**
 * Jest Configuration
 * Configures Jest to run TypeScript tests with ts-jest transformer
 */

module.exports = {
  // Use ts-jest to transpile TypeScript files
  preset: 'ts-jest',

  // Node.js test environment
  testEnvironment: 'node',

  // Root directory for tests
  rootDir: './src',

  // Test file patterns
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Ignore node_modules
  testPathIgnorePatterns: ['/node_modules/'],
  coveragePathIgnorePatterns: ['/node_modules/'],

  // TypeScript configuration
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },

  // Coverage thresholds (optional, uncomment to enforce)
  // collectCoverageFrom: [
  //   '**/*.ts',
  //   '!**/*.test.ts',
  //   '!**/*.spec.ts',
  //   '!**/node_modules/**',
  // ],
  // coverageThreshold: {
  //   global: {
  //     branches: 50,
  //     functions: 50,
  //     lines: 50,
  //     statements: 50,
  //   },
  // },

  // Verbose output
  verbose: true,

  // Timeout for tests (in milliseconds)
  testTimeout: 10000,
};
