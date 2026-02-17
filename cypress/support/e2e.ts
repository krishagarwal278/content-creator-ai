/**
 * Cypress E2E Support File
 * Global configuration and custom commands (inspired by OpenShift Console)
 */

// Import commands
import "./commands";

// ============================================================================
// Global Hooks
// ============================================================================

// Run before each test
beforeEach(() => {
  // Clear localStorage and sessionStorage
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();

  // Optionally clear cookies
  cy.clearCookies();
});

// ============================================================================
// Uncaught Exception Handler
// ============================================================================

// Prevent Cypress from failing on uncaught exceptions from the app
Cypress.on("uncaught:exception", (err, _runnable) => {
  // Log the error for debugging
  console.error("Uncaught exception:", err.message);

  // Return false to prevent Cypress from failing the test
  // You can add conditions to only ignore specific errors
  if (err.message.includes("ResizeObserver")) {
    return false;
  }

  // Let other errors fail the test
  return true;
});

// ============================================================================
// Type Definitions
// ============================================================================

// Extend Cypress namespace with custom commands

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Login with email and password
       * @example cy.login('user@example.com', 'password123')
       */
      login(email?: string, password?: string): Chainable<void>;

      /**
       * Logout the current user
       */
      logout(): Chainable<void>;

      /**
       * Get element by data-test attribute
       * @example cy.getByTestId('submit-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Get element by data-test attribute within a parent
       * @example cy.findByTestId('submit-button')
       */
      findByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Wait for the page to finish loading
       */
      waitForPageLoad(): Chainable<void>;

      /**
       * Check for any console errors
       */
      checkForConsoleErrors(): Chainable<void>;

      /**
       * Mock API response
       */
      mockApi(method: string, url: string, response: object, statusCode?: number): Chainable<void>;
    }
  }
}

export {};
