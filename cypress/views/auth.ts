/**
 * Auth Page Object
 * Encapsulates auth page interactions (following OpenShift Console patterns)
 */

export const authPage = {
  // ============================================================================
  // Navigation
  // ============================================================================

  visit() {
    cy.visit("/auth");
    this.isLoaded();
  },

  isLoaded() {
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
  },

  // ============================================================================
  // Form Interactions
  // ============================================================================

  enterEmail(email: string) {
    cy.get('input[type="email"]').clear().type(email);
    return this;
  },

  enterPassword(password: string) {
    cy.get('input[type="password"]').clear().type(password);
    return this;
  },

  enterFirstName(firstName: string) {
    cy.get("input#name").clear().type(firstName);
    return this;
  },

  enterLastName(lastName: string) {
    cy.get('input[id="last name"]').clear().type(lastName);
    return this;
  },

  submitForm() {
    cy.get('button[type="submit"]').click();
  },

  // ============================================================================
  // Mode Switching
  // ============================================================================

  switchToSignUp() {
    cy.contains("button", "Sign Up").click();
    cy.contains("Create Account").should("be.visible");
  },

  switchToSignIn() {
    cy.contains("button", "Sign In").click();
    cy.contains("Welcome Back").should("be.visible");
  },

  // ============================================================================
  // Assertions
  // ============================================================================

  shouldShowSignInForm() {
    cy.contains("Welcome Back").should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.contains("button", /sign in/i).should("be.visible");
  },

  shouldShowSignUpForm() {
    cy.contains("Create Account").should("be.visible");
    cy.get("input#name").should("be.visible"); // First name
    cy.get('input[id="last name"]').should("be.visible"); // Last name
  },

  shouldShowError(message: string) {
    // Assuming you use sonner toast for errors
    cy.contains(message).should("be.visible");
  },

  shouldShowSuccess(message: string) {
    cy.contains(message).should("be.visible");
  },

  shouldBeLoading() {
    cy.get('button[type="submit"]').should("be.disabled");
    cy.contains("Loading").should("be.visible");
  },

  // ============================================================================
  // Complete Flows
  // ============================================================================

  signIn(email: string, password: string) {
    this.enterEmail(email);
    this.enterPassword(password);
    this.submitForm();
  },

  signUp(firstName: string, lastName: string, email: string, password: string) {
    this.switchToSignUp();
    this.enterFirstName(firstName);
    this.enterLastName(lastName);
    this.enterEmail(email);
    this.enterPassword(password);
    this.submitForm();
  },
};
