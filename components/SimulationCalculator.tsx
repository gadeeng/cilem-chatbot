"use client";

import React, { useMemo, useState, useRef } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import LinearProgress from "@mui/material/LinearProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import {
  GOLD_BRANDS,
  TIMEFRAME_OPTIONS,
  getGoldBarTable,
  getHistoricalSeries,
  type GoldBrandId,
  type TimeframeId,
  type PriceMode,
} from "@/lib/gold-prices";

const TENOR_MARKS = [2, 3, 4, 5].map((t) => ({ value: t, label: `${t} th` }));
const TENOR_OPTIONS = [2, 3, 4, 5];
const QUICK_WEIGHTS = [1, 5, 10, 25, 50, 100];
const KEPING_OPTIONS = [1, 2, 3, 5];

const FTV_OPTIONS = [
  { label: "80%", value: 0.8 },
  { label: "83,33%", value: 5 / 6 },
  { label: "90%", value: 0.9 },
];

// Asumsi kerja (Kategori B), bukan ketentuan resmi BSN.
// Rate flat dihitung balik dari satu contoh RIPLAY: plafon Rp50 juta, 5 tahun,
// angsuran Rp1.163.413 -> margin Rp19.804.780 -> ~7,92% per tahun.
const ASSUMED_FLAT_RATE = 0.07921912;
const ASSUMED_DSR_CAP = 0.3;

const NUM = { fontVariantNumeric: "tabular-nums" } as const;

const rupiah = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");
const formatInput = (n: number) => (n ? Math.round(n).toLocaleString("id-ID") : "");
const parseInput = (raw: string) => {
  const cleaned = raw.replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
};

function feeTier(plafon: number) {
  if (plafon <= 0) return { label: "-", proses: 0, admin: 0 };
  if (plafon <= 50_000_000) return { label: "plafon sampai Rp50 juta", proses: 125_000, admin: 375_000 };
  if (plafon <= 100_000_000) return { label: "plafon di atas Rp50 juta sampai Rp100 juta", proses: 250_000, admin: 750_000 };
  if (plafon <= 150_000_000) return { label: "plafon di atas Rp100 juta sampai Rp150 juta", proses: 375_000, admin: 1_125_000 };
  return null; // di luar tabel RIPLAY
}

type Status = "LAYAK" | "LAYAK DENGAN DP" | "TIDAK LAYAK / PERLU PENYESUAIAN";

function simulate(kebutuhan: number, tenor: number, gaji: number, ftv: number) {
  const bulan = tenor * 12;
  const r = ASSUMED_FLAT_RATE;

  const plafonKebutuhan = kebutuhan;
  const plafonFTV = Math.round(ftv * kebutuhan);
  const plafonDSR = Math.round((ASSUMED_DSR_CAP * gaji * bulan) / (1 + r * tenor));
  const plafonFinal = Math.max(0, Math.min(plafonFTV, plafonDSR, plafonKebutuhan));

  let binding: "DSR" | "FTV" | "KEBUTUHAN" = "KEBUTUHAN";
  if (plafonDSR <= plafonFTV && plafonDSR <= plafonKebutuhan) binding = "DSR";
  else if (plafonFTV <= plafonDSR && plafonFTV <= plafonKebutuhan) binding = "FTV";

  const margin = Math.round(plafonFinal * r * tenor);
  const total = plafonFinal + margin;
  const angsuran = Math.round(total / bulan);
  const dsr = gaji > 0 ? (angsuran / gaji) * 100 : 0;
  const dp = Math.max(0, kebutuhan - plafonFinal);
  const fees = feeTier(plafonFinal);

  const angsuranFTV = Math.round((plafonFTV + plafonFTV * r * tenor) / bulan);
  const dsrFTV = gaji > 0 ? (angsuranFTV / gaji) * 100 : 100;

  let status: Status;
  let catatan: string;
  if (kebutuhan <= 0 || gaji <= 0) {
    status = "TIDAK LAYAK / PERLU PENYESUAIAN";
    catatan = "Isi nilai emas dan penghasilan bulanan dengan angka lebih dari nol.";
  } else if (plafonDSR < plafonFTV) {
    status = "TIDAK LAYAK / PERLU PENYESUAIAN";
    catatan = `Angsuran untuk plafon FTV penuh sekitar ${rupiah(angsuranFTV)} per bulan (${dsrFTV.toFixed(1)}% dari penghasilan), melebihi batas asumsi 30%.`;
  } else if (dp > 0) {
    status = "LAYAK DENGAN DP";
    catatan = `Angsuran ${dsr.toFixed(1)}% dari penghasilan (aman di bawah 30%). Siapkan uang muka (DP) mandiri sekitar ${rupiah(dp)}.`;
  } else {
    status = "LAYAK";
    catatan = `Angsuran ${dsr.toFixed(1)}% dari penghasilan, masih di bawah batas asumsi 30%.`;
  }

  return {
    kebutuhan, tenor, bulan, gaji, ftv,
    plafonKebutuhan, plafonFTV, plafonDSR, plafonFinal, binding,
    margin, total, angsuran, dsr, dp, fees, status, catatan, angsuranFTV,
  };
}

const roundDown = (n: number, step: number) => Math.floor(n / step) * step;
const roundUp = (n: number, step: number) => Math.ceil(n / step) * step;

