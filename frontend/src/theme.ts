import { createTheme } from "@mui/material";

const base = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366f1",
      dark: "#4f46e5",
      light: "#8b8cf7",
    },
    background: {
      default: "#f5f7fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
});

export default base;
