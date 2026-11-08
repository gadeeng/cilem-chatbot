import Box from "@mui/material/Box";
import SimulationCalculator from "@/components/SimulationCalculator";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Simulasi Perhitungan — BSN Cicil Emas",
  description:
    "Kalkulator simulasi plafon pembiayaan, angsuran bulanan tetap, biaya awal, dan kelayakan BSN Cicil Emas dari PT Bank Syariah Nasional.",
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

