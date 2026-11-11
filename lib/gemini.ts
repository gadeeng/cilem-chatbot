import { SYSTEM_PROMPT } from "./system-prompt";

export type ChatMessage = { role: "user" | "model"; content: string };

// Model untuk pertanyaan ringan: prioritas kecepatan tinggi (~0.9 - 2.0 detik)
const LIGHT_MODELS = [
  "gemini-3.5-flash-lite",
  process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
].filter((m): m is string => Boolean(m && m.trim()));

// Model untuk simulasi perhitungan: prioritas akurasi & penalaran mendalam
const CALC_MODELS = [
  "gemini-3.5-flash",
  process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
].filter((m): m is string => Boolean(m && m.trim()));

const RETRYABLE = new Set([429, 500, 503, 504]);

// Prompt ringkas khusus untuk pertanyaan ringan / Q&A umum / input simulasi belum lengkap.
// Memangkas ukuran prompt dari ~34.000 karakter menjadi ~2.600 karakter agar waktu prefill & respon sangat cepat (< 2 detik).
const COMPACT_LIGHT_PROMPT = `Kamu adalah ALIEF, asisten virtual resmi produk BSN Cicil Emas (akad Murabahah) dari PT Bank Syariah Nasional (BSN).
Catatan penting: PT Bank Syariah Nasional (BSN) adalah entitas yang berbeda dari PT Bank Syariah Indonesia (BSI). Jika nasabah menyebut BSI, luruskan dengan ramah bahwa layanan ini adalah milik PT Bank Syariah Nasional (BSN).

ATURAN GAYA BAHASA:
1. Gunakan Bahasa Indonesia yang ramah, santun, jelas, dan langsung ke inti (to-the-point).
2. DILARANG KERAS menggunakan karakter asterisk/bintang (* atau **) di mana pun. Gunakan penomoran angka (1., 2.) atau titik bulat (•) untuk rincian daftar, atau tabel markdown jika merinci tabel biaya.
3. Jangan mengarang fakta di luar data resmi di bawah ini.

FAKTA RESMI PRODUK BSN CICIL EMAS (RIPLAY DESEMBER 2025):
• Definisi & Tujuan: Fasilitas pembiayaan syariah dari PT Bank Syariah Nasional bagi nasabah perorangan untuk membeli emas murni guna dimiliki dan dipergunakan sendiri (bukan gadai/rahn).
• Akad & Margin: Menggunakan akad Murabahah (jual beli). Ujrah/margin bersifat TETAP sejak awal akad hingga pembiayaan lunas, sehingga angsuran bulanan selalu tetap sampai lunas.
• Jangka Waktu (Tenor): Minimal 2 tahun (24 bulan) dan maksimal 5 tahun (60 bulan).
• Plafon Pembiayaan: Ditentukan berdasarkan analisis kemampuan mengangsur nasabah (DSR) dan ketentuan internal Bank mengenai Financing to Value (FTV).
• Tabel Biaya Proses & Biaya Administrasi Resmi:
| Plafon Pembiayaan | Biaya Proses | Biaya Administrasi | Total Biaya Awal |
|---|---|---|---|
| Rp0 s.d. Rp50 juta | Rp125.000 | Rp375.000 | Rp500.000 |
| Lebih dari Rp50 s.d. Rp100 juta | Rp250.000 | Rp750.000 | Rp1.000.000 |
| Lebih dari Rp100 s.d. Rp150 juta | Rp375.000 | Rp1.125.000 | Rp1.500.000 |
(Untuk plafon di atas Rp150 juta, pengajuan tetap dapat diproses sesuai analisis kemampuan mengangsur & FTV Bank; rincian biayanya dapat dikonfirmasi langsung ke Kantor Cabang BSN).
• Komponen Biaya Lain: Asuransi jiwa bersifat opsional (tidak wajib). Saldo mengendap dan denda keterlambatan (ta'zir) mengikuti ketentuan Bank. Pelunasan dipercepat diperbolehkan sesuai ketentuan Bank.
• Persyaratan Pemohon (Karyawan, Wiraswasta, Profesional):
  1. Warga Negara Indonesia (WNI).
  2. Usia minimal 17 tahun atau telah menikah, dan maksimal 65 tahun saat pembiayaan lunas.
  3. Masa kerja atau usaha minimal 1 tahun.
  4. Tidak memiliki kredit/pembiayaan bermasalah (IDI BI / SLIK clear).
  5. Memiliki NPWP pribadi atau SPT Pasal 21.
• Dokumen Pengajuan:
  - Dokumen Umum: Formulir aplikasi ditandatangani, fotokopi KTP (pemohon/pasangan), KK, NPWP/SPT Psl 21, surat nikah/cerai (jika berlaku), rekening koran/tabungan 3 bulan terakhir.
  - Tambahan Karyawan: Slip gaji asli 3 bulan terakhir/surat keterangan penghasilan, surat keterangan kerja, fotokopi SK pengangkatan pegawai.
  - Tambahan Wiraswasta & Profesional: Neraca dan laporan laba rugi / laporan keuangan minimal 6 bulan terakhir.
• Agunan & Risiko: Agunan pembiayaan adalah objek emas yang dibeli itu sendiri (disimpan oleh Bank selama masa pembiayaan dan diserahkan saat lunas). Risiko gagal bayar: eksekusi agunan emas dan tercatat pada sistem pelaporan kredit (SLIK).
• Contoh Simulasi Resmi di RIPLAY: Plafon Rp50.000.000, tenor 5 tahun (60 bulan), angsuran tetap Rp1.163.413/bulan.
• Arahan Nasabah Tertarik / Kontak Resmi:
  Arahkan ke Kantor Cabang (KC) BSN terdekat, Call Center BSN di 150 286 atau 1500 286, email pengaduan@bankbsn.co.id, website https://bankbsn.co.id, atau download aplikasi Bale Syariah di:
  - Google PlayStore: https://play.google.com/store/apps/details?id=co.id.newmb.btnsyariah&hl=id
  - Apple AppStore: https://apps.apple.com/sg/app/bale-syariah-by-bsn/id6590610395
• Penanganan Keluhan / Kata Kasar: Jika nasabah berkata kasar, tetap tenang, minta maaf dengan tulus atas ketidaknyamanan yang dialami, dan tanyakan apa yang selanjutnya bisa dibantu.
• Pertanyaan di Luar Cakupan: Jika ditanya hal yang tidak tersedia di data produk (misal harga emas per gram hari ini), langsung sampaikan belum dapat membantu karena informasinya belum tersedia dan arahkan ke KC BSN terdekat atau Call Center 150 286 / 1500 286.

ATURAN RESPON CEPAT SAAT INPUT SIMULASI BELUM LENGKAP:
Untuk menghitung simulasi dibutuhkan 3 parameter: (1) Nilai Kebutuhan Emas (Rp), (2) Tenor (2–5 tahun), dan (3) Gaji Bulanan (Rp). Jika nasabah baru menyebutkan 1 atau 2 parameter, LANGSUNG minta parameter sisanya secara singkat dalam 2–3 baris tanpa bertele-tele.`;

