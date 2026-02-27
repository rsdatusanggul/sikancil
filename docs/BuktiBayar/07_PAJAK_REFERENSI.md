# 07 - Referensi Lengkap Pajak
## Modul Bukti Pembayaran | SI-KANCIL

---

## Ringkasan 8 Jenis Pajak

```
╔══╦══════════════════════╦═══════════════════╦════════╦═══════════════════════════╦═════════════════╗
║ # ║ Jenis               ║ Field DB          ║ Tarif  ║ Trigger di BLUD           ║ BLUD sbg        ║
╠══╬══════════════════════╬═══════════════════╬════════╬═══════════════════════════╬═════════════════╣
║ 1 ║ PPN                 ║ ppn_rate          ║ 11%    ║ Vendor PKP                ║ Pemotong        ║
║ 2 ║ PPh 21              ║ pph21_rate        ║ Prog   ║ Gaji & honorarium         ║ Pemotong        ║
║ 3 ║ PPh 22              ║ pph22_rate        ║ 1.5%   ║ Pembelian barang          ║ Pemotong        ║
║ 4 ║ PPh 23              ║ pph23_rate        ║ 2%     ║ Jasa & katering PKP       ║ Pemotong        ║
║ 5 ║ PPh 4 ayat (2)      ║ pph4a2_rate       ║ 10%    ║ Sewa gedung/lahan         ║ Pemotong        ║
║ 6 ║ PPh Final UMKM      ║ pph_final_umkm    ║ 0.5%   ║ Vendor SK PP 23/2018      ║ Pemotong        ║
║ 7 ║ PPh 24              ║ pph24_rate        ║ Var    ║ Luar negeri (sangat jarang)║ Pemotong        ║
║ 8 ║ PBJT Makan Minum    ║ includes_pbjt     ║ ≤10%   ║ Beli langsung di restoran ║ BUKAN pemotong  ║
║   ║                     ║ (flag saja)       ║        ║ — harga sudah include PBJT║ (flag audit)    ║
╚══╩══════════════════════╩═══════════════════╩════════╩═══════════════════════════╩═════════════════╝
```

---

## Detail per Jenis Pajak

### 1. PPN — Pajak Pertambahan Nilai
```
Dasar Hukum  : UU 42/2009 jo UU 7/2021 (HPP)
Tarif        : 11% (sejak April 2022)
DPP          : Harga jual / nilai penggantian
Vendor       : Hanya PKP (Pengusaha Kena Pajak) yang wajib pungut
Dokumen      : Faktur Pajak dari vendor (wajib dilampirkan)
Penyetoran   : Via SSP oleh vendor ke KPP

Contoh:
  Gross       = Rp 17.000.000
  PPN 11%     = Rp  1.700.000
  DPP         = Rp 15.300.000 (harga sebelum PPN)
```

---

### 2. PPh 21 — Pajak Penghasilan Orang Pribadi
```
Dasar Hukum  : UU 36/2008 Pasal 21
Tarif        : Progresif (5% s.d. 35%)
Objek        : Gaji, honorarium, uang saku, hadiah
Dokumen      : Bukti Potong 1721-A1 (gaji) / 1721-A2 (non-gaji)
Relevansi    : Untuk pembayaran honor narasumber, konsultan OP

Tarif progresif (2024):
  s.d. Rp 60 juta/tahun         → 5%
  > Rp 60 juta s.d. 250 juta    → 15%
  > Rp 250 juta s.d. 500 juta   → 25%
  > Rp 500 juta s.d. 5 miliar   → 30%
  > Rp 5 miliar                  → 35%
```

---

### 3. PPh 22 — Pajak atas Pembelian Barang
```
Dasar Hukum  : UU 36/2008 Pasal 22
Tarif        : 1.5% (ber-NPWP) / 3% (non-NPWP)
Objek        : Pembelian barang oleh instansi pemerintah
Threshold    : Pembelian > Rp 2.000.000 (non-kumulatif)
Dokumen      : SSP PPh 22

Dikecualikan dari PPh 22:
  - Pembelian BBM, gas, pelumas dari Pertamina
  - Pembayaran rekening listrik, air, telepon
  - Pembayaran gaji/honorarium (→ PPh 21)

Contoh BLUD:
  Beli BMHP Rp 18.938.178:
  PPh 22 = 1.5% × 18.938.178 = Rp 284.073
```

---

