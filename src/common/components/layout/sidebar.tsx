import * as React from "react";
import { Home, FolderOpen, Settings, History, Sparkles, PlusCircle, LogOut } from "lucide-react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Avatar,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation, NavLink } from "react-router-dom";

import { useProjectContext, useAuth } from "@/common/contexts";
import { accountService, DEFAULT_ACCOUNT_INFO } from "@/api";
import "@/styles/layout.css";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: FolderOpen, label: "Projects", path: "/projects" },
  { icon: History, label: "History", path: "/history" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const { createNewProject } = useProjectContext();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [planDisplay, setPlanDisplay] = React.useState("Free Plan");

  // Fetch account info for sidebar plan display
  React.useEffect(() => {
    async function loadAccountInfo() {
      if (!user?.id) {
        return;
      }
      try {
        const info = await accountService.getAccountInfo(user.id);
        setPlanDisplay(info.isBetaUser ? "Beta Tester" : info.planName || "Free Plan");
      } catch {
        setPlanDisplay(DEFAULT_ACCOUNT_INFO.isBetaUser ? "Beta Tester" : "Free Plan");
      }
    }
    loadAccountInfo();
  }, [user?.id]);

  const handleNewProject = () => {
    createNewProject();
    navigate("/");
  };

  const handleUserSectionClick = () => {
    navigate("/settings?tab=account");
  };

  return (
    <Drawer variant="permanent" className="sidebar-drawer" sx={{ flexShrink: 0 }}>
      {/* Logo */}
      <Box className="sidebar-logo-container">
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box className="sidebar-logo-icon">
            <Sparkles size={20} color="white" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
              Veya
            </Typography>
            <Typography variant="caption" color="text.secondary"></Typography>
          </Box>
        </Stack>
      </Box>

      {/* New Project Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleNewProject}
          startIcon={<PlusCircle size={18} />}
          className="new-project-button"
        >
          New Project
        </Button>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                className={`nav-item-button ${isActive ? "selected" : ""}`}
                selected={isActive}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                  <Icon size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
                {isActive && <Box className="nav-item-indicator" />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Section */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Tooltip title="View account & credits" placement="top">
          <Box
            onClick={handleUserSectionClick}
            sx={{
              cursor: "pointer",
              borderRadius: 2,
              p: 1.5,
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar className="user-avatar" sx={{ width: 36, height: 36 }}>
                {user?.email?.charAt(0).toUpperCase() || "G"}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" fontWeight="medium" noWrap sx={{ lineHeight: 1.3 }}>
                  {user?.email?.split("@")[0] || "Guest"}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {planDisplay}
                </Typography>
              </Box>
              <IconButton
                onClick={async (e) => {
                  e.stopPropagation();
                  await signOut();
                  navigate("/");
                }}
                size="small"
                title="Log Out"
                sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
              >
                <LogOut size={16} />
              </IconButton>
            </Stack>
          </Box>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