const ASSUMED_FLAT_RATE = 0.07921912;
const ASSUMED_DSR_CAP = 0.3;
const DEFAULT_FTV = 5 / 6; // 83,33%

function formatRp(n: number): string {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

function parseRupiahToken(numStr: string, unit?: string): number {
  const normalized = numStr.replace(/\./g, "").replace(",", ".");
  const val = parseFloat(normalized);
  if (isNaN(val) || val <= 0) return 0;
  const u = (unit || "").toLowerCase();
  if (u === "miliar" || u === "milyar" || u === "m") return Math.round(val * 1_000_000_000);
  if (u === "juta" || u === "jt") return Math.round(val * 1_000_000);
  if (u === "ribu" || u === "rb") return Math.round(val * 1_000);
  if (val >= 100_000) return Math.round(val);
  return 0;
}

interface ExtractedSimParams {
  kebutuhanEmas?: number;
  gajiBulanan?: number;
  tenorTahun?: number;
  ftvRatio: number;
}

/**
 * Ekstraksi parameter simulasi (Kebutuhan Emas, Gaji Bulanan, Tenor) dari riwayat percakapan
 */
function extractSimParams(messages: ChatMessage[]): ExtractedSimParams {
  const params: ExtractedSimParams = { ftvRatio: DEFAULT_FTV };

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== "user") continue;
    const text = msg.content.toLowerCase();
    const prevAssistant = i > 0 && messages[i - 1].role === "model" ? messages[i - 1].content.toLowerCase() : "";

    // 1. Cek FTV jika user meminta persentase FTV tertentu (80% - 90%)
    const ftvMatch = text.match(/ftv\s*(\d{2}(?:[.,]\d+)?)\s*%/i);
    if (ftvMatch) {
      const pct = parseFloat(ftvMatch[1].replace(",", ".")) / 100;
      if (pct >= 0.5 && pct <= 1.0) params.ftvRatio = pct;
    }

    // 2. Cek Tenor (tahun atau bulan)
    const tahunMatch = text.match(/(?:tenor\s*)?(\d+)\s*(?:tahun|thn|th)\b/i);
    if (tahunMatch) {
      const t = parseInt(tahunMatch[1], 10);
      if (t >= 1 && t <= 10) params.tenorTahun = t;
    } else {
      const bulanMatch = text.match(/(\d+)\s*(?:bulan|bln)\b/i);
      if (bulanMatch) {
        const b = parseInt(bulanMatch[1], 10);
        if (b >= 12 && b <= 120 && b % 12 === 0) params.tenorTahun = b / 12;
      }
    }

    // 3. Cek nominal dengan konteks eksplisit "emas / kebutuhan / beli / plafon"
    const emasMatches = [
      ...text.matchAll(
        /(?:emas|kebutuhan|harga|beli|plafon|nominal|senilai|jadi|turun(?:kan)?(?:\s*jadi)?)\s*(?:sebesar\s*|sekitar\s*)?(?:rp\.?\s*)?(\d+(?:[.,]\d+)*)\s*(juta|jt|ribu|rb|miliar|milyar)?/gi
      ),
    ];
    for (const m of emasMatches) {
      const val = parseRupiahToken(m[1], m[2]);
      if (val >= 1_000_000) params.kebutuhanEmas = val;
    }

    // 4. Cek nominal dengan konteks eksplisit "gaji / penghasilan / income / pendapatan"
    const gajiMatches = [
      ...text.matchAll(
        /(?:gaji|penghasilan|pendapatan|income|upah)(?:\s*saya|\s*bulanan|\s*per\s*bulan)?\s*(?:sebesar\s*|sekitar\s*)?(?:rp\.?\s*)?(\d+(?:[.,]\d+)*)\s*(juta|jt|ribu|rb|miliar|milyar)?/gi
      ),
    ];
    for (const m of gajiMatches) {
      const val = parseRupiahToken(m[1], m[2]);
      if (val >= 500_000) params.gajiBulanan = val;
    }

    // 5. Cari nominal uang umum jika user tidak menulis kata kunci "emas"/"gaji" secara eksplisit
    const allMoney: number[] = [];
    const genericMoneyRegex =
      /(?:rp\.?\s*)?(\d+(?:[.,]\d+)*)\s*(juta|jt|ribu|rb|miliar|milyar)\b|(?:rp\.?\s*)(\d{1,3}(?:\.\d{3}){2,})\b/gi;
    for (const m of text.matchAll(genericMoneyRegex)) {
      const val = m[3] ? parseRupiahToken(m[3]) : parseRupiahToken(m[1], m[2]);
      if (val >= 500_000) allMoney.push(val);
    }

    if (emasMatches.length === 0 && gajiMatches.length === 0 && allMoney.length > 0) {
      if (allMoney.length >= 2) {
        if (!params.kebutuhanEmas) params.kebutuhanEmas = allMoney[0];
        if (!params.gajiBulanan) params.gajiBulanan = allMoney[1];
      } else if (allMoney.length === 1) {
        const singleVal = allMoney[0];
        const askedGaji =
          /gaji|penghasilan/.test(prevAssistant) && !/kebutuhan\s*emas|harga\s*emas/.test(prevAssistant);
        const askedEmas =
          /kebutuhan\s*emas|harga\s*emas/.test(prevAssistant) && !/gaji|penghasilan/.test(prevAssistant);
        if (askedGaji || (params.kebutuhanEmas && !params.gajiBulanan)) {
          params.gajiBulanan = singleVal;
        } else if (askedEmas || (!params.kebutuhanEmas && params.gajiBulanan)) {
          params.kebutuhanEmas = singleVal;
        } else {
          params.kebutuhanEmas = singleVal;
        }
      }
    }
  }

  return params;
}

