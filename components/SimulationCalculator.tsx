"use client";

import React, { useMemo, useState } from "react";
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
import ShopRoundedIcon from "@mui/icons-material/ShopRounded";
import AppleIcon from "@mui/icons-material/Apple";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=co.id.newmb.btnsyariah&hl=id";
const APP_STORE_URL =
  "https://apps.apple.com/sg/app/bale-syariah-by-bsn/id6590610395";

const TENOR_MARKS = [2, 3, 4, 5].map((t) => ({ value: t, label: `${t} th` }));
const TENOR_OPTIONS = [2, 3, 4, 5];

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
    catatan = `Angsuran untuk plafon FTV penuh sekitar ${rupiah(angsuranFTV)} per bulan (${dsrFTV.toFixed(1)}% dari penghasilan), di atas batas asumsi 30%. Coba tenor lebih panjang, nilai emas lebih kecil, atau siapkan DP sekitar ${rupiah(dp)}.`;
  } else if (dp > 0) {
    status = "LAYAK DENGAN DP";
    catatan = `Angsuran ${dsr.toFixed(1)}% dari penghasilan, masih di bawah batas asumsi 30%. Plafon dibatasi FTV, jadi siapkan DP mandiri sekitar ${rupiah(dp)}.`;
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

// Saran penyesuaian saat status tidak layak (semua angka tetap berbasis asumsi simulasi).
function buildRecommendations(sim: ReturnType<typeof simulate>): string[] {
  if (sim.status !== "TIDAK LAYAK / PERLU PENYESUAIAN" || sim.kebutuhan <= 0 || sim.gaji <= 0) return [];
  const recs: string[] = [];

  const maxEmasNow = roundDown(sim.plafonDSR / sim.ftv, 100_000);
  if (maxEmasNow > 0) {
    recs.push(
      `Turunkan nilai emas menjadi sekitar ${rupiah(maxEmasNow)} atau kurang (tenor ${sim.tenor} tahun tetap).`
    );
  }

  let tenorFound = false;
  for (let t = sim.tenor + 1; t <= 5; t++) {
    const alt = simulate(sim.kebutuhan, t, sim.gaji, sim.ftv);
    if (alt.status !== "TIDAK LAYAK / PERLU PENYESUAIAN") {
      recs.push(
        `Perpanjang tenor menjadi ${t} tahun: angsuran sekitar ${rupiah(alt.angsuran)} per bulan (${alt.dsr.toFixed(1)}% dari penghasilan), nilai emas tetap ${rupiah(sim.kebutuhan)}.`
      );
      tenorFound = true;
      break;
    }
  }
  if (!tenorFound && sim.tenor < 5) {
    const at5 = simulate(sim.kebutuhan, 5, sim.gaji, sim.ftv);
    const maxEmas5 = roundDown(at5.plafonDSR / sim.ftv, 100_000);
    recs.push(
      `Tenor 5 tahun (maksimal) belum cukup untuk nilai emas ini. Gabungkan dengan nilai emas sekitar ${rupiah(maxEmas5)} atau kurang.`
    );
  }
  if (sim.tenor === 5) {
    recs.push("Tenor sudah di batas maksimal 5 tahun, jadi satu-satunya pilihan adalah menurunkan nilai emas atau menambah penghasilan.");
  }

  const minGaji = roundUp(sim.angsuranFTV / ASSUMED_DSR_CAP, 100_000);
  recs.push(`Atau penghasilan rutin minimal sekitar ${rupiah(minGaji)} per bulan untuk nilai emas dan tenor ini.`);
  return recs;
}

const statusSeverity = (s: Status) =>
  s === "LAYAK" ? "success" : s === "LAYAK DENGAN DP" ? "info" : "error";

const headCell = { fontWeight: 600, color: "text.secondary", fontSize: "0.78rem" } as const;

export default function SimulationCalculator() {
  const [kebutuhan, setKebutuhan] = useState(60_000_000);
  const [gaji, setGaji] = useState(10_000_000);
  const [tenor, setTenor] = useState(5);
  const [ftv, setFtv] = useState(5 / 6);

  const sim = useMemo(() => simulate(kebutuhan, tenor, gaji, ftv), [kebutuhan, tenor, gaji, ftv]);
  const recommendations = useMemo(() => buildRecommendations(sim), [sim]);
  const perTenor = useMemo(
    () => TENOR_OPTIONS.map((t) => simulate(kebutuhan, t, gaji, ftv)),
    [kebutuhan, gaji, ftv]
  );

  const reset = () => {
    setKebutuhan(60_000_000);
    setGaji(10_000_000);
    setTenor(5);
    setFtv(5 / 6);
  };

  const bindingLabel =
    sim.binding === "FTV"
      ? `batas FTV (asumsi ${(sim.ftv * 100).toFixed(2).replace(".", ",")}%)`
      : sim.binding === "DSR"
        ? "batas kemampuan angsuran (asumsi 30% penghasilan)"
        : "nilai emas yang Anda butuhkan";

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
      <Box sx={{ mb: { xs: 3, sm: 4 }, maxWidth: 640 }}>
        <Typography
          component="h1"
          sx={{ fontWeight: 800, fontSize: { xs: "1.6rem", sm: "2.1rem" }, letterSpacing: "-0.02em", lineHeight: 1.15, textWrap: "balance" }}
        >
          Simulasi BSN Cicil Emas
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 1, lineHeight: 1.65, textWrap: "pretty" }}>
          Masukkan kebutuhan emas, penghasilan, dan tenor. Hasil dan cara menghitungnya muncul langsung di samping.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: "flex-start" }}>
        {/* INPUT */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ position: { md: "sticky" }, top: { md: 88 } }}>
          <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Nilai emas yang dibutuhkan"
                value={formatInput(kebutuhan)}
                onChange={(e) => setKebutuhan(parseInput(e.target.value))}
                fullWidth
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start">Rp</InputAdornment> },
                  htmlInput: { inputMode: "numeric", style: NUM },
                }}
                helperText="Contoh: 60.000.000"
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
                helperText="Gaji atau penghasilan usaha yang rutin"
              />

              <Box>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                  <Typography id="tenor-label" sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    Tenor
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

              <Accordion
                disableGutters
                elevation={0}
                variant="outlined"
                sx={{ borderRadius: 2, "&::before": { display: "none" } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Asumsi perhitungan</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                      Angka berikut adalah asumsi simulasi, bukan ketentuan resmi BSN. Ketentuan resmi ada pada RIPLAY dan petugas bank.
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5, color: "text.secondary", fontSize: "0.85rem", lineHeight: 1.7 }}>
                      <li>Margin flat sekitar 7,92% per tahun (dihitung balik dari satu contoh RIPLAY, bisa berbeda per tenor)</li>
                      <li>Batas angsuran 30% dari penghasilan (praktik umum, bukan kebijakan tertulis BSN)</li>
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }} id="ftv-label">
                      Rasio FTV (asumsi, kisaran 80% sampai 90%)
                    </Typography>
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
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Button
                variant="text"
                startIcon={<RestartAltRoundedIcon />}
                onClick={reset}
                sx={{ alignSelf: "flex-start", color: "text.secondary" }}
              >
                Kembalikan ke contoh awal
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* HASIL */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={3}>
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
                    ? "Layak dengan uang muka"
                    : "Perlu penyesuaian"}
              </AlertTitle>
              {sim.catatan}
              {recommendations.length > 0 && (
                <>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", mt: 1.5 }}>
                    Rekomendasi agar layak
                  </Typography>
                  <Box component="ul" sx={{ ...NUM, m: 0, mt: 0.5, pl: 2.5, lineHeight: 1.7, fontSize: "0.9rem" }}>
                    {recommendations.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ display: "block", mt: 1, color: "text.secondary" }}>
                    Angka saran memakai asumsi simulasi, bukan ketentuan resmi BSN.
                  </Typography>
                </>
              )}
            </Alert>

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              <TableContainer>
                <Table aria-label="Ringkasan simulasi">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={headCell} component="th" scope="row">Angsuran per bulan, tetap</TableCell>
                      <TableCell align="right" sx={{ ...NUM, fontWeight: 800, fontSize: "1.35rem", color: "primary.main" }}>
                        {rupiah(sim.angsuran)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={headCell} component="th" scope="row">Plafon pembiayaan</TableCell>
                      <TableCell align="right" sx={{ ...NUM, fontWeight: 700 }}>{rupiah(sim.plafonFinal)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={headCell} component="th" scope="row">Uang muka mandiri</TableCell>
                      <TableCell align="right" sx={{ ...NUM, fontWeight: 700 }}>{rupiah(sim.dp)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={headCell} component="th" scope="row">Margin total (asumsi)</TableCell>
                      <TableCell align="right" sx={NUM}>{rupiah(sim.margin)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={headCell} component="th" scope="row">Total dibayar selama {sim.bulan} bulan</TableCell>
                      <TableCell align="right" sx={NUM}>{rupiah(sim.total)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ "& td, & th": { borderBottom: 0 } }}>
                      <TableCell sx={headCell} component="th" scope="row">
                        Biaya awal (proses + administrasi)
                      </TableCell>
                      <TableCell align="right" sx={NUM}>
                        {sim.fees ? (
                          <>
                            {rupiah(sim.fees.proses + sim.fees.admin)}
                            <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                              {rupiah(sim.fees.proses)} + {rupiah(sim.fees.admin)}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Plafon di atas Rp150 juta: tanyakan ke kantor cabang
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider />
              <Box sx={{ p: 2.5 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Porsi angsuran dari penghasilan
                  </Typography>
                  <Typography variant="body2" sx={{ ...NUM, fontWeight: 700 }}>
                    {sim.dsr.toFixed(1)}% dari batas 30%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (sim.dsr / 30) * 100)}
                  color={sim.dsr > 30 ? "error" : "primary"}
                  aria-label="Porsi angsuran dibanding batas 30 persen"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Paper>

            <Accordion disableGutters variant="outlined" elevation={0} sx={{ borderRadius: 3, "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Typography sx={{ fontWeight: 700 }}>Cara menghitungnya</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, lineHeight: 1.6 }}>
                  Plafon adalah yang terkecil dari tiga batas. Saat ini yang mengikat adalah <strong>{bindingLabel}</strong>.
                  {sim.binding === "FTV" && " Menambah penghasilan tidak akan menaikkan plafon, selisihnya ditutup dengan uang muka."}
                </Typography>
                <TableContainer>
                  <Table size="small" aria-label="Tiga batas plafon">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headCell}>Batas</TableCell>
                        <TableCell sx={headCell}>Rumus</TableCell>
                        <TableCell sx={headCell} align="right">Hasil</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow selected={sim.binding === "KEBUTUHAN"}>
                        <TableCell>Kebutuhan</TableCell>
                        <TableCell sx={{ color: "text.secondary" }}>Nilai emas</TableCell>
                        <TableCell align="right" sx={NUM}>{rupiah(sim.plafonKebutuhan)}</TableCell>
                      </TableRow>
                      <TableRow selected={sim.binding === "FTV"}>
                        <TableCell>FTV (asumsi)</TableCell>
                        <TableCell sx={{ color: "text.secondary", ...NUM }}>
                          {(sim.ftv * 100).toFixed(2).replace(".", ",")}% × nilai emas
                        </TableCell>
                        <TableCell align="right" sx={NUM}>{rupiah(sim.plafonFTV)}</TableCell>
                      </TableRow>
                      <TableRow selected={sim.binding === "DSR"}>
                        <TableCell>Angsuran 30% (asumsi)</TableCell>
                        <TableCell sx={{ color: "text.secondary", ...NUM }}>
                          (30% × penghasilan × {sim.bulan}) ÷ (1 + 7,92% × {sim.tenor})
                        </TableCell>
                        <TableCell align="right" sx={NUM}>{rupiah(sim.plafonDSR)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box component="ol" sx={{ ...NUM, mt: 2, mb: 0, pl: 2.5, fontSize: "0.88rem", lineHeight: 1.9, color: "text.secondary" }}>
                  <li>Margin = {rupiah(sim.plafonFinal)} × 7,92% × {sim.tenor} = <strong>{rupiah(sim.margin)}</strong></li>
                  <li>Total = {rupiah(sim.plafonFinal)} + {rupiah(sim.margin)} = <strong>{rupiah(sim.total)}</strong></li>
                  <li>Angsuran = {rupiah(sim.total)} ÷ {sim.bulan} bulan = <strong>{rupiah(sim.angsuran)}</strong></li>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Bandingkan tenor</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Pilih baris untuk memakai tenor tersebut.
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small" aria-label="Perbandingan tenor">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headCell}>Tenor</TableCell>
                      <TableCell sx={headCell} align="right">Angsuran</TableCell>
                      <TableCell sx={headCell} align="right">DP</TableCell>
                      <TableCell sx={headCell} align="right">% penghasilan</TableCell>
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
                        <TableCell sx={{ fontWeight: row.tenor === tenor ? 700 : 400 }}>{row.tenor} tahun</TableCell>
                        <TableCell align="right" sx={NUM}>{rupiah(row.angsuran)}</TableCell>
                        <TableCell align="right" sx={NUM}>{rupiah(row.dp)}</TableCell>
                        <TableCell
                          align="right"
                          sx={{ ...NUM, color: row.dsr > 30 ? "error.main" : "text.primary", fontWeight: row.dsr > 30 ? 700 : 400 }}
                        >
                          {row.dsr.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, lineHeight: 1.65, textWrap: "pretty" }}>
                Simulasi ini bersifat edukatif dan tidak menjamin persetujuan pembiayaan. Besaran margin, FTV, dan kelayakan
                ditentukan oleh BSN setelah analisis resmi.
              </Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                <Button component={Link} href="/chat" variant="contained" startIcon={<ChatRoundedIcon />}>
                  Tanya ALIEF
                </Button>
                <Button component="a" href="tel:150286" variant="outlined" startIcon={<PhoneInTalkRoundedIcon />}>
                  Telepon 150 286
                </Button>
                <Button component="a" href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<ShopRoundedIcon />}>
                  Play Store
                </Button>
                <Button component="a" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<AppleIcon />}>
                  App Store
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
