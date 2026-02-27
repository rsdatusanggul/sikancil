# Si-Kancil - Koreksi: Laporan Penatausahaan & Struktur RBA
**Sistem Keuangan Cepat Lincah - BLUD**

**Tanggal:** 13 Februari 2026  
**Status:** Critical Correction - Penatausahaan & RBA Structure  
**Referensi:** PMK 220/2016, Permendagri 61/2007, Modul BLUD 2017

---

## Executive Summary

Dokumen ini mengoreksi **2 KESALAHAN KRUSIAL** dalam perencanaan Si-Kancil:

1. ❌ **MELEWATKAN Laporan Penatausahaan Keuangan** (SPJ, Rekap Objek, SPJ Fungsional)
2. ❌ **RBA BELUM ADA Struktur Program-Kegiatan-Output**

Kedua hal ini **WAJIB** untuk operasional harian BLUD dan **CRITICAL** untuk audit BPK!

---

## BAGIAN 1: LAPORAN PENATAUSAHAAN KEUANGAN

### **Perbedaan: Laporan Akuntansi vs Laporan Penatausahaan**

```yaml
LAPORAN AKUNTANSI (untuk eksternal/audit):
  - LRA (Laporan Realisasi Anggaran)
  - LPSAL (Laporan Perubahan SAL)
  - Neraca
  - Laporan Operasional (LO)
  - Laporan Arus Kas (LAK)
  - Laporan Perubahan Ekuitas (LPE)
  - CaLK (Catatan atas Laporan Keuangan)
  
  Frekuensi: Triwulanan, Semesteran, Tahunan
  Tujuan: Audit BPK, Konsolidasi LKPD, Transparansi Publik
  Format: Sesuai SAP (Standar Akuntansi Pemerintahan)

LAPORAN PENATAUSAHAAN (untuk operasional/manajemen): ⭐ INI YANG TERLEWAT!
  - Laporan Pendapatan BLUD (Triwulanan)
  - Laporan Pengeluaran Biaya BLUD (Triwulanan)
  - Rekap Pengeluaran per Objek (Bulanan/Triwulanan)
  - SPJ Fungsional (Triwulanan)
  - SPTJ (Surat Pernyataan Tanggung Jawab)
  - Buku Kas Umum (BKU) - Harian
  - Rekap per Sumber Dana (Bulanan)
  - Rekap per Unit Kerja (Bulanan)
  
  Frekuensi: Harian, Bulanan, Triwulanan
  Tujuan: Pengesahan ke PPKD, Monitoring Internal, Pengendalian
  Format: Sesuai Permendagri 61/2007
```

---

## 1.1. Laporan Pendapatan BLUD (Triwulanan)

### **Format Standar (Permendagri 61/2007)**

```
PEMERINTAH KABUPATEN/KOTA [NAMA]
BLUD [NAMA RUMAH SAKIT/PUSKESMAS]

LAPORAN PENDAPATAN BLUD
TRIWULAN [I/II/III/IV] TAHUN [XXXX]

┌────┬──────────────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ NO │ JENIS PENDAPATAN │ ANGGARAN│ REAL S/D│ REAL TW │ REAL S/D│ LEBIH/  │
│    │                  │ DLM DPA │ TW LALU │   INI   │ TW INI  │ KURANG  │
├────┼──────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ 1  │ Jasa Layanan     │         │         │         │         │         │
│ 2  │ Hibah            │         │         │         │         │         │
│ 3  │ Hasil Kerja Sama │         │         │         │         │         │
│ 4  │ Pendapatan Lain  │         │         │         │         │         │
├────┼──────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│    │ JUMLAH           │         │         │         │         │         │
└────┴──────────────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

Mengetahui/Menyetujui:                      [Tempat], [Tanggal]
Pejabat Pengelola Keuangan Daerah          Pemimpin BLUD

(Tanda Tangan)                              (Tanda Tangan)
(Nama Lengkap)                              (Nama Lengkap)
NIP.                                        NIP.
```

### **Database Schema**

