"use client";

import { useColorScheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  if (!mode) return <IconButton disabled aria-label="Ubah tema" />;
  const effective = mode === "system" ? systemMode : mode;
  const isDark = effective === "dark";
  return (
    <Tooltip title={isDark ? "Mode terang" : "Mode gelap"}>
      <IconButton
        color="inherit"
        aria-label="Ubah tema"
        onClick={() => setMode(isDark ? "light" : "dark")}
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

