# BSN Cicil Emas Assistant

Asisten virtual **ALIEF** dan kalkulator simulasi untuk produk pembiayaan **BSN Cicil Emas** (akad Murabahah) dari PT Bank Syariah Nasional. Aplikasi ini bersifat informasional dan edukatif, bukan sistem pengajuan pembiayaan.

## Fitur

- **Chat ALIEF** (`/chat`): tanya jawab seputar BSN Cicil Emas berbasis Knowledge Base, dengan indikator berpikir `LatticeLoader`, tabel markdown, dan tautan yang bisa diklik.
- **Simulasi** (`/simulasi`): hitung plafon, angsuran bulanan, uang muka, biaya awal, dan kelayakan dari tiga input (nilai emas, penghasilan, tenor), lengkap dengan langkah hitung dan perbandingan tenor 2 sampai 5 tahun.
- **Ringkasan simulasi di chat**: setelah tiga input lengkap, ALIEF menampilkan langkah hitung lalu ringkasan berbentuk tabel dengan status `LAYAK`, `LAYAK DENGAN DP`, atau `TIDAK LAYAK / PERLU PENYESUAIAN`.
- **Arahan tindak lanjut**: nasabah yang tertarik diarahkan ke CS atau Call Center BSN (150 286 / 1500 286) atau aplikasi Bale Syariah (Play Store dan App Store).
- **Tema terang dan gelap** dengan warna hijau identitas BSN.

## Tech stack

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Material UI (MUI) |
| AI | Gemini API lewat `@google/genai` |
| Hosting | Vercel |

Aplikasi stateless: tidak ada database, riwayat chat hanya di state browser dan hilang saat refresh. Respons tidak di-stream.

## Struktur proyek

```
app/
  page.tsx            Beranda
  chat/page.tsx       Halaman chat ALIEF
  simulasi/page.tsx   Halaman simulasi
  api/chat/route.ts   Proxy ke Gemini API
components/           ChatWindow, FormattedMessage, SimulationCalculator, LatticeLoader, Header, Footer, ThemeRegistry
lib/
  gemini.ts           Pemanggilan Gemini dan fallback model
  system-prompt.ts    Hasil generate dari SytemPrompt.md
SytemPrompt.md        Sumber system prompt dan Knowledge Base
scripts/gen-prompt.js Generator lib/system-prompt.ts
```

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # isi GEMINI_API_KEY
npm run dev
```

Buka http://localhost:3000.

### Environment variables

| Variabel | Keterangan |
|---|---|
| `GEMINI_API_KEY` | API key dari Google AI Studio. Hanya dipakai di server. |
| `GEMINI_MODEL` | Model utama, default `gemini-3.1-flash-lite`. Ada cadangan otomatis ke model lain. |

### Mengubah system prompt

Edit `SytemPrompt.md`, lalu generate ulang:

```bash
node scripts/gen-prompt.js
```

### Skrip lain

```bash
npm run build   # build produksi
npm run start   # jalankan hasil build
npm run lint
```

## Asumsi simulasi

Simulasi memisahkan dua jenis informasi:

- **Fakta RIPLAY BSN Cicil Emas (Desember 2025)**: tenor 2 sampai 5 tahun, ujrah tetap sejak akad sampai lunas, serta tabel biaya proses dan administrasi untuk plafon sampai Rp150 juta.
- **Asumsi estimasi, bukan ketentuan resmi BSN**:
  - margin flat sekitar 7,92% per tahun (dihitung balik dari satu contoh RIPLAY, bisa berbeda per tenor)
  - FTV sekitar 80% sampai 90% (titik tengah 83,33%)
  - batas angsuran 30% dari penghasilan

Rumus: `Plafon_final = MIN(Plafon_FTV, Plafon_DSR, Plafon_Kebutuhan)`, `Margin = Plafon_final × r × n`, `Angsuran = (Plafon_final + Margin) / (n × 12)`.

Hasil simulasi tidak menjamin persetujuan pembiayaan dan tidak menggantikan proses analisis bank.

## Batasan yang diketahui

- Belum ada rate limiting pada `/api/chat`. Perlu ditambahkan sebelum dipublikasikan luas.
- Tidak ada logging atau analytics percakapan.
- Wording disclaimer belum ditinjau tim legal atau compliance BSN.
- Biaya proses dan administrasi untuk plafon di atas Rp150 juta belum tersedia di data produk.

## Di luar cakupan

Autentikasi, multi-bahasa, database, dan integrasi ke sistem pengajuan pembiayaan BSN.
