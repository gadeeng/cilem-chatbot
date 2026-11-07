"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";

type Msg = { role: "user" | "model"; content: string };

const FALLBACK =
  "Maaf, terjadi kendala saat memproses pertanyaan Anda. Silakan coba lagi, atau hubungi Call Center BSN di 150 286 / 1500 286 atau email pengaduan@bankbsn.co.id.";

const SUGGESTIONS = [
  "Apa itu BSN Cicil Emas?",
  "Berapa tenor pembiayaannya?",
  "Apa saja syarat pengajuan?",
  "Dokumen apa yang disiapkan?",
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error);
      setMessages([...next, { role: "model", content: data.reply }]);
    } catch {
      setMessages([...next, { role: "model", content: FALLBACK }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: { xs: "calc(100dvh - 54px - 38px)", sm: "calc(100dvh - 64px - 45px - 32px)" },
        minHeight: 320,
        maxWidth: 720,
        width: "100%",
        mx: "auto",
        my: { xs: 0, sm: 2 },
        overflow: "hidden",
        borderRadius: { xs: 0, sm: 3 },
        borderTopWidth: { xs: 0, sm: 1 },
        borderBottomWidth: { xs: 0, sm: 1 },
        borderLeftWidth: { xs: 0, sm: 1 },
        borderRightWidth: { xs: 0, sm: 1 },
      }}
    >
      <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 1.5, sm: 2 }, overscrollBehavior: "contain" }}>
        {messages.length === 0 && (
          <Stack spacing={2} sx={{ alignItems: "center", mt: { xs: 2.5, sm: 4 }, textAlign: "center" }}>
            <Typography sx={{ color: "text.secondary", fontSize: { xs: "0.95rem", sm: "1rem" } }}>
              Assalamu'alaikum, saya ALIEF. Senang membantu Anda! Ada yang ingin diketahui seputar produk Cicilan Emas? Silakan tanyakan, InsyaAllah saya siap membantu.
            </Typography>
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: { xs: 0.75, sm: 1 }, justifyContent: "center", px: { xs: 1, sm: 0 } }}>
              {SUGGESTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => send(s)}
                  sx={{
                    height: "auto",
                    py: 0.6,
                    px: 0.5,
                    fontSize: { xs: "0.78rem", sm: "0.82rem" },
                    "& .MuiChip-label": { whiteSpace: "normal", textAlign: "center" },
                  }}
                />
              ))}
            </Stack>
          </Stack>
        )}
        <Stack spacing={1.5}>
          {messages.map((m, i) => {
            const user = m.role === "user";
            return (
              <Box key={i} sx={{ display: "flex", justifyContent: user ? "flex-end" : "flex-start", gap: { xs: 0.75, sm: 1 } }}>
                {!user && (
                  <Avatar
                    src="/bsn-logo.svg"
                    alt="BSN"
                    sx={{
                      bgcolor: "#ffffff",
                      width: { xs: 26, sm: 32 },
                      height: { xs: 26, sm: 32 },
                      p: 0.35,
                      border: 1,
                      borderColor: "divider",
                      flexShrink: 0,
                      mt: 0.5,
                      "& img": { objectFit: "contain" },
                    }}
                  />
                )}
                <Box
                  sx={{
                    maxWidth: { xs: "86%", sm: "80%" },
                    px: { xs: 1.5, sm: 2 },
                    py: 1,
                    borderRadius: 3,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    bgcolor: user ? "primary.main" : "action.hover",
                    color: user ? "primary.contrastText" : "text.primary",
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" }, lineHeight: 1.6, overflowWrap: "anywhere" }}>{m.content}</Typography>
                </Box>
              </Box>
            );
          })}
          {loading && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "text.secondary", pl: 0.5 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>Asisten sedang mengetik...</Typography>
            </Stack>
          )}
        </Stack>
        <div ref={endRef} />
      </Box>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        sx={{
          display: "flex",
          gap: 1,
          p: { xs: 1, sm: 1.5 },
          pb: { xs: "max(8px, env(safe-area-inset-bottom))", sm: "max(12px, env(safe-area-inset-bottom))" },
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaan Anda..."
          slotProps={{ htmlInput: { maxLength: 2000, enterKeyHint: "send", sx: { fontSize: 16 } } }}
        />
        <IconButton type="submit" color="primary" disabled={loading || !input.trim()} aria-label="Kirim" sx={{ flexShrink: 0, width: 40, height: 40 }}>
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}
