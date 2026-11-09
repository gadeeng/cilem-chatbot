// Cek model Gemini mana yang bisa diakses oleh API key di .env.local.
// Pakai: node --env-file=.env.local scripts/check-models.mjs [model1 model2 ...]
import { GoogleGenAI } from "@google/genai";

const apiKey = (process.env.GEMINI_API_KEY || "").trim().replace(/^['"]|['"]$/g, "");
const ai = new GoogleGenAI({ apiKey });
const models = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "gemini-3.1-flash-lite",
      "gemini-3.1-flash-lite-preview",
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-3-flash-preview",
    ];

for (const model of models) {
  const t = Date.now();
  try {
    const r = await ai.models.generateContent({
      model,
      contents: "Balas satu kata: halo",
      config: { abortSignal: AbortSignal.timeout(10000) },
    });
    console.log(`OK    ${model.padEnd(28)} (${Date.now() - t}ms) -> ${r.text?.trim().slice(0, 40)}`);
  } catch (e) {
    const msg = String(e?.message ?? e).replace(/\s+/g, " ");
    console.log(`FAIL  ${model.padEnd(28)} (${e?.status ?? "?"}) -> ${msg.slice(0, 140)}`);
  }
}
