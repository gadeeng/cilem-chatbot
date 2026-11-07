"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0b7a5b" },
        secondary: { main: "#b8860b" },
        background: { default: "#f6f8f7", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#3ddc97" },
        secondary: { main: "#e0b84c" },
        background: { default: "#0e1512", paper: "#16201b" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme} defaultMode="system">
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

