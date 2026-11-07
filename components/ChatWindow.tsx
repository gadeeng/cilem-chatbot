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
      sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 190px)", minHeight: 420, maxWidth: 720, mx: "auto", my: 2, overflow: "hidden" }}
    >
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {messages.length === 0 && (
          <Stack spacing={2} sx={{ alignItems: "center", mt: 4, textAlign: "center" }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              <SmartToyIcon />
            </Avatar>
            <Typography sx={{ color: "text.secondary" }}>
              Halo! Tanyakan apa saja tentang produk BSN Cicil Emas.
            </Typography>
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
              {SUGGESTIONS.map((s) => (
                <Chip key={s} label={s} variant="outlined" color="primary" onClick={() => send(s)} />
              ))}
            </Stack>
          </Stack>
        )}
        <Stack spacing={1.5}>
          {messages.map((m, i) => {
            const user = m.role === "user";
            return (
              <Box key={i} sx={{ display: "flex", justifyContent: user ? "flex-end" : "flex-start", gap: 1 }}>
                {!user && (
                  <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: "80%",
                    px: 2,
                    py: 1,
                    borderRadius: 3,
                    whiteSpace: "pre-wrap",
                    bgcolor: user ? "primary.main" : "action.hover",
                    color: user ? "primary.contrastText" : "text.primary",
                  }}
                >
                  <Typography variant="body2">{m.content}</Typography>
                </Box>
              </Box>
            );
          })}
          {loading && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "text.secondary" }}>
              <CircularProgress size={16} />
              <Typography variant="body2">Asisten sedang mengetik...</Typography>
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
        sx={{ display: "flex", gap: 1, p: 1.5, borderTop: 1, borderColor: "divider" }}
      >
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaan Anda..."
          slotProps={{ htmlInput: { maxLength: 2000 } }}
        />
        <IconButton type="submit" color="primary" disabled={loading || !input.trim()} aria-label="Kirim">
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
