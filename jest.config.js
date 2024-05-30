/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageProvider: 'v8',
    collectCoverageFrom: ['src/**/*.ts', '!tests/**', '!**/node_modules/**'],
    coverageDirectory: 'coverage',
    maxWorkers: '50%',
    testTimeout: 10000,
    setupFilesAfterEnv: ['./tests/utils/testSetup.ts'],
};
