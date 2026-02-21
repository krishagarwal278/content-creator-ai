import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

// Common imports
import { Toaster } from "@/common/components/ui/toaster";
import { Toaster as Sonner } from "@/common/components/ui/sonner";
import { TooltipProvider } from "@/common/components/ui/tooltip";
import { AppLayout } from "@/common/components/layout/AppLayout";
import NotFound from "@/common/components/NotFound";
import { ProjectProvider, AuthProvider } from "@/common/contexts";
import theme from "@/config/theme";

// Feature imports - use full paths to avoid barrel re-export issues
import LandingPage from "./features/landing/LandingPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import HistoryPage from "./features/dashboard/HistoryPage";
import ProjectsPage from "./features/projects/Projects";
import SettingsPage from "./features/settings/Settings";
import AuthPage from "./features/auth/Auth";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { LegalPage } from "./features/legal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TooltipProvider>
        <AuthProvider>
          <ProjectProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
            </BrowserRouter>
          </ProjectProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
