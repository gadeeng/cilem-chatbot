export type GoldBrandId = "antam" | "galeri24" | "ubs";
export type TimeframeId = "7d" | "1m" | "3m" | "6m" | "1y";
export type PriceMode = "beli" | "buyback";

export interface GoldBrandMeta {
  id: GoldBrandId;
  name: string;
  shortName: string;
  producer: string;
  purity: string;
  certificate: string;
  baseSellPerGram: number;
  baseBuybackPerGram: number;
  dailyChangeRp: number;
  dailyChangePct: number;
  updatedAt: string;
}

export interface GoldBarRow {
  weight: number;
  label: string;
  hargaBeli: number;
  hargaBuyback: number;
  perGramBeli: number;
}

export interface DailyPricePoint {
  dateISO: string;
  dateLabel: string;
  fullDateLabel: string;
  hargaBeli: number;
  hargaBuyback: number;
}

export const GOLD_DENOMINATIONS: number[] = [
  0.5, 1, 2, 3, 5, 10, 25, 50, 100, 250, 500, 1000,
];

export const GOLD_BRANDS: Record<GoldBrandId, GoldBrandMeta> = {
  antam: {
    id: "antam",
    name: "Emas Batangan Antam",
    shortName: "Antam",
    producer: "PT Aneka Tambang Tbk (Logam Mulia)",
    purity: "99,99% (24 Karat)",
    certificate: "LBMA / CertiCard",
    baseSellPerGram: 1_826_000,
    baseBuybackPerGram: 1_678_000,
    dailyChangeRp: 14_000,
    dailyChangePct: 0.77,
    updatedAt: "11 November 2026",
  },
  galeri24: {
    id: "galeri24",
    name: "Emas Batangan Galeri 24",
    shortName: "Galeri 24",
    producer: "PT Pegadaian Galeri Dua Empat",
    purity: "99,99% (24 Karat)",
    certificate: "SNI 8880:2020",
    baseSellPerGram: 1_798_000,
    baseBuybackPerGram: 1_662_000,
    dailyChangeRp: 12_000,
    dailyChangePct: 0.67,
    updatedAt: "11 November 2026",
  },
  ubs: {
    id: "ubs",
    name: "Emas Batangan UBS",
    shortName: "UBS",
    producer: "PT Untung Bersama Sejahtera",
    purity: "99,99% (24 Karat)",
    certificate: "UBS Gold Certificate",
    baseSellPerGram: 1_792_000,
    baseBuybackPerGram: 1_656_000,
    dailyChangeRp: 11_000,
    dailyChangePct: 0.62,
    updatedAt: "11 November 2026",
  },
};

export const TIMEFRAME_OPTIONS: { id: TimeframeId; label: string; days: number }[] = [
  { id: "7d", label: "7 Hari", days: 7 },
  { id: "1m", label: "1 Bulan", days: 30 },
  { id: "3m", label: "3 Bulan", days: 90 },
  { id: "6m", label: "6 Bulan", days: 180 },
  { id: "1y", label: "1 Tahun", days: 365 },
];

// Faktor premi cetak per gramasi seperti struktur harga emas batangan di Pegadaian:
// Pecahan kecil memiliki premi cetak per gram sedikit lebih tinggi, pecahan besar lebih efisien.
const MINTING_MULTIPLIER: Record<number, number> = {
  0.5: 1.053,
  1: 1.0,
  2: 0.984,
  3: 0.979,
  5: 0.973,
  10: 0.966,
  25: 0.961,
  50: 0.958,
  100: 0.956,
  250: 0.954,
  500: 0.953,
  1000: 0.952,
};

const roundToThousand = (val: number) => Math.round(val / 1000) * 1000;

