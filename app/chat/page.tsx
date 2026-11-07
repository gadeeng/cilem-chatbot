import Box from "@mui/material/Box";
import ChatWindow from "@/components/ChatWindow";

export const metadata = { title: "Chat — BSN Cicil Emas Assistant" };

export default function ChatPage() {
  return (
    <Box sx={{ px: { xs: 0, sm: 2 }, width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
      <ChatWindow />
    </Box>
  );
}