```prisma
model LaporanPendapatanBLUD {
  id                    String   @id @default(uuid())
  tahun                 Int
  triwulan              Int      // 1, 2, 3, 4
  
  // Jasa Layanan
  anggaranJasaLayanan   Decimal  @db.Decimal(15,2)
  realisasiJasaLayanan  Decimal  @db.Decimal(15,2)
  
  // Hibah
  anggaranHibah         Decimal  @db.Decimal(15,2)
  realisasiHibah        Decimal  @db.Decimal(15,2)
  
  // Hasil Kerja Sama
  anggaranKerjaSama     Decimal  @db.Decimal(15,2)
  realisasiKerjaSama    Decimal  @db.Decimal(15,2)
  
  // Pendapatan Lain
  anggaranLainnya       Decimal  @db.Decimal(15,2)
  realisasiLainnya      Decimal  @db.Decimal(15,2)
  
  // Total
  totalAnggaran         Decimal  @db.Decimal(15,2)
  totalRealisasi        Decimal  @db.Decimal(15,2)
  selisih               Decimal  @db.Decimal(15,2)
  
  // Status
  status                String   // DRAFT, SUBMITTED, APPROVED
  nomorLaporan          String?  @unique
  
  // Breakdown per bulan (untuk triwulan)
  detailBulanan         Json     // [{bulan, jenis, jumlah}]
  
  // Approval
  submittedBy           String?
  submittedAt           DateTime?
  approvedBy            String?  // PPKD
  approvedAt            DateTime?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([tahun, triwulan])
  @@index([status])
}
```

---

## 1.2. Surat Pernyataan Tanggung Jawab (SPTJ)

### **Format Standar**

```
PEMERINTAH KABUPATEN/KOTA [NAMA]
BLUD [NAMA RUMAH SAKIT/PUSKESMAS]

SURAT PERNYATAAN TANGGUNG JAWAB (SPTJ)

Sehubungan dengan pengeluaran biaya BLUD Triwulan [I/II/III/IV] Tahun [XXXX] 
sebesar Rp [JUMLAH] ([TERBILANG]), yang berasal dari pendapatan:
  - Jasa Layanan
  - Hibah
  - Hasil Kerja Sama
  - Pendapatan Lainnya yang Sah

adalah tanggung jawab kami.

Pengeluaran biaya tersebut di atas telah:
1. Dilaksanakan dan dikelola berdasarkan sistem pengendalian intern yang memadai
2. Dilaksanakan dalam kerangka pelaksanaan DPA BLUD
3. Dibukukan sesuai dengan standar akuntansi yang berlaku pada BLUD
4. Bukti-bukti pengeluaran ada pada kami

Demikian surat pernyataan ini dibuat untuk mendapatkan pengesahan pengeluaran 
biaya BLUD [NAMA].

                                        [Tempat], [Tanggal]
                                        Pemimpin BLUD

                                        (Tanda Tangan)
                                        (Nama Lengkap)
                                        NIP.
```

### **Database Schema**

```prisma
model SPTJ {
  id                    String   @id @default(uuid())
  nomorSPTJ             String   @unique
  tahun                 Int
  triwulan              Int
  
  // Total Pengeluaran
  totalPengeluaran      Decimal  @db.Decimal(15,2)
  totalPengeluaranText  String   // Terbilang
  
  // Sumber Dana
  sumberDana            Json     // {jasaLayanan, hibah, kerjaSama, lainnya}
  
  // Pernyataan
  pernyataanSPI         Boolean  @default(true) // Sistem Pengendalian Intern
  pernyataanDPA         Boolean  @default(true) // Sesuai DPA
  pernyataanAkuntansi   Boolean  @default(true) // Standar Akuntansi
  pernyataanBukti       Boolean  @default(true) // Bukti ada
  
  // Link ke Laporan
  laporanPengeluaranId  String?
  
  // Status
  status                String   // DRAFT, SIGNED, SUBMITTED
  
  // Penandatangan
  pemimpinBLUD          String
  nipPemimpin           String?
  tanggalTandaTangan    DateTime
  
  // Submission
  submittedTo           String?  // PPKD
  submittedAt           DateTime?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([tahun, triwulan])
}
```

---

## 1.3. Laporan Pengeluaran Biaya BLUD (Triwulanan) ⭐ CRITICAL

### **Format Standar (dengan Kode Rekening)**