export function getGoldBarTable(brandId: GoldBrandId): GoldBarRow[] {
  const brand = GOLD_BRANDS[brandId];
  return GOLD_DENOMINATIONS.map((weight) => {
    const mult = MINTING_MULTIPLIER[weight] ?? 1;
    const rawSell = brand.baseSellPerGram * weight * mult;
    const hargaBeli = roundToThousand(rawSell);
    const hargaBuyback = roundToThousand(brand.baseBuybackPerGram * weight);
    const perGramBeli = Math.round(hargaBeli / weight);
    const label =
      weight < 1
        ? `${weight.toString().replace(".", ",")} gram`
        : `${weight.toLocaleString("id-ID")} gram`;
    return {
      weight,
      label,
      hargaBeli,
      hargaBuyback,
      perGramBeli,
    };
  });
}

const MONTHS_SHORT_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const MONTHS_LONG_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// Generator kurva historis deterministik yang realistis berakhir pada 11 November 2026
export function getHistoricalSeries(
  brandId: GoldBrandId,
  timeframe: TimeframeId
): DailyPricePoint[] {
  const brand = GOLD_BRANDS[brandId];
  const tf = TIMEFRAME_OPTIONS.find((t) => t.id === timeframe) ?? TIMEFRAME_OPTIONS[1];
  const totalDays = tf.days;

  // Titik akhir: 11 Nov 2026 (UTC)
  const endDate = new Date(Date.UTC(2026, 10, 11));
  const brandSeed = brandId === "antam" ? 1.0 : brandId === "galeri24" ? 1.35 : 1.7;

  // Pertama hitung offset mundur dari hari ke-0 (hari ini) s.d. totalDays yang lalu
  const rawOffsets: number[] = new Array(totalDays);
  rawOffsets[totalDays - 1] = 0;
  // Pastikan perubahan hari terakhir persis sama dengan dailyChangeRp
  if (totalDays >= 2) {
    rawOffsets[totalDays - 2] = -brand.dailyChangeRp;
  }

  let acc = -brand.dailyChangeRp;
  for (let i = totalDays - 3; i >= 0; i--) {
    const daysAgo = totalDays - 1 - i;
    // Tren kenaikan tahunan emas (~14% per tahun) + gelombang siklus pasar mingguan/bulanan
    const upwardDrift = 720; // rata-rata kenaikan harian dalam jangka panjang
    const wave1 = Math.sin(daysAgo * 0.23 + brandSeed) * 3800;
    const wave2 = Math.cos(daysAgo * 0.085 + brandSeed * 2) * 5200;
    const wave3 = Math.sin(daysAgo * 0.51 - brandSeed) * 2100;
    const dailyDelta = upwardDrift + (wave1 + wave2 + wave3) * 0.32;
    acc -= dailyDelta;
    rawOffsets[i] = acc;
  }

  const spreadRatio = brand.baseBuybackPerGram / brand.baseSellPerGram;

  return rawOffsets.map((offset, idx) => {
    const daysAgo = totalDays - 1 - idx;
    const d = new Date(endDate.getTime() - daysAgo * 86_400_000);
    const day = d.getUTCDate();
    const monthIdx = d.getUTCMonth();
    const year = d.getUTCFullYear();

    const hargaBeli =
      idx === totalDays - 1
        ? brand.baseSellPerGram
        : idx === totalDays - 2
          ? brand.baseSellPerGram - brand.dailyChangeRp
          : roundToThousand(brand.baseSellPerGram + offset);

    const hargaBuyback =
      idx === totalDays - 1
        ? brand.baseBuybackPerGram
        : roundToThousand(hargaBeli * spreadRatio);

    const dateISO = d.toISOString().slice(0, 10);
    const dateLabel =
      totalDays > 180
        ? `${day} ${MONTHS_SHORT_ID[monthIdx]} '${String(year).slice(-2)}`
        : `${day} ${MONTHS_SHORT_ID[monthIdx]}`;
    const fullDateLabel = `${day} ${MONTHS_LONG_ID[monthIdx]} ${year}`;

    return {
      dateISO,
      dateLabel,
      fullDateLabel,
      hargaBeli,
      hargaBuyback,
    };
  });
}