/**
 * Mesin Perhitungan Deterministik Server-Side (100% Akurat sesuai Formula Bagian 8)
 */
function buildDeterministicCalculationBlock(params: ExtractedSimParams): string | null {
  const { kebutuhanEmas, gajiBulanan, tenorTahun, ftvRatio } = params;
  if (!kebutuhanEmas || !gajiBulanan || !tenorTahun) return null;
  if (tenorTahun < 2 || tenorTahun > 5) return null;

  const n = tenorTahun;
  const bulan = n * 12;
  const r = ASSUMED_FLAT_RATE;

  const plafonKebutuhan = kebutuhanEmas;
  const plafonFTV = Math.round(ftvRatio * kebutuhanEmas);
  const plafonDSR = Math.round((ASSUMED_DSR_CAP * gajiBulanan * bulan) / (1 + r * n));
  const plafonFinal = Math.max(0, Math.min(plafonFTV, plafonDSR, plafonKebutuhan));

  let bindingConstraint = "Nilai Kebutuhan Emas";
  if (plafonDSR <= plafonFTV && plafonDSR <= plafonKebutuhan) {
    bindingConstraint = "Plafon DSR (Batas Kapasitas Angsuran 30% Gaji)";
  } else if (plafonFTV <= plafonDSR && plafonFTV <= plafonKebutuhan) {
    bindingConstraint = `Plafon FTV (Asumsi ${(ftvRatio * 100).toFixed(2)}%)`;
  }

  const marginTotal = Math.round(plafonFinal * r * n);
  const totalKewajiban = plafonFinal + marginTotal;
  const angsuranBulanan = Math.round(totalKewajiban / bulan);
  const dpMandiri = Math.max(0, kebutuhanEmas - plafonFinal);
  const dsrAktual = (angsuranBulanan / gajiBulanan) * 100;

  // Evaluasi terhadap Plafon FTV penuh
  const marginFTV = Math.round(plafonFTV * r * n);
  const angsuranFTV = Math.round((plafonFTV + marginFTV) / bulan);
  const dsrFTV = (angsuranFTV / gajiBulanan) * 100;

  // Biaya Proses & Administrasi sesuai tier Plafon Final
  let biayaInfo = "Plafon > Rp150 juta: Konfirmasi langsung ke Kantor Cabang BSN";
  if (plafonFinal <= 50_000_000) {
    biayaInfo = "Rp500.000 (Biaya Proses Rp125.000 + Biaya Administrasi Rp375.000 — Tier ≤ Rp50 juta)";
  } else if (plafonFinal <= 100_000_000) {
    biayaInfo = "Rp1.000.000 (Biaya Proses Rp250.000 + Biaya Administrasi Rp750.000 — Tier > Rp50–100 juta)";
  } else if (plafonFinal <= 150_000_000) {
    biayaInfo = "Rp1.500.000 (Biaya Proses Rp375.000 + Biaya Administrasi Rp1.125.000 — Tier > Rp100–150 juta)";
  }

  let statusTag = "[STATUS: LAYAK]";
  let recBlock = "";

  if (plafonDSR < plafonFTV) {
    statusTag = "[STATUS: TIDAK LAYAK / PERLU PENYESUAIAN]";
    const maxEmasNow = Math.floor(plafonDSR / ftvRatio / 100_000) * 100_000;
    const minGaji = Math.ceil(angsuranFTV / ASSUMED_DSR_CAP / 100_000) * 100_000;

    let tenorOptionText =
      n === 5
        ? "Tenor sudah di batas maksimal 5 tahun (tidak bisa diperpanjang lagi)"
        : "Perpanjang tenor ke 5 tahun belum cukup untuk nominal emas ini tanpa menurunkan harga emas";

    for (let t = n + 1; t <= 5; t++) {
      const bAlt = t * 12;
      const pDsrAlt = Math.round((ASSUMED_DSR_CAP * gajiBulanan * bAlt) / (1 + r * t));
      if (pDsrAlt >= plafonFTV) {
        const mAlt = Math.round(plafonFTV * r * t);
        const angsAlt = Math.round((plafonFTV + mAlt) / bAlt);
        const dsrAlt = ((angsAlt / gajiBulanan) * 100).toFixed(1);
        tenorOptionText = `Ubah tenor menjadi ${t} tahun (${bAlt} bulan) -> Estimasi angsuran ${formatRp(angsAlt)}/bulan (${dsrAlt}% dari gaji, LAYAK DENGAN DP ${formatRp(kebutuhanEmas - plafonFTV)})`;
        break;
      } else if (t === 5) {
        const maxEmas5 = Math.floor(pDsrAlt / ftvRatio / 100_000) * 100_000;
        tenorOptionText = `Perpanjang tenor ke 5 tahun DAN turunkan nilai emas menjadi maksimal sekitar ${formatRp(maxEmas5)}`;
      }
    }

    recBlock = `
DATA REKOMENDASI PENYESUAIAN (WAJIB TAMPILKAN DALAM TABEL REKOMENDASI KARENA STATUS TIDAK LAYAK):
- Alasan Tidak Layak pada Plafon FTV: Angsuran untuk Plafon FTV (${formatRp(plafonFTV)}) adalah ${formatRp(angsuranFTV)}/bulan (${dsrFTV.toFixed(1)}% dari gaji), melebihi batas asumsi DSR 30% (${formatRp(ASSUMED_DSR_CAP * gajiBulanan)}/bulan).
- Opsi 1 (Turunkan Nilai Emas pada Tenor ${n} Tahun): Maksimal sekitar ${formatRp(maxEmasNow)} (Plafon ${formatRp(Math.round(maxEmasNow * ftvRatio))}, DP ${formatRp(Math.round(maxEmasNow * (1 - ftvRatio)))}, Angsuran ≤ ${formatRp(ASSUMED_DSR_CAP * gajiBulanan)}/bulan).
- Opsi 2 (Ubah/Perpanjang Tenor): ${tenorOptionText}.
- Opsi 3 (Penghasilan Minimal): Sekitar ${formatRp(minGaji)}/bulan untuk nilai emas ${formatRp(kebutuhanEmas)} pada tenor ${n} tahun.`;
  } else if (dpMandiri > 0) {
    statusTag = "[STATUS: LAYAK DENGAN DP]";
  }

  return `
[DATA PERHITUNGAN TERVERIFIKASI SISTEM — WAJIB GUNAKAN ANGKA PASTI DI BAWAH INI 100% PERSIS]
Parameter Input Nasabah:
- Nilai Kebutuhan Emas = ${formatRp(kebutuhanEmas)}
- Tenor = ${n} Tahun (${bulan} Bulan)
- Gaji Bulanan = ${formatRp(gajiBulanan)}
- Asumsi FTV = ${(ftvRatio * 100).toFixed(2)}%, Asumsi Rate Margin Flat = ~7,92%/tahun (0,07921912), Asumsi Batas DSR = 30%

Hasil Langkah 1 (3 Batasan Plafon):
- Plafon_Kebutuhan = ${formatRp(plafonKebutuhan)}
- Plafon_FTV = ${(ftvRatio * 100).toFixed(2)}% × ${formatRp(kebutuhanEmas)} = ${formatRp(plafonFTV)}
- Plafon_DSR = (30% × ${formatRp(gajiBulanan)} × ${bulan}) / (1 + 0,07921912 × ${n}) = ${formatRp(plafonDSR)}
- Plafon_final = MIN(${formatRp(plafonFTV)}, ${formatRp(plafonDSR)}, ${formatRp(plafonKebutuhan)}) = ${formatRp(plafonFinal)}
- Constraint yang Mengikat = ${bindingConstraint}

Hasil Langkah 2 (Margin, Angsuran & DP berdasarkan Plafon_final):
- Margin Total = ${formatRp(plafonFinal)} × 7,9219% × ${n} = ${formatRp(marginTotal)}
- Total Kewajiban (Pokok + Margin) = ${formatRp(plafonFinal)} + ${formatRp(marginTotal)} = ${formatRp(totalKewajiban)}
- Angsuran Bulanan = ${formatRp(totalKewajiban)} / ${bulan} bulan = ${formatRp(angsuranBulanan)} / bulan
- Rasio DSR pada Plafon_final = ${dsrAktual.toFixed(1)}% dari gaji bulanan
- Estimasi Uang Muka (DP Mandiri) = ${formatRp(kebutuhanEmas)} - ${formatRp(plafonFinal)} = ${formatRp(dpMandiri)}

Hasil Langkah 3 (Biaya Awal & Status Kelayakan):
- Estimasi Biaya Awal = ${biayaInfo}
- Status Kelayakan = ${statusTag}
- Tag Plafon = [PLAFON: ${formatRp(plafonFinal)}]
- Tag Angsuran = [ANGSURAN: ${formatRp(angsuranBulanan)} / bulan]${recBlock}
`;
}