### 4. PPh 23 — Pajak atas Penghasilan dari Jasa
```
Dasar Hukum  : UU 36/2008 Pasal 23
Tarif        : 2% (ber-NPWP) / 4% (non-NPWP)
Objek        : Jasa teknik, konsultansi, katering, kebersihan, keamanan
Pengecualian : Jasa yang sudah dipotong PPh 21

Contoh BLUD:
  Katering rapat Rp 5.000.000:
  PPh 23 = 2% × 5.000.000 = Rp 100.000

  Catering vendor non-NPWP:
  PPh 23 = 4% × 5.000.000 = Rp 200.000
```

---

### 5. PPh Pasal 4 Ayat (2) — Pajak Final Sewa
```
Dasar Hukum  : UU 36/2008 Pasal 4 ayat (2)
Tarif        : 10% (final, tidak bisa dikreditkan)
Objek        : Sewa tanah/bangunan (gedung, ruangan, lahan parkir)
Dokumen      : Bukti Potong PPh 4(2)

Relevansi BLUD:
  - Sewa ruang untuk kegiatan pelatihan
  - Sewa gedung pertemuan
  - Sewa lahan parkir tambahan
  - Sewa gudang penyimpanan

Contoh:
  Sewa ruang rapat 1 hari Rp 10.000.000:
  PPh 4(2) = 10% × 10.000.000 = Rp 1.000.000
  PPN      = 11% × 10.000.000 = Rp 1.100.000  (jika landlord PKP)
  Net      = Rp 7.900.000
```

---

### 6. PPh Final UMKM — PP 23/2018
```
Dasar Hukum  : PP 23/2018 (berlaku sejak 1 Juli 2018)
Tarif        : 0.5% dari peredaran bruto
Syarat vendor:
  - Omzet ≤ Rp 4.800.000.000/tahun
  - Punya Surat Keterangan (SK) PP 23 dari KPP
  - SK berlaku 1 tahun pajak (harus diperbarui tiap tahun)

Jangka waktu berlaku (tidak bisa pakai PP 23 selamanya):
  - PT            : Max 3 tahun
  - CV/Firma/Kop  : Max 4 tahun
  - OP            : Max 7 tahun

PENTING — Interaksi dengan pajak lain:
  ✅ PPh Final UMKM MENGGANTIKAN PPh 22 dan PPh 23
  ✅ Tidak ada PPN jika vendor belum PKP (omzet < 4.8M)
  ❌ TIDAK berlaku bersamaan dengan PPh 22 atau PPh 23

Kewajiban BLUD:
  1. Minta fotokopi SK PP 23 dari vendor (setiap tahun)
  2. Simpan SK sebagai lampiran BB
  3. Potong 0.5% dari nilai bruto
  4. Setor ke kas negara via SSP

Contoh:
  Pengadaan ATK dari toko UMKM Rp 3.000.000:
  PPh Final UMKM = 0.5% × 3.000.000 = Rp 15.000
  PPN = 0 (vendor belum PKP)
  Net = Rp 2.985.000
```

---

### 7. PPh 24 — Pajak atas Penghasilan Luar Negeri
```
Dasar Hukum  : UU 36/2008 Pasal 24
Tarif        : Variatif (mengikuti P3B / tax treaty)
Relevansi    : Sangat jarang untuk BLUD daerah
Kemungkinan  : Pembelian software/lisensi dari vendor luar negeri

Rekomendasi  : Tetap ada di database untuk kelengkapan,
               tapi form UI bisa disembunyikan by default
```

---

### 8. PBJT Makanan & Minuman — Pajak Daerah
```
Dasar Hukum  : UU HKPD No. 1/2022 (menggantikan UU 28/2009)
Nama lama    : Pajak Restoran / PB1
Nama baru    : PBJT (Pajak Barang dan Jasa Tertentu) Makan Minum
Tarif        : Maksimal 10% (ditetapkan Perda masing-masing daerah)
Pemungut     : Restoran/warung/katering kepada pembeli

⚠️ PENTING — BLUD BUKAN PEMOTONG PBJT:
  BLUD membayar ke restoran → restoran sudah include PBJT dalam harga
  BLUD tidak memotong dari tagihan restoran
  BLUD tidak menyetorkan PBJT ke Pemda

Implementasi di sistem:
  ✅ Bukan kolom potongan (tidak masuk total_deductions)
  ✅ Flag 'includes_pbjt = true' pada tax_rule kode restoran
  ✅ Ditampilkan sebagai catatan (*) di dokumen BB
  ✅ Nilai estimasi PBJT dicatat untuk keperluan audit
  ✅ Berguna untuk analisis belanja daerah

Dua skenario makan minum di BLUD:
┌─────────────────────────────────┬───────────────────────────────────────┐
│ Skenario                        │ Pajak yang Dipotong BLUD              │
├─────────────────────────────────┼───────────────────────────────────────┤
│ Beli langsung di restoran       │ TIDAK ADA — PBJT sudah di harga       │
│ Vendor katering PKP             │ PPN 11% + PPh 23 2%                   │
│ Vendor katering UMKM (SK valid) │ PPh Final 0.5% (tanpa PPN, tanpa PPh 23)│
│ Vendor katering non-PKP, bukan  │ PPh 23 2% saja (tanpa PPN)            │
│ UMKM                            │                                       │
└─────────────────────────────────┴───────────────────────────────────────┘
```

