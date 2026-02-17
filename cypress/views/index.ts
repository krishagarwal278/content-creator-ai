/**
 * Page Objects Index
 * Central export for all page objects
 */

export { authPage } from "./auth";
export { dashboardPage } from "./dashboard";

// Common selectors used across pages
export const selectors = {
  // Navigation
  sidebar: '[data-test="sidebar"]',
  navLink: '[data-test="nav-link"]',

  // Common UI elements
  loadingSpinner: '[data-test="loading-spinner"]',
  errorMessage: '[data-test="error-message"]',
  successMessage: '[data-test="success-message"]',

  // Modals
  modal: '[data-test="modal"]',
  modalClose: '[data-test="modal-close"]',
  confirmButton: '[data-test="confirm-button"]',
  cancelButton: '[data-test="cancel-button"]',

  // Forms
  submitButton: 'button[type="submit"]',
  inputError: '[data-test="input-error"]',
};
