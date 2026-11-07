import { SYSTEM_PROMPT } from "./system-prompt";

export type ChatMessage = { role: "user" | "model"; content: string };

// Urutan prioritas model:
// 1. GEMINI_MODEL dari .env.local jika diset (default: gemini-3.1-flash-lite)
// 2. gemini-3.1-flash-lite (pilihan user: ringan & cepat)
// 3. gemini-3.5-flash-lite (cadangan lite generasi 3.5, sangat cepat ~1.3s)
// 4. gemini-3.5-flash (cadangan stabil jika lite server Google sedang 503)
// 5. gemini-3.8-flash (cadangan generasi 3.8)
const MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
].filter((m): m is string => Boolean(m && m.trim()));

const RETRYABLE = new Set([429, 500, 503, 504]);

async function request(model: string, apiKey: string, messages: ChatMessage[]) {
  const generationConfig: Record<string, unknown> = {
    temperature: 0.3,
    maxOutputTokens: 800,
  };
  // Matikan internal thinking reasoning untuk gemini-3.1-flash-lite agar respon instan
  if (model.includes("3.1-flash-lite")) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

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
        generationConfig,
      }),
      signal: AbortSignal.timeout(25_000),
    }
  );
}

function cleanResponse(text: string): string {
  return text
    // Ubah markdown bold/italic (**teks** atau *teks*) menjadi teks biasa
    .replace(/\*{2,}([^*]+?)\*{2,}/g, "$1")
    .replace(/(^|\s)\*([^*\n]+?)\*(?=\s|[.,!?;]|$)/g, "$1$2")
    // Ubah bullet list berbentuk asterisk (* poin) menjadi bullet bulat
    .replace(/(^|\n)\s*\*\s+/g, "$1• ")
    // Bersihkan sisa asterisk jika masih ada
    .replace(/\*/g, "");
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
        if (text) {
          console.log(`[Gemini] Berhasil memproses dengan model: ${model}`);
          return cleanResponse(text);
        }
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
