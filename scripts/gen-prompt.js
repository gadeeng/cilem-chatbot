const fs = require("fs");
const raw = fs.readFileSync("SytemPrompt.md", "utf8").replace(/\r\n/g, "\n");
fs.writeFileSync("lib/system-prompt.ts",
  "// AUTO-GENERATED dari SytemPrompt.md oleh scripts/gen-prompt.js — jangan edit manual.\n" +
  "export const SYSTEM_PROMPT = " + JSON.stringify(raw) + ";\n");
console.log("lib/system-prompt.ts generated (" + raw.length + " chars)");
