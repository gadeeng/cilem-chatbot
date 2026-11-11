# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Calon nasabah dan nasabah perorangan PT Bank Syariah Nasional (BSN) — karyawan, wiraswasta, dan profesional — yang ingin membeli dan memiliki emas murni melalui fasilitas pembiayaan syariah (akad Murabahah), memantau acuan harga emas batangan harian, serta menghitung simulasi plafon, uang muka (DP), angsuran bulanan tetap, biaya awal, dan kelayakan angsuran (DSR) sebelum mengajukan permohonan ke Kantor Cabang BSN.

## Product Purpose
BSN Cicil Emas Assistant menyediakan pusat informasi interaktif, referensi grafik & tabel harga emas batangan (Antam, Galeri 24, UBS) sebagai acuan simulasi, kalkulator simulasi pembiayaan Cicil Emas yang transparan, serta asisten AI (ALIEF) berbasis fakta resmi RIPLAY BSN. Keberhasilan diukur dari kejelasan nasabah memahami estimasi angsuran, batasan plafon (Kebutuhan, FTV, DSR), serta kesiapan dokumen sebelum berkunjung ke Kantor Cabang BSN.

## Positioning
Menggabungkan kalkulator kelayakan multi-batas (FTV, DSR, dan Kebutuhan) yang transparan beserta tabel harga emas batangan interaktif dan asisten AI khusus produk BSN Cicil Emas yang memisahkan secara tegas antara fakta resmi RIPLAY (Kategori A) dan asumsi simulasi edukatif (Kategori B).

## Operating Context
Digunakan oleh calon nasabah melalui browser desktop maupun perangkat seluler saat merencanakan kepemilikan emas batangan (0,5 gram hingga 1.000 gram), membandingkan pergerakan harga emas harian, memilih gramasi emas untuk langsung disimulasikan, serta berkonsultasi dengan ALIEF sebelum menghubungi BSN Call (150 286 / 1500 286), mengunduh aplikasi Bale Syariah, atau mendatangi Kantor Cabang BSN.

## Capabilities and Constraints
- **Fakta Resmi RIPLAY (Kategori A)**:
  - Akad Murabahah dengan ujrah/margin tetap sejak awal akad hingga lunas.
  - Tenor pembiayaan minimal 2 tahun dan maksimal 5 tahun.
  - Biaya proses: Rp125.000 (s.d. Rp50 juta), Rp250.000 (>Rp50–100 juta), Rp375.000 (>Rp100–150 juta).
  - Biaya administrasi: Rp375.000 (s.d. Rp50 juta), Rp750.000 (>Rp50–100 juta), Rp1.125.000 (>Rp100–150 juta).
- **Asumsi Edukatif Simulasi (Kategori B — wajib berlabel eksplisit)**:
  - Estimasi margin flat ~7,92% per tahun (dihitung balik dari contoh RIPLAY).
  - Rasio FTV asumsi 80%–90% (default 80%).
  - Batas aman kemampuan angsuran (DSR) asumsi 30% dari penghasilan bulanan.
  - Grafik harga emas harian dan tabel harga emas batangan (Antam, Galeri 24, UBS) disajikan sebagai data referensi/ilustrasi simulasi edukatif; harga realisasi mengikuti ketentuan resmi pada saat akad di Kantor Cabang BSN.

## Brand Commitments
- Identitas PT Bank Syariah Nasional (BSN): warna utama hijau zamrud syariah (`#006747` pada mode terang, `#14b881` pada mode gelap) dengan aksen emas hangat untuk elemen instrumen emas.
- Aset resmi di `public/bsn-logo.svg`, `public/bsn-logo-full.webp`, dan `public/home-bg.jpeg`.
- Tone komunikasi santun, transparan, akurat, dan tidak menjanjikan persetujuan kredit di luar wewenang analisis resmi Bank.

## Evidence on Hand
- Dokumen RIPLAY BSN Cicil Emas dan Knowledge Base Q&A yang terintegrasi pada `SytemPrompt.MD` dan `lib/system-prompt.ts`.
- Komponen kalkulator simulasi pada `components/SimulationCalculator.tsx` dan asisten chat ALIEF pada `components/ChatWindow.tsx`.

## Product Principles
1. **Transparansi Perhitungan**: Setiap angka simulasi wajib memperlihatkan cara hitung, batas mana yang mengikat (FTV, DSR, atau Kebutuhan), dan membedakan fakta resmi RIPLAY dari asumsi simulasi.
2. **Integrasi Harga Emas ke Simulasi Tanpa Hambatan**: Memantau grafik harga harian dan memilih gramasi pada tabel harga emas batangan langsung terhubung dengan input kalkulator simulasi.
3. **Presisi Numerik & Keterbacaan Finansial**: Seluruh nominal Rupiah, persentase, dan gramasi menggunakan `tabular-nums` dengan tata letak yang bersih di layar ponsel maupun desktop.
4. **Kepatuhan & Kejelasan Tindak Lanjut**: Selalu menyertakan arahan yang jelas ke Kantor Cabang BSN, BSN Call 150 286, dan aplikasi Bale Syariah.
