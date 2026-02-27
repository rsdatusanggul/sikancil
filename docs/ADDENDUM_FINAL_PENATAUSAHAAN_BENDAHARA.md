# Si-Kancil - Addendum Final: Modul Penatausahaan Bendahara
**Sistem Keuangan Cepat Lincah - BLUD**

**Tanggal:** 14 Februari 2026  
**Status:** Final Addendum - Complete Penatausahaan Module  
**Referensi:** Permendagri 13/2006, Per-47/PB/2014 (BLU), Web Search Results

---

## 🔴 TEMUAN KRUSIAL: Yang Masih Terlewat!

Setelah web search, saya menemukan bahwa penatausahaan BLUD memerlukan **2 LAPIS PERTANGGUNGJAWABAN**:

### **LAPIS 1: Pertanggungjawaban Administratif (HARIAN/BULANAN)** ⭐ TERLEWAT!
- SPJ UP (Uang Persediaan)
- SPJ GU (Ganti Uang)
- SPJ TU (Tambahan Uang)
- SPJ LS (Langsung)
- BKU (Buku Kas Umum) - Harian
- Buku Pembantu (Bank, Kas, Pajak, Panjar)
- Register-register (STS, SPJ, dll)

### **LAPIS 2: Pertanggungjawaban Fungsional (TRIWULANAN)** ✅ Sudah Ada
- Laporan Pendapatan BLUD
- Laporan Pengeluaran Biaya BLUD  
- SPTJ
- SPJ Fungsional

---

## BAGIAN 1: SPJ ADMINISTRATIF (UP/GU/TU/LS)

### **1.1. Konsep Dasar UP/GU/TU**

```yaml
UP (Uang Persediaan):
  Definisi: Uang muka kerja yang diberikan di awal tahun anggaran
  Tujuan: Membiayai kegiatan rutin/operasional
  Besaran: Ditetapkan per SK Kepala Daerah
  Frekuensi: SEKALI setahun (awal tahun anggaran)
  Pencairan: SPP-UP → SPM-UP → SP2D-UP
  
GU (Ganti Uang Persediaan):
  Definisi: Penggantian UP yang telah digunakan
  Tujuan: Mengisi kembali UP yang sudah terpakai
  Besaran: Sesuai SPJ yang telah disahkan
  Frekuensi: Berkala (setelah UP habis/menipis)
  Mekanisme: SPJ UP → Pengesahan → SPP-GU → SPM-GU → SP2D-GU
  
TU (Tambahan Uang Persediaan):
  Definisi: Tambahan uang di luar UP
  Tujuan: Kegiatan mendesak yang tidak bisa ditunda
  Besaran: Sesuai kebutuhan mendesak
  Frekuensi: Insidentil
  Syarat: UP sudah habis/hampir habis
  Pertanggungjawaban: Terpisah dari GU
  
LS (Langsung):
  Definisi: Pembayaran langsung dari PPKD ke pihak ketiga
  Tujuan: Pembayaran >Rp 50 juta atau sesuai aturan daerah
  Contoh: Gaji PNS, kontrak besar, belanja modal
  Mekanisme: SPP-LS → SPM-LS → SP2D-LS (langsung ke vendor)
```

### **1.2. SPJ UP (Surat Pertanggungjawaban Uang Persediaan)**

