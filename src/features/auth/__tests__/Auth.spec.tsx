/**
 * Auth Component Tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/test-utils";
import Auth from "../Auth";

// Mock the modules
vi.mock("@/api/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Import mocked modules
import { supabase } from "@/api/client";
import { toast } from "sonner";

describe("Auth Component", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render sign in form by default", () => {
      renderWithProviders(<Auth />);

      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("should not show name fields in sign in mode", () => {
      renderWithProviders(<Auth />);

      expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/last name/i)).not.toBeInTheDocument();
    });

    it("should toggle to sign up form when clicking sign up link", async () => {
      renderWithProviders(<Auth />);

      const signUpLink = screen.getByRole("button", { name: /sign up/i });
      await user.click(signUpLink);

      expect(screen.getByText("Create Account")).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    });

    it("should toggle back to sign in form", async () => {
      renderWithProviders(<Auth />);

      // Go to sign up
      await user.click(screen.getByRole("button", { name: /sign up/i }));
      expect(screen.getByText("Create Account")).toBeInTheDocument();

      // Go back to sign in
      await user.click(screen.getByRole("button", { name: /sign in/i }));
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });
  });

  describe("Sign In", () => {
    it("should call signInWithPassword with correct credentials", async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { session: {}, user: {} },
        error: null,
      } as never);

      renderWithProviders(<Auth />);

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("should show success toast on successful sign in", async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { session: {}, user: {} },
        error: null,
      } as never);

      renderWithProviders(<Auth />);

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Successfully signed in!");
      });
    });

    it("should show error toast on failed sign in", async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: "Invalid credentials" },
      } as never);

      renderWithProviders(<Auth />);

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
      });
    });

    it("should disable button while loading", async () => {
      // Create a promise that doesn't resolve immediately
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(supabase.auth.signInWithPassword).mockReturnValueOnce(pendingPromise as never);

      renderWithProviders(<Auth />);

      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();

      // Cleanup
      resolvePromise!({ data: { session: null }, error: null });
    });
  });

  describe("Sign Up", () => {
    it("should call signUp with correct data including name", async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: {}, session: null },
        error: null,
      } as never);

      renderWithProviders(<Auth />);

      // Switch to sign up
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: "john@example.com",
          password: "password123",
          options: {
            data: {
              name: "John Doe",
            },
          },
        });
      });
    });

    it("should show confirmation message on successful sign up", async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: {}, session: null },
        error: null,
      } as never);

      renderWithProviders(<Auth />);

      // Switch to sign up
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Check your email for the confirmation link!");
      });
    });

    it("should show error on failed sign up", async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: "Email already registered" },
      } as never);

      renderWithProviders(<Auth />);

      // Switch to sign up
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await user.type(screen.getByLabelText(/first name/i), "John");
      await user.type(screen.getByLabelText(/last name/i), "Doe");
      await user.type(screen.getByLabelText(/email/i), "john@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign up/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Email already registered");
      });
    });
  });

  describe("Form Validation", () => {
    it("should require email field", async () => {
      renderWithProviders(<Auth />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("required");
    });

    it("should require password field", async () => {
      renderWithProviders(<Auth />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("required");
    });

    it("should require minimum password length of 6", async () => {
      renderWithProviders(<Auth />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("minLength", "6");
    });

    it("should validate email format", async () => {
      renderWithProviders(<Auth />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("type", "email");
    });
  });
});
