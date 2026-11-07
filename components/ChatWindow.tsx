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

type Msg = {
  role: "user" | "model";
  content: string;
  time?: string;
};

const FALLBACK =
  "Mohon maaf, terjadi kendala saat memproses pertanyaan Anda. Silakan coba sesaat lagi, atau hubungi Call Center BSN di 150 286 / 1500 286 atau email pengaduan@bankbsn.co.id.";

const PROMPT_SUGGESTIONS = [
  { icon: <DescriptionRoundedIcon sx={{ fontSize: 16 }} />, text: "Apa saja syarat pengajuan BSN Cicil Emas?" },
  { icon: <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />, text: "Berapa lama pilihan tenor pembiayaannya?" },
  { icon: <PaymentsRoundedIcon sx={{ fontSize: 16 }} />, text: "Berapa rincian biaya proses dan administrasi?" },
  { icon: <BadgeRoundedIcon sx={{ fontSize: 16 }} />, text: "Dokumen apa saja yang perlu disiapkan karyawan?" },
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
      setMessages([...next, { role: "model", content: FALLBACK, time: getTimeNow() }]);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(text: string, idx: number) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }

  function handleReset() {
    setMessages([]);
    setInput("");
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
      {/* Top Chat Subheader (Full Width with Centered Content) */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: { xs: 2, sm: 3 },
          py: 1.2,
          flexShrink: 0,
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
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
                  width: 38,
                  height: 38,
                  p: 0.5,
                  bgcolor: "#ffffff",
                  border: 1,
                  borderColor: "divider",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  "& img": { objectFit: "contain" },
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "#10b981",
                  border: "2px solid #ffffff",
                }}
              />
            </Box>
            <Box>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                  ALIEF
                </Typography>
                <VerifiedRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                <Chip
                  label="Online"
                  size="small"
                  color="success"
                  sx={{
                    height: 18,
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    px: 0.5,
                    display: { xs: "none", sm: "inline-flex" },
                  }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                Asisten Virtual Produk BSN Cicil Emas
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Tooltip title="Hubungi Call Center BSN">
              <Chip
                icon={<SupportAgentRoundedIcon sx={{ fontSize: 16 }} />}
                label="150 286"
                size="small"
                variant="outlined"
                component="a"
                href="tel:150286"
                clickable
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderColor: "divider",
                }}
              />
            </Tooltip>
            {messages.length > 0 && (
              <Tooltip title="Mulai Percakapan Baru">
                <IconButton
                  size="small"
                  onClick={handleReset}
                  sx={{
                    color: "text.secondary",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 0.8,
                    "&:hover": { bgcolor: "action.hover", color: "primary.main" },
                  }}
                >
                  <RestartAltRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Main Message Stream Area (Scrollable Room Chat with Hidden Scrollbar) */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          // Sembunyikan tampilan scrollbar di semua browser tapi tetap dapat di-scroll
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE / Edge
          "&::-webkit-scrollbar": {
            display: "none", // Chrome, Safari, Edge
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
          {/* Welcome State when messages are empty (NO BSN LOGO per request) */}
          {messages.length === 0 && (
            <Box
              sx={{
                mt: { xs: 2, sm: 3.5, md: 5 },
                mb: "auto",
                textAlign: "center",
                px: { xs: 1, sm: 2 },
              }}
            >
              <Paper
                variant="outlined"
                sx={(theme) => ({
                  p: { xs: 2.25, sm: 3 },
                  borderRadius: 3.5,
                  maxWidth: 520,
                  mx: "auto",
                  bgcolor: "background.paper",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.03)",
                  ...theme.applyStyles("dark", {
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
                  }),
                })}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    fontSize: { xs: "1.05rem", sm: "1.2rem" },
                    letterSpacing: "-0.2px",
                  }}
                  suppressHydrationWarning
                >
                  Assalamu&apos;alaikum!
                </Typography>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.82rem", sm: "0.88rem" },
                    maxWidth: 440,
                    mx: "auto",
                    mt: 0.75,
                    lineHeight: 1.6,
                  }}
                  suppressHydrationWarning
                >
                  Saya <strong>ALIEF</strong>, asisten virtual PT Bank Syariah Nasional. Saya siap membantu Anda
                  memperoleh informasi akurat seputar produk <strong>BSN Cicil Emas</strong>.
                </Typography>

                {/* Quick Prompt Suggestions */}
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 700,
                    mt: 2.5,
                    mb: 1.2,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    fontSize: "0.68rem",
                  }}
                >
                  Pilih Pertanyaan Cepat
                </Typography>

                <Stack
                  direction="row"
                  sx={{
                    flexWrap: "wrap",
                    gap: 1,
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
                        py: 1.5,
                        px: 0.5,
                        borderRadius: 2.5,
                        fontSize: { xs: "0.75rem", sm: "0.8rem" },
                        fontWeight: 500,
                        borderColor: "divider",
                        bgcolor: "action.hover",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: "action.selected",
                          transform: "translateY(-1px)",
                          boxShadow: "0 2px 6px rgba(0, 103, 71, 0.1)",
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
                    maxWidth: { xs: "92%", sm: "85%" },
                    flexDirection: isUser ? "row-reverse" : "row",
                    alignItems: "flex-start",
                  }}
                >
                  {!isUser && (
                    <Avatar
                      src="/bsn-logo.svg"
                      alt="ALIEF"
                      sx={{
                        width: 32,
                        height: 32,
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
                      p: { xs: 1.75, sm: 2.25 },
                      borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                      bgcolor: isUser ? "primary.main" : "background.paper",
                      color: isUser ? "primary.contrastText" : "text.primary",
                      border: isUser ? 0 : 1,
                      borderColor: "divider",
                      boxShadow: isUser
                        ? "0 2px 10px rgba(0, 103, 71, 0.2)"
                        : "0 2px 10px rgba(0, 0, 0, 0.04)",
                      ...(!isUser &&
                        theme.applyStyles("dark", {
                          bgcolor: "rgba(255, 255, 255, 0.03)",
                          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.25)",
                        })),
                    })}
                  >
                    {!isUser && (
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.85 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: "primary.main", fontSize: "0.8rem" }}
                        >
                          ALIEF
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                          • Bank Syariah Nasional
                        </Typography>
                      </Stack>
                    )}

                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: "0.88rem", sm: "0.94rem" },
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {m.content}
                    </Typography>

                    {/* Actions for Assistant Bubble */}
                    {!isUser && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          mt: 1.2,
                          pt: 0.75,
                          borderTop: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Tooltip title={copiedIndex === i ? "Tersalin!" : "Salin Jawaban"}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(m.content, i)}
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
                      color: "text.disabled",
                      fontSize: "0.68rem",
                      px: isUser ? 1 : 5.5,
                    }}
                  >
                    {m.time}
                  </Typography>
                )}
              </Box>
            );
          })}

          {/* Animated Typing Indicator */}
          {loading && (
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", pl: 0.5 }}>
              <Avatar
                src="/bsn-logo.svg"
                alt="ALIEF"
                sx={{
                  width: 32,
                  height: 32,
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
                  py: 1.25,
                  px: 2,
                  borderRadius: "20px 20px 20px 4px",
                  bgcolor: "background.paper",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      animation: "pulseDot 1.4s infinite ease-in-out both",
                      animationDelay: "0s",
                      "@keyframes pulseDot": {
                        "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
                        "40%": { transform: "scale(1.1)", opacity: 1 },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      animation: "pulseDot 1.4s infinite ease-in-out both",
                      animationDelay: "0.2s",
                      "@keyframes pulseDot": {
                        "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
                        "40%": { transform: "scale(1.1)", opacity: 1 },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      animation: "pulseDot 1.4s infinite ease-in-out both",
                      animationDelay: "0.4s",
                      "@keyframes pulseDot": {
                        "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
                        "40%": { transform: "scale(1.1)", opacity: 1 },
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  ALIEF sedang menyiapkan jawaban...
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>

      {/* Input Form Bar (Full Width Container with Centered Input Box) */}
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
          pt: { xs: 1.5, sm: 2 },
          pb: {
            xs: "max(24px, env(safe-area-inset-bottom))",
            sm: 3.5,
            md: 4.5,
          },
        }}
      >
        <Box sx={{ maxWidth: 880, mx: "auto", width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 0.6,
              pl: 2.25,
              borderRadius: 4,
              border: 1,
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
              placeholder="Tulis pertanyaan seputar BSN Cicil Emas..."
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
              color: "text.disabled",
              fontSize: "0.7rem",
              mt: 1,
            }}
          >
            ALIEF menyajikan data resmi RIPLAY PT Bank Syariah Nasional · Call Center BSN: 150 286 / 1500 286
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
