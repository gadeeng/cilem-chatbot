# Spesifikasi — Website BSN Cicil Emas Assistant

## 1. Tech Stack
- **Framework**: Next.js (App Router) — dipilih karena deploy di Vercel (native support, zero-config).
- **Bahasa**: TypeScript.
- **Styling**: Tailwind CSS (default scaffold Next.js, cepat buat MVP tanpa setup tambahan).
- **AI**: Gemini API via `@google/genai` SDK atau REST call langsung ke `generativelanguage.googleapis.com`.
- **Hosting**: Vercel.
- **State**: Stateless — tidak ada database, tidak ada persistence chat di server maupun browser. Refresh = percakapan hilang.
- **Response mode**: Non-streaming (tunggu full response sebelum ditampilkan).

## 2. Struktur Halaman

```
/app
  /page.tsx                 → Landing page
  /chat
    /page.tsx                → Halaman chat
  /faq
    /page.tsx                → FAQ / info produk (render dari Knowledge Base)
  /api
    /chat
      /route.ts               → API route, proxy ke Gemini API
  /layout.tsx                → Shared layout (header, footer, disclaimer banner)
/lib
  /system-prompt.ts           → Export string system prompt + KB (dari file final yang sudah dibuat)
  /gemini.ts                  → Helper function untuk call Gemini API
/components
  /ChatWindow.tsx              → UI percakapan (input, bubble pesan, loading state)
  /DisclaimerBanner.tsx         → Banner disclaimer, muncul di semua halaman
  /FaqAccordion.tsx             → Render Q&A dari KB sebagai accordion di halaman FAQ
```

## 3. Halaman — Detail

### 3.1 Landing Page (`/`)
- Headline singkat: apa itu BSN Cicil Emas.
- CTA tombol: "Tanya Asisten" → ke `/chat`.
- Link ke `/faq`.
- Disclaimer banner tampil di sini juga (lihat 3.4).

### 3.2 Halaman Chat (`/chat`)
- Komponen utama: `ChatWindow`.
- Input teks + tombol kirim.
- Riwayat pesan ditampilkan sebagai bubble (user kanan, assistant kiri) — disimpan di React state (`useState`), **hilang saat refresh** (sesuai keputusan stateless).
- Loading state wajib ada (karena non-streaming): tampilkan indikator "mengetik..." selama menunggu response dari `/api/chat`, supaya user tahu sistem sedang memproses, bukan macet.
- Error handling: kalau API call gagal (timeout, rate limit, error Gemini), tampilkan pesan fallback yang mengarahkan ke Call Center BSN — **jangan** biarkan UI diam tanpa feedback.

### 3.3 Halaman FAQ (`/faq`)
- Render seluruh Q&A dari Knowledge Base (file `system-prompt.ts` atau file KB terpisah) sebagai accordion statis — **bukan** hasil panggilan ke Gemini, murni render data.
- Dikelompokkan per kategori (Section A–K sesuai KB yang sudah dibuat).
- Ini juga berguna untuk SEO — konten statis lebih mudah diindeks dibanding chat interaktif.

### 3.4 Disclaimer Banner
- Komponen persisten (muncul di landing, chat, dan FAQ — taruh di `layout.tsx`).
- Isi contoh: *"Asisten ini memberikan informasi umum mengenai produk BSN Cicil Emas berdasarkan data resmi. Jawaban yang diberikan bukan merupakan nasihat keuangan pribadi maupun keputusan/persetujuan resmi dari Bank. Untuk pengajuan dan konsultasi, hubungi Kantor Cabang BSN terdekat."*
- **Perlu dikonfirmasi ke tim legal/compliance BSN** sebelum go-live — wording di atas draft awal, bukan final.

## 4. API Route — `/api/chat`

**Method**: POST
**Request body**: `{ messages: [{ role: "user" | "model", content: string }] }`
**Response**: `{ reply: string }` atau `{ error: string }`

Tanggung jawab route ini:
1. Terima history percakapan dari client (dikirim penuh tiap request karena stateless — tidak ada session di server).
2. Panggil Gemini API dengan `systemInstruction` = isi file system prompt + KB final, dan `contents` = history dari request.
3. Return teks jawaban ke client.
4. **Rate limiting**: belum ada di MVP ini — ini gap yang perlu diisi sebelum go-live publik, karena tanpa rate limit, endpoint ini bisa di-abuse (orang spam request → biaya API membengkak). Minimal pertimbangkan Vercel's built-in rate limiting atau middleware sederhana berbasis IP.
5. API key Gemini diakses lewat `process.env.GEMINI_API_KEY` — **hanya di server-side** (dalam `route.ts`), tidak pernah dikirim ke client.

## 5. Environment Variables

```
GEMINI_API_KEY=<diisi di Vercel dashboard, bukan di kode>
```

## 6. Known Limitations (MVP ini)

- **Non-streaming**: response Gemini ditunggu penuh sebelum ditampilkan. Untuk jawaban panjang, user menunggu tanpa progres — dimitigasi dengan loading indicator, bukan dihilangkan sepenuhnya.
- **Stateless**: tidak ada riwayat chat tersimpan. User yang refresh atau pindah device mulai dari nol. Ini keputusan sadar untuk MVP, bukan oversight.
- **Tidak ada rate limiting**: risiko abuse/biaya membengkak kalau sudah live publik. Harus diisi sebelum launch resmi, bukan nice-to-have.
- **Tidak ada analytics/logging** percakapan — kalau nanti perlu audit jawaban yang diberikan assistant (penting untuk compliance di produk finansial), ini perlu ditambahkan sebagai fase berikutnya.
- **Disclaimer wording belum direview legal** — placeholder, wajib dikonfirmasi sebelum go-live.

## 7. Non-Goals (eksplisit di luar scope MVP ini)
- Autentikasi/login user.
- Multi-bahasa (Bahasa Indonesia saja).
- Integrasi langsung ke sistem pengajuan pembiayaan BSN (chatbot ini informational only, bukan transactional).
- Database/persistence.