**Format:**
```
PEMERINTAH KABUPATEN/KOTA [NAMA]
BLUD [NAMA]

SURAT PERTANGGUNGJAWABAN
PENGGUNAAN UANG PERSEDIAAN (SPJ-UP)
Bulan: [Nama Bulan] Tahun [XXXX]

┌────┬──────────┬─────────────┬──────────┬─────────┬─────────┬─────────┐
│ NO │ TANGGAL  │ NO BUKTI    │ URAIAN   │  KODE   │ JUMLAH  │ KET     │
│    │          │             │          │ REK     │  (Rp)   │         │
├────┼──────────┼─────────────┼──────────┼─────────┼─────────┼─────────┤
│  1 │ 05/01/26 │ KWT-001     │ ATK      │ 5.2.2   │ 500.000 │ Tunai   │
│  2 │ 08/01/26 │ KWT-002     │ BBM      │ 5.2.3   │ 300.000 │ Tunai   │
│... │          │             │          │         │         │         │
├────┴──────────┴─────────────┴──────────┴─────────┼─────────┼─────────┤
│                                       JUMLAH SPJ  │5.000.000│         │
└───────────────────────────────────────────────────┴─────────┴─────────┘

REKAPITULASI:
1. Saldo Awal UP                     : Rp 50.000.000
2. Pengeluaran (SPJ ini)             : Rp  5.000.000
3. Sisa UP                           : Rp 45.000.000

Lampiran:
- Bukti pengeluaran yang sah (kuitansi, nota, faktur)
- Bukti setor pajak (jika ada)

                                [Tempat], [Tanggal]
Bendahara Pengeluaran                      Disetujui:
                                          PPK-BLUD / Pemimpin BLUD

(Tanda Tangan)                            (Tanda Tangan)
(Nama)                                    (Nama)
NIP.                                      NIP.
```

**Database Schema:**
```prisma
model SPJUP {
  id                    String   @id @default(uuid())
  nomorSPJ              String   @unique
  bulan                 Int
  tahun                 Int
  
  // UP Info
  nilaiUP               Decimal  @db.Decimal(15,2) // Dari SK
  saldoAwalUP           Decimal  @db.Decimal(15,2)
  
  // Detail Pengeluaran
  detailPengeluaran     Json     // [{tgl, noBukti, uraian, kodeRek, jumlah}]
  totalPengeluaran      Decimal  @db.Decimal(15,2)
  
  // Sisa
  sisaUP                Decimal  @db.Decimal(15,2)
  
  // Dokumen Pendukung
  buktiPengeluaran      String[] // Array of file paths
  buktiSetorPajak       String[]
  
  // Status
  status                String   // DRAFT, SUBMITTED, VERIFIED, APPROVED
  
  // Workflow
  bendaharaId           String
  submittedAt           DateTime?
  verifiedBy            String?  // Verifikator
  verifiedAt            DateTime?
  approvedBy            String?  // PPK atau Pemimpin BLUD
  approvedAt            DateTime?
  
  // Link ke GU
  isUsedForGU           Boolean  @default(false)
  spjGUId               String?  // Link to next GU
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([bulan, tahun])
  @@index([status])
}
```

---

### **1.3. SPJ GU (Surat Pertanggungjawaban Ganti Uang)**

**Mekanisme:**
```
1. Bendahara menggunakan UP untuk belanja
2. Bendahara membuat SPJ UP (bukti penggunaan)
3. SPJ UP diverifikasi & disahkan
4. Bendahara mengajukan SPP-GU sebesar SPJ yang disahkan
5. Diterbitkan SPM-GU
6. PPKD menerbitkan SP2D-GU
7. UP kembali penuh (revolving)
```

**Format:**
```
SURAT PERTANGGUNGJAWABAN
GANTI UANG PERSEDIAAN (SPJ-GU)
Periode: [Tanggal] s/d [Tanggal]

A. REKAPITULASI SPJ-UP YANG DIMINTAKAN PENGGANTIAN:
┌────┬─────────────┬──────────┬──────────┬─────────┐
│ NO │ BULAN/      │ NO SPJ   │ TANGGAL  │ JUMLAH  │
│    │ PERIODE     │          │ SAHKAN   │  (Rp)   │
├────┼─────────────┼──────────┼──────────┼─────────┤
│  1 │ Jan 2026    │ SPJ-01   │ 31/01/26 │ 5.000.  │
│  2 │ Feb 2026    │ SPJ-02   │ 28/02/26 │ 7.000.  │
├────┴─────────────┴──────────┴──────────┼─────────┤
│                              TOTAL GU  │12.000.  │
└────────────────────────────────────────┴─────────┘

B. RINCIAN BELANJA PER KODE REKENING:
┌──────────┬────────────────────────────┬─────────────┐
│ KODE REK │ URAIAN                     │ JUMLAH (Rp) │
├──────────┼────────────────────────────┼─────────────┤
│ 5.1.01   │ Biaya Pegawai              │  3.000.000  │
│ 5.1.02   │ Biaya Persediaan           │  5.000.000  │
│ 5.1.05   │ Biaya Daya & Jasa          │  4.000.000  │
├──────────┴────────────────────────────┼─────────────┤
│                              TOTAL     │ 12.000.000  │
└────────────────────────────────────────┴─────────────┘

Lampiran:
- SPJ-UP yang telah disahkan (Periode yang dimintakan GU)
- Pengesahan SPJ dari PPK/Pemimpin BLUD

Bendahara Pengeluaran,
(...)
```

