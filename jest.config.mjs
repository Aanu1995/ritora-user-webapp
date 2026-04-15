import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/i18n/**',
    '!src/proxy.ts',
    '!src/app/**',
    '!src/test/**',
    '!src/lib/site.ts',
    '!src/components/landing/**',
    '!src/components/layout/**',
    '!src/components/cookie-consent.tsx',
    '!src/components/site-header.tsx',
    '!src/components/site-footer.tsx',
    '!src/components/theme-toggle.tsx',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
});
