"use client";

import Link from "next/link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import ChatIcon from "@mui/icons-material/Chat";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SpeedIcon from "@mui/icons-material/Speed";
import PaymentsIcon from "@mui/icons-material/Payments";
import Footer from "@/components/Footer";

const features = [
  {
    icon: <VerifiedUserIcon sx={{ color: "primary.main", fontSize: 28 }} />,
    title: "Prinsip Murabahah",
    text: "Pembiayaan syariah resmi untuk kepemilikan emas murni yang dimiliki dan dipergunakan sendiri tanpa riba.",
  },
  {
    icon: <PaymentsIcon sx={{ color: "primary.main", fontSize: 28 }} />,
    title: "Angsuran Tetap",
    text: "Ujrah atau margin bersifat pasti dan tetap sejak awal akad hingga pembiayaan lunas tanpa kenaikan.",
  },
  {
    icon: <SpeedIcon sx={{ color: "primary.main", fontSize: 28 }} />,
    title: "Pengajuan Mudah",
    text: "Konsultasikan simulasi dengan ALIEF, lalu ajukan langsung melalui Kantor Cabang BSN terdekat.",
  },
];

export default function Home() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: { xs: "calc(100dvh - 54px)", sm: "calc(100dvh - 64px)" } }}>
      <Box
        sx={(theme) => ({
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 5, sm: 7, md: 10 },
          backgroundImage:
            "linear-gradient(rgba(246, 248, 247, 0.78), rgba(246, 248, 247, 0.88)), url('/home-bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          ...theme.applyStyles("dark", {
            backgroundImage:
              "linear-gradient(rgba(11, 18, 14, 0.78), rgba(11, 18, 14, 0.90)), url('/home-bg.jpeg')",
          }),
        })}
      >
        <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={{ xs: 2.5, sm: 3.5 }} sx={{ alignItems: "center", textAlign: "center" }}>
            <Box
              component="img"
              src="/bsn-logo-full.webp"
              alt="Bank Syariah Nasional"
              sx={(theme) => ({
                height: { xs: 75, sm: 105, md: 130 },
                width: "auto",
                display: "block",
                objectFit: "contain",
                ...theme.applyStyles("dark", {
                  filter: "brightness(1.9) saturate(1.1)",
                }),
              })}
            />

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "primary.main",
                fontSize: { xs: 26, sm: 36, md: 46 },
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
              }}
            >
              BSN Cicil Emas
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                maxWidth: 580,
                fontSize: { xs: "0.92rem", sm: "1.05rem" },
                lineHeight: 1.7,
                textWrap: "pretty",
              }}
            >
              Fasilitas pembiayaan syariah dari PT Bank Syariah Nasional untuk nasabah perorangan yang ingin memiliki
              emas murni secara terencana, aman, dan penuh keberkahan.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ width: { xs: "100%", sm: "auto" }, alignItems: "center", justifyContent: "center", mt: 1 }}
            >
              <Button
                component={Link}
                href="/chat"
                variant="contained"
                size="large"
                startIcon={<ChatIcon />}
                sx={{
                  px: { xs: 3.5, sm: 4 },
                  py: { xs: 1.3, sm: 1.45 },
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  borderRadius: 3,
                  boxShadow: "0 4px 14px rgba(0, 103, 71, 0.25)",
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: 320, sm: "none" },
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(0, 103, 71, 0.35)",
                  },
                }}
              >
                Konsultasi dengan ALIEF
              </Button>

              <Button
                component={Link}
                href="/simulasi"
                variant="outlined"
                size="large"
                startIcon={<CalculateRoundedIcon />}
                sx={{
                  px: { xs: 3.5, sm: 3.5 },
                  py: { xs: 1.3, sm: 1.45 },
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  borderColor: "primary.main",
                  color: "primary.main",
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: 320, sm: "none" },
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    bgcolor: "rgba(0, 103, 71, 0.06)",
                    borderColor: "primary.main",
                  },
                }}
              >
                Simulasi Perhitungan
              </Button>
            </Stack>
          </Stack>

          {/* Three Key Pillar Cards */}
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 5, sm: 7, md: 9 } }}>
            {features.map((f) => (
              <Grid key={f.title} size={{ xs: 12, sm: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2.5, sm: 3.5 },
                    height: "100%",
                    bgcolor: "background.paper",
                    borderRadius: 3,
                    borderColor: "divider",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      transform: { xs: "none", sm: "translateY(-4px)" },
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        bgcolor: "rgba(0, 103, 71, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                      {f.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.6,
                        fontSize: { xs: "0.84rem", sm: "0.88rem" },
                        textWrap: "pretty",
                      }}
                    >
                      {f.text}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
