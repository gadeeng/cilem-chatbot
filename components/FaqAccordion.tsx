import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FAQ_SECTIONS } from "@/lib/faq-data";

export default function FaqAccordion() {
  return (
    <Stack spacing={4}>
      {FAQ_SECTIONS.map((s) => (
        <section key={s.id}>
          <Typography variant="h6" gutterBottom sx={{ color: "primary.main", fontWeight: 700 }}>
            {s.id}. {s.title}
          </Typography>
          {s.items.map((i) => (
            <Accordion key={i.id} disableGutters variant="outlined" sx={{ "&:not(:last-child)": { borderBottom: 0 }, "&:before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>{i.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "pre-line", lineHeight: 1.7 }}>
                  {i.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </section>
      ))}
    </Stack>
  );
}
