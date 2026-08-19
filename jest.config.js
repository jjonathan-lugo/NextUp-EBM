const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

// data/ and hooks/ are plain JS modules — no React rendering needed for
// most of these — so testEnvironment: 'node' is enough and faster than
// jsdom. next/jest still handles the SWC transform, CSS module mocking,
// and env loading for us.
const customJestConfig = {
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>/'],
}

module.exports = createJestConfig(customJestConfig)