/**
 * Deteksi apakah pesan membutuhkan mode Perhitungan Mendalam ("calculation") atau Respon Cepat ("light")
 */
function classifyMode(messages: ChatMessage[], simParams: ExtractedSimParams): "light" | "calculation" {
  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || "";

  // Jika pesan terakhir adalah pertanyaan umum yang jelas bukan meminta simulasi (misal tanya syarat/dokumen/akad)
  const isPureFaqQuestion =
    /\b(apa\s+itu|apa\s+saja\s+syarat|dokumen\s+apa|bagaimana\s+cara|siapa\s+saja|apakah\s+wiraswasta|asuransi\s+jiwa|denda|pelunasan\s+dipercepat)\b/i.test(
      lastUserMsg
    ) && !/\b(hitung|simulasi|gaji|juta|jt)\b/i.test(lastUserMsg);

  if (isPureFaqQuestion) return "light";

  const hasAllThree = Boolean(
    simParams.kebutuhanEmas &&
    simParams.gajiBulanan &&
    simParams.tenorTahun &&
    simParams.tenorTahun >= 2 &&
    simParams.tenorTahun <= 5
  );
  if (hasAllThree) return "calculation";

  // Jika user menanyakan skenario hitung/perbandingan angka yang kompleks
  const calcKeywords =
    /\b(hitung|hitungin|perhitungan|simulasi|simulasikan|kalkulasi|angsuran|cicilan|plafon|ftv|dsr|kelayakan)\b/i;
  const numberCount = (lastUserMsg.match(/\d+/g) || []).length;
  if (calcKeywords.test(lastUserMsg) && numberCount >= 3) {
    return "calculation";
  }

  return "light";
}

