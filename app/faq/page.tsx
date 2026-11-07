import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import FaqAccordion from "@/components/FaqAccordion";

export const metadata = { title: "FAQ — BSN Cicil Emas Assistant" };

export default function FaqPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        FAQ BSN Cicil Emas
      </Typography>
      <FaqAccordion />
    </Container>
  );
}
