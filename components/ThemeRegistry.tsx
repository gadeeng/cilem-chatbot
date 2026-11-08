"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#006747",
          dark: "#004d35",
          light: "#008a5e",
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#004d35",
          dark: "#003322",
          light: "#006747",
          contrastText: "#ffffff",
        },
        background: {
          default: "#f6f8f7",
          paper: "#ffffff",
        },
        divider: "rgba(0, 40, 20, 0.08)",
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#14b881",
          dark: "#008a5e",
          light: "#38d9a9",
          contrastText: "#0e1512",
        },
        secondary: {
          main: "#38d9a9",
          dark: "#14b881",
          light: "#6ee7b7",
          contrastText: "#0e1512",
        },
        background: {
          default: "#0b120e",
          paper: "#131e18",
        },
        divider: "rgba(255, 255, 255, 0.08)",
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
