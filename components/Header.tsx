"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import SavingsIcon from "@mui/icons-material/Savings";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/chat", label: "Chat" },
  { href: "/faq", label: "FAQ" },
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
      <Toolbar sx={{ gap: 1 }}>
        <Box
          component={Link}
          href="/"
          sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main", textDecoration: "none", flexGrow: 1 }}
        >
          <SavingsIcon />
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            BSN Cicil Emas
          </Typography>
        </Box>
        {links.map((l) => (
          <Button
            key={l.href}
            component={Link}
            href={l.href}
            color={pathname === l.href ? "primary" : "inherit"}
            variant={pathname === l.href ? "contained" : "text"}
            size="small"
          >
            {l.label}
          </Button>
        ))}
        <ThemeToggle />
      </Toolbar>
    </AppBar>
  );
}