---

## Logic Decision Tree — Tax Engine

```
INPUT: accountCode + grossAmount + vendorNpwp + skUmkmNumber + skUmkmExpiry

                      ┌─────────────────────────────┐
                      │  Cari tax_rule (best match)  │
                      └──────────────┬──────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │ rule.isFinalTax = true?          │
                    │ DAN SK UMKM masih berlaku?       │
                    └────────────────┬────────────────┘
                          │                │
                         YES               NO
                          │                │
              ┌───────────▼───┐     ┌──────▼──────────────┐
              │ PPh Final UMKM │     │ Hitung normal:       │
              │ 0.5% × gross   │     │ PPN + PPh 21/22/23   │
              │ PPh 22 = 0     │     │ + PPh 4(2) + PPh 24  │
              │ PPh 23 = 0     │     │                      │
              └───────────────┘     └──────┬───────────────┘
                                           │
                                   ┌───────▼───────────────┐
                                   │ vendorNpwp kosong?     │
                                   │ PPh 22 × 2 (3%)        │
                                   │ PPh 23 × 2 (4%)        │
                                   └───────────────────────┘

                    ┌────────────────▼────────────────┐
                    │ rule.includesPbjt = true?        │
                    └────────────────┬────────────────┘
                          │                │
                         YES               NO
                          │                │
              ┌───────────▼───┐     ┌──────▼──────────────┐
              │ Set flag       │     │ Total deductions     │
              │ includes_pbjt │     │ dihitung tanpa PBJT  │
              │ = true         │     │                      │
              │ Estimasi PBJT  │     │                      │
              │ (info audit)   │     │                      │
              └───────────────┘     └──────────────────────┘

OUTPUT: TaxResult {
  ppnAmount, pph21Amount, pph22Amount, pph23Amount,
  pph4a2Amount, pphFinalUmkmAmount, pph24Amount,
  includesPbjt, pbjt_rate, pbjt_amount (estimasi),
  totalDeductions, netPayment, grossAmountText
}
```

---

## Dokumen Pendukung per Jenis Pajak

| Jenis Pajak | Dokumen Wajib dari Vendor | Dokumen BLUD |
|-------------|--------------------------|--------------|
| PPN | Faktur Pajak (e-faktur) | SSP PPN |
| PPh 21 | — | Bukti Potong 1721-A2 |
| PPh 22 | NPWP vendor | SSP PPh 22 |
| PPh 23 | NPWP vendor | Bukti Potong PPh 23 |
| PPh 4(2) | NPWP vendor | SSP PPh 4(2) |
| PPh Final UMKM | **SK PP 23/2018 dari KPP** | SSP PPh Final |
| PBJT | Nota/invoice (sudah include) | — (bukan pemotong) |

---

## Catatan Penting untuk Developer

```typescript
// Urutan prioritas tax rule matching:
// 1. Pattern paling PANJANG = paling spesifik → menang
// 2. Contoh: '5.2.02.10.01.0003' > '5.2.02.10.01' > '5.2.02.10' > '5.2.02'

// UMKM check:
// - Jika skUmkmNumber ada DAN skUmkmExpiry >= today → isUmkm = true
// - Jika isUmkm → PPh 22 = 0, PPh 23 = 0, pakai pphFinalUmkm
// - Jika SK expired → throw BadRequestException (vendor update SK dulu)

// Double rate tanpa NPWP:
// - PPh 22: 1.5% → 3%  (jika vendorNpwp kosong/null)
// - PPh 23: 2%   → 4%  (jika vendorNpwp kosong/null)
// - PPh Final UMKM: tarif tetap 0.5% (tidak dobel)

// PBJT — TIDAK masuk total_deductions:
// - totalDeductions = pph21 + pph22 + pph23 + pph4a2 + pphFinalUmkm + pph24 + ppn + other
// - pbjt_amount = estimasi saja (gross × pbjt_rate / (100 + pbjt_rate))
// - netPayment = gross - totalDeductions (PBJT tidak mempengaruhi net)
```
