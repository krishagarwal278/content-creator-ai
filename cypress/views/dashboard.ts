/**
 * Dashboard Page Object
 * Encapsulates dashboard page interactions
 */

export const dashboardPage = {
  // ============================================================================
  // Navigation
  // ============================================================================

  visit() {
    cy.visit("/");
    this.isLoaded();
  },

  isLoaded() {
    // Wait for the dashboard to be fully loaded
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);
    // Add more specific checks based on your dashboard structure
  },

  // ============================================================================
  // Generation Panel Interactions
  // ============================================================================

  enterProjectName(name: string) {
    cy.getByTestId("project-name-input").clear().type(name);
    return this;
  },

  enterTopic(topic: string) {
    cy.getByTestId("topic-input").clear().type(topic);
    return this;
  },

  selectFormat(format: "reel" | "short_video" | "vfx_movie" | "presentation") {
    cy.getByTestId("format-selector").click();
    cy.contains(format).click();
    return this;
  },

  selectDuration(duration: number) {
    // Assuming there's a duration slider or input
    cy.getByTestId("duration-input").clear().type(duration.toString());
    return this;
  },

  toggleVoiceover(enabled: boolean) {
    const checkbox = cy.getByTestId("voiceover-toggle");
    if (enabled) {
      checkbox.check();
    } else {
      checkbox.uncheck();
    }
    return this;
  },

  toggleCaptions(enabled: boolean) {
    const checkbox = cy.getByTestId("captions-toggle");
    if (enabled) {
      checkbox.check();
    } else {
      checkbox.uncheck();
    }
    return this;
  },

  clickGenerate() {
    cy.getByTestId("generate-button").click();
  },

  // ============================================================================
  // Preview Panel Interactions
  // ============================================================================

  getPreviewPanel() {
    return cy.getByTestId("preview-panel");
  },

  getScreenplayPreview() {
    return cy.getByTestId("screenplay-preview");
  },

  shouldShowScreenplay() {
    this.getScreenplayPreview().should("be.visible");
  },

  clickGenerateVideo() {
    cy.getByTestId("generate-video-button").click();
  },

  // ============================================================================
  // Assertions
  // ============================================================================

  shouldShowLoadingState() {
    cy.getByTestId("loading-spinner").should("be.visible");
  },

  shouldShowError(message: string) {
    cy.contains(message).should("be.visible");
  },

  shouldShowSuccess(message: string) {
    cy.contains(message).should("be.visible");
  },

  // ============================================================================
  // Complete Flows
  // ============================================================================

  generateScreenplay(options: {
    projectName: string;
    topic: string;
    format?: "reel" | "short_video" | "vfx_movie" | "presentation";
    duration?: number;
  }) {
    this.enterProjectName(options.projectName);
    this.enterTopic(options.topic);

    if (options.format) {
      this.selectFormat(options.format);
    }

    if (options.duration) {
      this.selectDuration(options.duration);
    }

    this.clickGenerate();
  },
};