function buildRecommendations(sim: ReturnType<typeof simulate>) {
  if (sim.status !== "TIDAK LAYAK / PERLU PENYESUAIAN" || sim.kebutuhan <= 0 || sim.gaji <= 0) {
    return { items: [] as string[], suggestedEmas: null as number | null, suggestedTenor: null as number | null };
  }
  const items: string[] = [];
  const maxEmasNow = roundDown(sim.plafonDSR / sim.ftv, 100_000);
  if (maxEmasNow > 0) {
    items.push(
      `Turunkan nilai emas menjadi sekitar ${rupiah(maxEmasNow)} atau kurang (tenor ${sim.tenor} tahun tetap).`
    );
  }

  let suggestedTenor: number | null = null;
  for (let t = sim.tenor + 1; t <= 5; t++) {
    const alt = simulate(sim.kebutuhan, t, sim.gaji, sim.ftv);
    if (alt.status !== "TIDAK LAYAK / PERLU PENYESUAIAN") {
      items.push(
        `Perpanjang tenor menjadi ${t} tahun: angsuran sekitar ${rupiah(alt.angsuran)}/bulan (${alt.dsr.toFixed(1)}% dari penghasilan).`
      );
      suggestedTenor = t;
      break;
    }
  }
  if (!suggestedTenor && sim.tenor < 5) {
    const at5 = simulate(sim.kebutuhan, 5, sim.gaji, sim.ftv);
    const maxEmas5 = roundDown(at5.plafonDSR / sim.ftv, 100_000);
    items.push(
      `Pada tenor maksimal 5 tahun, sesuaikan nilai emas ke sekitar ${rupiah(maxEmas5)} atau kurang.`
    );
  }

  const minGaji = roundUp(sim.angsuranFTV / ASSUMED_DSR_CAP, 100_000);
  items.push(`Atau penghasilan rutin minimal sekitar ${rupiah(minGaji)}/bulan untuk nilai emas dan tenor ini.`);
  return {
    items,
    suggestedEmas: maxEmasNow > 0 ? maxEmasNow : null,
    suggestedTenor,
  };
}

const statusSeverity = (s: Status) =>
  s === "LAYAK" ? "success" : s === "LAYAK DENGAN DP" ? "info" : "error";

const headCell = { fontWeight: 600, color: "text.secondary", fontSize: "0.78rem" } as const;

