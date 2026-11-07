import { NextResponse } from "next/server";
import { callGemini, type ChatMessage } from "@/lib/gemini";

export const maxDuration = 60;

const MAX_MESSAGES = 30;
const MAX_CONTENT = 2000;

// TODO (sebelum go-live publik): tambahkan rate limiting berbasis IP.

function isValid(messages: unknown): messages is ChatMessage[] {
  return (
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length <= MAX_MESSAGES &&
    messages[messages.length - 1]?.role === "user" &&
    messages.every(
      (m) =>
        m &&
        (m.role === "user" || m.role === "model") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        m.content.length <= MAX_CONTENT
    )
  );
}

export async function POST(req: Request) {
  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid" }, { status: 400 });
  }
  if (!isValid(body.messages)) {
    return NextResponse.json({ error: "Format pesan tidak valid" }, { status: 400 });
  }
  try {
    const reply = await callGemini(body.messages);
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("[api/chat]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Gagal memproses permintaan" }, { status: 502 });
  }
}

