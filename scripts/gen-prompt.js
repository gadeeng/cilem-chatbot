const fs = require("fs");
const raw = fs.readFileSync("SytemPrompt.md", "utf8").replace(/\r\n/g, "\n");
fs.writeFileSync("lib/system-prompt.ts",
  "// AUTO-GENERATED dari SytemPrompt.md oleh scripts/gen-prompt.js — jangan edit manual.\n" +
  "export const SYSTEM_PROMPT = " + JSON.stringify(raw) + ";\n");
const kb = raw.split("\n# KNOWLEDGE BASE")[1];
const sections = [];
let cur = null, q = null;
for (const line of kb.split("\n")) {
  let m;
  if ((m = line.match(/^## ([A-K])\. (.+)$/))) { cur = { id: m[1], title: m[2].trim(), items: [] }; sections.push(cur); q = null; }
  else if (cur && (m = line.match(/^Q(\d+): (.+)$/))) { q = { id: +m[1], question: m[2].trim(), answer: "" }; cur.items.push(q); }
  else if (q && (m = line.match(/^A: (.*)$/))) q.answer = m[1];
  else if (q && line.trim() !== "" ) q.answer += "\n" + line;
  else if (q && q.answer && line.trim() === "") q.answer += "\n";
}
sections.forEach(s => s.items.forEach(i => i.answer = i.answer.trim()));
// Section K berisi catatan internal untuk AI; tetap ditampilkan Q&A-nya saja.
fs.writeFileSync("lib/faq-data.ts",
  "// AUTO-GENERATED dari SytemPrompt.md oleh scripts/gen-prompt.js — jangan edit manual.\n" +
  "export type FaqItem = { id: number; question: string; answer: string };\n" +
  "export type FaqSection = { id: string; title: string; items: FaqItem[] };\n" +
  "export const FAQ_SECTIONS: FaqSection[] = " + JSON.stringify(sections, null, 2) + ";\n");
console.log(sections.map(s => s.id + ":" + s.items.length).join(" "));