function buildPartialSimHint(simParams: ExtractedSimParams): string {
  const known: string[] = [];
  const missing: string[] = [];

  if (simParams.kebutuhanEmas) {
    known.push(`Nilai Kebutuhan Emas: ${formatRp(simParams.kebutuhanEmas)}`);
  } else {
    missing.push("Nilai kebutuhan/harga emas yang ingin diajukan (Rp)");
  }

  if (simParams.tenorTahun) {
    known.push(`Tenor: ${simParams.tenorTahun} tahun`);
  } else {
    missing.push("Jangka waktu/tenor pembiayaan (pilihan 2 s.d. 5 tahun)");
  }

  if (simParams.gajiBulanan) {
    known.push(`Gaji Bulanan: ${formatRp(simParams.gajiBulanan)}`);
  } else {
    missing.push("Estimasi gaji/penghasilan bulanan (Rp)");
  }

  if (known.length === 0 || missing.length === 0) return "";
  return `\n\n[CATATAN KONTEKS SAAT INI: Nasabah sudah menyebutkan (${known.join(", ")}), namun masih kurang (${missing.join(" dan ")}). Jika nasabah sedang meminta simulasi, langsung minta data yang kurang tersebut secara singkat!]`;
}

async function request(
  model: string,
  apiKey: string,
  messages: ChatMessage[],
  mode: "light" | "calculation",
  calcReferenceBlock: string | null,
  simParams: ExtractedSimParams
) {
  const isLight = mode === "light";

  // Mode Ringan: prompt ringkas (~2.6KB), 4 pesan terakhir, maxOutputTokens 500, thinking dimatikan -> respon ~0.9 - 2 detik
  // Mode Perhitungan: prompt lengkap + lembar hitung deterministik, 8 pesan terakhir, thinkingBudget 1024 -> akurasi 100%
  const contextMessages = isLight ? messages.slice(-4) : messages.slice(-8);
  const systemText = isLight
    ? COMPACT_LIGHT_PROMPT + buildPartialSimHint(simParams)
    : calcReferenceBlock
      ? `${SYSTEM_PROMPT}\n\n${calcReferenceBlock}`
      : SYSTEM_PROMPT;

  const generationConfig: Record<string, unknown> = {
    temperature: isLight ? 0.2 : 0.1,
    maxOutputTokens: isLight ? 500 : 2048,
  };

  // Hanya model yang mendukung thinkingConfig yang diberi parameter ini (3.5-flash-lite tidak menerima thinkingConfig)
  const supportsThinkingConfig =
    model.includes("3.1-flash-lite") || model === "gemini-3.5-flash";

  if (supportsThinkingConfig) {
    generationConfig.thinkingConfig = {
      thinkingBudget: isLight ? 0 : 1024,
    };
  }

  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents: contextMessages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
        generationConfig,
      }),
      signal: AbortSignal.timeout(isLight ? 9_000 : 35_000),
    }
  );
}

