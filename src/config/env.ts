/**
 * Runtime environment checks.
 * Prevents production deploys with missing or invalid VITE_BACKEND_URL
 * (e.g. unset or localhost), which would cause all API calls to fail.
 * @see skills/SKILL_debugger.md
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (import.meta.env.PROD) {
  if (!BACKEND_URL || BACKEND_URL.trim() === "") {
    throw new Error(
      "VITE_BACKEND_URL is not set. Set it in your host (e.g. Railway) to the backend API URL.",
    );
  }
  if (BACKEND_URL.includes("localhost")) {
    throw new Error(
      "VITE_BACKEND_URL must not be localhost in production. Set it to your backend API URL in your host's environment variables.",
    );
  }
}
