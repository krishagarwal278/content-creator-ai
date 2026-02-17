import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Vitest Configuration
 * Fast test runner with SWC transformation (inspired by OpenShift's @swc/jest setup)
 */
export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for React component testing
    environment: "jsdom",
    // Global test utilities
    globals: true,
    // Setup files for test configuration
    setupFiles: ["./src/test/setup.ts"],
    // Include patterns
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Exclude patterns
    exclude: ["node_modules", "dist", "e2e"],
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "**/index.ts"],
    },
    // Type checking
    typecheck: {
      enabled: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