function cleanResponse(text: string): string {
  return text
    .replace(/\*{2,}([^*]+?)\*{2,}/g, "$1")
    .replace(/(^|\s)\*([^*\n]+?)\*(?=\s|[.,!?;]|$)/g, "$1$2")
    .replace(/(^|\n)\s*\*\s+/g, "$1• ")
    .replace(/\*/g, "");
}

export async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim().replace(/^['"]|['"]$/g, "");
  if (!apiKey) throw new Error("GEMINI_API_KEY belum diset");

  const simParams = extractSimParams(messages);
  const mode = classifyMode(messages, simParams);
  const calcReferenceBlock =
    mode === "calculation" ? buildDeterministicCalculationBlock(simParams) : null;
  const candidateModels = mode === "light" ? LIGHT_MODELS : CALC_MODELS;

  let lastError = "unknown";
  for (const model of [...new Set(candidateModels)]) {
    try {
      const res = await request(model, apiKey, messages, mode, calcReferenceBlock, simParams);
      if (res.ok) {
        const data = await res.json();
        const text: string | undefined = data?.candidates?.[0]?.content?.parts
          ?.filter((p: { thought?: boolean }) => !p.thought)
          ?.map((p: { text?: string }) => p.text ?? "")
          .join("");
        if (text) {
          console.log(
            `[Gemini] mode=${mode} model=${model} verifiedCalc=${Boolean(calcReferenceBlock)}`
          );
          return cleanResponse(text);
        }
        lastError = `${model}: response kosong`;
        continue;
      }
      lastError = `${model}: HTTP ${res.status}`;
      if (res.status !== 404 && !RETRYABLE.has(res.status)) break;
    } catch (e) {
      lastError = `${model}: ${e instanceof Error ? e.message : "error"}`;
    }
  }
  throw new Error(`Gemini gagal (${lastError})`);
}