```
PEMERINTAH KABUPATEN/KOTA [NAMA]
BLUD [NAMA RUMAH SAKIT/PUSKESMAS]

LAPORAN PENGELUARAN BIAYA BLUD
TRIWULAN [I/II/III/IV] TAHUN [XXXX]

┌──────┬────────────────────────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ KODE │ URAIAN                     │ ANGGARAN│ REAL S/D│ REAL TW │ REAL S/D│ LEBIH/  │
│ REK  │                            │ DLM DPA │ TW LALU │   INI   │ TW INI  │ KURANG  │
├──────┼────────────────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ 5.1  │ A. BIAYA OPERASIONAL       │         │         │         │         │         │
├──────┼────────────────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│      │ 1. Biaya Pelayanan         │         │         │         │         │         │
│5.1.01│    a. Biaya Pegawai        │         │         │         │         │         │
│5.1.02│    b. Biaya Bahan          │         │         │         │         │         │
│5.1.03│    c. Biaya Jasa Layanan   │         │         │         │         │         │
│5.1.04│    d. Biaya Pemeliharaan   │         │         │         │         │         │
│5.1.05│    e. Biaya Barang & Jasa  │         │         │         │         │         │
│5.1.06│    f. Biaya Subsidi Pasien │         │         │         │         │         │
│5.1.07│    g. Biaya Penyusutan     │         │         │         │         │         │
│5.1.08│    h. Biaya Lainnya        │         │         │         │         │         │
├──────┼────────────────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│      │ 2. Biaya Umum & Adm        │         │         │         │         │         │
│5.2.01│    a. Biaya Pegawai        │         │         │         │         │         │
│5.2.02│    b. Biaya Adm Perkantoran│         │         │         │         │         │
│5.2.03│    c. Biaya Pemeliharaan   │         │         │         │         │         │
│5.2.04│    d. Biaya Daya & Jasa    │         │         │         │         │         │
│5.2.05│    e. Biaya Penyusutan     │         │         │         │         │         │
│5.2.06│    f. Biaya Promosi        │         │         │         │         │         │
│5.2.09│    g. Biaya Penyisihan     │         │         │         │         │         │
│5.2.10│    h. Biaya Umum Lainnya   │         │         │         │         │         │
├──────┼────────────────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ 5.3  │ B. BIAYA NON-OPERASIONAL   │         │         │         │         │         │
│5.3.01│    a. Biaya Bunga          │         │         │         │         │         │
│5.3.02│    b. Biaya Adm Bank       │         │         │         │         │         │
├──────┼────────────────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│      │ JUMLAH TOTAL               │         │         │         │         │         │
└──────┴────────────────────────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

Mengetahui/Menyetujui:                      [Tempat], [Tanggal]
Pejabat Pengelola Keuangan Daerah          Pemimpin BLUD

(Tanda Tangan)                              (Tanda Tangan)
(Nama Lengkap)                              (Nama Lengkap)
NIP.                                        NIP.
```

### **Database Schema**

```prisma
model LaporanPengeluaranBiayaBLUD {
  id                    String   @id @default(uuid())
  tahun                 Int
  triwulan              Int
  
  // Detail per Kode Rekening (JSON array)
  detailBiaya           Json     // [{kode, uraian, anggaran, realisasi}]
  
  // Summary
  totalBiayaOperasional Decimal  @db.Decimal(15,2)
  totalBiayaNonOps      Decimal  @db.Decimal(15,2)
  totalAnggaran         Decimal  @db.Decimal(15,2)
  totalRealisasi        Decimal  @db.Decimal(15,2)
  selisih               Decimal  @db.Decimal(15,2)
  
  // Link ke detail breakdown
  detailPerObjek        BiayaPerObjek[]
  
  // Status
  status                String   // DRAFT, SUBMITTED, APPROVED
  nomorLaporan          String?  @unique
  
  // Approval
  submittedBy           String?
  submittedAt           DateTime?
  approvedBy            String?
  approvedAt            DateTime?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([tahun, triwulan])
}
```

---

## 1.4. Rekap Pengeluaran Per Objek ⭐ CRITICAL

**Ini adalah DETAIL BREAKDOWN dari Laporan Pengeluaran Biaya!**

### **Struktur Kode Rekening BLUD (Sesuai PMK 220/2016)**

