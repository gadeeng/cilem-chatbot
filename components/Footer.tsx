"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        pt: { xs: 5, sm: 6 },
        pb: { xs: 5, sm: 6 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
        {/* Baris 1: Kantor Pusat (Kiri) & BSN Call (Kanan) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "flex-start" },
            gap: { xs: 3, sm: 4 },
          }}
        >
          {/* Sisi Kiri: Kantor Pusat & Pusat Operasional */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                lineHeight: 1.35,
                mb: 1.25,
              }}
            >
              Kantor Pusat & Pusat<br />Operasional
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.82rem", sm: "0.875rem" },
                lineHeight: 1.65,
              }}
            >
              Menara Bank BTN lt. 11,<br />
              Jl. Gajah Mada No. 1<br />
              Jakarta Pusat 10130
            </Typography>
          </Box>

          {/* Sisi Kanan: BSN Call */}
          <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                mb: 0.75,
              }}
            >
              BSN Call
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.82rem", sm: "0.875rem" },
                lineHeight: 1.65,
              }}
            >
              1500-286 atau 150-286
            </Typography>
          </Box>
        </Box>

        {/* Baris 2: Garis Horizontal dengan Ikon Sosial Media di Tengah */}
        <Divider
          sx={{
            my: { xs: 4, sm: 5 },
            borderColor: "divider",
            "&::before, &::after": {
              borderColor: "divider",
            },
          }}
        >
          <Stack direction="row" spacing={2.5} sx={{ px: 2, alignItems: "center" }}>
            <IconButton
              component="a"
              href="https://www.facebook.com/bankbsn.id"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label="Facebook Bank Syariah Nasional"
              sx={{
                color: "text.primary",
                p: 0.5,
                transition: "color 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  transform: "scale(1.1)",
                },
              }}
            >
              <FacebookIcon sx={{ fontSize: 22 }} />
            </IconButton>

            <IconButton
              component="a"
              href="https://www.instagram.com/bankbsn_id"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label="Instagram Bank Syariah Nasional"
              sx={{
                color: "text.primary",
                p: 0.5,
                transition: "color 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  transform: "scale(1.1)",
                },
              }}
            >
              <InstagramIcon sx={{ fontSize: 21 }} />
            </IconButton>

            <IconButton
              component="a"
              href="https://x.com/bankbsn_id"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label="X (Twitter) Bank Syariah Nasional"
              sx={{
                color: "text.primary",
                p: 0.5,
                transition: "color 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  transform: "scale(1.1)",
                },
              }}
            >
              <XIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Divider>

        {/* Baris 3: Legal Regulatory Text (Kiri) & Copyright (Kanan) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "flex-start" },
            gap: 2.5,
          }}
        >
          {/* Sisi Kiri: Informasi Regulasi OJK & LPS */}
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.74rem", sm: "0.78rem" },
              lineHeight: 1.7,
              maxWidth: { xs: "100%", sm: 540 },
            }}
          >
            BSN berizin dan diawasi oleh Otoritas Jasa Keuangan & Bank Indonesia serta merupakan peserta penjaminan LPS. Maksimum nilai simpanan yang dijamin LPS per nasabah per bank adalah Rp 2 miliar. Untuk mengetahui informasi lebih lanjut silakan akses di{" "}
            <Box
              component="a"
              href="https://bankbsn.co.id"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                textDecoration: "underline",
                transition: "color 0.2s ease",
                "&:hover": { color: "primary.main" },
              }}
            >
              sini
            </Box>
            .
          </Typography>

          {/* Sisi Kanan: Copyright */}
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.74rem", sm: "0.78rem" },
              textAlign: { xs: "left", sm: "right" },
              whiteSpace: { xs: "normal", sm: "nowrap" },
              mt: { xs: 1, sm: 0 },
            }}
          >
            © 2026{" "}
            <Box
              component="a"
              href="https://bankbsn.co.id"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                textDecoration: "underline",
                transition: "color 0.2s ease",
                "&:hover": { color: "primary.main" },
              }}
            >
              Bank Syariah Nasional
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
