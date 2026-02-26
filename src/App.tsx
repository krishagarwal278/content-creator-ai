import { useMemo, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";

// Common imports (keep in main bundle – needed for shell)
import { Toaster } from "@/common/components/ui/toaster";
import { Toaster as Sonner } from "@/common/components/ui/sonner";
import { TooltipProvider } from "@/common/components/ui/tooltip";
import { AppLayout } from "@/common/components/layout/AppLayout";
import { RouteFallback } from "@/common/components/RouteFallback";
import { AuthProvider } from "@/common/contexts/AuthContext";
import { ProjectProvider } from "@/common/contexts/ProjectContext";
import { ThemeProvider, useTheme } from "@/common/contexts/ThemeContext";
import { createAppTheme } from "@/config/theme";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";

// Route-level code splitting: load pages only when their route is visited
const LandingPage = lazy(() => import("./features/landing/LandingPage"));
const AuthPage = lazy(() => import("./features/auth/Auth"));
const LegalPage = lazy(() => import("@/features/legal/LegalPage"));
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage"));
const HistoryPage = lazy(() => import("./features/dashboard/HistoryPage"));
const ProjectsPage = lazy(() => import("./features/projects/Projects"));
const SettingsPage = lazy(() => import("./features/settings/Settings"));
const NotFound = lazy(() => import("@/common/components/NotFound"));

const queryClient = new QueryClient();

function AppContent() {
  const { resolvedTheme } = useTheme();
  const muiTheme = useMemo(() => createAppTheme(resolvedTheme), [resolvedTheme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <TooltipProvider>
        <AuthProvider>
          <ProjectProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/legal/:type" element={<LegalPage />} />

                  {/* Protected routes - require authentication */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/project/:id" element={<DashboardPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ProjectProvider>
        </AuthProvider>
      </TooltipProvider>
    </MuiThemeProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <AppContent />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