```
5 = BEBAN/BIAYA
│
├─ 5.1 = BIAYA OPERASIONAL
│   │
│   ├─ 5.1.01 = Biaya Pegawai
│   │   ├─ 5.1.01.01 = Gaji PNS
│   │   ├─ 5.1.01.02 = Honorarium
│   │   ├─ 5.1.01.03 = Tunjangan
│   │   └─ 5.1.01.04 = Lembur
│   │
│   ├─ 5.1.02 = Biaya Persediaan
│   │   ├─ 5.1.02.01 = Obat-obatan
│   │   ├─ 5.1.02.02 = Bahan Medis Habis Pakai
│   │   ├─ 5.1.02.03 = Alat Tulis Kantor
│   │   └─ 5.1.02.04 = Bahan Makanan
│   │
│   ├─ 5.1.03 = Biaya Jasa Layanan
│   ├─ 5.1.04 = Biaya Pemeliharaan
│   ├─ 5.1.05 = Biaya Daya dan Jasa
│   │   ├─ 5.1.05.01 = Listrik
│   │   ├─ 5.1.05.02 = Air
│   │   ├─ 5.1.05.03 = Telepon
│   │   └─ 5.1.05.04 = Internet
│   │
│   ├─ 5.1.06 = Biaya Subsidi Pasien
│   │   ├─ 5.1.06.01 = Subsidi Pasien Tidak Mampu
│   │   └─ 5.1.06.04 = Selisih Klaim BPJS
│   │
│   ├─ 5.1.07 = Biaya Penyusutan
│   └─ 5.1.08 = Biaya Lain-lain
│
├─ 5.2 = BIAYA UMUM & ADMINISTRASI
│   ├─ 5.2.01 = Biaya Pegawai (non-pelayanan)
│   ├─ 5.2.02 = Biaya Administrasi Perkantoran
│   ├─ 5.2.03 = Biaya Pemeliharaan
│   ├─ 5.2.04 = Biaya Langganan Daya & Jasa
│   ├─ 5.2.05 = Biaya Penyusutan
│   ├─ 5.2.06 = Biaya Promosi
│   ├─ 5.2.09 = Biaya Penyisihan Kerugian Piutang
│   └─ 5.2.10 = Biaya Umum & Adm Lainnya
│
└─ 5.3 = BIAYA NON-OPERASIONAL
    ├─ 5.3.01 = Biaya Bunga
    └─ 5.3.02 = Biaya Administrasi Bank
```

### **Database Schema**

```prisma
model BiayaPerObjek {
  id                    String   @id @default(uuid())
  tahun                 Int
  bulan                 Int?     // Null = tahunan
  triwulan              Int?     // Untuk grouping
  
  // Kode Rekening (6 level)
  kodeRekening          String   // 5.1.01.01
  namaRekening          String   // Gaji PNS
  levelRekening         Int      // 1-6
  parentKode            String?  // 5.1.01
  
  // Klasifikasi
  kategori              String   // OPERASIONAL, NON_OPERASIONAL
  subKategori           String   // PELAYANAN, UMUM_ADM
  
  // Unit Kerja (opsional)
  unitKerjaId           String?
  
  // Sumber Dana
  sumberDana            String   // APBD, FUNGSIONAL, HIBAH
  
  // Anggaran & Realisasi
  pagu                  Decimal  @db.Decimal(15,2)
  realisasi             Decimal  @db.Decimal(15,2)
  sisa                  Decimal  @db.Decimal(15,2)
  persentase            Decimal  @db.Decimal(5,2) // Realisasi/Pagu * 100
  
  // Link ke transaksi
  transaksiIds          String[] // Array of transaction IDs
  
  // Link ke laporan
  laporanPengeluaranId  String?
  laporanPengeluaran    LaporanPengeluaranBiayaBLUD? @relation(fields: [laporanPengeluaranId], references: [id])
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([kodeRekening])
  @@index([tahun, bulan])
  @@index([tahun, triwulan])
  @@index([sumberDana])
  @@index([unitKerjaId])
}
```

### **API Endpoints**

```typescript
@Controller('laporan-penatausahaan')
export class LaporanPenatausahaanController {
  
  // Rekap Per Objek
  @Get('rekap-objek/:tahun/:triwulan')
  async getRekapPerObjek(
    @Param('tahun') tahun: number,
    @Param('triwulan') triwulan: number,
    @Query('unitKerja') unitKerjaId?: string,
    @Query('sumberDana') sumberDana?: string
  ) {
    // Return hierarchical structure of biaya per objek
  }
  
  @Get('rekap-objek/detail/:kodeRekening')
  async getDetailObjek(
    @Param('kodeRekening') kode: string,
    @Query('tahun') tahun: number,
    @Query('triwulan') triwulan: number
  ) {
    // Return detail transactions for specific kode rekening
  }
  
  // Export Excel
  @Get('rekap-objek/export/:tahun/:triwulan')
  async exportRekapObjek(
    @Param('tahun') tahun: number,
    @Param('triwulan') triwulan: number
  ) {
    // Generate Excel dengan pivot table
  }
}
```

---

## 1.5. SPJ Fungsional ⭐ CRITICAL

**SPJ Fungsional = Pertanggungjawaban Pendapatan & Belanja dari Sumber Fungsional (bukan APBD)**

### **Komponen SPJ Fungsional**

