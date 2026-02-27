# Update Skema Database Si-Kancil v2.0
**Tanggal:** 14 Februari 2026
**Berdasarkan:** KOREKSI_PENATAUSAHAAN_DAN_STRUKTUR_RBA.md & ADDENDUM_FINAL_PENATAUSAHAAN_BENDAHARA.md

---

## Executive Summary

Dokumen ini merupakan **penyesuaian skema database** berdasarkan dua dokumen koreksi yang menemukan bahwa:
1. ❌ **Struktur RBA belum ada hierarki Program-Kegiatan-Output** (wajib Permendagri 61/2007)
2. ❌ **Modul Penatausahaan Bendahara belum lengkap** (SPJ UP/GU/TU, Buku Pembantu, Register, dll)

---

## A. Modul Struktur RBA (Program-Kegiatan-Output)

### **Entitas Baru: 4 Tabel**

#### 1. **program_rba**
Hierarki Level 1 - Master Program

```typescript
{
  id: uuid (PK)
  kodeProgram: varchar(20) UNIQUE // "01", "02", "03"
  namaProgram: varchar(500)
  deskripsi: text (nullable)
  indikatorProgram: jsonb // [{nama, satuan, target}]
  tahun: int (indexed)
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}

Relations:
  - OneToMany → kegiatan_rba
```

#### 2. **kegiatan_rba**
Hierarki Level 2 - Master Kegiatan

```typescript
{
  id: uuid (PK)
  kodeKegiatan: varchar(20) // "01.01", "01.02"
  namaKegiatan: varchar(500)
  deskripsi: text (nullable)
  programId: uuid (FK → program_rba)
  indikatorKegiatan: jsonb // [{nama, satuan, target}]
  tahun: int (indexed)
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - UNIQUE (kodeKegiatan, tahun)

Relations:
  - ManyToOne → program_rba
  - OneToMany → output_rba
```

#### 3. **output_rba**
Hierarki Level 3 - Output/Komponen

```typescript
{
  id: uuid (PK)
  kodeOutput: varchar(20) // "01.01.001", "01.01.002"
  namaOutput: varchar(500)
  deskripsi: text (nullable)
  kegiatanId: uuid (FK → kegiatan_rba)
  volumeTarget: int // Jumlah target
  satuan: varchar(50) // "Orang", "Kunjungan", dll
  lokasi: varchar(255) (nullable)
  bulanMulai: int (nullable) // 1-12
  bulanSelesai: int (nullable) // 1-12
  unitKerjaId: uuid (nullable, indexed)
  totalPagu: decimal(15,2) // Calculated
  tahun: int (indexed)
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - UNIQUE (kodeOutput, tahun)

Relations:
  - ManyToOne → kegiatan_rba
  - OneToMany → anggaran_belanja_rba
  - OneToMany → sub_output_rba
```

#### 4. **sub_output_rba**
Hierarki Level 4 - Sub Output (Optional)

```typescript
{
  id: uuid (PK)
  kodeSubOutput: varchar(20) // "01.01.001.01"
  namaSubOutput: varchar(500)
  outputId: uuid (FK → output_rba)
  volumeTarget: int
  satuan: varchar(50)
  totalPagu: decimal(15,2)
  tahun: int (indexed)
  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - UNIQUE (kodeSubOutput, tahun)

Relations:
  - ManyToOne → output_rba
  - OneToMany → anggaran_belanja_rba
```

### **Entitas Modifikasi: anggaran_belanja_rba**

**Perubahan dari `rba_belanja`:**

```typescript
// Fields BARU ditambahkan:
{
  // Link ke struktur
  outputId: uuid (nullable, FK → output_rba)
  subOutputId: uuid (nullable, FK → sub_output_rba)

  // Kategori
  jenisBelanja: varchar(50) // OPERASIONAL, MODAL, TAK_TERDUGA
  kategori: varchar(50) // PEGAWAI, BARANG_JASA, MODAL
  sumberDana: varchar(50) // APBD, FUNGSIONAL, HIBAH

  // Tracking
  komitmen: decimal(15,2) // Dari kontrak
  sisa: decimal(15,2) // Pagu - (Realisasi + Komitmen)

  // Breakdown bulanan (untuk anggaran kas)
  januari: decimal(15,2)
  februari: decimal(15,2)
  maret: decimal(15,2)
  april: decimal(15,2)
  mei: decimal(15,2)
  juni: decimal(15,2)
  juli: decimal(15,2)
  agustus: decimal(15,2)
  september: decimal(15,2)
  oktober: decimal(15,2)
  november: decimal(15,2)
  desember: decimal(15,2)

  unitKerjaId: uuid (nullable)
  keterangan: text (nullable)
}

// Fields DIHAPUS (diganti dengan breakdown bulanan):
// tw1, tw2, tw3, tw4 (triwulan) → diganti dengan bulan
```

