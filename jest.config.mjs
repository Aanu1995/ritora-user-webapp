import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Bumped from Jest's 5s default: form-heavy tests simulate many keystrokes
  // via userEvent and can time out under parallel CPU load even when correct.
  testTimeout: 15000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/i18n/**',
    '!src/app/**',
    '!src/test/**',
    '!src/lib/site.ts',
    '!src/components/landing/**',
    '!src/components/layout/**',
    '!src/components/icons/**',
    '!src/components/illustrations/**',
    '!src/components/app/app-shell.tsx',
    '!src/components/cookie-consent.tsx',
    '!src/components/site-header.tsx',
    '!src/components/site-header-client.tsx',
    '!src/components/site-footer.tsx',
    '!src/components/theme-toggle.tsx',
    '!src/components/language-switcher.tsx',
    '!src/components/settings/language-tab.tsx',
    '!src/components/settings/privacy-tab.tsx',
    '!src/components/ui/alert-dialog.tsx',
    '!src/components/ui/calendar.tsx',
    '!src/components/ui/country-select.tsx',
    '!src/components/ui/date-picker.tsx',
    '!src/components/ui/popover.tsx',
    '!src/components/ui/radio-group.tsx',
    '!src/components/ui/select.tsx',
    '!src/components/ui/separator.tsx',
    '!src/components/ui/sheet.tsx',
    '!src/components/ui/sidebar.tsx',
    '!src/components/ui/tooltip.tsx',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 80,
      functions: 80,
    },
  },
});