```yaml
1. Laporan Pendapatan BLUD (Fokus: Jasa Layanan, Hibah, Kerja Sama)
2. Laporan Pengeluaran Biaya BLUD (yang didanai dari pendapatan fungsional)
3. SPTJ (Surat Pernyataan Tanggung Jawab)
4. SPM Pengesahan (untuk pengesahan ke PPKD)
5. Bukti Pendukung:
   - Rekening koran bank
   - Bukti transaksi
   - Kontrak/perjanjian (untuk kerja sama)
   - Berita acara (untuk hibah)
```

### **Mekanisme Pengesahan (Triwulanan)**

```
┌─────────────────────────────────────────┐
│ BLUD menyusun:                          │
│ 1. Laporan Pendapatan BLUD              │
│ 2. Laporan Pengeluaran Biaya BLUD       │
│ 3. SPTJ                                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ BLUD mengajukan SPM Pengesahan          │
│ ke PPKD                                  │
│                                          │
│ Lampiran:                                │
│ - Laporan Pendapatan                     │
│ - Laporan Pengeluaran Biaya              │
│ - SPTJ                                   │
│ - Rekening Koran                         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ PPKD melakukan verifikasi:              │
│ - Kesesuaian dengan DPA                 │
│ - Kelengkapan dokumen                   │
│ - Kebenaran perhitungan                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ PPKD menerbitkan SP2D Pengesahan        │
│ (Surat Perintah Pencairan Dana)         │
│                                          │
│ = PENGESAHAN RESMI                       │
└─────────────────────────────────────────┘
```

### **Database Schema**

```prisma
model SPJFungsional {
  id                        String   @id @default(uuid())
  nomorSPJ                  String   @unique
  tahun                     Int
  triwulan                  Int
  
  // Link ke Laporan
  laporanPendapatanId       String
  laporanPendapatan         LaporanPendapatanBLUD @relation(fields: [laporanPendapatanId], references: [id])
  
  laporanPengeluaranId      String
  laporanPengeluaran        LaporanPengeluaranBiayaBLUD @relation(fields: [laporanPengeluaranId], references: [id])
  
  sptjId                    String
  sptj                      SPTJ @relation(fields: [sptjId], references: [id])
  
  // SPM Pengesahan
  nomorSPM                  String?  @unique
  tanggalSPM                DateTime?
  nilaiSPM                  Decimal  @db.Decimal(15,2)
  
  // SP2D Pengesahan (dari PPKD)
  nomorSP2D                 String?  @unique
  tanggalSP2D               DateTime?
  statusPengesahan          String   // PENDING, APPROVED, REJECTED
  
  // Dokumen Pendukung
  rekeningKoran             String[] // Array of file paths
  buktiTransaksi            String[]
  dokumenLainnya            String[]
  
  // Status
  status                    String   // DRAFT, SUBMITTED, VERIFIED, APPROVED
  
  // Workflow
  submittedBy               String?
  submittedAt               DateTime?
  verifiedBy                String?  // PPKD
  verifiedAt                DateTime?
  approvedBy                String?
  approvedAt                DateTime?
  
  // Catatan
  catatanVerifikasi         String?  @db.Text
  alasanReject              String?  @db.Text
  
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
  
  @@unique([tahun, triwulan])
  @@index([status])
}
```

---

## BAGIAN 2: STRUKTUR RBA DENGAN PROGRAM-KEGIATAN-OUTPUT

### **2.1. Hierarki RBA BLUD (Sesuai Permendagri 61/2007)**

```
LEVEL 1: PROGRAM
   └─ LEVEL 2: KEGIATAN
        └─ LEVEL 3: OUTPUT/KOMPONEN
             └─ LEVEL 4: SUB OUTPUT (Optional)
                  └─ LEVEL 5: KODE REKENING
                       └─ LEVEL 6: DETAIL BELANJA
```

### **Contoh Struktur untuk RSUD**

