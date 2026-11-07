import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1512" },
  ],
};

export const metadata: Metadata = {
  title: "BSN Cicil Emas Assistant",
  description:
    "Informasi produk BSN Cicil Emas dari PT Bank Syariah Nasional, dengan asisten virtual.",
  icons: {
    icon: "/bsn-logo.svg",
    shortcut: "/bsn-logo.svg",
    apple: "/bsn-logo.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body suppressHydrationWarning>
        <InitColorSchemeScript attribute="class" defaultMode="system" />
        <ThemeRegistry>
          <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
            <Header />
            <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              {children}
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
