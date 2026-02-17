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
} from "@mui/material";
import { useNavigate, useLocation, NavLink } from "react-router-dom";

import { useProjectContext, useAuth } from "@/common/contexts";
import "@/styles/layout.css";

const DRAWER_WIDTH = 260;

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: FolderOpen, label: "Projects", path: "/projects" },
  { icon: History, label: "History", path: "/history" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const { createNewProject } = useProjectContext();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();

  const handleNewProject = () => {
    createNewProject();
    navigate("/");
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
              ContentAI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Video Generator
            </Typography>
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
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, py: 1 }}>
          <Avatar className="user-avatar">{user?.email?.charAt(0).toUpperCase() || "G"}</Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight="medium" noWrap>
              {user?.email || "Guest User"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Free Plan
            </Typography>
          </Box>
          <IconButton onClick={() => signOut()} size="small" title="Log Out">
            <LogOut size={18} />
          </IconButton>
        </Stack>
      </Box>
    </Drawer>
  );
}
