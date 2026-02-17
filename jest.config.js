module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "api/**/*.{ts,tsx}",
    "utils/**/*.{ts,tsx}",
    "components/common/ContactForm.tsx",
    "components/tools/**/*.{ts,tsx}",
     "!components/tools/ToolsLayout.tsx",
    "!components/tools/ToolsOverviewGrid.tsx",
    "!components/tools/ToolsSidebar.tsx",
    "!components/tools/tools-config.ts",
    "!**/*.test.{ts,tsx}",
    "!**/index.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 85,
      statements: 85,
      functions: 90,
      branches: 70,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css)$": "<rootDir>/__mocks__/styleMock.js",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.jest.json" },
    ],
  },
  // otras configuraciones...
};
