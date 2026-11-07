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
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SpeedIcon from "@mui/icons-material/Speed";
import PaymentsIcon from "@mui/icons-material/Payments";

const features = [
  {
    icon: <VerifiedUserIcon color="primary" />,
    title: "Prinsip Murabahah",
    text: "Pembiayaan syariah untuk membeli emas yang dimiliki dan dipergunakan sendiri.",
  },
  {
    icon: <PaymentsIcon color="primary" />,
    title: "Angsuran Tetap",
    text: "Ujrah bersifat tetap sejak awal akad hingga pembiayaan lunas.",
  },
  {
    icon: <SpeedIcon color="primary" />,
    title: "Pengajuan Mudah",
    text: "Ajukan melalui Kantor Cabang BSN terdekat dengan proses yang cepat.",
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
          py: { xs: 4, sm: 6, md: 9 },
          backgroundImage:
            "linear-gradient(rgba(246, 248, 247, 0.90), rgba(246, 248, 247, 0.95)), url('/home-bg.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          ...theme.applyStyles("dark", {
            backgroundImage:
              "linear-gradient(rgba(8, 14, 11, 0.86), rgba(8, 14, 11, 0.94)), url('/home-bg.jpeg')",
          }),
        })}
      >
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }} sx={{ alignItems: "center", textAlign: "center" }}>
          <Box
            component="img"
            src="/bsn-logo-full.webp"
            alt="Bank Syariah Nasional"
            sx={(theme) => ({
              height: { xs: 75, sm: 105, md: 135 },
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
              fontSize: { xs: 24, sm: 34, md: 44 },
              letterSpacing: "-0.5px",
            }}
          >
            BSN Cicil Emas
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 580,
              fontSize: { xs: "0.88rem", sm: "1rem" },
              lineHeight: 1.65,
            }}
          >
            Produk pembiayaan dari PT Bank Syariah Nasional yang memungkinkan
            nasabah perorangan memiliki emas melalui fasilitas pembiayaan
            berdasarkan prinsip Murabahah.
          </Typography>
          <Button
            component={Link}
            href="/chat"
            variant="contained"
            size="large"
            startIcon={<ChatIcon />}
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1.2, sm: 1.3 },
              fontSize: { xs: "0.95rem", sm: "1rem" },
              width: { xs: "100%", sm: "auto" },
              maxWidth: { xs: 300, sm: "none" },
              mt: { xs: 0.5, sm: 1 },
            }}
          >
            Tanya ALIEF
          </Button>
        </Stack>

        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mt: { xs: 4, sm: 6, md: 8 } }}>
          {features.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: "100%",
                  bgcolor: "background.paper",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: { xs: "none", sm: "translateY(-3px)" },
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Stack spacing={1}>
                  {f.icon}
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
                    {f.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", lineHeight: 1.55, fontSize: { xs: "0.82rem", sm: "0.875rem" } }}
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
    <Box
      component="footer"
        sx={{
          borderTop: 1,
          borderColor: "divider",
          py: { xs: 2, sm: 2.5 },
          px: 2,
          textAlign: "center",
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "0.72rem", sm: "0.78rem" },
            display: "block",
          }}
        >
          Call Center BSN: 150 286 / 1500 286 · pengaduan@bankbsn.co.id · PT Bank Syariah Nasional
        </Typography>
      </Box>
    </Box>
  );
}
