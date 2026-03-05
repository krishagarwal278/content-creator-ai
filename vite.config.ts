import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/**
 * Vite Configuration
 * Production-optimized build settings inspired by OpenShift Console
 * @see https://github.com/openshift/console
 */
export default defineConfig(({ mode }): UserConfig => {
  const isDev = mode === "development";
  const isProd = mode === "production";

  return {
    // Development Server
    server: {
      host: "::",
      port: 5173,
      strictPort: false,
      // Enable HMR with overlay for development errors
      hmr: {
        overlay: true,
      },
    },

    // Preview Server (for testing production builds locally)
    preview: {
      port: 5173,
    },

    plugins: [
      react({
        // SWC is already fast, but we can add dev-only options
        devTarget: "es2021",
      }),
    ],

    resolve: {
      alias: [
        // More specific aliases first (order matters!)
        { find: "@/lib", replacement: path.resolve(__dirname, "./src/common/utils") },
        { find: "@/hooks", replacement: path.resolve(__dirname, "./src/common/hooks") },
        { find: "@/components", replacement: path.resolve(__dirname, "./src/common/components") },
        { find: "@/api", replacement: path.resolve(__dirname, "./src/api") },
        { find: "@/config", replacement: path.resolve(__dirname, "./src/config") },
        { find: "@/features", replacement: path.resolve(__dirname, "./src/features") },
        { find: "@/common", replacement: path.resolve(__dirname, "./src/common") },
        { find: "@/styles", replacement: path.resolve(__dirname, "./src/styles") },
        // Catch-all for @/* last
        { find: "@", replacement: path.resolve(__dirname, "./src") },
      ],
    },

    // Build Configuration - Production Optimizations
    build: {
      // Target modern browsers for smaller bundles
      target: "es2021",
      // Output directory
      outDir: "dist",
      // Generate source maps for production debugging
      sourcemap: isProd ? "hidden" : true,
      // Minification settings
      minify: isProd ? "esbuild" : false,
      // CSS code splitting
      cssCodeSplit: true,
      // Chunk size warning limit (500KB)
      chunkSizeWarningLimit: 500,
      // Rollup-specific options for chunking
      rollupOptions: {
        output: {
          // Manual chunk splitting: smaller initial load + stable cacheable vendor chunks
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-mui": [
              "@mui/material",
              "@mui/icons-material",
              "@emotion/react",
              "@emotion/styled",
            ],
            "vendor-ui": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-tabs",
              "@radix-ui/react-tooltip",
              "@radix-ui/react-popover",
              "@radix-ui/react-select",
            ],
            "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
            "vendor-data": ["@tanstack/react-query", "@supabase/supabase-js"],
            "vendor-charts": ["recharts"],
          },
          // Content-based hashing for long-term caching
          entryFileNames: isProd ? "assets/[name]-[hash].js" : "assets/[name].js",
          chunkFileNames: isProd ? "assets/[name]-[hash].js" : "assets/[name].js",
          assetFileNames: isProd ? "assets/[name]-[hash].[ext]" : "assets/[name].[ext]",
        },
      },
    },

    // Optimization settings
    optimizeDeps: {
      // Pre-bundle these dependencies for faster dev startup
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "react-error-boundary",
        "@tanstack/react-query",
        "lucide-react",
        "clsx",
        "tailwind-merge",
      ],
      // Exclude large dependencies that should be loaded on-demand
      exclude: [],
    },

    // CSS configuration
    css: {
      // Enable CSS modules
      modules: {
        localsConvention: "camelCase",
      },
      devSourcemap: isDev,
    },

    // esbuild options for faster builds
    esbuild: {
      // Drop console.log in production (keep warn/error)
      drop: isProd ? ["debugger"] : [],
      // Legal comments handling
      legalComments: "none",
    },

    // Define global constants
    define: {
      __DEV__: JSON.stringify(isDev),
      __PROD__: JSON.stringify(isProd),
    },
  };
});