**Database Schema:**
```prisma
model SPJGU {
  id                    String   @id @default(uuid())
  nomorSPJ              String   @unique
  periodeAwal           DateTime
  periodeAkhir          DateTime
  
  // SPJ UP yang digabung
  spjUPIds              String[] // Array of SPJ UP IDs
  
  // Total
  totalGU               Decimal  @db.Decimal(15,2)
  
  // Rekap per Kode Rekening
  rekapPerRekening      Json     // [{kodeRek, uraian, jumlah}]
  
  // SPP/SPM/SP2D
  nomorSPP              String?  @unique
  tanggalSPP            DateTime?
  nomorSPM              String?  @unique
  tanggalSPM            DateTime?
  nomorSP2D             String?  @unique
  tanggalSP2D           DateTime?
  nilaiSP2D             Decimal? @db.Decimal(15,2)
  
  // Status
  status                String   // DRAFT, SPJ_APPROVED, SPP_CREATED, SPM_ISSUED, SP2D_ISSUED
  
  // Workflow
  bendaharaId           String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([status])
}
```

---

### **1.4. SPJ TU (Tambahan Uang)**

**Syarat Pengajuan TU:**
```yaml
Kondisi yang Membolehkan TU:
  1. UP sudah habis atau hampir habis (misal <20%)
  2. Ada kegiatan mendesak yang tidak bisa ditunda
  3. Kegiatan tidak bisa dibiayai dari UP yang tersisa
  
Contoh Kebutuhan Mendesak (BLUD/RS):
  - Pengadaan obat-obatan mendesak (stok habis)
  - Bahan medis habis pakai (BMHP) emergency
  - Perbaikan alat medis vital yang rusak
  - Kegiatan mendadak (kunjungan, bencana, dll)
```

**Database Schema:**
```prisma
model SPJTU {
  id                    String   @id @default(uuid())
  nomorSPJ              String   @unique
  tanggal               DateTime
  
  // Alasan TU
  alasanTU              String   @db.Text // Mendesak, apa, kenapa
  sisaUPSaatIni         Decimal  @db.Decimal(15,2)
  persentaseSisaUP      Decimal  @db.Decimal(5,2) // %
  
  // Kebutuhan
  kebutuhanMendesak     String   @db.Text
  nilaiTU               Decimal  @db.Decimal(15,2)
  
  // Detail Penggunaan
  detailPengeluaran     Json     // [{tgl, noBukti, uraian, kodeRek, jumlah}]
  totalPengeluaran      Decimal  @db.Decimal(15,2)
  
  // Sisa TU (harus disetorkan)
  sisaTU                Decimal  @db.Decimal(15,2)
  buktiSetor            String?  // File path bukti setor sisa
  tanggalSetor          DateTime?
  
  // SPP/SPM/SP2D
  nomorSPP              String?  @unique
  nomorSPM              String?  @unique
  nomorSP2D             String?  @unique
  
  // Status
  status                String   // DRAFT, APPROVED, USED, SETTLED
  
  // Pertanggungjawaban
  batasPertanggung jawaban DateTime // Max 1 bulan dari SP2D
  isPertanggungJawab    Boolean  @default(false)
  
  bendaharaId           String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([status])
}
```

