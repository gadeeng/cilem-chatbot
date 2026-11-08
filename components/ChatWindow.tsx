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
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import FormattedMessage from "./FormattedMessage";
import LatticeLoader from "./LatticeLoader";

type Msg = {
  role: "user" | "model";
  content: string;
  time?: string;
  isError?: boolean;
};

const FALLBACK =
  "Mohon maaf, terjadi kendala saat memproses pertanyaan Anda. Silakan coba sesaat lagi, atau hubungi Call Center BSN di 150 286 / 1500 286 atau email pengaduan@bankbsn.co.id.";

const PROMPT_SUGGESTIONS = [
  { icon: <DescriptionRoundedIcon sx={{ fontSize: 16 }} />, text: "Apa saja syarat pengajuan BSN Cicil Emas?" },
  { icon: <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />, text: "Berapa lama pilihan tenor pembiayaannya?" },
  { icon: <PaymentsRoundedIcon sx={{ fontSize: 16 }} />, text: "Berapa rincian biaya proses dan administrasi?" },
  { icon: <BadgeRoundedIcon sx={{ fontSize: 16 }} />, text: "Dokumen apa saja yang perlu disiapkan karyawan?" },
];

const PERSISTENT_PROMPTS = [
  "Syarat Karyawan",
  "Tabel Biaya",
  "Pilihan Tenor",
  "Simulasi 10 Gram",
  "Download Bale Syariah",
  "Akad Murabahah",
];

