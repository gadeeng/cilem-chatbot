"use client";

import Link from "next/link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import ChatIcon from "@mui/icons-material/Chat";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SpeedIcon from "@mui/icons-material/Speed";
import PaymentsIcon from "@mui/icons-material/Payments";

const features = [
  { icon: <VerifiedUserIcon color="primary" />, title: "Prinsip Murabahah", text: "Pembiayaan syariah untuk membeli emas yang dimiliki dan dipergunakan sendiri." },
  { icon: <PaymentsIcon color="primary" />, title: "Angsuran Tetap", text: "Ujrah bersifat tetap sejak awal akad hingga pembiayaan lunas." },
  { icon: <SpeedIcon color="primary" />, title: "Pengajuan Mudah", text: "Ajukan melalui Kantor Cabang BSN terdekat dengan proses yang cepat." },
];

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: "primary.main", fontSize: { xs: 32, md: 48 } }}>
          BSN Cicil Emas
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 560 }}>
          Produk pembiayaan dari PT Bank Syariah Nasional yang memungkinkan
          nasabah perorangan memiliki emas melalui fasilitas pembiayaan
          berdasarkan prinsip Murabahah.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button component={Link} href="/chat" variant="contained" size="large" startIcon={<ChatIcon />}>
            Tanya Asisten
          </Button>
          <Button component={Link} href="/faq" variant="outlined" size="large" startIcon={<HelpOutlineIcon />}>
            Lihat FAQ
          </Button>
        </Stack>
      </Stack>
      <Grid container spacing={2} sx={{ mt: 8 }}>
        {features.map((f) => (
          <Grid key={f.title} size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
              <Stack spacing={1}>
                {f.icon}
                <Typography sx={{ fontWeight: 700 }}>{f.title}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>{f.text}</Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