---

## BAGIAN 2: BUKU KAS UMUM (BKU) - HARIAN

### **2.1. Konsep BKU BLUD**

**BKU BLUD dibedakan menjadi 2:**

#### **A. BKU Penerimaan (Bendahara Penerimaan)**
```yaml
Fungsi: Mencatat aliran kas MASUK
Pencatatan:
  Sisi PENERIMAAN (Debet):
    - Pendapatan tunai dari pasien
    - Pendapatan non-tunai (transfer)
    - Pendapatan APBD (SP2D)
    - Hibah
  
  Sisi PENGELUARAN (Kredit):
    - Penyetoran ke bank
    - Transfer ke Bendahara Pengeluaran
    - Deposito/investasi jangka pendek
    
Saldo Akhir: Idealnya NOL (semua sudah disetor)
Jika Saldo > 0: Ada penerimaan tunai belum disetor
```

#### **B. BKU Pengeluaran (Bendahara Pengeluaran)**
```yaml
Fungsi: Mencatat aliran kas KELUAR  
Pencatatan:
  Sisi PENERIMAAN (Debet):
    - SP2D-UP
    - SP2D-GU
    - SP2D-TU
    - Penarikan bank
    - Pemungutan pajak
  
  Sisi PENGELUARAN (Kredit):
    - Belanja operasional
    - Belanja modal
    - Uang panjar
    - Setoran pajak
    
Saldo: Sisa UP/GU/TU yang belum terpakai
```

### **2.2. Format BKU BLUD**

```
PEMERINTAH [KABUPATEN/KOTA]
BLUD [NAMA]

BUKU KAS UMUM (BKU) PENGELUARAN
BULAN: [NAMA BULAN] TAHUN [XXXX]

Bendahara: [Nama Bendahara]
NIP: [NIP]

┌────┬────────┬──────┬─────────────────┬────────────┬────────────┬─────────┐
│ NO │TANGGAL │ KODE │    URAIAN       │ PENERIMAAN │ PENGELUARAN│  SALDO  │
│    │        │ REK  │                 │    (Rp)    │    (Rp)    │  (Rp)   │
├────┼────────┼──────┼─────────────────┼────────────┼────────────┼─────────┤
│    │        │      │ Saldo Awal      │            │            │ 0,00    │
├────┼────────┼──────┼─────────────────┼────────────┼────────────┼─────────┤
│  1 │02/01/26│      │ SP2D-UP No.001  │50.000.000  │            │50.000.  │
│  2 │03/01/26│1.1.04│ Tarik tunai     │10.000.000  │ 10.000.000 │50.000.  │
│  3 │05/01/26│5.1.02│ Beli obat KWT01 │            │  5.000.000 │45.000.  │
│  4 │05/01/26│1.3.01│ Pajak PPN 10%   │   500.000  │            │45.500.  │
│  5 │08/01/26│5.1.05│ Bayar listrik   │            │  2.000.000 │43.500.  │
│  6 │10/01/26│1.3.01│ Setor pajak     │            │    500.000 │43.000.  │
│... │        │      │                 │            │            │         │
├────┴────────┴──────┴─────────────────┼────────────┼────────────┼─────────┤
│                           JUMLAH      │60.500.000  │ 17.500.000 │43.000.  │
└───────────────────────────────────────┴────────────┴────────────┴─────────┘

Mengetahui,                             [Tempat], 31 Januari 2026
Pemimpin BLUD                           Bendahara Pengeluaran

(Tanda Tangan)                          (Tanda Tangan)
(Nama)                                  (Nama)
NIP.                                    NIP.
```

### **2.3. Database Schema BKU**

