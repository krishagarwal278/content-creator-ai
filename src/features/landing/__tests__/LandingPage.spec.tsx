/**
 * LandingPage Component Tests
 * Assert on features (CTAs, modals, forms, behavior), not copy.
 */
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import LandingPage from "../LandingPage";

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
vi.mock("@/api/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));
vi.mock("@/api/interest-service", () => ({
  submitInterestForm: vi.fn(),
  getInterestStats: vi.fn().mockResolvedValue({
    total: 0,
    pending: 0,
    approved: 0,
    betaUsers: 0,
  }),
}));
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

  const renderLandingPage = () =>
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>,
    );

  describe("Header", () => {
    it("has branding and main nav", () => {
      renderLandingPage();
      expect(screen.getByRole("link", { name: /Videaa/i })).toBeInTheDocument();
      expect(screen.getByTestId("beta-login-btn")).toBeInTheDocument();
      expect(screen.getByTestId("join-beta-btn")).toBeInTheDocument();
    });

    it("has theme toggle", () => {
      renderLandingPage();
      expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    });

    it("has Features, About, Pricing links", () => {
      renderLandingPage();
      expect(screen.getByRole("link", { name: /Features/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /About/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Pricing/i })).toBeInTheDocument();
    });
  });

  describe("Hero", () => {
    it("has primary and demo CTAs", () => {
      renderLandingPage();
      expect(screen.getByTestId("start-creating-btn")).toBeInTheDocument();
      expect(screen.getByTestId("watch-demo-btn")).toBeInTheDocument();
    });

    it("has a main heading", () => {
      renderLandingPage();
      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe("Live Demo", () => {
    it("has demo section with topic input and generate button", () => {
      renderLandingPage();
      const topicInput = screen.getByPlaceholderText(/e\.g\., Introduction to/i);
      expect(topicInput).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Generate.*Slide/i })).toBeInTheDocument();
    });

    it("scrolls to demo when demo CTA is clicked", async () => {
      const user = userEvent.setup();
      const scrollSpy = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

      renderLandingPage();
      const demoBtn = screen.getByTestId("watch-demo-btn");
      await user.click(demoBtn);

      await waitFor(() => {
        expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
      });
      scrollSpy.mockRestore();
    });
  });

  describe("Features section", () => {
    it("has multiple feature headings", () => {
      renderLandingPage();
      const headings = screen.getAllByRole("heading", { level: 3 });
      expect(headings.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Theme toggle", () => {
    it("toggles dark/light and updates document class", async () => {
      const user = userEvent.setup();
      renderLandingPage();
      const themeToggle = screen.getByLabelText("Toggle theme");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      await user.click(themeToggle);
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });

    it("persists theme in localStorage", async () => {
      const user = userEvent.setup();
      renderLandingPage();
      await user.click(screen.getByLabelText("Toggle theme"));
      const stored = JSON.parse(localStorage.getItem("userPreferences") || "{}");
      expect(stored.theme).toBe("light");
    });
  });

  describe("Beta Login modal", () => {
    it("opens with email and password inputs when Login is clicked", async () => {
      const user = userEvent.setup();
      renderLandingPage();
      await user.click(screen.getByTestId("beta-login-btn"));
      expect(screen.getByTestId("beta-email-input")).toBeInTheDocument();
      expect(screen.getByTestId("beta-password-input")).toBeInTheDocument();
    });

    it("calls supabase auth on submit", async () => {
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

    it("navigates to dashboard on successful login", async () => {
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

    it("shows error toast on login failure", async () => {
      const user = userEvent.setup();
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: "Invalid credentials" },
      } as any);

      renderLandingPage();
      await user.click(screen.getByTestId("beta-login-btn"));
      await user.type(screen.getByTestId("beta-email-input"), "test@example.com");
      await user.type(screen.getByTestId("beta-password-input"), "wrong");
      await user.click(screen.getByTestId("beta-login-submit-btn"));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe("Interest form modal", () => {
    it("opens with name and email fields when Join Beta is clicked", async () => {
      const user = userEvent.setup();
      renderLandingPage();
      await user.click(screen.getByTestId("join-beta-btn"));
      expect(screen.getByTestId("modal-name-input")).toBeInTheDocument();
      expect(screen.getByTestId("modal-email-input")).toBeInTheDocument();
    });

    it("submit is disabled when required fields are empty", async () => {
      const user = userEvent.setup();
      renderLandingPage();
      await user.click(screen.getByTestId("join-beta-btn"));
      expect(screen.getByTestId("modal-submit-btn")).toBeDisabled();
    });

    it("submit enables after filling required fields and selecting role/interest", async () => {
      const user = userEvent.setup({ pointerEventsCheck: 0 });
      renderLandingPage();
      await user.click(screen.getByTestId("join-beta-btn"));
      await user.type(screen.getByTestId("modal-name-input"), "John Doe");
      await user.type(screen.getByTestId("modal-email-input"), "john@example.com");
      const combos = screen.getAllByRole("combobox");
      await user.click(combos[0]);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(combos[1]);
      await user.keyboard("{ArrowDown}{Enter}");
      expect(screen.getByTestId("modal-submit-btn")).not.toBeDisabled();
    });

    it("calls submitInterestForm on submit", async () => {
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
      const combos = screen.getAllByRole("combobox");
      await user.click(combos[0]);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(combos[1]);
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

    it("shows success toast on successful submission", async () => {
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
      const combos = screen.getAllByRole("combobox");
      await user.click(combos[0]);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(combos[1]);
      await user.keyboard("{ArrowDown}{Enter}");
      await user.click(screen.getByTestId("modal-submit-btn"));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe("Inline interest form", () => {
    it("has name and email inputs in page", () => {
      renderLandingPage();
      expect(screen.getByTestId("interest-name-input")).toBeInTheDocument();
      expect(screen.getByTestId("interest-email-input")).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("has Videaa in document at least twice (header + footer)", () => {
      renderLandingPage();
      const videaa = screen.getAllByText(/Videaa/i);
      expect(videaa.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Accessibility", () => {
    it("interest modal has form labels", async () => {
      const user = userEvent.setup();
      renderLandingPage();
      await user.click(screen.getByTestId("join-beta-btn"));
      expect(screen.getAllByLabelText(/Full Name/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByLabelText(/Email/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