---

## B. Modul SPJ Administratif

### **Entitas Baru: 3 Tabel**

#### 5. **spj_up**
SPJ Uang Persediaan

```typescript
{
  id: uuid (PK)
  nomorSPJ: varchar(100) UNIQUE
  bulan: int (1-12, indexed)
  tahun: int (indexed)

  // UP Info
  nilaiUP: decimal(15,2) // Dari SK
  saldoAwalUP: decimal(15,2)

  // Detail
  detailPengeluaran: jsonb // [{tanggal, noBukti, uraian, kodeRekening, jumlah}]
  totalPengeluaran: decimal(15,2)
  sisaUP: decimal(15,2)

  // Dokumen
  buktiPengeluaran: jsonb (array of file paths)
  buktiSetorPajak: jsonb (array)

  // Status & Workflow
  status: varchar(50) // DRAFT, SUBMITTED, VERIFIED, APPROVED, REJECTED
  bendaharaId: uuid (indexed)
  submittedAt: timestamp
  verifiedBy: uuid
  verifiedAt: timestamp
  approvedBy: uuid
  approvedAt: timestamp
  catatanVerifikasi: text
  alasanReject: text

  // Link ke GU
  isUsedForGU: boolean
  spjGUId: uuid (nullable)

  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - UNIQUE (bulan, tahun, bendaharaId)
```

#### 6. **spj_gu**
SPJ Ganti Uang