```prisma
model BukuKasUmum {
  id                    String   @id @default(uuid())
  jenisBKU              String   // PENERIMAAN, PENGELUARAN
  tanggal               DateTime
  nomorUrut             Int
  
  // Referensi
  kodeRekening          String?
  namaRekening          String?
  uraian                String
  nomorBukti            String?  // No kwitansi, nota, dll
  
  // Jumlah
  penerimaan            Decimal  @db.Decimal(15,2) @default(0)
  pengeluaran           Decimal  @db.Decimal(15,2) @default(0)
  saldo                 Decimal  @db.Decimal(15,2)
  
  // Metadata
  metodePembayaran      String?  // TUNAI, TRANSFER, CEK
  bankId                String?  // Jika transfer
  
  // Link ke dokumen sumber
  jenisTransaksi        String   // SP2D, BELANJA, PAJAK, PANJAR, SETOR, dll
  dokumenSumberId       String?  // ID dari tabel lain
  dokumenSumberType     String?  // SP2D, SPJ, Transaksi, dll
  
  // Bulan & Tahun (untuk grouping)
  bulan                 Int
  tahun                 Int
  
  // Status
  isPosted              Boolean  @default(false)
  postedAt              DateTime?
  
  // Bendahara
  bendaharaId           String
  bendaharaTipe         String   // PENERIMAAN, PENGELUARAN
  
  // Approval (monthly)
  approvedBy            String?  // Pemimpin BLUD
  approvedAt            DateTime?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([jenisBKU, bulan, tahun])
  @@index([tanggal])
  @@index([bendaharaId])
  @@index([isPosted])
}
```

---

## BAGIAN 3: BUKU PEMBANTU

### **3.1. Jenis-jenis Buku Pembantu BLUD**

Berdasarkan **Per-47/PB/2014**, Buku Pembantu BLUD terdiri dari:

```yaml
Buku Pembantu (Supporting Books):
  1. Buku Pembantu Kas Tunai
  2. Buku Pembantu Bank per Rekening
  3. Buku Pembantu Pajak (per jenis pajak)
  4. Buku Pembantu Panjar/Uang Muka
  5. Buku Pembantu Pendapatan (per jenis)
  6. Buku Pembantu Deposito
  7. Buku Pembantu Investasi Jangka Pendek
  8. Buku Pembantu Piutang
  9. Buku Pembantu Persediaan
```

### **3.2. Buku Pembantu Kas Tunai**

**Format:**
```
BUKU PEMBANTU KAS TUNAI
Bulan: [Bulan] Tahun [Tahun]

┌────┬────────┬──────────────┬────────────┬────────────┬─────────┐
│ NO │TANGGAL │   URAIAN     │   MASUK    │   KELUAR   │  SALDO  │
├────┼────────┼──────────────┼────────────┼────────────┼─────────┤
│  1 │02/01/26│Tarik dari ATM│ 10.000.000 │            │10.000.  │
│  2 │03/01/26│Beli ATK      │            │    500.000 │ 9.500.  │
│  3 │05/01/26│Bayar parkir  │            │     50.000 │ 9.450.  │
│  4 │08/01/26│Setor ke bank │            │  9.000.000 │   450.  │
└────┴────────┴──────────────┴────────────┴────────────┴─────────┘
```

### **3.3. Buku Pembantu Bank (per Rekening)**

**Format:**
```
BUKU PEMBANTU BANK
Bank: [Nama Bank - No Rekening]
Bulan: [Bulan] Tahun [Tahun]

┌────┬────────┬──────────────┬────────────┬────────────┬─────────┐
│ NO │TANGGAL │   URAIAN     │   DEBET    │   KREDIT   │  SALDO  │
├────┼────────┼──────────────┼────────────┼────────────┼─────────┤
│    │        │Saldo Awal    │            │            │100.000.K│
│  1 │02/01/26│SP2D-UP       │ 50.000.000 │            │150.000.K│
│  2 │03/01/26│Tarik tunai   │            │ 10.000.000 │140.000.K│
│  3 │05/01/26│Biaya admin   │            │      6.500 │139.993.K│
│  4 │10/01/26│Jasa giro     │     35.000 │            │140.028.K│
└────┴────────┴──────────────┴────────────┴────────────┴─────────┘
```

### **3.4. Buku Pembantu Pajak**

