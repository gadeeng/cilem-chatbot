import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ThemeRegistry from "@/components/ThemeRegistry";
import Header from "@/components/Header";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BSN Cicil Emas Assistant",
  description:
    "Informasi produk BSN Cicil Emas dari PT Bank Syariah Nasional, dengan asisten virtual dan FAQ.",
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
          <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <DisclaimerBanner />
            <Header />
            <Box component="main" sx={{ flex: 1, px: 2 }}>
              {children}
            </Box>
            <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                Call Center BSN: 150 286 / 1500 286 · pengaduan@bankbsn.co.id
              </Typography>
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
