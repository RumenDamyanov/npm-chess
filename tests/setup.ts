/**
 * Test Setup
 *
 * Global setup and configuration for Jest tests.
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods for cleaner test output
global.console = {
  ...console,
  // Keep error and warn for debugging
  error: jest.fn(),
  warn: jest.fn(),
  // Suppress log, debug, and info in tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Add custom matchers if needed
expect.extend({
  // Custom matchers can be added here
});

// Global beforeAll
beforeAll(() => {
  // Global setup
});

// Global afterAll
afterAll(() => {
  // Global cleanup
});