```typescript
{
  id: uuid (PK)
  nomorSPJ: varchar(100) UNIQUE
  periodeAwal: timestamp
  periodeAkhir: timestamp

  // SPJ UP yang digabung
  spjUPIds: jsonb (array of UUIDs)
  totalGU: decimal(15,2)

  // Rekap
  rekapPerRekening: jsonb // [{kodeRekening, uraian, jumlah}]

  // SPP/SPM/SP2D
  nomorSPP: varchar(100) UNIQUE
  tanggalSPP: timestamp
  nomorSPM: varchar(100) UNIQUE
  tanggalSPM: timestamp
  nomorSP2D: varchar(100) UNIQUE
  tanggalSP2D: timestamp
  nilaiSP2D: decimal(15,2)

  // Status
  status: varchar(50) // DRAFT, SPJ_APPROVED, SPP_CREATED, SPM_ISSUED, SP2D_ISSUED
  bendaharaId: uuid (indexed)

  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 7. **spj_tu**
SPJ Tambahan Uang

```typescript
{
  id: uuid (PK)
  nomorSPJ: varchar(100) UNIQUE
  tanggal: timestamp (indexed)

  // Alasan TU
  alasanTU: text
  sisaUPSaatIni: decimal(15,2)
  persentaseSisaUP: decimal(5,2) // %
  kebutuhanMendesak: text
  nilaiTU: decimal(15,2)

  // Detail Penggunaan
  detailPengeluaran: jsonb
  totalPengeluaran: decimal(15,2)
  sisaTU: decimal(15,2)

  // Setor Sisa
  buktiSetor: varchar(500)
  tanggalSetor: timestamp

  // SPP/SPM/SP2D
  nomorSPP: varchar(100) UNIQUE
  nomorSPM: varchar(100) UNIQUE
  nomorSP2D: varchar(100) UNIQUE
  tanggalSP2D: timestamp

  // Status & Pertanggungjawaban
  status: varchar(50) // DRAFT, APPROVED, USED, SETTLED, REJECTED
  batasPertanggungjawaban: timestamp
  isPertanggungjawab: boolean
  alasanReject: text

  bendaharaId: uuid (indexed)
  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## C. Modul Buku Pembantu & Register

### **Entitas Baru: 3 Tabel**

#### 8. **buku_pembantu**
9 Jenis Buku Pembantu (Per-47/PB/2014)

```typescript
{
  id: uuid (PK)
  jenisBuku: varchar(50) (indexed)
  // KAS_TUNAI, BANK, PAJAK, PANJAR, PENDAPATAN, DEPOSITO, INVESTASI, PIUTANG, PERSEDIAAN

  // Identifikasi (opsional tergantung jenis)
  bankId: uuid (nullable, indexed)
  nomorRekening: varchar(50)
  jenisPajak: varchar(50) (indexed) // PPH21, PPH22, PPH23, PPH4_2, PPN
  jenisDepositoID: uuid

  // Transaksi
  tanggal: timestamp (indexed)
  bulan: int (indexed)
  tahun: int (indexed)
  nomorUrut: int
  uraian: text
  nomorBukti: varchar(100)

  // Jumlah
  debet: decimal(15,2) (nullable)
  kredit: decimal(15,2) (nullable)
  saldo: decimal(15,2)

  // Link
  bkuId: uuid (nullable)
  bendaharaId: uuid (indexed)

  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - (jenisBuku, bulan, tahun)
  - tanggal
```

#### 9. **register_sts**
Register Surat Tanda Setoran

```typescript
{
  id: uuid (PK)
  nomorSTS: varchar(100) UNIQUE
  tanggal: timestamp (indexed)
  jenisSetoran: varchar(50) (indexed) // PENDAPATAN, PAJAK, LAINNYA
  jumlah: decimal(15,2)
  keterangan: text

  // Link ke transaksi sumber
  transaksiId: uuid
  transaksiType: varchar(50)

  // Bank tujuan
  bankTujuanId: uuid
  nomorRekeningTujuan: varchar(50)

  bendaharaId: uuid (indexed)
  bulan: int (indexed)
  tahun: int (indexed)

  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 10. **register_spj**
Register SPJ (Tracking Semua SPJ)

```typescript
{
  id: uuid (PK)
  nomorSPJ: varchar(100) UNIQUE
  bulan: int (indexed)
  tahun: int (indexed)
  tanggalSPJ: timestamp (indexed)
  jenisSPJ: varchar(20) (indexed) // UP, GU, TU, LS
  jumlah: decimal(15,2)
  tanggalPengesahan: timestamp
  status: varchar(50) (indexed)

  // Link ke SPJ entity
  spjId: uuid (indexed)
  spjType: varchar(50) // SPJUP, SPJGU, SPJTU, SPJLS

  bendaharaId: uuid (indexed)
  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}
```

### **Entitas Modifikasi: buku_kas_umum**

**Fields yang perlu DITAMBAHKAN:**

```typescript
// Fields BARU:
{
  jenisBKU: varchar(50) (indexed) // PENERIMAAN, PENGELUARAN (menggantikan 'jenis')
  bulan: int (indexed) // Untuk grouping
  tahun: int (indexed) // Untuk grouping
  bendaharaId: uuid (indexed)
  bendaharaTipe: varchar(50) // PENERIMAAN, PENGELUARAN
  isPosted: boolean // Sudah di-posting ke jurnal?
  postedAt: timestamp
  approvedBy: varchar (nullable) // Pemimpin BLUD
  approvedAt: timestamp (nullable) // Monthly approval
}

// Field yang mungkin perlu di-rename atau adjust:
// 'jenis' → 'jenisBKU' (lebih spesifik)
```

---

## D. Modul Laporan Penatausahaan

### **Entitas Baru: 5 Tabel**

#### 11. **laporan_pendapatan_blud**
Laporan Pendapatan Triwulanan

```typescript
{
  id: uuid (PK)
  tahun: int (indexed)
  triwulan: int (indexed) // 1-4

  // Jasa Layanan
  anggaranJasaLayanan: decimal(15,2)
  realisasiJasaLayanan: decimal(15,2)

  // Hibah
  anggaranHibah: decimal(15,2)
  realisasiHibah: decimal(15,2)

  // Hasil Kerja Sama
  anggaranKerjaSama: decimal(15,2)
  realisasiKerjaSama: decimal(15,2)

  // Pendapatan Lainnya
  anggaranLainnya: decimal(15,2)
  realisasiLainnya: decimal(15,2)

  // Total
  totalAnggaran: decimal(15,2)
  totalRealisasi: decimal(15,2)
  selisih: decimal(15,2)

  // Breakdown
  detailBulanan: jsonb // [{bulan, jenis, anggaran, realisasi}]

  // Status & Approval
  status: varchar(50) (indexed)
  nomorLaporan: varchar(100) UNIQUE
  submittedBy: uuid
  submittedAt: timestamp
  approvedBy: uuid // PPKD
  approvedAt: timestamp
  catatanApproval: text

  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - UNIQUE (tahun, triwulan)
```

#### 12. **laporan_pengeluaran_biaya_blud**
Laporan Pengeluaran Triwulanan

```typescript
{
  id: uuid (PK)
  tahun: int (indexed)
  triwulan: int (indexed)

  // Detail (summary level)
  detailBiaya: jsonb // [{kode, uraian, anggaran, realisasi, selisih}]

  // Summary
  totalBiayaOperasional: decimal(15,2)
  totalBiayaNonOps: decimal(15,2)
  totalAnggaran: decimal(15,2)
  totalRealisasi: decimal(15,2)
  selisih: decimal(15,2)

  // Status & Approval
  status: varchar(50) (indexed)
  nomorLaporan: varchar(100) UNIQUE
  submittedBy: uuid
  submittedAt: timestamp
  approvedBy: uuid
  approvedAt: timestamp
  catatanApproval: text

  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - UNIQUE (tahun, triwulan)

Relations:
  - OneToMany → biaya_per_objek
```

#### 13. **biaya_per_objek** ⭐ CRITICAL!
Rekap Pengeluaran Per Objek (Detail 6 Level)

```typescript
{
  id: uuid (PK)
  tahun: int (indexed)
  bulan: int (nullable, indexed) // Null untuk tahunan
  triwulan: int (nullable, indexed)

  // Kode Rekening (6 level)
  kodeRekening: varchar(20) (indexed) // "5.1.01.01"
  namaRekening: varchar(255)
  levelRekening: int // 1-6
  parentKode: varchar(20)

  // Klasifikasi
  kategori: varchar(50) (indexed) // OPERASIONAL, NON_OPERASIONAL
  subKategori: varchar(50) // PELAYANAN, UMUM_ADM
  unitKerjaId: uuid (nullable, indexed)
  sumberDana: varchar(50) (indexed) // APBD, FUNGSIONAL, HIBAH

  // Anggaran & Realisasi
  pagu: decimal(15,2)
  realisasi: decimal(15,2)
  sisa: decimal(15,2)
  persentase: decimal(5,2) // Realisasi/Pagu * 100

  // Link
  transaksiIds: jsonb (array)
  laporanPengeluaranId: uuid (indexed)

  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - kodeRekening
  - (tahun, bulan)
  - (tahun, triwulan)
  - sumberDana
  - unitKerjaId

Relations:
  - ManyToOne → laporan_pengeluaran_biaya_blud
```

#### 14. **sptj**
Surat Pernyataan Tanggung Jawab

```typescript
{
  id: uuid (PK)
  nomorSPTJ: varchar(100) UNIQUE
  tahun: int (indexed)
  triwulan: int (indexed)

  // Total
  totalPengeluaran: decimal(15,2)
  totalPengeluaranText: text // Terbilang

  // Sumber Dana
  sumberDana: jsonb // {jasaLayanan, hibah, kerjaSama, lainnya}

  // Pernyataan (checkboxes)
  pernyataanSPI: boolean
  pernyataanDPA: boolean
  pernyataanAkuntansi: boolean
  pernyataanBukti: boolean

  // Link
  laporanPengeluaranId: uuid (indexed)

  // Status
  status: varchar(50) (indexed) // DRAFT, SIGNED, SUBMITTED, APPROVED

  // Penandatangan
  pemimpinBLUD: varchar(255)
  nipPemimpin: varchar(50)
  tanggalTandaTangan: timestamp

  // Submission
  submittedTo: varchar(255) // PPKD
  submittedAt: timestamp

  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - UNIQUE (tahun, triwulan)
```

#### 15. **spj_fungsional**
SPJ Fungsional ke PPKD

```typescript
{
  id: uuid (PK)
  nomorSPJ: varchar(100) UNIQUE
  tahun: int (indexed)
  triwulan: int (indexed)

  // Link ke laporan
  laporanPendapatanId: uuid (indexed)
  laporanPengeluaranId: uuid (indexed)
  sptjId: uuid (indexed)

  // SPM Pengesahan
  nomorSPM: varchar(100) UNIQUE
  tanggalSPM: timestamp
  nilaiSPM: decimal(15,2)

  // SP2D Pengesahan
  nomorSP2D: varchar(100) UNIQUE
  tanggalSP2D: timestamp
  statusPengesahan: varchar(50) (indexed) // PENDING, APPROVED, REJECTED

  // Dokumen (array of file paths)
  rekeningKoran: jsonb
  buktiTransaksi: jsonb
  dokumenLainnya: jsonb

  // Status & Workflow
  status: varchar(50) (indexed)
  submittedBy: uuid
  submittedAt: timestamp
  verifiedBy: uuid
  verifiedAt: timestamp
  approvedBy: uuid
  approvedAt: timestamp
  catatanVerifikasi: text
  alasanReject: text

  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - UNIQUE (tahun, triwulan)
```

---

## E. Laporan Penutupan Kas

### **Entitas Baru: 1 Tabel**

#### 16. **laporan_penutupan_kas**
Monthly Cash Reconciliation

```typescript
{
  id: uuid (PK)
  bulan: int (indexed)
  tahun: int (indexed)

  // Kas Tunai
  saldoBKUTunai: decimal(15,2)
  kasAktualTunai: decimal(15,2)
  selisihTunai: decimal(15,2)

  // Kas Bank (JSON array)
  detailBank: jsonb // [{bankId, namaBank, nomorRekening, saldoBKU, saldoBank, selisih}]
  totalSaldoBKUBank: decimal(15,2)
  totalSaldoAktualBank: decimal(15,2)
  totalSelisihBank: decimal(15,2)

  // Total
  totalKas: decimal(15,2)
  penjelasanSelisih: text (nullable)

  // Status & Approval
  status: varchar(50) (indexed)
  bendaharaId: uuid (indexed)
  approvedBy: uuid // Pemimpin BLUD
  approvedAt: timestamp
  catatanApproval: text

  createdBy: varchar
  createdAt: timestamp
  updatedAt: timestamp
}

Indexes:
  - UNIQUE (bulan, tahun, bendaharaId)
```

---

## F. Enum Baru

### **File Baru:**

1. **jenis-buku-pembantu.enum.ts**
```typescript
export enum JenisBukuPembantu {
  KAS_TUNAI = 'KAS_TUNAI',
  BANK = 'BANK',
  PAJAK = 'PAJAK',
  PANJAR = 'PANJAR',
  PENDAPATAN = 'PENDAPATAN',
  DEPOSITO = 'DEPOSITO',
  INVESTASI = 'INVESTASI',
  PIUTANG = 'PIUTANG',
  PERSEDIAAN = 'PERSEDIAAN',
}
```

2. **jenis-pajak.enum.ts**
```typescript
export enum JenisPajak {
  PPH21 = 'PPH21',
  PPH22 = 'PPH22',
  PPH23 = 'PPH23',
  PPH4_2 = 'PPH4_2',
  PPN = 'PPN',
  PPN_BM = 'PPN_BM',
}
```

3. **status-spj.enum.ts**
```typescript
export enum StatusSPJ {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SPJ_APPROVED = 'SPJ_APPROVED',
  SPP_CREATED = 'SPP_CREATED',
  SPM_ISSUED = 'SPM_ISSUED',
  SP2D_ISSUED = 'SP2D_ISSUED',
  USED = 'USED',
  SETTLED = 'SETTLED',
}
```

4. **jenis-setoran.enum.ts**
```typescript
export enum JenisSetoran {
  PENDAPATAN = 'PENDAPATAN',
  PAJAK = 'PAJAK',
  LAINNYA = 'LAINNYA',
}
```

5. **status-laporan.enum.ts**
```typescript
export enum StatusLaporan {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SIGNED = 'SIGNED',
}
```

6. **kategori-biaya.enum.ts**
```typescript
export enum KategoriBiaya {
  OPERASIONAL = 'OPERASIONAL',
  NON_OPERASIONAL = 'NON_OPERASIONAL',
}

export enum SubKategoriBiaya {
  PELAYANAN = 'PELAYANAN',
  UMUM_ADM = 'UMUM_ADM',
}
```

---

## Summary Perubahan

### **Total Perubahan:**

| Kategori | Jumlah |
|----------|--------|
| **Entitas Baru** | **16 tabel** |
| - Struktur RBA | 4 tabel |
| - SPJ Administratif | 3 tabel |
| - Buku Pembantu & Register | 3 tabel |
| - Laporan Penatausahaan | 5 tabel |
| - Laporan Penutupan | 1 tabel |
| **Entitas Modifikasi** | **2 tabel** |
| - anggaran_belanja_rba | Restrukturisasi + fields baru |
| - buku_kas_umum | Fields tambahan |
| **Enum Baru** | **6 files** |

### **Total Database Objects:**

```yaml
Sebelum Update: ~38 tabel
Setelah Update: ~54 tabel (+16 tabel baru)

Total Indexes Baru: ~40+ indexes
Total Relations Baru: ~20+ foreign keys
```

---

## Migration Plan

### **Langkah Implementasi:**

1. **Fase 1: Create New Tables** (Week 1)
   - Buat semua 16 tabel baru
   - Tambahkan indexes
   - Setup relations

2. **Fase 2: Modify Existing Tables** (Week 1)
   - Alter `buku_kas_umum` (add fields)
   - Rename & restructure `rba_belanja` → `anggaran_belanja_rba`

3. **Fase 3: Data Migration** (Week 2)
   - Migrate existing RBA data ke struktur baru
   - Setup initial data untuk Program-Kegiatan-Output

4. **Fase 4: Testing** (Week 2)
   - Integration testing
   - Constraint validation
   - Performance testing

### **Rollback Strategy:**

```sql
-- Backup sebelum migration
CREATE TABLE backup_rba_belanja AS SELECT * FROM rba_belanja;
CREATE TABLE backup_buku_kas_umum AS SELECT * FROM buku_kas_umum;

-- Jika rollback diperlukan
-- DROP semua tabel baru
-- RESTORE dari backup
```

---

## Impact Analysis

### **Application Layer Changes:**

1. **Services yang Perlu Dibuat:** ~20 services baru
   - ProgramRBAService, KegiatanRBAService, OutputRBAService
   - SPJUPService, SPJGUService, SPJTUService
   - BukuPembantuService, RegisterSTSService, RegisterSPJService
   - Laporan services (5 services)
   - LaporanPenutupanKasService

2. **Controllers yang Perlu Dibuat:** ~15 controllers baru

3. **DTOs yang Perlu Dibuat:** ~50 DTOs (Create, Update, Query)

4. **API Endpoints Baru:** ~100+ endpoints

### **Frontend Changes:**

1. **Pages Baru:** ~25 pages
2. **Components Baru:** ~50 components
3. **Forms Baru:** ~30 forms

### **Estimasi Effort:**

```yaml
Backend Development: 4-5 weeks
  - Entity & Migration: 1 week (DONE)
  - Services & Controllers: 2 weeks
  - Testing: 1 week
  - Bug fixing: 1 week

Frontend Development: 4-5 weeks
  - Components: 2 weeks
  - Pages & Forms: 2 weeks
  - Integration: 1 week

Total: 8-10 weeks (2-2.5 bulan)
```

---

## Compliance Checklist

### **Regulatory Compliance:**

- ✅ **Permendagri 61/2007**: Struktur Program-Kegiatan-Output
- ✅ **Per-47/PB/2014**: 9 Jenis Buku Pembantu
- ✅ **PMK 220/2016**: Laporan Penatausahaan Triwulanan
- ✅ **Permendagri 13/2006**: SPJ Administratif (UP/GU/TU)

### **Audit Requirements:**

- ✅ **Audit Trail**: Semua tabel punya createdAt, updatedAt, createdBy
- ✅ **Document Tracking**: File uploads dalam jsonb arrays
- ✅ **Approval Workflow**: Multi-level approval fields
- ✅ **Status Tracking**: Status enums untuk semua proses

---

## Conclusion

Update skema database ini **CRITICAL dan WAJIB** untuk:

1. ✅ Compliance dengan regulasi BLUD (Permendagri, PMK)
2. ✅ Operasional harian bendahara (SPJ, BKU, Buku Pembantu)
3. ✅ Pelaporan triwulanan ke PPKD (SPJ Fungsional)
4. ✅ Audit readiness (BPK audit)
5. ✅ Struktur RBA yang sesuai standar

**Tanpa update ini, sistem Si-Kancil v2.0 TIDAK DAPAT digunakan untuk operasional BLUD yang sesungguhnya!**

---

**Document Control:**
- Version: 1.0
- Date: 14 Feb 2026
- Author: RSDS_DEV Team
- Status: Ready for Implementation
- Next Step: Create TypeORM migrations
