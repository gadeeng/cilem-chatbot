import Box from "@mui/material/Box";
import SimulationCalculator from "@/components/SimulationCalculator";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Harga Emas & Simulasi — BSN Cicil Emas",
  description:
    "Pantau grafik harga emas harian, tabel harga emas batangan (Antam, Galeri 24, UBS), serta kalkulator simulasi plafon dan angsuran tetap BSN Cicil Emas.",
};

export default function SimulasiPage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: { xs: "calc(100dvh - 54px)", sm: "calc(100dvh - 64px)" },
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ flex: 1 }}>
        <SimulationCalculator />
      </Box>
      <Footer />
    </Box>
  );
}