function getTimeNow() {
  const now = new Date();
  return now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || loading) return;

    const time = getTimeNow();
    const next: Msg[] = [...messages, { role: "user", content: text, time }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setLastFailedMessage(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error || "Gagal memproses");
      setMessages([...next, { role: "model", content: data.reply, time: getTimeNow() }]);
    } catch {
      setLastFailedMessage(text);
      setMessages([
        ...next,
        { role: "model", content: FALLBACK, time: getTimeNow(), isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    if (lastFailedMessage) {
      send(lastFailedMessage);
    }
  }

  function handleCopy(text: string, idx: number) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }

  function handleConfirmReset() {
    setMessages([]);
    setInput("");
    setLastFailedMessage(null);
    setOpenResetDialog(false);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        flex: 1,
        minHeight: 0,
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      {/* Top Chat Subheader with Centered Content */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: { xs: 2, sm: 3 },
          py: 1.25,
          flexShrink: 0,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <Box
          sx={{
            maxWidth: 960,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                src="/bsn-logo.svg"
                alt="ALIEF BSN"
                sx={{
                  width: 40,
                  height: 40,
                  p: 0.5,
                  bgcolor: "#ffffff",
                  border: 1,
                  borderColor: "divider",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                  "& img": { objectFit: "contain" },
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  bgcolor: "#10b981",
                  border: "2px solid #ffffff",
                }}
              />
            </Box>
            <Box>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.98rem" }}>
                  ALIEF
                </Typography>
                <VerifiedRoundedIcon sx={{ fontSize: 17, color: "primary.main" }} />
                <Chip
                  label="Online"
                  size="small"
                  color="success"
                  sx={{
                    height: 22,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    px: 0.6,
                    display: { xs: "none", sm: "inline-flex" },
                  }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                Asisten Resmi BSN Cicil Emas
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}>
            {/* Clickable Call Center Phone Chip - Always visible on desktop & mobile */}
            <Tooltip title="Hubungi Call Center BSN">
              <Chip
                icon={<SupportAgentRoundedIcon sx={{ fontSize: 16 }} />}
                label="150 286"
                size="small"
                variant="outlined"
                component="a"
                href="tel:150286"
                clickable
                color="primary"
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  borderColor: "divider",
                  py: 1.8,
                  px: 0.6,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(0, 103, 71, 0.08)",
                    borderColor: "primary.main",
                  },
                }}
              />
            </Tooltip>

            {messages.length > 0 && (
              <Tooltip title="Mulai Percakapan Baru">
                <IconButton
                  size="small"
                  onClick={() => setOpenResetDialog(true)}
                  aria-label="Bersihkan riwayat chat"
                  sx={{
                    color: "text.secondary",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 0.8,
                    "&:hover": { bgcolor: "action.hover", color: "error.main" },
                  }}
                >
                  <RestartAltRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Main Message Stream Area */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Box
          sx={{
            maxWidth: 880,
            mx: "auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            minHeight: "100%",
          }}
        >
          {/* Welcome State when messages are empty */}
          {messages.length === 0 && (
            <Box
              sx={{
                mt: { xs: 2, sm: 3.5, md: 4.5 },
                mb: "auto",
                textAlign: "center",
                px: { xs: 1, sm: 2 },
              }}
            >
              <Paper
                variant="outlined"
                sx={(theme) => ({
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3.5,
                  maxWidth: 540,
                  mx: "auto",
                  bgcolor: "background.paper",
                  borderColor: "divider",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  ...theme.applyStyles("dark", {
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                  }),
                })}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    letterSpacing: "-0.2px",
                  }}
                  suppressHydrationWarning
                >
                  Assalamu&apos;alaikum!
                </Typography>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.84rem", sm: "0.9rem" },
                    maxWidth: 460,
                    mx: "auto",
                    mt: 0.85,
                    lineHeight: 1.65,
                    textWrap: "pretty",
                  }}
                  suppressHydrationWarning
                >
                  Saya <strong>ALIEF</strong>, asisten virtual resmi PT Bank Syariah Nasional. Saya siap membantu Anda
                  memperoleh informasi resmi dan akurat seputar produk <strong>BSN Cicil Emas</strong>.
                </Typography>

                {/* Quick Prompt Suggestions */}
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 700,
                    mt: 3,
                    mb: 1.5,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                  }}
                >
                  Pilih Pertanyaan Cepat
                </Typography>

                <Stack
                  direction="row"
                  sx={{
                    flexWrap: "wrap",
                    gap: 1.2,
                    justifyContent: "center",
                  }}
                >
                  {PROMPT_SUGGESTIONS.map((item, idx) => (
                    <Chip
                      key={idx}
                      icon={item.icon}
                      label={item.text}
                      variant="outlined"
                      onClick={() => send(item.text)}
                      sx={{
                        py: 2,
                        px: 0.8,
                        borderRadius: 2.5,
                        fontSize: { xs: "0.78rem", sm: "0.84rem" },
                        fontWeight: 600,
                        borderColor: "divider",
                        bgcolor: "action.hover",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "action.selected",
                          transform: "translateY(-1px)",
                          boxShadow: "0 2px 8px rgba(0, 103, 71, 0.12)",
                        },
                        "& .MuiChip-label": {
                          whiteSpace: "normal",
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Paper>
            </Box>
          )}

          {/* Message Stream */}
          {messages.map((m, i) => {
            const isUser = m.role === "user";
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isUser ? "flex-end" : "flex-start",
                  gap: 0.5,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    maxWidth: { xs: "94%", sm: "85%" },
                    flexDirection: isUser ? "row-reverse" : "row",
                    alignItems: "flex-start",
                  }}
                >
                  {!isUser && (
                    <Avatar
                      src="/bsn-logo.svg"
                      alt="ALIEF"
                      sx={{
                        width: 34,
                        height: 34,
                        p: 0.45,
                        bgcolor: "#ffffff",
                        border: 1,
                        borderColor: "divider",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        flexShrink: 0,
                        mt: 0.5,
                        "& img": { objectFit: "contain" },
                      }}
                    />
                  )}

                  <Paper
                    elevation={0}
                    sx={(theme) => ({
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                      bgcolor: isUser ? "primary.main" : "background.paper",
                      color: isUser ? "primary.contrastText" : "text.primary",
                      border: isUser ? 0 : 1,
                      borderColor: m.isError ? "error.main" : "divider",
                      boxShadow: isUser
                        ? "0 2px 10px rgba(0, 103, 71, 0.2)"
                        : "0 2px 12px rgba(0, 0, 0, 0.04)",
                      ...(!isUser &&
                        theme.applyStyles("dark", {
                          bgcolor: "rgba(255, 255, 255, 0.03)",
                          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.25)",
                        })),
                    })}
                  >
                    {!isUser && (
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: "primary.main", fontSize: "0.82rem" }}
                        >
                          ALIEF
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                          • Bank Syariah Nasional
                        </Typography>
                      </Stack>
                    )}

                    {/* Rich Formatted Message with Markdown Tables & Interactive Links */}
                    <FormattedMessage content={m.content} isUser={isUser} />

                    {/* Retry button for error states */}
                    {m.isError && (
                      <Box sx={{ mt: 1.5, pt: 1, borderTop: 1, borderColor: "divider" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<ReplayRoundedIcon />}
                          onClick={handleRetry}
                          sx={{ fontSize: "0.78rem", py: 0.5 }}
                        >
                          Coba Pertanyaan Lagi
                        </Button>
                      </Box>
                    )}

                    {/* Actions for Assistant Bubble */}
                    {!isUser && !m.isError && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          mt: 1.5,
                          pt: 0.75,
                          borderTop: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Tooltip title={copiedIndex === i ? "Tersalin!" : "Salin Jawaban"}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(m.content, i)}
                            aria-label="Salin jawaban ALIEF"
                            sx={{
                              color: copiedIndex === i ? "success.main" : "text.secondary",
                              p: 0.5,
                            }}
                          >
                            {copiedIndex === i ? (
                              <CheckRoundedIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Paper>
                </Box>

                {/* Timestamp Indicator */}
                {m.time && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                      px: isUser ? 1 : 5.5,
                      fontWeight: 500,
                    }}
                  >
                    {m.time}
                  </Typography>
                )}
              </Box>
            );
          })}

          {/* Animated Typing Indicator with LatticeLoader */}
          {loading && (
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", pl: 0.5 }}>
              <Avatar
                src="/bsn-logo.svg"
                alt="ALIEF"
                sx={{
                  width: 34,
                  height: 34,
                  p: 0.45,
                  bgcolor: "#ffffff",
                  border: 1,
                  borderColor: "divider",
                  "& img": { objectFit: "contain" },
                }}
              />
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  py: 1.35,
                  px: 2.25,
                  borderRadius: "20px 20px 20px 4px",
                  bgcolor: "background.paper",
                  color: "text.secondary",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <LatticeLoader
                  label="ALIEF sedang menyiapkan rincian resmi..."
                  status="working"
                  pattern="orbit"
                  grid={3}
                  shape="round"
                  color="var(--mui-palette-primary-main, #006747)"
                  doneColor="var(--mui-palette-primary-main, #006747)"
                  cellSize={5}
                  gap={2}
                  fontSize={13}
                  glow={true}
                  showTimer={true}
                />
              </Paper>
            </Box>
          )}
        </Box>
      </Box>

      {/* Input Form Bar with Persistent Quick Suggestions */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        sx={{
          flexShrink: 0,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: { xs: 2, sm: 3 },
          pt: 1.5,
          pb: {
            xs: "max(24px, env(safe-area-inset-bottom))",
            sm: 3,
            md: 3.5,
          },
        }}
      >
        <Box sx={{ maxWidth: 880, mx: "auto", width: "100%" }}>
          {/* Persistent Quick Follow-up Chips (visible even when conversation is active) */}
          {messages.length > 0 && (
            <Box
              sx={{
                mb: 1.5,
                overflowX: "auto",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                display: "flex",
                gap: 1,
                py: 0.25,
              }}
            >
              {PERSISTENT_PROMPTS.map((prompt, idx) => (
                <Chip
                  key={idx}
                  label={prompt}
                  size="small"
                  variant="outlined"
                  onClick={() => send(prompt)}
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    borderColor: "divider",
                    bgcolor: "action.hover",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.selected",
                      transform: "translateY(-1px)",
                    },
                  }}
                />
              ))}
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 0.6,
              pl: 2.25,
              borderRadius: 4,
              border: 1.5,
              borderColor: "divider",
              bgcolor: "action.hover",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              "&:focus-within": {
                borderColor: "primary.main",
                boxShadow: "0 0 0 2px rgba(0, 103, 71, 0.15)",
              },
            }}
          >
            <TextField
              fullWidth
              variant="standard"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Tulis pertanyaan seputar syarat, tenor, atau biaya emas..."
              slotProps={{
                htmlInput: {
                  maxLength: 2000,
                  enterKeyHint: "send",
                  sx: {
                    fontSize: { xs: 16, sm: 14.5 },
                    py: 1,
                  },
                },
              }}
              sx={{
                "& .MuiInput-underline:before": { display: "none" },
                "& .MuiInput-underline:after": { display: "none" },
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={loading || !input.trim()}
              aria-label="Kirim pertanyaan"
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                bgcolor: input.trim() && !loading ? "primary.main" : "transparent",
                color: input.trim() && !loading ? "primary.contrastText" : "action.disabled",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: input.trim() && !loading ? "primary.dark" : "transparent",
                },
              }}
            >
              <SendRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Micro-disclaimer */}
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: "text.secondary",
              fontSize: "0.75rem",
              mt: 1,
              fontWeight: 500,
            }}
          >
            Hubungi Call Center BSN: 150 286 / 1500 286
          </Typography>
        </Box>
      </Box>

      {/* Confirmation Dialog for Resetting Chat */}
      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3.5,
              p: 1,
              maxWidth: 420,
            },
          },
        }}
      >
        <DialogTitle id="reset-dialog-title" sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
          Mulai Percakapan Baru?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description" sx={{ fontSize: "0.88rem", color: "text.secondary" }}>
            Riwayat percakapan konsultasi Anda saat ini akan dibersihkan. Catatan syarat dan informasi yang telah
            disampaikan sebelumnya akan hilang.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenResetDialog(false)}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmReset}
            variant="contained"
            color="primary"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Ya, Mulai Baru
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
