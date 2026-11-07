"use client";

import { useEffect, useState } from "react";
import { useColorScheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { mode, systemMode, setMode } = useColorScheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !mode) {
    return (
      <IconButton disabled aria-label="Ubah tema" sx={{ width: 40, height: 40, opacity: 0 }}>
        <DarkModeIcon />
      </IconButton>
    );
  }

  const effective = mode === "system" ? systemMode : mode;
  const isDark = effective === "dark";

  return (
    <Tooltip title={isDark ? "Mode terang" : "Mode gelap"}>
      <IconButton
        color="inherit"
        aria-label="Ubah tema"
        onClick={() => setMode(isDark ? "light" : "dark")}
        sx={{ width: 40, height: 40 }}
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