**Format (Per Jenis Pajak):**
```
BUKU PEMBANTU PAJAK - PPh 21
Bulan: [Bulan] Tahun [Tahun]

┌────┬────────┬──────────────┬───────────┬───────────┬─────────┐
│ NO │TANGGAL │   URAIAN     │  PUNGUT   │   SETOR   │  SALDO  │
├────┼────────┼──────────────┼───────────┼───────────┼─────────┤
│  1 │05/01/26│Gaji Jan 2026 │   500.000 │           │ 500.000 │
│  2 │10/01/26│Setor ke bank │           │   500.000 │       0 │
│  3 │20/01/26│Gaji Feb 2026 │   520.000 │           │ 520.000 │
└────┴────────┴──────────────┴───────────┴───────────┴─────────┘
```

### **3.5. Database Schema Buku Pembantu**

```prisma
// Generic model untuk semua buku pembantu
model BukuPembantu {
  id                    String   @id @default(uuid())
  jenisBuku             String   // KAS_TUNAI, BANK, PAJAK, PANJAR, PENDAPATAN, dll
  
  // Identifikasi (opsional, tergantung jenis)
  bankId                String?  // Untuk buku bank
  nomorRekening         String?  // Untuk buku bank
  jenisPajak            String?  // Untuk buku pajak (PPh21, PPN, dll)
  jenisDepositoID       String?  // Untuk buku deposito
  
  // Tanggal & Periode
  tanggal               DateTime
  bulan                 Int
  tahun                 Int
  nomorUrut             Int
  
  // Uraian
  uraian                String
  nomorBukti            String?
  
  // Jumlah (flexible untuk debet/kredit atau masuk/keluar)
  debet                 Decimal? @db.Decimal(15,2)
  kredit                Decimal? @db.Decimal(15,2)
  saldo                 Decimal  @db.Decimal(15,2)
  
  // Link ke BKU
  bkuId                 String?
  
  // Metadata
  bendaharaId           String
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([jenisBuku, bulan, tahun])
  @@index([tanggal])
}
```

---

## BAGIAN 4: REGISTER-REGISTER

### **4.1. Register STS (Surat Tanda Setoran)**

```
REGISTER SURAT TANDA SETORAN (STS)
Bulan: [Bulan] Tahun [Tahun]

┌────┬────────┬──────────┬──────────────┬────────────┬─────────┐
│ NO │TANGGAL │ NO. STS  │ JENIS SETORAN│   JUMLAH   │   KET   │
├────┼────────┼──────────┼──────────────┼────────────┼─────────┤
│  1 │05/01/26│STS-001   │Pendpt Tunai  │  5.000.000 │         │
│  2 │10/01/26│STS-002   │Pajak PPh21   │    500.000 │         │
│  3 │15/01/26│STS-003   │Pendpt Tunai  │  3.000.000 │         │
└────┴────────┴──────────┴──────────────┴────────────┴─────────┘
```

### **4.2. Register SPJ**

```
REGISTER SURAT PERTANGGUNGJAWABAN (SPJ)
Tahun: [Tahun]

┌────┬─────────┬──────────┬──────────┬───────────┬──────────┬─────────┐
│ NO │  BULAN  │ NO. SPJ  │ TANGGAL  │   JENIS   │  JUMLAH  │ TGL     │
│    │         │          │ SPJ      │ (UP/GU/TU)│   (Rp)   │ SAHKAN  │
├────┼─────────┼──────────┼──────────┼───────────┼──────────┼─────────┤
│  1 │ Jan-26  │ SPJ-01   │ 31/01/26 │    UP     │5.000.000 │01/02/26 │
│  2 │ Feb-26  │ SPJ-02   │ 28/02/26 │    UP     │7.000.000 │01/03/26 │
│  3 │ Mar-26  │ GU-01    │ 15/03/26 │    GU     │12.000.000│16/03/26 │
└────┴─────────┴──────────┴──────────┴───────────┴──────────┴─────────┘
```

