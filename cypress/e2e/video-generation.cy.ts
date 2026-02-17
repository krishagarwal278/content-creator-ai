/**
 * Video Generation E2E Tests
 * Tests for the core video generation workflow
 */
// Dashboard page object available for future use
// import { dashboardPage } from "../views";

describe("Video Generation", () => {
  // Mock screenplay response for consistent testing
  const mockScreenplayResponse = {
    success: true,
    projectId: "test-project-123",
    screenplay: {
      title: "Test Video",
      format: "reel",
      totalDuration: 30,
      scenes: [
        {
          sceneNumber: 1,
          duration: 10,
          visualDescription: "Opening shot",
          narration: "Welcome to our test video",
          textOverlay: "Test Overlay",
          transition: "fade",
        },
        {
          sceneNumber: 2,
          duration: 10,
          visualDescription: "Main content",
          narration: "This is the main content",
          transition: "cut",
        },
        {
          sceneNumber: 3,
          duration: 10,
          visualDescription: "Closing shot",
          narration: "Thank you for watching",
          transition: "fade",
        },
      ],
      voiceoverStyle: "professional",
      musicSuggestion: "upbeat",
    },
    status: "screenplay_generated",
    message: "Screenplay generated successfully",
    estimatedCompletionTime: 30,
  };

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

    // Mock the user endpoint
    cy.intercept("GET", "**/auth/v1/user*", {
      statusCode: 200,
      body: {
        id: "user-123",
        email: "test@example.com",
      },
    });

    // Mock video generation API
    cy.intercept("POST", "**/api/video/generate", (req) => {
      req.reply({
        statusCode: 200,
        body: mockScreenplayResponse,
        delay: 500, // Simulate network delay
      });
    }).as("generateVideo");

    // Mock enhance screenplay API
    cy.intercept("POST", "**/api/video/enhance-screenplay", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          ...mockScreenplayResponse,
          message: "Screenplay enhanced successfully",
        },
      });
    }).as("enhanceScreenplay");

    // Mock actual video generation API
    cy.intercept("POST", "**/api/video/generate-video", {
      statusCode: 200,
      body: {
        success: true,
        videoId: "video-123",
        videoUrl: "https://example.com/video.mp4",
        message: "Video generation started",
      },
    }).as("generateActualVideo");

    // Mock video status API
    cy.intercept("GET", "**/api/video/status/*", {
      statusCode: 200,
      body: {
        status: "completed",
        progress: 100,
        videoUrl: "https://example.com/video.mp4",
      },
    }).as("videoStatus");
  });

  describe("Dashboard Access", () => {
    it("should load dashboard when authenticated", () => {
      cy.visit("/");
      cy.url().should("not.include", "/auth");
    });
  });

  describe("Screenplay Generation", () => {
    beforeEach(() => {
      cy.visit("/");
    });

    it("should display generation form", () => {
      // Check for form elements (adjust selectors based on your UI)
      cy.get("input, textarea").should("exist");
      cy.contains(/generate|create/i).should("be.visible");
    });

    it("should generate screenplay with valid inputs", () => {
      // Fill in the form (adjust based on your actual form structure)
      cy.get('input[placeholder*="name" i], input[placeholder*="title" i]')
        .first()
        .type("My Test Video");

      cy.get(
        'textarea[placeholder*="topic" i], input[placeholder*="topic" i], textarea[placeholder*="describe" i]',
      )
        .first()
        .type("A video about artificial intelligence");

      // Click generate button
      cy.contains("button", /generate/i).click();

      // Wait for API call
      cy.wait("@generateVideo");

      // Should show screenplay preview (adjust based on your UI)
      cy.contains(/screenplay|preview|scene/i).should("be.visible");
    });

    it("should show loading state while generating", () => {
      // Add a longer delay to the mock
      cy.intercept("POST", "**/api/video/generate", (req) => {
        req.reply({
          statusCode: 200,
          body: mockScreenplayResponse,
          delay: 2000,
        });
      }).as("generateVideoSlow");

      // Fill form and submit
      cy.get('input[placeholder*="name" i], input[placeholder*="title" i]')
        .first()
        .type("My Test Video");

      cy.get(
        'textarea[placeholder*="topic" i], input[placeholder*="topic" i], textarea[placeholder*="describe" i]',
      )
        .first()
        .type("A video about AI");

      cy.contains("button", /generate/i).click();

      // Should show loading indicator
      cy.contains(/loading|generating|please wait/i).should("be.visible");
    });

    it("should handle API errors gracefully", () => {
      // Mock API error
      cy.intercept("POST", "**/api/video/generate", {
        statusCode: 500,
        body: {
          message: "Server error occurred",
        },
      }).as("generateVideoError");

      // Fill form and submit
      cy.get('input[placeholder*="name" i], input[placeholder*="title" i]')
        .first()
        .type("My Test Video");

      cy.get(
        'textarea[placeholder*="topic" i], input[placeholder*="topic" i], textarea[placeholder*="describe" i]',
      )
        .first()
        .type("A video about AI");

      cy.contains("button", /generate/i).click();

      cy.wait("@generateVideoError");

      // Should show error message
      cy.contains(/error|failed|try again/i).should("be.visible");
    });
  });

  describe("Video Format Selection", () => {
    beforeEach(() => {
      cy.visit("/");
    });

    it("should allow selecting different video formats", () => {
      // Check for format selector (adjust based on your UI)
      cy.get("body").then(($body) => {
        // Look for format-related elements
        const hasFormatSelector =
          $body.find('[data-test="format-selector"]').length > 0 ||
          $body.find('select, [role="combobox"], [role="listbox"]').length > 0;

        if (hasFormatSelector) {
          // Click on format selector
          cy.get('[data-test="format-selector"], select, [role="combobox"]').first().click();

          // Should show format options
          cy.contains(/reel|short|video|presentation/i).should("be.visible");
        }
      });
    });
  });

  describe("Screenplay Preview", () => {
    beforeEach(() => {
      cy.visit("/");

      // Generate a screenplay first
      cy.get('input[placeholder*="name" i], input[placeholder*="title" i]')
        .first()
        .type("My Test Video");

      cy.get(
        'textarea[placeholder*="topic" i], input[placeholder*="topic" i], textarea[placeholder*="describe" i]',
      )
        .first()
        .type("A video about AI");

      cy.contains("button", /generate/i).click();
      cy.wait("@generateVideo");
    });

    it("should display screenplay scenes after generation", () => {
      // Should show scene information
      cy.contains(/scene|shot/i).should("be.visible");
    });

    it("should display scene details", () => {
      // Check for scene details (narration, visual description, etc.)
      cy.get("body").then(($body) => {
        const bodyText = $body.text().toLowerCase();
        const hasSceneContent =
          bodyText.includes("welcome") ||
          bodyText.includes("opening") ||
          bodyText.includes("scene 1") ||
          bodyText.includes("narration");

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(hasSceneContent).to.be.true;
      });
    });
  });

  describe("Backend Connection", () => {
    it("should show error when backend is unavailable", () => {
      // Mock network failure
      cy.intercept("POST", "**/api/video/generate", {
        forceNetworkError: true,
      }).as("networkError");

      cy.visit("/");

      cy.get('input[placeholder*="name" i], input[placeholder*="title" i]')
        .first()
        .type("My Test Video");

      cy.get(
        'textarea[placeholder*="topic" i], input[placeholder*="topic" i], textarea[placeholder*="describe" i]',
      )
        .first()
        .type("A video about AI");

      cy.contains("button", /generate/i).click();

      // Should show connection error
      cy.contains(/connect|network|backend|server/i, { timeout: 10000 }).should("be.visible");
    });
  });
});
