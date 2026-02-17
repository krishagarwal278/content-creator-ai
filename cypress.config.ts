/**
 * Cypress Configuration
 * E2E testing setup inspired by OpenShift Console
 */
import { defineConfig } from "cypress";

export default defineConfig({
  // Viewport settings for consistent testing
  viewportWidth: 1280,
  viewportHeight: 720,

  // Timeouts
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 30000,
  requestTimeout: 10000,
  responseTimeout: 30000,

  // Retry configuration
  retries: {
    runMode: 2, // Retry twice in CI
    openMode: 0, // No retries in interactive mode
  },

  // Video and screenshots
  video: false, // Enable in CI if needed
  screenshotOnRunFailure: true,
  screenshotsFolder: "cypress/screenshots",
  videosFolder: "cypress/videos",

  // E2E specific configuration
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",

    // Experimental features
    experimentalRunAllSpecs: true,

    // Test isolation - set to false for faster tests with shared state
    // Set to true for fully isolated tests
    testIsolation: true,

    setupNodeEvents(on, config) {
      // Implement node event listeners here if needed
      // Example: code coverage, custom tasks, etc.

      // Task for logging from tests
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });

      return config;
    },
  },

  // Component testing (optional - for future use)
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/component.ts",
  },

  // Environment variables
  env: {
    // Test user credentials (use test accounts only!)
    TEST_USER_EMAIL: "test@example.com",
    TEST_USER_PASSWORD: "testpassword123",

    // API endpoints
    API_URL: "http://localhost:4000",
  },
});