export default function SimulationCalculator() {
  // Gold price chart & table states
  const [brandId, setBrandId] = useState<GoldBrandId>("antam");
  const [timeframe, setTimeframe] = useState<TimeframeId>("1m");
  const [priceMode, setPriceMode] = useState<PriceMode>("beli");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number | null>(25);
  const [kepingCount, setKepingCount] = useState<number>(1);

  const brand = GOLD_BRANDS[brandId];
  const goldTable = useMemo(() => getGoldBarTable(brandId), [brandId]);
  const series = useMemo(() => getHistoricalSeries(brandId, timeframe), [brandId, timeframe]);

  // Initial default kebutuhan matches 25 gram Antam (1 keping) & default FTV = 80% (0.8)
  const initialRow25 = useMemo(() => getGoldBarTable("antam").find((r) => r.weight === 25), []);
  const [kebutuhan, setKebutuhan] = useState<number>(initialRow25 ? initialRow25.hargaBeli : 60_000_000);
  const [gaji, setGaji] = useState<number>(10_000_000);
  const [tenor, setTenor] = useState<number>(5);
  const [ftv, setFtv] = useState<number>(0.8);

  const calculatorSectionRef = useRef<HTMLDivElement | null>(null);

  const applyBarSelection = (nextBrand: GoldBrandId, weight: number, keping: number) => {
    const rows = getGoldBarTable(nextBrand);
    const found = rows.find((r) => r.weight === weight);
    if (found) {
      setSelectedWeight(weight);
      setKepingCount(keping);
      setKebutuhan(found.hargaBeli * keping);
    }
  };

  const handleBrandChange = (nextBrand: GoldBrandId) => {
    setBrandId(nextBrand);
    setHoverIdx(null);
    if (selectedWeight !== null) {
      applyBarSelection(nextBrand, selectedWeight, kepingCount);
    }
  };

  const handleRowClick = (weight: number) => {
    applyBarSelection(brandId, weight, kepingCount);
  };

  const handleKepingChange = (nextKeping: number) => {
    setKepingCount(nextKeping);
    if (selectedWeight !== null) {
      applyBarSelection(brandId, selectedWeight, nextKeping);
    }
  };

  const handleManualKebutuhan = (val: number) => {
    setSelectedWeight(null);
    setKebutuhan(val);
  };

  const sim = useMemo(() => simulate(kebutuhan, tenor, gaji, ftv), [kebutuhan, tenor, gaji, ftv]);
  const recData = useMemo(() => buildRecommendations(sim), [sim]);
  const perTenor = useMemo(
    () => TENOR_OPTIONS.map((t) => simulate(kebutuhan, t, gaji, ftv)),
    [kebutuhan, gaji, ftv]
  );

  const reset = () => {
    setBrandId("antam");
    setTimeframe("1m");
    setPriceMode("beli");
    setHoverIdx(null);
    const defaultRow = getGoldBarTable("antam").find((r) => r.weight === 25);
    setSelectedWeight(25);
    setKepingCount(1);
    setKebutuhan(defaultRow ? defaultRow.hargaBeli : 60_000_000);
    setGaji(10_000_000);
    setTenor(5);
    setFtv(0.8);
  };

  // Chart geometry & statistics
  const chartStats = useMemo(() => {
    const values = series.map((pt) => (priceMode === "beli" ? pt.hargaBeli : pt.hargaBuyback));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const firstVal = values[0] ?? 0;
    const lastVal = values[values.length - 1] ?? 0;
    const activeIdx = hoverIdx !== null && hoverIdx >= 0 && hoverIdx < series.length ? hoverIdx : series.length - 1;
    const activePoint = series[activeIdx] ?? series[series.length - 1];
    const activeVal = values[activeIdx] ?? lastVal;
    const periodDeltaRp = activeVal - firstVal;
    const periodDeltaPct = firstVal > 0 ? (periodDeltaRp / firstVal) * 100 : 0;

    const width = 680;
    const height = 250;
    const padLeft = 12;
    const padRight = 12;
    const padTop = 18;
    const padBottom = 30;
    const innerW = width - padLeft - padRight;
    const innerH = height - padTop - padBottom;
    const range = Math.max(10_000, maxVal - minVal);

    const coords = values.map((v, i) => {
      const x = padLeft + (values.length > 1 ? (i / (values.length - 1)) * innerW : innerW / 2);
      const y = padTop + innerH - ((v - minVal) / range) * innerH;
      return { x, y, v, pt: series[i] };
    });

    const linePath = coords
      .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
      .join(" ");
    const areaPath =
      coords.length > 0
        ? `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${(padTop + innerH).toFixed(1)} L${coords[0].x.toFixed(1)},${(padTop + innerH).toFixed(1)} Z`
        : "";

    const gridSteps = [0, 0.5, 1].map((ratio) => {
      const val = Math.round((minVal + ratio * (maxVal - minVal)) / 1000) * 1000;
      const y = padTop + innerH - ratio * innerH;
      return { val, y };
    });

    const xLabelIndices =
      series.length <= 7
        ? series.map((_, idx) => idx)
        : [
            0,
            Math.floor((series.length - 1) * 0.25),
            Math.floor((series.length - 1) * 0.5),
            Math.floor((series.length - 1) * 0.75),
            series.length - 1,
          ];

    return {
      minVal,
      maxVal,
      firstVal,
      lastVal,
      activeIdx,
      activePoint,
      activeVal,
      periodDeltaRp,
      periodDeltaPct,
      width,
      height,
      padTop,
      padBottom,
      innerH,
      coords,
      linePath,
      areaPath,
      gridSteps,
      xLabelIndices,
    };
  }, [series, priceMode, hoverIdx]);

  const fvtPctFormatted = (sim.ftv * 100).toFixed(2).replace(".00", "").replace(".", ",");

  const bindingLabel =
    sim.binding === "FTV"
      ? `batas FTV (asumsi ${fvtPctFormatted}%)`
      : sim.binding === "DSR"
        ? "batas kemampuan angsuran (asumsi 30% penghasilan)"
        : "nilai emas yang Anda butuhkan";

  const activeCutoffPoint = chartStats.coords[chartStats.activeIdx];

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 3, sm: 5 },
        px: { xs: 2, sm: 4 },
        caretColor: "var(--mui-palette-primary-main)",
        "& ::selection": { bgcolor: "rgba(0, 103, 71, 0.22)" },
      }}
    >
      {/* HEADER UTAMA */}
      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "flex-end" },
          gap: 2.5,
        }}
      >
        <Box sx={{ maxWidth: "68ch" }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.65rem", sm: "2.2rem" },
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              textWrap: "balance",
            }}
          >
            Harga Emas & Simulasi BSN Cicil Emas
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              mt: 1,
              lineHeight: 1.65,
              fontSize: { xs: "0.92rem", sm: "1rem" },
              textWrap: "pretty",
            }}
          >
            Pantau grafik pergerakan harga emas harian, pilih ukuran gramasi pada tabel emas batangan, lalu hitung
            estimasi plafon pembiayaan dan angsuran bulanan tetap secara praktis.
          </Typography>
        </Box>

        {/* Pilihan Merek Emas Terpadu */}
        <Stack direction="column" spacing={0.75} sx={{ width: { xs: "100%", md: "auto" } }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={brandId}
            onChange={(_, next) => {
              if (next) handleBrandChange(next as GoldBrandId);
            }}
            aria-label="Pilih cetakan emas batangan"
            sx={{
              bgcolor: "background.paper",
              width: { xs: "100%", md: "auto" },
              "& .MuiToggleButton-root": {
                flex: { xs: 1, md: "initial" },
                px: { xs: 1.5, sm: 2.25 },
                py: 0.75,
                fontWeight: 700,
                fontSize: "0.85rem",
              },
            }}
          >
            <ToggleButton value="antam">Antam</ToggleButton>
            <ToggleButton value="galeri24">Galeri 24</ToggleButton>
            <ToggleButton value="ubs">UBS</ToggleButton>
          </ToggleButtonGroup>
          <Typography
            variant="caption"
            sx={{
              ...NUM,
              color: "text.secondary",
              textAlign: { xs: "left", md: "right" },
              display: "block",
            }}
          >
            Acuan simulasi: {brand.updatedAt} · {brand.purity}
          </Typography>
        </Stack>
      </Box>

      {/* SEKSI 1: GRAFIK HARGA EMAS HARIAN & TABEL HARGA EMAS BATANGAN */}
      <Grid container spacing={{ xs: 3, md: 3.5 }} sx={{ alignItems: "stretch", mb: { xs: 5, sm: 6 } }}>
        {/* KIRI: GRAFIK HARGA EMAS HARIAN */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.25, sm: 3 },
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 6px 24px rgba(0, 40, 20, 0.04)",
            }}
          >
            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 2 }}
              >
                <Box>
                  <Typography component="h2" sx={{ fontWeight: 800, fontSize: { xs: "1.15rem", sm: "1.25rem" } }}>
                    Grafik Harga Emas Harian ({brand.shortName})
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.83rem" }}>
                    {brand.producer} · Harga per 1 gram
                  </Typography>
                </Box>

                <ToggleButtonGroup
                  exclusive
                  size="small"
                  color="primary"
                  value={priceMode}
                  onChange={(_, val) => {
                    if (val) setPriceMode(val as PriceMode);
                  }}
                  aria-label="Jenis harga emas pada grafik"
                >
                  <ToggleButton value="beli" sx={{ px: 1.5, py: 0.4, fontSize: "0.78rem", fontWeight: 600 }}>
                    Harga Beli
                  </ToggleButton>
                  <ToggleButton value="buyback" sx={{ px: 1.5, py: 0.4, fontSize: "0.78rem", fontWeight: 600 }}>
                    Harga Buyback
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "flex-end" }, mb: 2 }}
              >
                <Box>
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: "baseline", flexWrap: "wrap" }}>
                    <Typography
                      sx={{
                        ...NUM,
                        fontWeight: 800,
                        fontSize: { xs: "1.55rem", sm: "1.85rem" },
                        color: "primary.main",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                      }}
                    >
                      {rupiah(chartStats.activeVal)}
                      <Typography component="span" sx={{ fontSize: "0.9rem", fontWeight: 600, color: "text.secondary" }}>
                        {" "}
                        / gr
                      </Typography>
                    </Typography>

                    <Chip
                      size="small"
                      icon={
                        chartStats.periodDeltaRp >= 0 ? (
                          <TrendingUpRoundedIcon fontSize="small" />
                        ) : (
                          <TrendingDownRoundedIcon fontSize="small" />
                        )
                      }
                      label={`${chartStats.periodDeltaRp >= 0 ? "+" : ""}${rupiah(chartStats.periodDeltaRp)} (${
                        chartStats.periodDeltaRp >= 0 ? "+" : ""
                      }${chartStats.periodDeltaPct.toFixed(2).replace(".", ",")}%)`}
                      color={chartStats.periodDeltaRp >= 0 ? "success" : "error"}
                      variant="outlined"
                      sx={{ ...NUM, fontWeight: 700, fontSize: "0.76rem" }}
                    />
                  </Stack>

                  <Typography variant="caption" sx={{ ...NUM, color: "text.secondary", display: "block", mt: 0.5 }}>
                    {hoverIdx !== null
                      ? `Titik dipilih: ${chartStats.activePoint?.fullDateLabel}`
                      : `Posisi terakhir (${chartStats.activePoint?.fullDateLabel}) · Geser pada grafik untuk melihat tanggal lain`}
                  </Typography>
                </Box>

                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={timeframe}
                  onChange={(_, next) => {
                    if (next) {
                      setTimeframe(next as TimeframeId);
                      setHoverIdx(null);
                    }
                  }}
                  aria-label="Rentang waktu grafik harga emas"
                  sx={{
                    "& .MuiToggleButton-root": {
                      px: { xs: 1.1, sm: 1.3 },
                      py: 0.35,
                      fontSize: "0.76rem",
                      fontWeight: 600,
                    },
                  }}
                >
                  {TIMEFRAME_OPTIONS.map((tf) => (
                    <ToggleButton key={tf.id} value={tf.id}>
                      {tf.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>

              {/* Area Grafik SVG Interaktif */}
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  pt: 0.5,
                  pb: 0.5,
                  userSelect: "none",
                  touchAction: "pan-y",
                }}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <svg
                  viewBox={`0 0 ${chartStats.width} ${chartStats.height}`}
                  style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
                  role="img"
                  aria-label={`Grafik pergerakan ${priceMode === "beli" ? "harga beli" : "harga buyback"} emas ${brand.shortName}`}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const idx = Math.round(relX * (series.length - 1));
                    setHoverIdx(idx);
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const relX = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
                      const idx = Math.round(relX * (series.length - 1));
                      setHoverIdx(idx);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="bsnGoldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--mui-palette-primary-main)" stopOpacity="0.26" />
                      <stop offset="85%" stopColor="var(--mui-palette-primary-main)" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="var(--mui-palette-primary-main)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {chartStats.gridSteps.map((g, i) => (
                    <g key={i}>
                      <line
                        x1={12}
                        x2={chartStats.width - 12}
                        y1={g.y}
                        y2={g.y}
                        stroke="var(--mui-palette-divider)"
                        strokeDasharray={i === 0 ? undefined : "4 4"}
                        strokeWidth="1"
                      />
                      <text
                        x={chartStats.width - 14}
                        y={g.y - 5}
                        textAnchor="end"
                        fill="var(--mui-palette-text-secondary)"
                        fontSize="10.5"
                        fontWeight="600"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {rupiah(g.val)}
                      </text>
                    </g>
                  ))}

                  <path d={chartStats.areaPath} fill="url(#bsnGoldAreaGrad)" />

                  <path
                    d={chartStats.linePath}
                    fill="none"
                    stroke="var(--mui-palette-primary-main)"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {activeCutoffPoint && (
                    <g>
                      <line
                        x1={activeCutoffPoint.x}
                        x2={activeCutoffPoint.x}
                        y1={chartStats.padTop}
                        y2={chartStats.padTop + chartStats.innerH}
                        stroke="var(--mui-palette-primary-main)"
                        strokeDasharray="3 3"
                        strokeWidth="1.2"
                        opacity="0.7"
                      />
                      <circle
                        cx={activeCutoffPoint.x}
                        cy={activeCutoffPoint.y}
                        r="6.5"
                        fill="var(--mui-palette-primary-main)"
                        opacity="0.2"
                      />
                      <circle
                        cx={activeCutoffPoint.x}
                        cy={activeCutoffPoint.y}
                        r="4"
                        fill="var(--mui-palette-background-paper)"
                        stroke="var(--mui-palette-primary-main)"
                        strokeWidth="2.5"
                      />
                    </g>
                  )}

                  {chartStats.xLabelIndices.map((idx, i) => {
                    const c = chartStats.coords[idx];
                    if (!c) return null;
                    const anchor =
                      i === 0
                        ? "start"
                        : i === chartStats.xLabelIndices.length - 1
                          ? "end"
                          : "middle";
                    return (
                      <text
                        key={idx}
                        x={c.x}
                        y={chartStats.height - 6}
                        textAnchor={anchor}
                        fill="var(--mui-palette-text-secondary)"
                        fontSize="10.5"
                        fontWeight="500"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {c.pt.dateLabel}
                      </text>
                    );
                  })}
                </svg>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    Harga Beli / gr
                  </Typography>
                  <Typography sx={{ ...NUM, fontWeight: 700, fontSize: "0.95rem" }}>
                    {rupiah(brand.baseSellPerGram)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    Harga Buyback / gr
                  </Typography>
                  <Typography sx={{ ...NUM, fontWeight: 700, fontSize: "0.95rem" }}>
                    {rupiah(brand.baseBuybackPerGram)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    Terendah ({TIMEFRAME_OPTIONS.find((t) => t.id === timeframe)?.label})
                  </Typography>
                  <Typography sx={{ ...NUM, fontWeight: 700, fontSize: "0.95rem" }}>
                    {rupiah(chartStats.minVal)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                    Tertinggi ({TIMEFRAME_OPTIONS.find((t) => t.id === timeframe)?.label})
                  </Typography>
                  <Typography sx={{ ...NUM, fontWeight: 700, fontSize: "0.95rem" }}>
                    {rupiah(chartStats.maxVal)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* KANAN: TABEL HARGA EMAS BATANGAN */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 6px 24px rgba(0, 40, 20, 0.04)",
            }}
          >
            <Box sx={{ p: { xs: 2.25, sm: 2.75 }, pb: 1.75 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}
              >
                <Typography component="h2" sx={{ fontWeight: 800, fontSize: { xs: "1.15rem", sm: "1.25rem" } }}>
                  Tabel Harga Emas Batangan
                </Typography>

                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    Keping:
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    color="primary"
                    value={kepingCount}
                    onChange={(_, val) => {
                      if (val) handleKepingChange(val as number);
                    }}
                    aria-label="Jumlah keping emas batangan"
                    sx={{
                      "& .MuiToggleButton-root": {
                        ...NUM,
                        px: 1,
                        py: 0.2,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        minWidth: 28,
                      },
                    }}
                  >
                    {KEPING_OPTIONS.map((k) => (
                      <ToggleButton key={k} value={k}>
                        {k}×
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Stack>
              </Stack>

              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, fontSize: "0.83rem" }}>
                Cetakan {brand.shortName} ({brand.certificate}). Klik baris gramasi untuk langsung menghitung simulasi
                cicilannya.
              </Typography>
            </Box>

            <Divider />

            <TableContainer sx={{ maxHeight: 370, flex: 1 }}>
              <Table size="small" stickyHeader aria-label={`Tabel harga emas batangan ${brand.shortName}`}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...headCell, bgcolor: "background.paper" }}>Berat</TableCell>
                    <TableCell sx={{ ...headCell, bgcolor: "background.paper" }} align="right">
                      Harga Beli {kepingCount > 1 ? `(${kepingCount}×)` : ""}
                    </TableCell>
                    <TableCell sx={{ ...headCell, bgcolor: "background.paper" }} align="right">
                      Buyback {kepingCount > 1 ? `(${kepingCount}×)` : ""}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {goldTable.map((row) => {
                    const isSelected = selectedWeight === row.weight;
                    const totalBeli = row.hargaBeli * kepingCount;
                    const totalBuyback = row.hargaBuyback * kepingCount;
                    return (
                      <TableRow
                        key={row.weight}
                        hover
                        selected={isSelected}
                        onClick={() => handleRowClick(row.weight)}
                        sx={{
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                          "&:last-child td": { borderBottom: 0 },
                        }}
                      >
                        <TableCell sx={{ ...NUM, fontWeight: isSelected ? 800 : 600, py: 1 }}>
                          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                            <span>{row.label}</span>
                            {isSelected && (
                              <CheckCircleRoundedIcon
                                color="primary"
                                sx={{ fontSize: 16 }}
                                titleAccess="Gramasi sedang dipilih pada kalkulator"
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            ...NUM,
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? "primary.main" : "text.primary",
                            py: 1,
                          }}
                        >
                          {rupiah(totalBeli)}
                        </TableCell>
                        <TableCell align="right" sx={{ ...NUM, color: "text.secondary", py: 1 }}>
                          {rupiah(totalBuyback)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />
            <Box
              sx={{
                px: 2.25,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="caption" sx={{ ...NUM, color: "text.secondary", fontWeight: 500 }}>
                {selectedWeight !== null
                  ? `Aktif: ${brand.shortName} ${selectedWeight.toString().replace(".", ",")} gr × ${kepingCount} (${rupiah(kebutuhan)})`
                  : `Input manual aktif: ${rupiah(kebutuhan)}`}
              </Typography>
              <Button
                size="small"
                variant="text"
                startIcon={<CalculateRoundedIcon fontSize="small" />}
                onClick={() => {
                  calculatorSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                sx={{ fontWeight: 700, fontSize: "0.78rem", py: 0.25 }}
              >
                Ke Kalkulator ↓
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* SEKSI 2: KALKULATOR SIMULASI PEMBIAYAAN (RINGKAS & FOKUS PADA POIN PENTING) */}
      <Box ref={calculatorSectionRef} id="kalkulator-simulasi" sx={{ scrollMarginTop: 84 }}>
        <Box sx={{ mb: { xs: 2.5, sm: 3.5 }, maxWidth: "68ch" }}>
          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.4rem", sm: "1.75rem" },
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Kalkulator Simulasi Pembiayaan
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.75, lineHeight: 1.6, fontSize: "0.95rem" }}>
            {selectedWeight !== null
              ? `Simulasi untuk ${brand.shortName} ${selectedWeight.toString().replace(".", ",")} gram (${kepingCount} keping) senilai ${rupiah(kebutuhan)}. Sesuaikan penghasilan dan tenor untuk melihat estimasi cicilan.`
              : "Masukkan nilai emas yang dibutuhkan, penghasilan bulanan, dan tenor pembiayaan."}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: "flex-start" }}>
          {/* PANEL INPUT INTI (3 PARAMETER UTAMA) */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ position: { md: "sticky" }, top: { md: 88 } }}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                boxShadow: "0 6px 24px rgba(0, 40, 20, 0.04)",
              }}
            >
              <Stack spacing={2.75}>
                {/* Pintasan Pilih Cepat Gramasi */}
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      Pilih cepat gramasi {brand.shortName}
                    </Typography>
                    {selectedWeight !== null && (
                      <Typography variant="caption" sx={{ ...NUM, color: "primary.main", fontWeight: 700 }}>
                        {selectedWeight.toString().replace(".", ",")} gr × {kepingCount}
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75 }}>
                    {QUICK_WEIGHTS.map((w) => {
                      const active = selectedWeight === w;
                      return (
                        <Chip
                          key={w}
                          label={`${w} gr`}
                          clickable
                          color={active ? "primary" : "default"}
                          variant={active ? "filled" : "outlined"}
                          onClick={() => handleRowClick(w)}
                          sx={{ ...NUM, fontWeight: 700, fontSize: "0.8rem" }}
                        />
                      );
                    })}
                  </Stack>
                </Box>

                <TextField
                  label="Nilai emas yang dibutuhkan"
                  value={formatInput(kebutuhan)}
                  onChange={(e) => handleManualKebutuhan(parseInput(e.target.value))}
                  fullWidth
                  slotProps={{
                    input: { startAdornment: <InputAdornment position="start">Rp</InputAdornment> },
                    htmlInput: { inputMode: "numeric", style: NUM },
                  }}
                  helperText={
                    selectedWeight !== null
                      ? `Mengikuti harga ${brand.shortName} ${selectedWeight.toString().replace(".", ",")} gr (ketik untuk ubah manual)`
                      : "Nominal kustom atau pilih dari tabel harga emas di atas"
                  }
                />

                <TextField
                  label="Penghasilan per bulan"
                  value={formatInput(gaji)}
                  onChange={(e) => setGaji(parseInput(e.target.value))}
                  fullWidth
                  slotProps={{
                    input: { startAdornment: <InputAdornment position="start">Rp</InputAdornment> },
                    htmlInput: { inputMode: "numeric", style: NUM },
                  }}
                  helperText="Gaji bulanan atau penghasilan usaha rutin"
                />

                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                    <Typography id="tenor-label" sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      Tenor pembiayaan
                    </Typography>
                    <Typography sx={{ ...NUM, fontWeight: 700, color: "primary.main" }}>
                      {tenor} tahun ({tenor * 12} bulan)
                    </Typography>
                  </Stack>
                  <Slider
                    aria-labelledby="tenor-label"
                    value={tenor}
                    min={2}
                    max={5}
                    step={1}
                    marks={TENOR_MARKS}
                    onChange={(_, v) => setTenor(v as number)}
                    sx={{ mt: 0.5, mx: 1, width: "calc(100% - 16px)" }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Tenor resmi BSN Cicil Emas: 2 sampai 5 tahun.
                  </Typography>
                </Box>

                <Button
                  variant="text"
                  size="small"
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={reset}
                  sx={{ alignSelf: "flex-start", color: "text.secondary" }}
                >
                  Kembalikan ke contoh awal
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* PANEL HASIL INTI SIMULASI */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2.5}>
              {/* 1. Status Kelayakan */}
              <Alert
                severity={statusSeverity(sim.status)}
                variant="outlined"
                sx={{ borderRadius: 3, alignItems: "flex-start" }}
                aria-live="polite"
              >
                <AlertTitle sx={{ fontWeight: 700 }}>
                  {sim.status === "LAYAK"
                    ? "Layak untuk disimulasikan"
                    : sim.status === "LAYAK DENGAN DP"
                      ? "Layak dengan uang muka (DP)"
                      : "Perlu penyesuaian"}
                </AlertTitle>
                {sim.catatan}
                {recData.items.length > 0 && (
                  <>
                    <Box
                      component="ul"
                      sx={{ ...NUM, m: 0, mt: 1, pl: 2.25, lineHeight: 1.65, fontSize: "0.88rem" }}
                    >
                      {recData.items.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </Box>
                    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 1.25 }}>
                      {recData.suggestedTenor && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={() => setTenor(recData.suggestedTenor!)}
                          sx={{ ...NUM, fontWeight: 700, fontSize: "0.78rem" }}
                        >
                          Pakai Tenor {recData.suggestedTenor} Tahun
                        </Button>
                      )}
                      {recData.suggestedEmas && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={() => handleManualKebutuhan(recData.suggestedEmas!)}
                          sx={{ ...NUM, fontWeight: 700, fontSize: "0.78rem" }}
                        >
                          Sesuaikan ke {rupiah(recData.suggestedEmas)}
                        </Button>
                      )}
                    </Stack>
                  </>
                )}
              </Alert>

              {/* 2. Ringkasan Utama yang Penting bagi Nasabah */}
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 6px 24px rgba(0, 40, 20, 0.04)",
                }}
              >
                <TableContainer>
                  <Table aria-label="Ringkasan hasil simulasi utama">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={headCell} component="th" scope="row">
                          Estimasi angsuran per bulan (tetap)
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ ...NUM, fontWeight: 800, fontSize: { xs: "1.25rem", sm: "1.45rem" }, color: "primary.main" }}
                        >
                          {rupiah(sim.angsuran)}
                          <Typography
                            component="span"
                            sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.secondary" }}
                          >
                            {" "}
                            / bln
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={headCell} component="th" scope="row">
                          Plafon pembiayaan bank
                        </TableCell>
                        <TableCell align="right" sx={{ ...NUM, fontWeight: 700 }}>
                          {rupiah(sim.plafonFinal)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={headCell} component="th" scope="row">
                          Uang muka (DP mandiri)
                        </TableCell>
                        <TableCell align="right" sx={{ ...NUM, fontWeight: 700 }}>
                          {rupiah(sim.dp)}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ "& td, & th": { borderBottom: 0 } }}>
                        <TableCell sx={headCell} component="th" scope="row">
                          Estimasi biaya awal (proses + admin)
                        </TableCell>
                        <TableCell align="right" sx={NUM}>
                          {sim.fees ? (
                            <>
                              <Typography component="span" sx={{ ...NUM, fontWeight: 700 }}>
                                {rupiah(sim.fees.proses + sim.fees.admin)}
                              </Typography>
                              <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                                Proses {rupiah(sim.fees.proses)} + Admin {rupiah(sim.fees.admin)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              Plafon &gt; Rp150 juta: konfirmasi di cabang BSN
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider />
                <Box sx={{ p: 2.25 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Rasio angsuran terhadap penghasilan
                    </Typography>
                    <Typography variant="body2" sx={{ ...NUM, fontWeight: 700 }}>
                      {sim.dsr.toFixed(1)}% (batas aman 30%)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (sim.dsr / 30) * 100)}
                    color={sim.dsr > 30 ? "error" : "primary"}
                    aria-label="Rasio angsuran terhadap batas aman 30 persen penghasilan"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Paper>

              {/* 3. Perbandingan Tenor */}
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Perbandingan Pilihan Tenor</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Klik baris tenor untuk mengganti simulasi di atas.
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small" aria-label="Perbandingan tenor">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headCell}>Tenor</TableCell>
                        <TableCell sx={headCell} align="right">
                          Angsuran / bln
                        </TableCell>
                        <TableCell sx={headCell} align="right">
                          Uang Muka (DP)
                        </TableCell>
                        <TableCell sx={headCell} align="right">
                          % Penghasilan
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {perTenor.map((row) => (
                        <TableRow
                          key={row.tenor}
                          hover
                          selected={row.tenor === tenor}
                          onClick={() => setTenor(row.tenor)}
                          sx={{ cursor: "pointer", "&:last-child td": { borderBottom: 0 } }}
                        >
                          <TableCell sx={{ fontWeight: row.tenor === tenor ? 700 : 400 }}>
                            {row.tenor} tahun
                          </TableCell>
                          <TableCell align="right" sx={NUM}>
                            {rupiah(row.angsuran)}
                          </TableCell>
                          <TableCell align="right" sx={NUM}>
                            {rupiah(row.dp)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              ...NUM,
                              color: row.dsr > 30 ? "error.main" : "text.primary",
                              fontWeight: row.dsr > 30 ? 700 : 400,
                            }}
                          >
                            {row.dsr.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* 4. Cara Perhitungan & Pengaturan Rasio FTV */}
              <Accordion
                disableGutters
                variant="outlined"
                elevation={0}
                sx={{ borderRadius: 3, "&::before": { display: "none" } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center", justifyContent: "space-between", width: "100%", pr: 1 }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Cara Perhitungan</Typography>
                    <Chip
                      size="small"
                      label={`Asumsi FTV: ${fvtPctFormatted}%`}
                      variant="outlined"
                      sx={{ ...NUM, fontWeight: 600, fontSize: "0.75rem" }}
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Stack spacing={2}>
                    {/* Pengaturan Rasio FTV di dalam Cara Perhitungan */}
                    <Box>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }} id="ftv-label">
                          Rasio Financing to Value / FTV (asumsi 80%–90%)
                        </Typography>
                        <Typography variant="caption" sx={{ ...NUM, color: "text.secondary" }}>
                          DP minimal ~{(100 - ftv * 100).toFixed(2).replace(".00", "").replace(".", ",")}%
                        </Typography>
                      </Stack>
                      <ToggleButtonGroup
                        exclusive
                        fullWidth
                        size="small"
                        color="primary"
                        value={FTV_OPTIONS.find((o) => Math.abs(o.value - ftv) < 0.001)?.label ?? null}
                        onChange={(_, label) => {
                          const opt = FTV_OPTIONS.find((o) => o.label === label);
                          if (opt) setFtv(opt.value);
                        }}
                        aria-labelledby="ftv-label"
                      >
                        {FTV_OPTIONS.map((o) => (
                          <ToggleButton key={o.label} value={o.label} sx={{ ...NUM, fontWeight: 600 }}>
                            {o.label}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.25, lineHeight: 1.6 }}>
                        Plafon ditentukan dari nilai terkecil di antara tiga batas berikut. Saat ini yang mengikat adalah{" "}
                        <strong>{bindingLabel}</strong>.
                      </Typography>
                      <TableContainer>
                        <Table size="small" aria-label="Tiga batas plafon">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={headCell}>Batas Plafon</TableCell>
                              <TableCell sx={headCell}>Rumus</TableCell>
                              <TableCell sx={headCell} align="right">
                                Hasil
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow selected={sim.binding === "KEBUTUHAN"}>
                              <TableCell>Kebutuhan Emas</TableCell>
                              <TableCell sx={{ color: "text.secondary" }}>Nilai emas</TableCell>
                              <TableCell align="right" sx={NUM}>
                                {rupiah(sim.plafonKebutuhan)}
                              </TableCell>
                            </TableRow>
                            <TableRow selected={sim.binding === "FTV"}>
                              <TableCell>Batas FTV (asumsi)</TableCell>
                              <TableCell sx={{ color: "text.secondary", ...NUM }}>
                                {fvtPctFormatted}% × nilai emas
                              </TableCell>
                              <TableCell align="right" sx={NUM}>
                                {rupiah(sim.plafonFTV)}
                              </TableCell>
                            </TableRow>
                            <TableRow selected={sim.binding === "DSR"}>
                              <TableCell>Batas DSR 30% (asumsi)</TableCell>
                              <TableCell sx={{ color: "text.secondary", ...NUM }}>
                                (30% × gaji × {sim.bulan}) ÷ (1 + 7,92% × {sim.tenor})
                              </TableCell>
                              <TableCell align="right" sx={NUM}>
                                {rupiah(sim.plafonDSR)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>

                    <Box
                      component="ol"
                      sx={{
                        ...NUM,
                        m: 0,
                        pl: 2.5,
                        fontSize: "0.86rem",
                        lineHeight: 1.85,
                        color: "text.secondary",
                      }}
                    >
                      <li>
                        Margin total (asumsi ~7,92%/thn) = {rupiah(sim.plafonFinal)} × 7,92% × {sim.tenor} thn ={" "}
                        <strong>{rupiah(sim.margin)}</strong>
                      </li>
                      <li>
                        Total kewajiban ({sim.bulan} bulan) = {rupiah(sim.plafonFinal)} + {rupiah(sim.margin)} ={" "}
                        <strong>{rupiah(sim.total)}</strong>
                      </li>
                      <li>
                        Angsuran bulanan tetap = {rupiah(sim.total)} ÷ {sim.bulan} bulan ={" "}
                        <strong>{rupiah(sim.angsuran)}</strong>
                      </li>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* 5. Disclaimer & Tombol Konsultasi (Tanpa Play Store & App Store) */}
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 1.5, lineHeight: 1.6, fontSize: "0.85rem", textWrap: "pretty" }}
                >
                  Simulasi dan acuan harga emas ini bersifat edukatif serta tidak menjamin persetujuan pembiayaan.
                  Besaran margin, FTV, dan kelayakan akhir mengacu pada ketentuan RIPLAY serta analisis resmi petugas
                  PT Bank Syariah Nasional.
                </Typography>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1.25 }}>
                  <Button component={Link} href="/chat" variant="contained" startIcon={<ChatRoundedIcon />}>
                    Tanya ALIEF
                  </Button>
                  <Button
                    component="a"
                    href="tel:150286"
                    variant="outlined"
                    startIcon={<PhoneInTalkRoundedIcon />}
                  >
                    Telepon 150 286
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
