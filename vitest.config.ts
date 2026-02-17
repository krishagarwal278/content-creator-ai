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
    // Use happy-dom for React component testing (faster and better ESM compatibility than jsdom)
    environment: "happy-dom",
    // Global test utilities
    globals: true,
    // Setup files for test configuration
    setupFiles: ["./src/test/setup.ts"],
    // Include patterns
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Exclude patterns
    exclude: ["node_modules", "dist", "e2e", "cypress"],
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/test/",
        "cypress/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts",
        "src/common/components/ui/**", // Exclude shadcn UI components from coverage
      ],
      reportsDirectory: "./coverage",
    },
    // Timeout for slow tests
    testTimeout: 10000,
    // Retry failed tests
    retry: 1,
  },
  resolve: {
    alias: {
      "@/test": path.resolve(__dirname, "./src/test"),
      "@/api": path.resolve(__dirname, "./src/api"),
      "@/common": path.resolve(__dirname, "./src/common"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/components/ui": path.resolve(__dirname, "./src/common/components/ui"),
      "@/components": path.resolve(__dirname, "./src/common/components"),
      "@/lib": path.resolve(__dirname, "./src/common/utils"),
      "@/hooks": path.resolve(__dirname, "./src/common/hooks"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