```yaml
PROGRAM 01: Program Pelayanan Kesehatan Masyarakat
  Indikator Program:
    - Cakupan pelayanan kesehatan: 80%
    - Tingkat kepuasan pasien: >85%
  
  KEGIATAN 01.01: Pelayanan Kesehatan Rawat Jalan
    Indikator Kegiatan:
      - Jumlah kunjungan rawat jalan: 50,000 kunjungan
      - Waktu tunggu pelayanan: <30 menit
    
    OUTPUT 01.01.001: Layanan Poli Umum
      Target: 10,000 pasien
      Lokasi: Gedung Poliklinik Lt.1
      
      KODE REKENING:
        5.1.01 - Biaya Pegawai
          5.1.01.01 - Gaji Dokter Umum: Rp 120.000.000
          5.1.01.02 - Honorarium Perawat: Rp 80.000.000
        
        5.1.02 - Biaya Persediaan
          5.1.02.01 - Obat-obatan: Rp 50.000.000
          5.1.02.02 - Bahan Habis Pakai: Rp 30.000.000
        
        5.1.03 - Biaya Jasa Layanan: Rp 20.000.000
        5.1.04 - Biaya Pemeliharaan: Rp 15.000.000
        5.1.05 - Biaya Daya dan Jasa: Rp 25.000.000
        
        Total Output 01.01.001: Rp 340.000.000
    
    OUTPUT 01.01.002: Layanan Poli Anak
      Target: 8,000 pasien
      [struktur serupa]
    
    OUTPUT 01.01.003: Layanan Poli Gigi
      Target: 5,000 pasien
      [struktur serupa]
    
    Total Kegiatan 01.01: Rp XXX
  
  KEGIATAN 01.02: Pelayanan Kesehatan Rawat Inap
    [struktur serupa]
  
  KEGIATAN 01.03: Pelayanan Gawat Darurat
    [struktur serupa]
  
  Total Program 01: Rp XXX

PROGRAM 02: Program Peningkatan Sarana dan Prasarana
  [struktur serupa]
```

### **2.2. Database Schema RBA dengan Program-Kegiatan**

```prisma
// Master Program
model ProgramRBA {
  id                    String   @id @default(uuid())
  kodeProgram           String   @unique // 01, 02, 03
  namaProgram           String
  deskripsi             String?  @db.Text
  
  // Indikator Program
  indikatorProgram      Json     // [{nama, satuan, target}]
  
  // Kegiatan
  kegiatan              KegiatanRBA[]
  
  // Tahun
  tahun                 Int
  
  // Status
  isActive              Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([kodeProgram])
  @@index([tahun])
}

// Master Kegiatan
model KegiatanRBA {
  id                    String   @id @default(uuid())
  kodeKegiatan          String   // 01.01, 01.02
  namaKegiatan          String
  deskripsi             String?  @db.Text
  
  // Link ke Program
  programId             String
  program               ProgramRBA @relation(fields: [programId], references: [id])
  
  // Indikator Kegiatan
  indikatorKegiatan     Json     // [{nama, satuan, target}]
  
  // Output/Komponen
  output                OutputRBA[]
  
  // Tahun
  tahun                 Int
  
  // Status
  isActive              Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([kodeKegiatan, tahun])
  @@index([programId])
}

// Output/Komponen
model OutputRBA {
  id                    String   @id @default(uuid())
  kodeOutput            String   // 01.01.001, 01.01.002
  namaOutput            String
  deskripsi             String?  @db.Text
  
  // Link ke Kegiatan
  kegiatanId            String
  kegiatan              KegiatanRBA @relation(fields: [kegiatanId], references: [id])
  
  // Target Output
  volumeTarget          Int      // Jumlah target (pasien, kunjungan, dll)
  satuan                String   // Orang, Kunjungan, Kegiatan, dll
  
  // Lokasi
  lokasi                String?
  
  // Waktu Pelaksanaan
  bulanMulai            Int?     // 1-12
  bulanSelesai          Int?     // 1-12
  
  // Unit Pelaksana
  unitKerjaId           String?
  
  // Anggaran per Output
  anggaranBelanja       AnggaranBelanjaRBA[]
  totalPagu             Decimal  @db.Decimal(15,2) @default(0)
  
  // Sub Output (Optional)
  subOutput             SubOutputRBA[]
  
  // Tahun
  tahun                 Int
  
  // Status
  isActive              Boolean  @default(true)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([kodeOutput, tahun])
  @@index([kegiatanId])
  @@index([unitKerjaId])
}

// Sub Output (Optional - untuk breakdown lebih detail)
model SubOutputRBA {
  id                    String   @id @default(uuid())
  kodeSubOutput         String   // 01.01.001.01
  namaSubOutput         String
  
  // Link ke Output
  outputId              String
  output                OutputRBA @relation(fields: [outputId], references: [id])
  
  // Target
  volumeTarget          Int
  satuan                String
  
  // Anggaran
  anggaranBelanja       AnggaranBelanjaRBA[]
  totalPagu             Decimal  @db.Decimal(15,2) @default(0)
  
  tahun                 Int
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@unique([kodeSubOutput, tahun])
}

// Anggaran Belanja RBA (Link ke Output/Sub Output)
model AnggaranBelanjaRBA {
  id                    String   @id @default(uuid())
  
  // Link ke Output atau Sub Output
  outputId              String?
  output                OutputRBA? @relation(fields: [outputId], references: [id])
  
  subOutputId           String?
  subOutput             SubOutputRBA? @relation(fields: [subOutputId], references: [id])
  
  // Kode Rekening (existing dari schema sebelumnya)
  kodeRekening          String   // 5.1.01.01
  namaRekening          String
  
  // Klasifikasi
  jenisBelanja          String   // OPERASIONAL, MODAL, TAK_TERDUGA
  kategori              String   // PEGAWAI, BARANG_JASA, MODAL
  
  // Sumber Dana
  sumberDana            String   // APBD, FUNGSIONAL, HIBAH
  
  // Pagu
  pagu                  Decimal  @db.Decimal(15,2)
  
  // Realisasi (diupdate dari transaksi)
  realisasi             Decimal  @db.Decimal(15,2) @default(0)
  komitmen              Decimal  @db.Decimal(15,2) @default(0)
  sisa                  Decimal  @db.Decimal(15,2) @default(0)
  
  // Breakdown bulanan (untuk anggaran kas)
  januari               Decimal  @db.Decimal(15,2) @default(0)
  februari              Decimal  @db.Decimal(15,2) @default(0)
  maret                 Decimal  @db.Decimal(15,2) @default(0)
  april                 Decimal  @db.Decimal(15,2) @default(0)
  mei                   Decimal  @db.Decimal(15,2) @default(0)
  juni                  Decimal  @db.Decimal(15,2) @default(0)
  juli                  Decimal  @db.Decimal(15,2) @default(0)
  agustus               Decimal  @db.Decimal(15,2) @default(0)
  september             Decimal  @db.Decimal(15,2) @default(0)
  oktober               Decimal  @db.Decimal(15,2) @default(0)
  november              Decimal  @db.Decimal(15,2) @default(0)
  desember              Decimal  @db.Decimal(15,2) @default(0)
  
  // Unit Kerja
  unitKerjaId           String?
  
  // Tahun
  tahun                 Int
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([kodeRekening])
  @@index([outputId])
  @@index([subOutputId])
  @@index([sumberDana])
}
```

