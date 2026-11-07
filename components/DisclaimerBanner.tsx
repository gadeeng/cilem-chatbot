import Alert from "@mui/material/Alert";

export default function DisclaimerBanner() {
  return (
    <Alert
      severity="warning"
      variant="outlined"
      icon={false}
      sx={{ borderRadius: 0, borderWidth: "0 0 1px 0", justifyContent: "center", textAlign: "center", fontSize: { xs: 11, sm: 13 }, py: 0.5 }}
    >
      Asisten ini memberikan informasi umum mengenai produk BSN Cicil Emas
      berdasarkan data resmi. Jawaban yang diberikan bukan merupakan nasihat
      keuangan pribadi maupun keputusan/persetujuan resmi dari Bank. Untuk
      pengajuan dan konsultasi, hubungi Kantor Cabang BSN terdekat.
    </Alert>
  );
}
