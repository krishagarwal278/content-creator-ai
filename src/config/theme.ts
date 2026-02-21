import { createTheme, type ThemeOptions } from "@mui/material/styles";

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
};

const theme = createTheme({
  ...baseTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "#2dd4bf",
      light: "#5eead4",
      dark: "#14b8a6",
    },
    secondary: {
      main: "#a78bfa",
      light: "#c4b5fd",
      dark: "#8b5cf6",
    },
    background: {
      default: "hsl(222, 47%, 6%)",
      paper: "hsl(222, 47%, 9%)",
    },
    text: {
      primary: "hsl(210, 40%, 98%)",
      secondary: "hsl(215, 20%, 55%)",
    },
    divider: "hsl(217, 33%, 17%)",
  },
});

export default theme;

export function createAppTheme(mode: "light" | "dark") {
  if (mode === "light") {
    return createTheme({
      ...baseTheme,
      palette: {
        mode: "light",
        primary: {
          main: "#0d9488",
          light: "#14b8a6",
          dark: "#0f766e",
        },
        secondary: {
          main: "#8b5cf6",
          light: "#a78bfa",
          dark: "#7c3aed",
        },
        background: {
          default: "#ffffff",
          paper: "#ffffff",
        },
        text: {
          primary: "#0f172a",
          secondary: "#64748b",
        },
        divider: "#e2e8f0",
      },
    });
  }

  return createTheme({
    ...baseTheme,
    palette: {
      mode: "dark",
      primary: {
        main: "#2dd4bf",
        light: "#5eead4",
        dark: "#14b8a6",
      },
      secondary: {
        main: "#a78bfa",
        light: "#c4b5fd",
        dark: "#8b5cf6",
      },
      background: {
        default: "hsl(222, 47%, 6%)",
        paper: "hsl(222, 47%, 9%)",
      },
      text: {
        primary: "hsl(210, 40%, 98%)",
        secondary: "hsl(215, 20%, 55%)",
      },
      divider: "hsl(217, 33%, 17%)",
    },
  });
}