### **2.3. API Endpoints untuk RBA dengan Struktur**

```typescript
@Controller('rba-struktur')
export class RBAStrukturController {
  
  // ===== PROGRAM =====
  @Get('program/:tahun')
  async getProgram(@Param('tahun') tahun: number) {
    // Return all programs with hierarchy
  }
  
  @Post('program')
  async createProgram(@Body() dto: CreateProgramDto) {}
  
  // ===== KEGIATAN =====
  @Get('kegiatan/:programId')
  async getKegiatanByProgram(@Param('programId') programId: string) {}
  
  @Post('kegiatan')
  async createKegiatan(@Body() dto: CreateKegiatanDto) {}
  
  // ===== OUTPUT =====
  @Get('output/:kegiatanId')
  async getOutputByKegiatan(@Param('kegiatanId') kegiatanId: string) {}
  
  @Post('output')
  async createOutput(@Body() dto: CreateOutputDto) {}
  
  // ===== ANGGARAN PER OUTPUT =====
  @Get('output/:outputId/anggaran')
  async getAnggaranByOutput(@Param('outputId') outputId: string) {}
  
  @Post('output/:outputId/anggaran')
  async createAnggaranBelanja(
    @Param('outputId') outputId: string,
    @Body() dto: CreateAnggaranBelanjaDto
  ) {}
  
  // ===== HIERARCHY VIEW =====
  @Get('hierarchy/:tahun')
  async getRBAHierarchy(@Param('tahun') tahun: number) {
    // Return full hierarchy:
    // Program → Kegiatan → Output → Anggaran
  }
  
  // ===== IMPORT FROM EXCEL =====
  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: Express.Multer.File) {
    // Parse Excel dengan struktur Program-Kegiatan-Output
  }
  
  // ===== EXPORT TO EXCEL =====
  @Get('export/:tahun')
  async exportRBA(@Param('tahun') tahun: number) {
    // Generate Excel RBA lengkap dengan struktur
  }
  
  // ===== MONITORING =====
  @Get('monitoring/:tahun')
  async getMonitoringRBA(@Param('tahun') tahun: number) {
    // Dashboard monitoring per Program-Kegiatan-Output
    // Pagu vs Realisasi
  }
}
```

### **2.4. Frontend Components**

