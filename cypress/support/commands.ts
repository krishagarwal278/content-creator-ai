/**
 * Cypress Custom Commands
 * Reusable commands for E2E tests (inspired by OpenShift Console patterns)
 */

// ============================================================================
// Authentication Commands
// ============================================================================

/**
 * Login with email and password
 * Uses session caching for faster test execution
 */
Cypress.Commands.add("login", (email?: string, password?: string) => {
  const userEmail = email ?? Cypress.env("TEST_USER_EMAIL");
  const userPassword = password ?? Cypress.env("TEST_USER_PASSWORD");

  // Use session to cache login state between tests
  cy.session(
    [userEmail, userPassword],
    () => {
      cy.visit("/auth");

      // Wait for the form to be ready
      cy.get('input[type="email"]').should("be.visible");

      // Fill in credentials
      cy.get('input[type="email"]').type(userEmail);
      cy.get('input[type="password"]').type(userPassword);

      // Submit form
      cy.get('button[type="submit"]').click();

      // Wait for redirect to dashboard
      cy.url().should("not.include", "/auth");
    },
    {
      // Validate the session is still valid
      validate() {
        // Check if we're still logged in by looking for auth state
        cy.window().then((win) => {
          const supabaseAuth = win.localStorage.getItem("sb-auth-token");
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          expect(supabaseAuth).to.exist;
        });
      },
    },
  );
});

/**
 * Logout the current user
 */
Cypress.Commands.add("logout", () => {
  // Clear Supabase session from localStorage
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();

  // Optionally click logout button if visible
  cy.get("body").then(($body) => {
    if ($body.find('[data-test="sign-out-button"]').length > 0) {
      cy.getByTestId("sign-out-button").click();
    }
  });

  // Verify we're logged out
  cy.visit("/auth");
});

// ============================================================================
// Element Selection Commands
// ============================================================================

/**
 * Get element by data-test attribute
 * This follows the pattern used by OpenShift Console for stable selectors
 */
Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-test="${testId}"]`);
});

/**
 * Find element by data-test attribute within current subject
 */
Cypress.Commands.add(
  "findByTestId",
  { prevSubject: true },
  (subject: Cypress.Chainable<JQuery<HTMLElement>>, testId: string) => {
    return cy.wrap(subject).find(`[data-test="${testId}"]`);
  },
);

// ============================================================================
// Page Interaction Commands
// ============================================================================

/**
 * Wait for page to finish loading
 * Useful after navigation or data fetching
 */
Cypress.Commands.add("waitForPageLoad", () => {
  // Wait for any loading spinners to disappear
  cy.get("body").then(($body) => {
    if ($body.find('[data-test="loading-spinner"]').length > 0) {
      cy.getByTestId("loading-spinner").should("not.exist");
    }
  });

  // Wait for network requests to complete
  cy.wait(500); // Small buffer for async operations
});

/**
 * Check for console errors
 * Useful for catching runtime errors
 */
Cypress.Commands.add("checkForConsoleErrors", () => {
  cy.window().then((_win) => {
    // This requires setting up console spying in beforeEach
    // Implementation depends on your needs
    // Placeholder - implement based on your error tracking needs
  });
});

// ============================================================================
// API Mocking Commands
// ============================================================================

/**
 * Mock an API endpoint
 */
Cypress.Commands.add(
  "mockApi",
  (method: string, url: string, response: object, statusCode: number = 200) => {
    cy.intercept(method, url, {
      statusCode,
      body: response,
    }).as(`mock-${method}-${url.replace(/[^a-zA-Z0-9]/g, "-")}`);
  },
);

export {};
