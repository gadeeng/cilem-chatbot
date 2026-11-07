"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/chat", label: "Chat" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Toolbar sx={{ px: { xs: 1.5, sm: 3 }, minHeight: { xs: 54, sm: 64 }, gap: { xs: 0.5, sm: 1 } }}>
        <Box
          component={Link}
          href="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
            textDecoration: "none",
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <Box
            component="img"
            src="/bsn-logo.svg"
            alt="Bank BSN"
            sx={{ height: { xs: 24, sm: 28 }, width: "auto", display: "block", flexShrink: 0 }}
          />
        </Box>
        {links.map((l) => (
          <Button
            key={l.href}
            component={Link}
            href={l.href}
            color={pathname === l.href ? "primary" : "inherit"}
            variant={pathname === l.href ? "contained" : "text"}
            size="small"
            sx={{
              px: { xs: 1.2, sm: 1.8 },
              minWidth: { xs: "auto", sm: 54 },
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            {l.label}
          </Button>
        ))}
        <ThemeToggle />
      </Toolbar>
    </AppBar>
  );
}
