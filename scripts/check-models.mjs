// Cek model Gemini mana yang bisa diakses oleh API key di .env.local.
// Pakai: node --env-file=.env.local scripts/check-models.mjs [model1 model2 ...]
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const models = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];

for (const model of models) {
  const t = Date.now();
  try {
    const r = await ai.models.generateContent({ model, contents: "Balas satu kata: halo" });
    console.log(`OK    ${model} (${Date.now() - t}ms) -> ${r.text?.trim().slice(0, 40)}`);
  } catch (e) {
    const msg = String(e?.message ?? e).replace(/\s+/g, " ");
    console.log(`FAIL  ${model} (${e?.status ?? "?"}) -> ${msg.slice(0, 140)}`);
  }
}