### **4.3. Database Schema Register**

```prisma
model RegisterSTS {
  id                    String   @id @default(uuid())
  nomorSTS              String   @unique
  tanggal               DateTime
  jenisSetoran          String   // PENDAPATAN, PAJAK, LAINNYA
  jumlah                Decimal  @db.Decimal(15,2)
  keterangan            String?
  
  // Link ke transaksi
  transaksiId           String?
  
  // Bendahara
  bendaharaId           String
  
  bulan                 Int
  tahun                 Int
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([tanggal])
  @@index([bulan, tahun])
}

model RegisterSPJ {
  id                    String   @id @default(uuid())
  nomorSPJ              String   @unique
  bulan                 Int
  tahun                 Int
  tanggalSPJ            DateTime
  jenisSPJ              String   // UP, GU, TU, LS
  jumlah                Decimal  @db.Decimal(15,2)
  tanggalPengesahan     DateTime?
  
  // Link ke SPJ
  spjId                 String   // Link to SPJUP/SPJGU/SPJTU
  spjType               String   // SPJUP, SPJGU, SPJTU
  
  bendaharaId           String
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([jenisSPJ])
  @@index([bulan, tahun])
}
```

---

## BAGIAN 5: LAPORAN PENUTUPAN KAS

### **5.1. Laporan Penutupan Kas (Monthly)**

**Format:**
```
PEMERINTAH [KABUPATEN/KOTA]
BLUD [NAMA]

LAPORAN PENUTUPAN KAS
BULAN: [NAMA BULAN] TAHUN [XXXX]

A. KAS TUNAI:
   1. Saldo menurut BKU                    : Rp    500.000
   2. Kas yang ada (hasil perhitungan)     : Rp    500.000
   3. Selisih (lebih/kurang)               : Rp          0
   
B. KAS BANK:
   ┌────────────────────────────┬──────────────┬──────────────┬──────────┐
   │ NAMA BANK & NO. REKENING   │ SALDO BKU    │ SALDO BANK   │ SELISIH  │
   ├────────────────────────────┼──────────────┼──────────────┼──────────┤
   │ Bank Jatim - 123456789     │ 100.000.000  │ 100.000.000  │     0    │
   │ Bank Mandiri - 987654321   │  50.000.000  │  50.000.000  │     0    │
   ├────────────────────────────┼──────────────┼──────────────┼──────────┤
   │ JUMLAH                     │ 150.000.000  │ 150.000.000  │     0    │
   └────────────────────────────┴──────────────┴──────────────┴──────────┘

C. TOTAL KAS:
   1. Kas Tunai                            : Rp        500.000
   2. Kas Bank                             : Rp    150.000.000
   ─────────────────────────────────────────────────────────────
   TOTAL KAS (A + B)                       : Rp    150.500.000

D. PENJELASAN SELISIH (jika ada):
   [Uraian jika ada selisih]

                                [Tempat], [Tanggal]
Mengetahui,                             Bendahara Pengeluaran
Pemimpin BLUD

(Tanda Tangan)                          (Tanda Tangan)
(Nama)                                  (Nama)
NIP.                                    NIP.
```

**Database Schema:**
```prisma
model LaporanPenutupanKas {
  id                    String   @id @default(uuid())
  bulan                 Int
  tahun                 Int
  
  // Kas Tunai
  saldoBKUTunai         Decimal  @db.Decimal(15,2)
  kasAktualTunai        Decimal  @db.Decimal(15,2)
  selisihTunai          Decimal  @db.Decimal(15,2)
  
  // Kas Bank (JSON array)
  detailBank            Json     // [{bank, noRek, saldoBKU, saldoBank, selisih}]
  totalSaldoBKUBank     Decimal  @db.Decimal(15,2)
  totalSaldoAktualBank  Decimal  @db.Decimal(15,2)
  totalSelisihBank      Decimal  @db.Decimal(15,2)
  
  // Total
  totalKas              Decimal  @db.Decimal(15,2)
  
  // Penjelasan selisih
  penjelasanSelisih     String?  @db.Text
  
  // Status
  status                String   // DRAFT, APPROVED
  
  // Approval
  bendaharaId           String
  approvedBy            String?  // Pemimpin BLUD
  approvedAt            DateTime?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([bulan, tahun])
}
```

