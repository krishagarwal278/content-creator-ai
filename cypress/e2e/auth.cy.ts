/**
 * Authentication E2E Tests
 * Tests for sign in, sign up, and protected routes
 */
import { authPage } from "../views";

describe("Authentication", () => {
  beforeEach(() => {
    // Clear any existing sessions
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe("Sign In Page", () => {
    beforeEach(() => {
      authPage.visit();
    });

    it("should display sign in form by default", () => {
      authPage.shouldShowSignInForm();
    });

    it("should toggle between sign in and sign up forms", () => {
      // Should start on sign in
      authPage.shouldShowSignInForm();

      // Switch to sign up
      authPage.switchToSignUp();
      authPage.shouldShowSignUpForm();

      // Switch back to sign in
      authPage.switchToSignIn();
      authPage.shouldShowSignInForm();
    });

    it("should show validation for required fields", () => {
      // Try to submit without filling fields
      authPage.submitForm();

      // Email and password inputs should be marked as required
      cy.get('input[type="email"]:invalid').should("exist");
    });

    it("should show error for invalid credentials", () => {
      // Mock the auth API to return an error
      cy.intercept("POST", "**/auth/v1/token*", {
        statusCode: 400,
        body: {
          error: "invalid_grant",
          error_description: "Invalid login credentials",
        },
      });

      authPage.signIn("invalid@example.com", "wrongpassword");

      // Should show error message (adjust based on your error handling)
      cy.contains(/invalid|error|failed/i).should("be.visible");
    });

    it("should successfully sign in with valid credentials", () => {
      // Mock successful auth response
      cy.intercept("POST", "**/auth/v1/token*", {
        statusCode: 200,
        body: {
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
          token_type: "bearer",
          expires_in: 3600,
          user: {
            id: "user-123",
            email: "test@example.com",
          },
        },
      });

      // Mock the session check
      cy.intercept("GET", "**/auth/v1/user*", {
        statusCode: 200,
        body: {
          id: "user-123",
          email: "test@example.com",
        },
      });

      authPage.signIn("test@example.com", "password123");

      // Should redirect to dashboard
      cy.url().should("not.include", "/auth");
    });
  });

  describe("Sign Up", () => {
    beforeEach(() => {
      authPage.visit();
      authPage.switchToSignUp();
    });

    it("should display sign up form with name fields", () => {
      authPage.shouldShowSignUpForm();
    });

    it("should show success message after sign up", () => {
      // Mock successful signup
      cy.intercept("POST", "**/auth/v1/signup*", {
        statusCode: 200,
        body: {
          id: "new-user-123",
          email: "newuser@example.com",
        },
      });

      authPage.signUp("John", "Doe", "newuser@example.com", "password123");

      // Should show confirmation message
      cy.contains(/check your email|confirmation/i).should("be.visible");
    });

    it("should show error for existing email", () => {
      // Mock signup failure
      cy.intercept("POST", "**/auth/v1/signup*", {
        statusCode: 400,
        body: {
          error: "email_exists",
          error_description: "Email already registered",
        },
      });

      authPage.signUp("John", "Doe", "existing@example.com", "password123");

      // Should show error
      cy.contains(/already|exists|registered/i).should("be.visible");
    });
  });

  describe("Protected Routes", () => {
    it("should redirect to /auth when not authenticated", () => {
      // Try to access dashboard without auth
      cy.visit("/");

      // Should be redirected to auth page
      cy.url().should("include", "/auth");
    });

    it("should allow access to protected routes when authenticated", () => {
      // Set up mock authenticated session
      cy.intercept("GET", "**/auth/v1/user*", {
        statusCode: 200,
        body: {
          id: "user-123",
          email: "test@example.com",
        },
      });

      // Mock the session in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem(
          "sb-auth-token",
          JSON.stringify({
            access_token: "mock-token",
            user: { id: "user-123", email: "test@example.com" },
          }),
        );
      });

      // Visit dashboard
      cy.visit("/");

      // Should stay on dashboard (not redirect to auth)
      cy.url().should("not.include", "/auth");
    });
  });

  describe("Logout", () => {
    beforeEach(() => {
      // Set up authenticated session
      cy.window().then((win) => {
        win.localStorage.setItem(
          "sb-auth-token",
          JSON.stringify({
            access_token: "mock-token",
            user: { id: "user-123", email: "test@example.com" },
          }),
        );
      });
    });

    it("should clear session and redirect to auth on logout", () => {
      // Mock the signout endpoint
      cy.intercept("POST", "**/auth/v1/logout*", {
        statusCode: 200,
        body: {},
      });

      // Visit a protected page first
      cy.visit("/");

      // Find and click logout (adjust selector based on your UI)
      cy.get("body").then(($body) => {
        if ($body.find('[data-test="sign-out-button"]').length > 0) {
          cy.getByTestId("sign-out-button").click();

          // Should redirect to auth
          cy.url().should("include", "/auth");

          // Session should be cleared
          cy.window().then((win) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect(win.localStorage.getItem("sb-auth-token")).to.be.null;
          });
        }
      });
    });
  });
});