```typescript
// RBA Hierarchy Tree Component
interface RBANode {
  id: string;
  kode: string;
  nama: string;
  type: 'program' | 'kegiatan' | 'output' | 'suboutput';
  pagu?: number;
  realisasi?: number;
  children?: RBANode[];
}

// Tree View Component
function RBATreeView({ tahun }: { tahun: number }) {
  const { data: hierarchy } = useQuery(['rba-hierarchy', tahun]);
  
  return (
    <TreeView
      data={hierarchy}
      renderNode={(node) => (
        <div>
          <span>{node.kode} - {node.nama}</span>
          {node.pagu && (
            <span>Pagu: {formatCurrency(node.pagu)}</span>
          )}
        </div>
      )}
    />
  );
}

// RBA Form with Hierarchy
function RBAForm({ tahun }: { tahun: number }) {
  return (
    <div>
      {/* Level 1: Select Program */}
      <Select name="program" label="Program" />
      
      {/* Level 2: Select/Create Kegiatan */}
      <Select name="kegiatan" label="Kegiatan" />
      
      {/* Level 3: Output Details */}
      <Input name="namaOutput" label="Nama Output" />
      <Input name="volumeTarget" label="Target Volume" type="number" />
      <Select name="satuan" label="Satuan" />
      
      {/* Level 4: Anggaran per Kode Rekening */}
      <RekeningTable />
    </div>
  );
}
```

---

## Summary Penambahan

### **Modul Baru yang Harus Ditambahkan:**

```yaml
1. Modul Laporan Penatausahaan:
   ✅ Laporan Pendapatan BLUD (Triwulanan)
   ✅ Laporan Pengeluaran Biaya BLUD (Triwulanan)
   ✅ Rekap Pengeluaran Per Objek (Bulanan/Triwulanan)
   ✅ SPTJ (Surat Pernyataan Tanggung Jawab)
   ✅ SPJ Fungsional (Complete workflow)
   ✅ Dashboard Penatausahaan (Real-time monitoring)

2. Struktur RBA Enhanced:
   ✅ Master Program
   ✅ Master Kegiatan
   ✅ Master Output/Komponen
   ✅ Master Sub Output (Optional)
   ✅ Link Anggaran ke Output
   ✅ Hierarchy View
   ✅ Import/Export Excel dengan struktur
   ✅ Monitoring per Program-Kegiatan-Output
```

### **Database Tables Baru:**

```yaml
Laporan Penatausahaan: +5 tables
  - LaporanPendapatanBLUD
  - LaporanPengeluaranBiayaBLUD
  - BiayaPerObjek
  - SPTJ
  - SPJFungsional

Struktur RBA: +4 tables
  - ProgramRBA
  - KegiatanRBA
  - OutputRBA
  - SubOutputRBA
  
Enhanced: +1 table
  - AnggaranBelanjaRBA (replace existing AnggaranBelanja)

Total: +10 tables
```

### **API Endpoints Baru:**

```yaml
Laporan Penatausahaan: ~15 endpoints
RBA Struktur: ~12 endpoints
Total: ~27 new endpoints
```

---

## Timeline Impact

```yaml
Original Timeline: 28-32 weeks
Additional Work:
  - Laporan Penatausahaan: +2 weeks
  - Struktur RBA: +1-2 weeks
  
New Timeline: 31-36 weeks (8-9 months)
```

---

## Priority Implementation

```yaml
Phase 1 (MUST HAVE - P0):
  Week 1-2: Struktur RBA (Program-Kegiatan-Output)
  Week 3-4: Laporan Penatausahaan (3 laporan utama + SPTJ)
  Week 5: Rekap Per Objek
  Week 6: SPJ Fungsional Workflow

Phase 2 (SHOULD HAVE - P1):
  Week 7: Dashboard Penatausahaan
  Week 8: Import/Export RBA dengan struktur
  Week 9: Monitoring & Analytics
```

---

## Conclusion

Kedua koreksi ini **SANGAT CRITICAL** karena:

1. ✅ **Laporan Penatausahaan** = Digunakan untuk operasional HARIAN dan pengesahan TRIWULANAN ke PPKD
2. ✅ **Struktur RBA** = WAJIB sesuai format RKA-SKPD yang disyaratkan Permendagri

Tanpa kedua ini, sistem **TIDAK BISA DIGUNAKAN** untuk operasional BLUD yang sesungguhnya!

---

**Document Control:**
- Version: 2.0 (Critical Correction)
- Date: 13 Feb 2026
- Author: RSDS_DEV
- Status: Critical Addition
- Reference: PMK 220/2016, Permendagri 61/2007, Modul BLUD 2017
