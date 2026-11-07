import { SYSTEM_PROMPT } from "./system-prompt";

export type ChatMessage = { role: "user" | "model"; content: string };

// Urutan prioritas model:
// 1. GEMINI_MODEL dari .env.local jika diset (mis. gemini-3.5-flash)
// 2. gemini-3.5-flash (terbukti aktif & stabil untuk key ini)
// 3. gemini-3.1-flash-lite (cadangan super cepat, latency ~900ms)
// 4. gemini-3.8-flash (model generasi terbaru; otomatis dicoba jika 503 sudah reda)
const MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
].filter((m): m is string => Boolean(m && m.trim()));

const RETRYABLE = new Set([429, 500, 503, 504]);

async function request(model: string, apiKey: string, messages: ChatMessage[]) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
        generationConfig: { temperature: 0.5 },
      }),
      signal: AbortSignal.timeout(25_000),
    }
  );
}

export async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY belum diset");

  let lastError = "unknown";
  for (const model of [...new Set(MODELS)]) {
    try {
      const res = await request(model, apiKey, messages);
      if (res.ok) {
        const data = await res.json();
        const text: string | undefined = data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("");
        if (text) return text;
        lastError = `${model}: response kosong`;
        continue;
      }
      lastError = `${model}: HTTP ${res.status}`;
      // 404 / 429 / 5xx -> coba model berikutnya; error lain (400, 401, 403) langsung lempar.
      if (res.status !== 404 && !RETRYABLE.has(res.status)) break;
    } catch (e) {
      lastError = `${model}: ${e instanceof Error ? e.message : "error"}`;
    }
  }
  throw new Error(`Gemini gagal (${lastError})`);
}