---

## Summary: Complete Penatausahaan Module

### **Hierarki Lengkap Penatausahaan BLUD:**

```yaml
LEVEL 1: PENCATATAN HARIAN
  ✅ BKU Penerimaan (harian)
  ✅ BKU Pengeluaran (harian)
  ✅ Buku Pembantu (9 jenis)
  ✅ Register STS
  ✅ Register SPJ

LEVEL 2: PERTANGGUNGJAWABAN ADMINISTRATIF (BULANAN)
  ✅ SPJ UP (setiap pengajuan GU)
  ✅ SPJ GU (penggantian UP)
  ✅ SPJ TU (insidentil)
  ✅ Laporan Penutupan Kas (monthly)

LEVEL 3: PERTANGGUNGJAWABAN FUNGSIONAL (TRIWULANAN)
  ✅ Laporan Pendapatan BLUD
  ✅ Laporan Pengeluaran Biaya BLUD
  ✅ Rekap Per Objek
  ✅ SPTJ
  ✅ SPJ Fungsional → SP2D Pengesahan
```

### **Total Database Tables Added:**

```yaml
SPJ Administratif: +3 tables
  - SPJUP
  - SPJGU
  - SPJTU

Buku Kas & Pembantu: +2 tables
  - BukuKasUmum
  - BukuPembantu

Register: +2 tables
  - RegisterSTS
  - RegisterSPJ

Laporan: +1 table
  - LaporanPenutupanKas

Total NEW: +8 tables
Grand Total (all penatausahaan): +18 tables
```

### **API Endpoints:**

```typescript
// SPJ Administratif (~15 endpoints)
@Controller('spj-administratif')
export class SPJAdministratifController {
  // UP
  @Post('up')
  @Get('up/:id')
  @Get('up/bulan/:bulan/:tahun')
  
  // GU
  @Post('gu')
  @Get('gu/periode')
  
  // TU
  @Post('tu')
  @Get('tu/:id')
}

// BKU (~10 endpoints)
@Controller('bku')
export class BKUController {
  @Post('transaksi')
  @Get('penerimaan/:bulan/:tahun')
  @Get('pengeluaran/:bulan/:tahun')
  @Post('penutupan-kas')
  @Get('export/:bulan/:tahun')
}

// Buku Pembantu (~8 endpoints)
@Controller('buku-pembantu')
export class BukuPembantuController {
  @Get('kas-tunai/:bulan/:tahun')
  @Get('bank/:bankId/:bulan/:tahun')
  @Get('pajak/:jenisPajak/:bulan/:tahun')
}

// Register (~6 endpoints)
@Controller('register')
export class RegisterController {
  @Get('sts/:bulan/:tahun')
  @Get('spj/:tahun')
}

Total NEW Endpoints: ~40 endpoints
```

---

## Conclusion

Inilah yang **BENAR-BENAR TERLEWAT** dari penatausahaan BLUD:

1. ✅ **SPJ UP/GU/TU** - Pertanggungjawaban bendahara harian/bulanan
2. ✅ **BKU Harian** - Pencatatan kas harian (penerimaan & pengeluaran)
3. ✅ **Buku Pembantu** - 9 jenis buku pendukung
4. ✅ **Register-register** - STS, SPJ, dll
5. ✅ **Laporan Penutupan Kas** - Monthly reconciliation

Tanpa ini semua, sistem **TIDAK BISA** digunakan untuk operasional bendahara BLUD sehari-hari!

---

**Document Control:**
- Version: Final Addendum
- Date: 14 Feb 2026
- Author: RSDS_DEV with Web Research
- Status: Complete Penatausahaan Module
- Reference: Permendagri 13/2006, Per-47/PB/2014, Multiple Web Sources
