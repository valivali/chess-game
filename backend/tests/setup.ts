// Jest setup file for backend tests
// Add any global test setup here

// Mock console.log in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}
