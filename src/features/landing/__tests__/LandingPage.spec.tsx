/**
 * LandingPage Component Tests
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import LandingPage from "../LandingPage";

// Mock hasPointerCapture for Radix UI Select components
beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Supabase client
vi.mock("@/api/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

// Mock interest service
vi.mock("@/api/interest-service", () => ({
  submitInterestForm: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { supabase } from "@/api/client";
import { submitInterestForm } from "@/api/interest-service";
import { toast } from "sonner";

describe("LandingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add("dark");
  });

  const renderLandingPage = () => {
    return render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>,
    );
  };

  describe("Header", () => {
    it("should display Videaa branding", () => {
      renderLandingPage();

      expect(screen.getAllByText("Videaa")[0]).toBeInTheDocument();
    });

    it("should display Login button", () => {
      renderLandingPage();

      expect(screen.getByTestId("beta-login-btn")).toBeInTheDocument();
    });

    it("should display Join Beta button", () => {
      renderLandingPage();

      expect(screen.getByTestId("join-beta-btn")).toBeInTheDocument();
    });

    it("should display theme toggle button", () => {
      renderLandingPage();

      const themeToggle = screen.getByLabelText("Toggle theme");
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe("Hero Section", () => {
    it("should display main headline", () => {
      renderLandingPage();

      expect(screen.getByText(/Turn your text into/)).toBeInTheDocument();
      expect(screen.getByText("cinematic reality")).toBeInTheDocument();
    });

    it("should display subheadline", () => {
      renderLandingPage();

      expect(screen.getByText(/Create physics-accurate, high-fidelity videos/)).toBeInTheDocument();
    });

    it("should display Start Creating button", () => {
      renderLandingPage();

      expect(screen.getByTestId("start-creating-btn")).toBeInTheDocument();
    });

    it("should display Watch Demo button", () => {
      renderLandingPage();

      expect(screen.getByTestId("watch-demo-btn")).toBeInTheDocument();
    });

    it("should display beta badge", () => {
      renderLandingPage();

      expect(screen.getByText("Next Gen AI Video Engine v2.0")).toBeInTheDocument();
    });
  });

  describe("Features Section", () => {
    it("should display Lightning Fast feature", () => {
      renderLandingPage();

      expect(screen.getByText("Lightning Fast")).toBeInTheDocument();
      expect(screen.getByText(/Generate 1080p video clips in seconds/)).toBeInTheDocument();
    });

    it("should display Commercial Rights feature", () => {
      renderLandingPage();

      expect(screen.getByText("Commercial Rights")).toBeInTheDocument();
      expect(screen.getByText(/Full ownership of your generated content/)).toBeInTheDocument();
    });

    it("should display Physics Engine feature", () => {
      renderLandingPage();

      expect(screen.getByText("Physics Engine")).toBeInTheDocument();
      expect(screen.getByText(/Our AI understands gravity, light, and motion/)).toBeInTheDocument();
    });
  });

  describe("Theme Toggle", () => {
    it("should toggle theme when clicked", async () => {
      const user = userEvent.setup();
      renderLandingPage();

      const themeToggle = screen.getByLabelText("Toggle theme");

      // Initially dark
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      // Click to switch to light
      await user.click(themeToggle);

      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("should persist theme preference to localStorage", async () => {
      const user = userEvent.setup();
      renderLandingPage();

      const themeToggle = screen.getByLabelText("Toggle theme");
      await user.click(themeToggle);

      const stored = JSON.parse(localStorage.getItem("userPreferences") || "{}");
      expect(stored.theme).toBe("light");
    });
  });

  describe("Beta Login Modal", () => {
    it("should open beta login modal when Login is clicked", async () => {
      const user = userEvent.setup();
      renderLandingPage();

      await user.click(screen.getByTestId("beta-login-btn"));

      expect(screen.getByText("Beta Tester Login")).toBeInTheDocument();
    });

    it("should have email and password inputs", async () => {
      const user = userEvent.setup();
      renderLandingPage();

      await user.click(screen.getByTestId("beta-login-btn"));

      expect(screen.getByTestId("beta-email-input")).toBeInTheDocument();
      expect(screen.getByTestId("beta-password-input")).toBeInTheDocument();
    });

    it("should call supabase auth on form submit", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: { id: "123" }, session: {} },
        error: null,
      } as any);

      renderLandingPage();

      await user.click(screen.getByTestId("beta-login-btn"));
      await user.type(screen.getByTestId("beta-email-input"), "test@example.com");
      await user.type(screen.getByTestId("beta-password-input"), "password123");
      await user.click(screen.getByTestId("beta-login-submit-btn"));

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should navigate to dashboard on successful login", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: { id: "123" }, session: {} },
        error: null,
      } as any);

      renderLandingPage();

      await user.click(screen.getByTestId("beta-login-btn"));
      await user.type(screen.getByTestId("beta-email-input"), "test@example.com");
      await user.type(screen.getByTestId("beta-password-input"), "password123");
      await user.click(screen.getByTestId("beta-login-submit-btn"));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("should show error toast on login failure", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: "Invalid credentials" },
      } as any);

      renderLandingPage();

      await user.click(screen.getByTestId("beta-login-btn"));
      await user.type(screen.getByTestId("beta-email-input"), "test@example.com");
      await user.type(screen.getByTestId("beta-password-input"), "wrongpassword");
      await user.click(screen.getByTestId("beta-login-submit-btn"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
      });
    });
  });

  describe("Interest Form", () => {
    it("should open interest form modal when Join Beta is clicked", async () => {
      const user = userEvent.setup();
      renderLandingPage();

      await user.click(screen.getByTestId("join-beta-btn"));

      expect(screen.getByText("Join the Videaa Beta")).toBeInTheDocument();
    });

    it("should have required form fields", async () => {
      const user = userEvent.setup();
      renderLandingPage();

      await user.click(screen.getByTestId("join-beta-btn"));

      expect(screen.getByTestId("modal-name-input")).toBeInTheDocument();
      expect(screen.getByTestId("modal-email-input")).toBeInTheDocument();
    });

    it("should disable submit button when required fields are empty", async () => {
      const user = userEvent.setup();
      renderLandingPage();

      await user.click(screen.getByTestId("join-beta-btn"));

      const submitButton = screen.getByTestId("modal-submit-btn");
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when required fields are filled", async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      renderLandingPage();

      await user.click(screen.getByTestId("join-beta-btn"));

      await user.type(screen.getByTestId("modal-name-input"), "John Doe");
      await user.type(screen.getByTestId("modal-email-input"), "john@example.com");

      // Select role - use keyboard navigation instead of click
      const roleSelect = screen.getAllByRole("combobox")[0];
      await user.click(roleSelect);
      await user.keyboard("{ArrowDown}{Enter}");

      // Select interest level
      const interestSelect = screen.getAllByRole("combobox")[1];
      await user.click(interestSelect);
      await user.keyboard("{ArrowDown}{Enter}");

      const submitButton = screen.getByTestId("modal-submit-btn");
      expect(submitButton).not.toBeDisabled();
    });

    it("should call submitInterestForm on form submit", async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      vi.mocked(submitInterestForm).mockResolvedValueOnce({
        id: "sub-123",
        fullName: "John Doe",
        email: "john@example.com",
        role: "student",
        earlyAccessPriority: "very_interested",
        createdAt: "2026-02-16T00:00:00Z",
        status: "pending",
        isBetaUser: false,
      });

      renderLandingPage();

      await user.click(screen.getByTestId("join-beta-btn"));

      await user.type(screen.getByTestId("modal-name-input"), "John Doe");
      await user.type(screen.getByTestId("modal-email-input"), "john@example.com");

      // Select role - use keyboard navigation
      const roleSelect = screen.getAllByRole("combobox")[0];
      await user.click(roleSelect);
      await user.keyboard("{ArrowDown}{Enter}");

      // Select interest level
      const interestSelect = screen.getAllByRole("combobox")[1];
      await user.click(interestSelect);
      await user.keyboard("{ArrowDown}{Enter}");

      await user.click(screen.getByTestId("modal-submit-btn"));

      await waitFor(() => {
        expect(submitInterestForm).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: "John Doe",
            email: "john@example.com",
          }),
        );
      });
    });

    it("should show success toast on successful submission", async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      vi.mocked(submitInterestForm).mockResolvedValueOnce({
        id: "sub-123",
        fullName: "John Doe",
        email: "john@example.com",
        role: "student",
        earlyAccessPriority: "very_interested",
        createdAt: "2026-02-16T00:00:00Z",
        status: "pending",
        isBetaUser: false,
      });

      renderLandingPage();

      await user.click(screen.getByTestId("join-beta-btn"));

      await user.type(screen.getByTestId("modal-name-input"), "John Doe");
      await user.type(screen.getByTestId("modal-email-input"), "john@example.com");

      // Use keyboard navigation for selects
      const roleSelect = screen.getAllByRole("combobox")[0];
      await user.click(roleSelect);
      await user.keyboard("{ArrowDown}{Enter}");

      const interestSelect = screen.getAllByRole("combobox")[1];
      await user.click(interestSelect);
      await user.keyboard("{ArrowDown}{Enter}");

      await user.click(screen.getByTestId("modal-submit-btn"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Thanks for joining! We'll be in touch soon.");
      });
    });
  });

  describe("Interest Form - Inline Section", () => {
    it("should have inline interest form in the page", () => {
      renderLandingPage();

      expect(screen.getByText("Join the Future")).toBeInTheDocument();
      expect(screen.getByTestId("interest-name-input")).toBeInTheDocument();
      expect(screen.getByTestId("interest-email-input")).toBeInTheDocument();
    });

    it("should have topic chips for selection", () => {
      renderLandingPage();

      expect(screen.getByText("Tech & Coding")).toBeInTheDocument();
      expect(screen.getByText("Business")).toBeInTheDocument();
      expect(screen.getByText("Academic")).toBeInTheDocument();
    });

    it("should toggle topic selection when clicked", async () => {
      const user = userEvent.setup();
      renderLandingPage();

      const techChip = screen.getByText("Tech & Coding");
      await user.click(techChip);

      // Should have selected styling
      expect(techChip).toHaveClass("border-primary");
    });
  });

  describe("Footer", () => {
    it("should display copyright text", () => {
      renderLandingPage();

      expect(screen.getByText(/© 2026 Videaa AI/)).toBeInTheDocument();
    });

    it("should display Videaa branding in footer", () => {
      renderLandingPage();

      // Footer has Videaa text
      const footerBranding = screen.getAllByText("Videaa");
      expect(footerBranding.length).toBeGreaterThan(1); // Header and footer
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels", async () => {
      const user = userEvent.setup();
      renderLandingPage();

      await user.click(screen.getByTestId("join-beta-btn"));

      // Use getAllByLabelText since there are multiple forms
      expect(screen.getAllByLabelText(/Full Name/)).toHaveLength(2);
      expect(screen.getAllByLabelText(/Email/)).toHaveLength(2);
    });

    it("should have required field indicators", async () => {
      const user = userEvent.setup();
      renderLandingPage();

      await user.click(screen.getByTestId("join-beta-btn"));

      // Required fields should have asterisks
      const requiredIndicators = screen.getAllByText("*");
      expect(requiredIndicators.length).toBeGreaterThan(0);
    });
  });
});
