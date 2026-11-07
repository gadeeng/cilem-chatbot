import Box from "@mui/material/Box";
import ChatWindow from "@/components/ChatWindow";

export const metadata = {
  title: "Chat ALIEF — BSN Cicil Emas Assistant",
  description: "Konsultasi langsung dengan ALIEF seputar pembiayaan cicil emas di PT Bank Syariah Nasional.",
};

export default function ChatPage() {
  return (
    <Box
      sx={{
        width: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: {
          xs: "calc(100dvh - 54px)",
          sm: "calc(100dvh - 64px)",
        },
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <ChatWindow />
    </Box>
  );
}
