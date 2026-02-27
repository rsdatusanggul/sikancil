# Features v3 - Si-Kancil BLUD

**Version:** 3.0
**Date:** 15 Februari 2026
**Status:** Final Feature Specification
**Based On:** Masterplan v2 + Rekomendasi Tahap 3 + Tech Stack v3

---

## Executive Summary

Features v3 menggabungkan **semua fitur compliance BLUD dari Masterplan v2** dengan **enhancement automation & real-time dari Rekomendasi Tahap 3**.

**Total Features:**
- ✅ **44 Modules** (dari 40 modules Masterplan v2)
- ✅ **7 Laporan Keuangan WAJIB** (PMK 220/2016 compliance)
- ✅ **~250 API Endpoints**
- ✅ **~75 Database Tables**
- ✅ **17+ New Features** (beyond Masterplan v2)

**Filosofi:**
> "100% Compliant, 100% Automated, 100% Audit-Ready"

---

## Table of Contents

1. [Feature Categories](#1-feature-categories)
2. [Module-by-Module Details](#2-module-by-module-details)
3. [New Features (v3 Enhancements)](#3-new-features-v3-enhancements)
4. [Compliance Features](#4-compliance-features)
5. [Integration Features](#5-integration-features)
6. [Security Features](#6-security-features)
7. [Reporting Features](#7-reporting-features)
8. [User Experience Features](#8-user-experience-features)
9. [Feature Comparison Matrix](#9-feature-comparison-matrix)
10. [Feature Roadmap](#10-feature-roadmap)

---

## 1. Feature Categories

### 1.1 Core BLUD Modules (From Masterplan v2)

```yaml
Total: 42 Modules (Base)

Category A - Perencanaan & Penganggaran (4 modules):
  1. RBA Management (Program-Kegiatan-SubKegiatan)
  2. Rencana Anggaran Kas (12 bulan projection)
  3. Revisi RBA (dengan ambang batas)
  4. DPA/DPPA BLUD Generator

Category B - Pendapatan (5 modules):
  5. Klasifikasi Pendapatan (4 jenis)
  6. SIMRS Integration (Billing sync)
  7. Penerimaan APBD (SP2D tracking)
  8. Hibah Management
  9. Piutang Tracking

Category C - Belanja (7 modules):
  10. Bukti Bayar (Payment Proof)
  11. SPP Management (UP/GU/TU/LS)
  12. SPM Generation
  13. SP2D Tracking
  14. Realisasi Belanja
  15. Budget Control
  16. Tax Calculation Engine

Category D - Penatausahaan Kas (5 modules):
  17. BKU Penerimaan
  18. BKU Pengeluaran
  19. Buku Pembantu (9 jenis)
  20. STS (Surat Tanda Setoran)
  21. Laporan Penutupan Kas

Category E - SPJ Administratif (4 modules):
  22. SPJ UP (Uang Persediaan)
  23. SPJ GU (Ganti Uang)
  24. SPJ TU (Tambahan Uang)
  25. Register SPJ

Category F - Akuntansi (3 modules):
  26. Jurnal (Auto & Manual)
  27. Buku Besar
  28. Neraca Saldo (Trial Balance)

Category G - Hutang & Kewajiban (2 modules):
  29. Register Hutang (Accounts Payable)
  30. Pembayaran Hutang

Category H - Laporan Keuangan (7 modules):
  31. LRA (Laporan Realisasi Anggaran)
  32. LPSAL (Laporan Perubahan SAL) ⭐ CRITICAL
  33. Neraca
  34. LO (Laporan Operasional)
  35. LAK (Laporan Arus Kas)
  36. LPE (Laporan Perubahan Ekuitas)
  37. CaLK (Catatan atas Laporan Keuangan) ⭐ CRITICAL

Category I - Laporan Penatausahaan (5 modules):
  38. Laporan Pendapatan BLUD
  39. Laporan Pengeluaran Biaya BLUD
  40. Rekap Pengeluaran Per Objek
  41. SPTJ (Surat Pernyataan Tanggung Jawab)
  42. SPJ Fungsional

Category J - Supporting Modules (3 modules):
  43. Aset Management
  44. Gaji & Payroll
  45. Pengadaan & Kontrak

Category K - Admin & Security (3 modules):
  46. User Management
  47. Role & Permission (RBAC)
  48. Audit Trail
```

### 1.2 New Modules (v3 Enhancements)

```yaml
Total: +17 New Features

Real-time & Integration:
  ✨ SIMRS Real-time Webhook (< 1 detik)
  ✨ Bank Integration (Host-to-Host + Virtual Account)
  ✨ SIPD RI Connector (Export ke Kemendagri)
  ✨ DJP Online Export (e-Bupot CSV)

Smart Automation:
  ✨ Budget Control Warning (Pre-alert sebelum overspending)
  ✨ Smart Tax Wizard (Auto-calculate PPh/PPN)
  ✨ Auto-Reconciliation (Bank VA vs Billing)
  ✨ Auto-Posting Jurnal (dari semua transaksi)
  ✨ Hutang Tracking (SPP/SPM tahun lalu yang belum terbayar)
  ✨ Pembayaran Hutang (dengan aging analysis)

Security & Compliance:
  ✨ Fraud Detection System (7 anomaly rules)
  ✨ Immutable Audit Trail (Hash chain)
  ✨ Data Encryption (AES-256 for NIK, sensitive data)
  ✨ Cash Opname Digital (Berita acara kas)

Monitoring & Analytics:
  ✨ Real-time Dashboard (WebSocket updates)
  ✨ Performance Monitoring (Grafana + Prometheus)
  ✨ Advanced Alerts (Email/SMS notifications)
```

---

## 2. Module-by-Module Details

### **MODULE 1: RBA Management** 📋
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: PMK 220/2016, Permendagri 61/2007

Description:
  Penyusunan Rencana Bisnis dan Anggaran dengan struktur
  Program → Kegiatan → Output (sesuai regulasi BLUD)

Features:
  ✅ Struktur hierarki Program-Kegiatan-Output
  ✅ Rencana Strategis Bisnis input
  ✅ Target Kinerja (IKU) per program/kegiatan
  ✅ Anggaran Pendapatan (per sumber dana)
  ✅ Anggaran Belanja (per output)
  ✅ Anggaran Pembiayaan
  ✅ Forward Estimate (proyeksi 3 tahun)
  ✅ Link Output → Kode Rekening

User Roles:
  - PPTK: Create & manage RBA
  - Verifikator: Review & verify
  - Admin Keuangan: Approve

Validations:
  ✅ Total belanja tidak boleh > total pendapatan + pembiayaan
  ✅ Kode kegiatan menggunakan format level 5 sesuai standar APBD
  ✅ Kode output unique per tahun
  ✅ Minimal 1 IKU per program

Format Kode RBA (Hierarki):

  📌 KEGIATAN RBA (Level 5): U.BB.PP.K.SS
    • U   = Urusan Pemerintahan (1 digit)
    • BB  = Bidang Urusan (2 digit)
    • PP  = Program (2 digit)
    • K   = Kegiatan (1 digit)
    • SS  = Sub-Kegiatan (2 digit)

    Contoh: 1.02.02.2.01 = Penyediaan Fasilitas Pelayanan Kesehatan untuk UKM dan UKP Kewenangan Daerah Kabupaten/Kota

  📌 SUB-KEGIATAN (Level 6): U.BB.PP.K.SS.DDD
    • DDD = Detail Sub-Kegiatan (3 digit)

    Contoh: 1.02.02.2.01.008 = Rehabilitasi dan Pemeliharaan Rumah Sakit

  ℹ️ Catatan: Menu Kegiatan RBA menggunakan Level 5, sedangkan Sub-Kegiatan menggunakan Level 6

UI Components:
  - Tree view (hierarchy)
  - Multi-step form (wizard)
  - Budget allocation table
  - Drag & drop untuk reorder

API Endpoints:
  - POST /api/rba/program
  - GET /api/rba/program/:id
  - PATCH /api/rba/program/:id
  - DELETE /api/rba/program/:id
  - GET /api/rba/program/:id/kegiatan
  - POST /api/rba/kegiatan
  - GET /api/rba/kegiatan/:id/output
  - POST /api/rba/output
  - GET /api/rba/monitoring (pagu vs realisasi)
```

---

### **MODULE 2: Anggaran Kas** 💰
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: PMK 220/2016 (Cash flow planning)

Description:
  Proyeksi penerimaan dan pengeluaran kas untuk 12 bulan
  (planning cash flow untuk menghindari defisit kas)

Features:
  ✅ Proyeksi bulanan (Januari - Desember)
  ✅ Penerimaan per sumber (Operasional, APBD, Hibah)
  ✅ Pengeluaran per jenis belanja
  ✅ Saldo kas akhir bulan (otomatis calculated)
  ✅ Chart visualisasi cash flow
  ✅ Alert jika proyeksi kas negatif
  🆕 Cash flow projection (3 bulan ke depan) - NEW

Calculations:
  Saldo Akhir Bulan = Saldo Awal + Penerimaan - Pengeluaran
  Saldo Awal Bulan n+1 = Saldo Akhir Bulan n

Validations:
  ⚠️ Warning: Saldo akhir < 10% total pengeluaran bulanan
  ❌ Error: Saldo akhir negatif (harus revisi)

UI Components:
  - Monthly input table (12 columns)
  - Line chart (trend kas)
  - Alert banner (warning/error)

API Endpoints:
  - GET /api/rba/anggaran-kas/:tahun
  - PATCH /api/rba/anggaran-kas/:tahun
  - GET /api/rba/anggaran-kas/:tahun/projection (NEW)
```

---

### **MODULE 3: Revisi RBA** 🔄
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: PMK 220/2016 (Budget revision mechanism)

Description:
  Perubahan RBA (penambahan/pengurangan pagu) dengan
  mekanisme approval berdasarkan ambang batas

Features:
  ✅ Jenis revisi: Penambahan, Pengurangan, Pergeseran
  ✅ Ambang batas (threshold):
     - < 10% pagu: Auto-approve
     - 10-20%: Approval Pemimpin BLUD
     - > 20%: Approval PPKD
  ✅ Alasan/justifikasi perubahan (mandatory)
  ✅ Upload dokumen pendukung
  ✅ History revisi (versioning)
  ✅ Compare RBA Murni vs Perubahan

Workflow:
  1. PPTK create revisi
  2. System check threshold
  3. Route ke approver sesuai threshold
  4. Approval
  5. Update RBA & DPA
  6. Notification

Validations:
  ✅ Perubahan harus dijelaskan (reason)
  ✅ Total RBA setelah revisi tetap balanced
  ✅ Tidak boleh revisi jika belum disetujui

UI Components:
  - Revisi form (before/after comparison)
  - Approval workflow tracker
  - History timeline

API Endpoints:
  - POST /api/rba/revisi
  - GET /api/rba/revisi/:id
  - PATCH /api/rba/revisi/:id/approve
  - PATCH /api/rba/revisi/:id/reject
  - GET /api/rba/:id/history
```

---

### **MODULE 4: DPA/DPPA BLUD Generator** 📄
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: Permendagri 13/2006, PMK 220/2016

Description:
  Generate Dokumen Pelaksanaan Anggaran (DPA) dari RBA
  yang telah disetujui

Features:
  ✅ Auto-generate dari RBA
  ✅ Rincian per Program-Kegiatan-Output
  ✅ Link ke Kode Rekening (6 level)
  ✅ Format PDF (sesuai standar)
  ✅ Digital signature (optional)
  ✅ DPPA (Dokumen Perubahan) untuk RBA Perubahan

Format Output:
  - PDF dengan layout official
  - Excel export (untuk arsip)
  - Include: Header, Ringkasan, Detail, Tanda Tangan

Sections:
  I. Ringkasan Anggaran
  II. Rincian Anggaran Pendapatan
  III. Rincian Anggaran Belanja
  IV. Rincian Anggaran Pembiayaan
  V. Pengesahan

UI Components:
  - Preview DPA (before print)
  - Print settings (page size, orientation)

API Endpoints:
  - POST /api/dpa/generate/:rbaId
  - GET /api/dpa/:id/pdf
  - GET /api/dpa/:id/excel
```

---

### **MODULE 5: Klasifikasi Pendapatan** 💵
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: PMK 220/2016 (Revenue classification)

Description:
  Pencatatan pendapatan BLUD dengan klasifikasi sesuai regulasi

Jenis Pendapatan (4 kategori):
  1. Pendapatan Operasional:
     - Jasa Layanan (dari SIMRS billing)
     - Usaha Lainnya (koperasi, kantin, parkir)

  2. Pendapatan Non-Operasional:
     - Bunga bank
     - Sewa aset
     - Hasil investasi

  3. Hibah:
     - Hibah Uang
     - Hibah Barang
     - Hibah Jasa

  4. Transfer APBD:
     - Subsidi
     - Kapitasi JKN
     - BOK (Bantuan Operasional Kesehatan)
     - Dana Khusus

Features:
  ✅ CRUD Pendapatan
  ✅ Auto-posting jurnal pendapatan
  ✅ Link ke SIMRS (jasa layanan)
  ✅ Classification by penjamin (BPJS, Umum, Asuransi)
  ✅ Monthly summary report

Validations:
  ✅ Tanggal tidak boleh future date
  ✅ Jumlah harus > 0
  ✅ Kode rekening harus valid

UI Components:
  - Pendapatan entry form
  - Classification dropdown
  - Penjamin selection (if jasa layanan)

API Endpoints:
  - POST /api/pendapatan
  - GET /api/pendapatan
  - GET /api/pendapatan/:id
  - PATCH /api/pendapatan/:id
  - DELETE /api/pendapatan/:id
  - GET /api/pendapatan/summary/:tahun/:bulan
```

---

### **MODULE 6: SIMRS Integration** 🏥
```yaml
Status: 🔄 ENHANCED (v3 upgrade to real-time)
Compliance: Internal integration requirement

Description:
  Sinkronisasi data billing pasien dari SIMRS ke Si-Kancil
  untuk auto-generate pendapatan & jurnal

v2 Feature (Polling):
  ✅ Polling API SIMRS setiap 5 menit
  ✅ Sync billing data
  ✅ Auto-posting jurnal pendapatan

✨ v3 Enhancement (Webhook):
  🆕 Real-time webhook (<1 detik vs 5 menit)
  🆕 Event-driven architecture
  🆕 Retry mechanism (BullMQ)
  🆕 Webhook signature verification (HMAC)

Features:
  ✅ Real-time billing sync (<1 second)
  ✅ Auto-posting jurnal pendapatan
  ✅ Mapping jenis layanan → akun pendapatan
  ✅ Classification by penjamin (BPJS/Umum/Asuransi)
  ✅ Piutang tracking (BPJS waiting payment)
  ✅ Data reconciliation (SIMRS vs Si-Kancil)
  🆕 Dashboard sync status (real-time)

Webhook Events:
  - billing.created (pasien baru keluar)
  - billing.updated (koreksi billing)
  - billing.paid (pembayaran diterima)

Mapping Logic:
  Rawat Jalan → Akun 4.1.1.01 (Pendapatan Rawat Jalan)
  Rawat Inap → Akun 4.1.1.02 (Pendapatan Rawat Inap)
  IGD → Akun 4.1.1.03 (Pendapatan IGD)
  Farmasi → Akun 4.1.1.04 (Pendapatan Farmasi)
  Laboratorium → Akun 4.1.1.05 (Pendapatan Lab)

Error Handling:
  ⚠️ Retry 3x dengan exponential backoff
  ⚠️ Alert jika sync gagal > 5x
  ⚠️ Manual intervention UI (force sync)

UI Components:
  - Sync status dashboard (real-time)
  - Reconciliation report (SIMRS vs Si-Kancil)
  - Error log viewer

API Endpoints:
  - POST /api/webhooks/simrs/billing (webhook receiver)
  - GET /api/simrs/sync-status
  - POST /api/simrs/force-sync
  - GET /api/simrs/reconciliation/:tahun/:bulan
```

---

### **MODULE 7: Penerimaan APBD** 🏛️
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: Permendagri 13/2006

Description:
  Pencatatan penerimaan dana dari APBD (transfer daerah)

Jenis Penerimaan APBD:
  1. Subsidi
  2. Kapitasi JKN
  3. BOK (Bantuan Operasional Kesehatan)
  4. Dana Khusus (program tertentu)

Features:
  ✅ SP2D tracking (nomor & tanggal SP2D)
  ✅ Auto-posting jurnal penerimaan
  ✅ Link ke bank account (multi-bank)
  ✅ Reconciliation dengan bank statement
  🆕 Virtual Account tracking (NEW)

Validations:
  ✅ Nomor SP2D unique
  ✅ Jumlah sesuai dengan dokumen

UI Components:
  - Penerimaan APBD form
  - SP2D tracking table
  - Bank reconciliation interface

API Endpoints:
  - POST /api/penerimaan-apbd
  - GET /api/penerimaan-apbd
  - GET /api/penerimaan-apbd/:id
  - GET /api/penerimaan-apbd/sp2d/:nomorSP2D
```

---

### **MODULE 8: Hibah Management** 🎁
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: PMK 220/2016, Permendagri 13/2006

Description:
  Pengelolaan hibah (uang/barang/jasa) dari pihak ketiga

Jenis Hibah:
  1. Hibah Uang (transfer dana)
  2. Hibah Barang (alat medis, kendaraan, dll)
  3. Hibah Jasa (tenaga ahli, pelatihan)

Features:
  ✅ SK Hibah upload & tracking
  ✅ Uang/Barang/Jasa classification
  ✅ Nilai hibah (market value untuk barang/jasa)
  ✅ Tracking penggunaan hibah (earmarked)
  ✅ Laporan pertanggungjawaban hibah
  ✅ Auto-posting jurnal (debit: Kas/Aset, kredit: Pendapatan Hibah)

Special Rules:
  - Hibah barang → Aset (capitalize)
  - Hibah jasa → Beban (expense)
  - Hibah uang → Track usage (earmarked budget)

Validations:
  ✅ SK Hibah mandatory
  ✅ Nilai hibah harus > 0
  ✅ Tanggal terima tidak boleh > tanggal SK

UI Components:
  - Hibah form (multi-step)
  - File upload (SK Hibah)
  - Usage tracking table

API Endpoints:
  - POST /api/hibah
  - GET /api/hibah
  - GET /api/hibah/:id
  - GET /api/hibah/:id/usage
  - POST /api/hibah/:id/usage
  - GET /api/hibah/:id/report
```

---

### **MODULE 9: Piutang Tracking** 📊
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: SAP (PSAP 01 - Piutang)

Description:
  Tracking piutang pasien & penjamin (BPJS, Asuransi)

Features:
  ✅ Piutang per pasien
  ✅ Piutang per penjamin (BPJS, Asuransi)
  ✅ Aging piutang (30/60/90/120+ hari)
  ✅ Auto-create piutang dari SIMRS billing
  ✅ Pelunasan piutang (payment received)
  ✅ Write-off piutang (bad debt)
  ✅ Reminder/collection letter generator

Aging Buckets:
  - Current (0-30 hari)
  - Overdue 1 (31-60 hari)
  - Overdue 2 (61-90 hari)
  - Overdue 3 (91-120 hari)
  - Bad Debt (> 120 hari)

Features:
  ✅ Dashboard piutang (summary by aging)
  ✅ Collection report
  ✅ Payment tracking

Validations:
  ✅ Pembayaran tidak boleh > saldo piutang
  ✅ Write-off harus ada approval

UI Components:
  - Piutang dashboard (aging analysis)
  - Payment entry form
  - Collection letter generator

API Endpoints:
  - GET /api/piutang
  - GET /api/piutang/:id
  - POST /api/piutang/:id/payment
  - POST /api/piutang/:id/write-off
  - GET /api/piutang/aging-report
```

---

### **MODULE 10: Bukti Bayar** 🧾
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: PMK 220/2016, Permendagri 13/2006

Description:
  Dokumen bukti pembayaran yang dibuat berdasarkan saldo anggaran kas.
  Berfungsi sebagai gatekeeper untuk memastikan setiap pembayaran tidak
  melebihi saldo anggaran kas yang tersedia.

Workflow Position:
  Anggaran Kas → Bukti Bayar → SPP → SPM → SP2D

Jenis Belanja (4 types):
  1. PEGAWAI: Belanja pegawai (gaji, tunjangan, honorarium)
  2. BARANG_JASA: Belanja barang dan jasa
  3. MODAL: Belanja modal (aset tetap)
  4. LAIN: Belanja lain-lain

Features:
  ✅ Validasi saldo anggaran kas otomatis (per jenis belanja)
  ✅ Workflow approval (DRAFT → SUBMITTED → VERIFIED → APPROVED → USED)
  ✅ CRUD operations dengan business rules
  ✅ Cek sisa saldo real-time
  ✅ Link to Anggaran Kas (source validation)
  ✅ Link to SPP (one-to-many relation)
  ✅ File lampiran pendukung (invoice, kuitansi, faktur)
  ✅ Approval tracking (multi-level)

Workflow Status:
  1. DRAFT: Masih draft, bisa diedit/dihapus
  2. SUBMITTED: Sudah diajukan untuk verifikasi
  3. VERIFIED: Sudah diverifikasi oleh verifikator
  4. APPROVED: Sudah disetujui, siap dibuat SPP
  5. REJECTED: Ditolak (bisa direvisi)
  6. USED: Sudah digunakan untuk membuat SPP

Business Rules:
  ✅ Validasi saldo: Total bukti bayar ≤ anggaran kas per jenis belanja
  ✅ Update/Delete hanya untuk status DRAFT & REJECTED
  ✅ Submit: DRAFT → SUBMITTED
  ✅ Verify: SUBMITTED → VERIFIED
  ✅ Approve: VERIFIED → APPROVED
  ✅ Reject: SUBMITTED/VERIFIED → REJECTED (dengan alasan)
  ✅ Used: APPROVED → USED (otomatis saat SPP dibuat)

Validations:
  ✅ Nomor bukti bayar harus unique
  ✅ Nilai pembayaran > 0
  ✅ Jenis belanja harus sesuai dengan anggaran kas
  ✅ Saldo anggaran kas harus mencukupi
  ✅ Tanggal bukti bayar tidak boleh > tanggal saat ini

UI Components:
  - Bukti bayar form (multi-step wizard)
  - Saldo checker (real-time balance display)
  - File upload (drag & drop untuk lampiran)
  - Workflow tracker (status progress)
  - Approval action buttons (submit/verify/approve/reject)

API Endpoints:
  - POST /api/bukti-bayar
  - GET /api/bukti-bayar
  - GET /api/bukti-bayar/:id
  - PUT /api/bukti-bayar/:id
  - DELETE /api/bukti-bayar/:id
  - POST /api/bukti-bayar/:id/submit
  - POST /api/bukti-bayar/:id/verify
  - POST /api/bukti-bayar/:id/approve
  - POST /api/bukti-bayar/:id/reject
  - GET /api/bukti-bayar/:anggaranKasId/sisa-saldo/:jenisBelanja

Database Schema:
  Table: bukti_bayar
  - id (UUID, PK)
  - nomorBuktiBayar (VARCHAR, UNIQUE)
  - tanggalBuktiBayar (TIMESTAMP)
  - tahunAnggaran (INT)
  - bulan (INT, 1-12)
  - anggaranKasId (UUID, FK → anggaran_kas)
  - nilaiPembayaran (DECIMAL 15,2)
  - uraian (TEXT)
  - jenisBelanja (ENUM)
  - status (ENUM)
  - namaPenerima (VARCHAR)
  - npwpPenerima (VARCHAR, nullable)
  - bankPenerima (VARCHAR, nullable)
  - rekeningPenerima (VARCHAR, nullable)
  - fileLampiran (VARCHAR, nullable)
  - submittedBy/At, verifiedBy/At, approvedBy/At, rejectedBy/At
  - alasanReject (TEXT, nullable)
  - createdBy, createdAt, updatedAt

Relations:
  - BuktiBayar N:1 AnggaranKas (many bukti bayar per anggaran kas)
  - BuktiBayar 1:N SPP (one bukti bayar has many SPP)

User Roles:
  - Pembuat: Create bukti bayar, submit untuk approval
  - Verifikator: Verify bukti bayar, reject jika tidak sesuai
  - Approver: Approve bukti bayar yang sudah verified
  - Admin: Full access (semua action)
```

---

### **MODULE 11: SPP Management** 📝
```yaml
Status: ✅ Core Feature (Masterplan v2) ⭐ CRITICAL
Compliance: Permendagri 13/2006, Per-47/PB/2014

Description:
  Surat Permintaan Pembayaran - awal workflow belanja BLUD

Jenis SPP (4 types):
  1. SPP-UP (Uang Persediaan):
     - Uang muka untuk belanja operasional rutin
     - Max 1/12 belanja per tahun

  2. SPP-GU (Ganti Uang):
     - Penggantian UP yang sudah digunakan
     - Gabungan dari beberapa SPJ UP

  3. SPP-TU (Tambahan Uang):
     - Kebutuhan mendesak > saldo UP
     - Harus dipertanggungjawabkan terpisah

  4. SPP-LS (Langsung):
     - Pembayaran langsung ke pihak ketiga
     - Untuk belanja besar (kontrak, gaji, dll)

Features:
  ✅ CRUD SPP (4 jenis)
  ✅ Budget availability check (real-time)
  ✅ Tax auto-calculation (PPh, PPN)
  ✅ Link to Output/DPA
  ✅ Dokumen pendukung upload
  ✅ Workflow approval (multi-level)
  ✅ Generate SPM otomatis (after approval)
  🆕 Smart Tax Wizard (auto-detect tax type) - NEW

Workflow:
  1. Bendahara/PPTK create SPP
  2. System check budget availability
  3. System calculate tax (PPh, PPN)
  4. Submit for approval
  5. Multi-level approval (Verifikator → Admin Keuangan)
  6. Generate SPM (auto)

Budget Check Logic:
  - Cek pagu output (apakah cukup?)
  - Cek realisasi s.d. saat ini
  - Sisa pagu = Pagu - Realisasi - Komitmen
  - SPP hanya boleh diajukan jika Sisa Pagu >= Nilai SPP

Tax Calculation:
  - PPh 21 (Gaji pegawai): Auto-calculate based on tarif
  - PPh 22 (Pembelian): 1.5% dari nilai belanja
  - PPh 23 (Jasa): 2% dari nilai jasa
  - PPh 4(2) (Sewa): 10% dari nilai sewa
  - PPN: 11% (tergantung jenis barang/jasa)

Validations:
  ✅ Nilai SPP > 0
  ✅ Output/DPA harus valid
  ✅ Budget harus cukup
  ✅ Tax calculation harus benar
  ✅ Dokumen pendukung mandatory (for LS)

UI Components:
  - SPP wizard (multi-step form)
  - Budget availability indicator (real-time)
  - Tax calculator (interactive)
  - Document upload (drag & drop)
  - Approval status tracker

API Endpoints:
  - POST /api/spp
  - GET /api/spp
  - GET /api/spp/:id
  - PATCH /api/spp/:id
  - DELETE /api/spp/:id
  - POST /api/spp/:id/submit
  - POST /api/spp/:id/approve
  - POST /api/spp/:id/reject
  - GET /api/spp/:id/budget-check
  - POST /api/spp/:id/calculate-tax
```

---

### **MODULE 12: SPM Generation** 📋
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: Permendagri 13/2006

Description:
  Surat Perintah Membayar - perintah pembayaran dari Pemimpin BLUD

Features:
  ✅ Auto-generate from approved SPP
  ✅ Validation rules (kelengkapan dokumen)
  ✅ Approval workflow (Pemimpin BLUD)
  ✅ Digital signature (optional)
  ✅ PDF generation (format official)
  ✅ Link ke bank transfer (untuk proses SP2D)

Workflow:
  1. SPP approved → Auto-create SPM draft
  2. Verifikator review SPM
  3. Pemimpin BLUD approve & sign
  4. SPM issued → ready for SP2D

Validations:
  ✅ SPP harus approved
  ✅ Dokumen lengkap
  ✅ Nilai SPM = Nilai SPP - Tax

UI Components:
  - SPM preview (before sign)
  - Digital signature pad
  - Print preview

API Endpoints:
  - POST /api/spm/generate/:sppId
  - GET /api/spm/:id
  - POST /api/spm/:id/approve
  - GET /api/spm/:id/pdf
```

---

### **MODULE 13: SP2D Tracking** 💳
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: Permendagri 13/2006

Description:
  Surat Perintah Pencairan Dana - dokumen pencairan dana dari BUD

Features:
  ✅ Generate from approved SPM
  ✅ Bank interface (optional integration)
  ✅ Status tracking (Issued, Cashed, Rejected)
  ✅ Notification to bendahara
  ✅ Auto-posting jurnal belanja
  ✅ Link to BKU Pengeluaran

Status Flow:
  1. ISSUED: SP2D terbit dari BUD
  2. SENT_TO_BANK: Dikirim ke bank
  3. CASHED: Dana sudah cair di rekening
  4. REJECTED: Ditolak (rare)

Validations:
  ✅ Nomor SP2D unique
  ✅ Tanggal SP2D >= tanggal SPM

UI Components:
  - SP2D tracking dashboard
  - Status timeline
  - Bank transfer details

API Endpoints:
  - POST /api/sp2d
  - GET /api/sp2d
  - GET /api/sp2d/:id
  - PATCH /api/sp2d/:id/status
  - GET /api/sp2d/by-spm/:spmId
```

---

### **MODULE 14: Realisasi Belanja** 📈
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: PMK 220/2016

Description:
  Monitoring realisasi belanja vs pagu anggaran

Features:
  ✅ Auto-update from SP2D
  ✅ Per Program-Kegiatan-Output
  ✅ Per Kode Rekening
  ✅ Monthly & cumulative view
  ✅ Budget vs Actual comparison
  ✅ Variance analysis (%)
  ✅ Dashboard visualization (charts)
  🆕 Budget Control Warning (alert before overspending) - NEW

Calculations:
  Pagu: From RBA
  Realisasi: Sum of SP2D (cashed)
  Komitmen: Sum of SPP (approved but not yet SP2D)
  Sisa: Pagu - Realisasi - Komitmen
  Variance %: ((Realisasi - Pagu) / Pagu) * 100

Alert Thresholds:
  🟢 < 70% realisasi: On track
  🟡 70-90%: Warning (monitor closely)
  🔴 90-100%: Critical (hampir habis)
  ⛔ > 100%: Overspending (TIDAK BOLEH!)

UI Components:
  - Realisasi dashboard (multi-chart)
  - Filter: Program/Kegiatan/Output/Bulan
  - Alert banner (warning/critical)
  - Drill-down to transaction detail

API Endpoints:
  - GET /api/realisasi/belanja/:tahun
  - GET /api/realisasi/belanja/:tahun/:bulan
  - GET /api/realisasi/belanja/by-output/:outputId
  - GET /api/realisasi/belanja/by-rekening/:kodeRekening
  - GET /api/realisasi/belanja/variance-analysis
```

---

### **MODULE 15: Budget Control** ⚠️
```yaml
Status: ✅ Core Feature (Masterplan v2)
Enhancement: 🆕 Budget Control Warning (v3)

Description:
  Kontrol anggaran real-time untuk mencegah overspending

v2 Features:
  ✅ Budget availability check (before SPP creation)
  ✅ Alert jika sisa pagu < nilai SPP
  ✅ Prevent SPP jika budget tidak cukup

✨ v3 Enhancement:
  🆕 Pre-alert warning (saat sisa pagu < 20%)
  🆕 Email notification ke PPTK & Admin Keuangan
  🆕 Budget freeze (lock budget untuk SPP in-process)
  🆕 Budget reservation (komitmen untuk kontrak)

Budget States:
  - AVAILABLE: Pagu tersedia
  - RESERVED: Di-booking untuk SPP (pending approval)
  - COMMITTED: Sudah SPP approved (belum SP2D)
  - REALIZED: Sudah SP2D (dana keluar)

Rules:
  1. Cek budget saat SPP creation
  2. Reserve budget saat SPP submitted
  3. Commit budget saat SPP approved
  4. Realize budget saat SP2D cashed
  5. Release reserved jika SPP rejected

Alert Logic:
  IF Sisa Pagu < 20% Pagu THEN
    Send email to PPTK: "Budget hampir habis"
  END IF

  IF Nilai SPP > Sisa Pagu THEN
    Block SPP creation
    Alert: "Budget tidak cukup"
  END IF

UI Components:
  - Budget availability badge (color-coded)
  - Alert modal (before SPP submit)
  - Budget freeze indicator

API Endpoints:
  - GET /api/budget/check/:outputId
  - POST /api/budget/reserve/:sppId
  - POST /api/budget/release/:sppId
  - GET /api/budget/status/:outputId
```

---

### **MODULE 16: Tax Calculation Engine** 💹
```yaml
Status: 🔄 ENHANCED (v3 Smart Tax Wizard)
Compliance: UU PPh, UU PPN

Description:
  Mesin perhitungan pajak otomatis untuk semua transaksi belanja

v2 Features:
  ✅ PPh 21 (Gaji pegawai)
  ✅ PPh 22 (Pembelian barang)
  ✅ PPh 23 (Jasa)
  ✅ PPh 4 ayat 2 (Sewa, final)
  ✅ PPN 11%
  ✅ Auto-calculation on SPP

✨ v3 Enhancement (Smart Tax Wizard):
  🆕 Interactive tax wizard (step-by-step)
  🆕 Auto-detect tax type from transaction
  🆕 Tax rate lookup table (configurable)
  🆕 NPWP validation (from supplier)
  🆕 Tax exemption rules (for certain items)
  🆕 Generate Bukti Potong (PDF)
  🆕 Generate SSP (Surat Setoran Pajak)

Tax Rules (Simplified):
  PPh 21 (Gaji):
    - Tarif progresif (5%, 15%, 25%, 30%)
    - PTKP dikurangkan
    - Perhitungan gross-up

  PPh 22 (Pembelian):
    - 1.5% x Nilai Pembelian (untuk NPWP)
    - 3% x Nilai Pembelian (non-NPWP)

  PPh 23 (Jasa):
    - 2% x Nilai Jasa (untuk jasa tertentu)
    - 15% x Nilai Jasa (untuk dividen, bunga)

  PPh 4(2) (Sewa):
    - 10% x Nilai Sewa (final)

  PPN:
    - 11% x DPP (Dasar Pengenaan Pajak)
    - Exempt: Pendidikan, kesehatan (certain services)

Smart Detection Logic:
  IF Jenis Belanja = "Gaji" THEN
    Tax Type = PPh 21
  ELSE IF Jenis Belanja = "Pembelian Barang" THEN
    Tax Type = PPh 22
  ELSE IF Jenis Belanja = "Jasa" THEN
    Tax Type = PPh 23
  ELSE IF Jenis Belanja = "Sewa" THEN
    Tax Type = PPh 4(2)
  END IF

  IF Barang Kena Pajak = TRUE THEN
    Add PPN 11%
  END IF

UI Components:
  - Tax wizard (guided flow)
  - Tax calculator preview (real-time)
  - Bukti potong generator
  - Tax summary table

API Endpoints:
  - POST /api/tax/calculate
  - GET /api/tax/types
  - GET /api/tax/rates
  - POST /api/tax/bukti-potong/generate/:sppId
  - POST /api/tax/ssp/generate/:bulan/:tahun
  - GET /api/tax/summary/:bulan/:tahun
```

---

### **MODULE 17-18: BKU (Buku Kas Umum)** 📖
```yaml
Status: ✅ Core Feature (Masterplan v2) ⭐ CRITICAL
Compliance: Permendagri 13/2006, Per-47/PB/2014

Description:
  Penatausahaan kas harian bendahara (Penerimaan & Pengeluaran)

BKU Penerimaan (Module 16):
  ✅ Input transaksi harian (kas/bank masuk)
  ✅ Sumber penerimaan (klasifikasi)
  ✅ Nomor bukti (kuitansi, transfer)
  ✅ Saldo running (otomatis calculated)
  ✅ Monthly approval (Pemimpin BLUD)

BKU Pengeluaran (Module 17):
  ✅ Input transaksi harian (kas/bank keluar)
  ✅ Jenis pengeluaran (belanja, setor pajak, dll)
  ✅ SP2D recording (in-out)
  ✅ Saldo running (otomatis calculated)
  ✅ Monthly approval (Pemimpin BLUD)

Features:
  ✅ Entry harian (date, uraian, debet/kredit)
  ✅ Auto-posting dari:
     - Pendapatan SIMRS → BKU Penerimaan
     - SP2D → BKU Pengeluaran
  ✅ Manual entry (untuk transaksi non-SIMRS/SP2D)
  ✅ Approval workflow (monthly)
  ✅ BKU print (format official)
  ✅ Reconciliation dengan bank statement

Calculations:
  Saldo = Saldo Sebelumnya + Debet - Kredit

Approval Flow:
  1. Bendahara input harian
  2. End of month: Bendahara close BKU
  3. Submit for approval
  4. Pemimpin BLUD review & approve
  5. BKU locked (tidak bisa diubah)

Validations:
  ✅ Tanggal tidak boleh future
  ✅ Saldo tidak boleh negatif
  ✅ Debet atau Kredit harus ada (salah satu)
  ✅ Nomor bukti harus unique

UI Components:
  - BKU entry form (inline editing)
  - Running saldo display
  - Approval status indicator
  - Print preview

API Endpoints:
  - POST /api/bku/penerimaan
  - GET /api/bku/penerimaan/:bulan/:tahun
  - POST /api/bku/pengeluaran
  - GET /api/bku/pengeluaran/:bulan/:tahun
  - POST /api/bku/:jenis/close/:bulan/:tahun
  - POST /api/bku/:jenis/approve/:bulan/:tahun
  - GET /api/bku/:jenis/pdf/:bulan/:tahun
```

---

### **MODULE 19: Buku Pembantu** 📚
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: Per-47/PB/2014 (9 jenis buku pembantu)

Description:
  Catatan rinci untuk mendukung BKU (detail per kategori)

9 Jenis Buku Pembantu (MANDATORY):
  1. Kas Tunai
     - Track kas fisik di tangan bendahara
     - Saldo kas tunai harus = kas fisik (opname)

  2. Bank (per rekening)
     - Satu buku per rekening bank
     - Track transaksi masuk/keluar per rekening
     - Reconciliation dengan bank statement

  3. Pajak (per jenis)
     - PPh 21, 22, 23, 4(2), PPN (terpisah)
     - Track pemotongan & penyetoran
     - Track NTPN (Nomor Tanda Penerimaan Negara)

  4. Panjar/Uang Muka
     - Track panjar yang diberikan
     - Track pertanggungjawaban panjar
     - Outstanding panjar monitoring

  5. Pendapatan
     - Detail pendapatan per jenis
     - Link ke BKU Penerimaan

  6. Deposito
     - Track deposito jangka pendek/panjang
     - Track bunga deposito

  7. Investasi Jangka Pendek
     - Reksadana, obligasi, dll
     - Track nilai investasi & return

  8. Piutang
     - Detail piutang per debitur
     - Aging analysis

  9. Persediaan
     - Stock barang (ATK, obat, dll)
     - FIFO/Average method

Features:
  ✅ Auto-posting dari BKU
  ✅ Manual entry (adjustments)
  ✅ Monthly summary
  ✅ Reconciliation tools (Bank, Kas Tunai)

UI Components:
  - Tabs untuk 9 jenis buku
  - Entry form (per jenis)
  - Summary dashboard

API Endpoints:
  - GET /api/buku-pembantu/:jenis/:bulan/:tahun
  - POST /api/buku-pembantu/:jenis
  - GET /api/buku-pembantu/bank/reconciliation/:rekeningId/:bulan/:tahun
```

---

### **MODULE 20: STS (Surat Tanda Setoran)** 🧾
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: Permendagri 13/2006

Description:
  Bukti penyetoran uang ke Kas Daerah atau Bank

Jenis STS:
  1. Penyetoran Pendapatan ke Kas Daerah
     - Pendapatan tertentu harus disetor
     - Sesuai aturan daerah

  2. Penyetoran Pajak
     - PPh, PPN yang sudah dipotong
     - Disetor ke bank persepsi (max H+10)

Features:
  ✅ Generate STS (nomor otomatis)
  ✅ Jenis setoran (pendapatan/pajak)
  ✅ Jumlah setoran
  ✅ Bank tujuan
  ✅ Nomor rekening
  ✅ Register STS (tracking)
  ✅ Print STS (format official)
  ✅ NTPN recording (for tax)

Validations:
  ✅ Jumlah setoran > 0
  ✅ Tanggal setoran tidak boleh future
  ✅ Nomor STS unique

UI Components:
  - STS form
  - Register STS (list)
  - Print preview

API Endpoints:
  - POST /api/sts
  - GET /api/sts
  - GET /api/sts/:id
  - GET /api/sts/:id/pdf
  - PATCH /api/sts/:id/ntpn (record NTPN)
```

---

### **MODULE 21: Laporan Penutupan Kas** 🔒
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: Per-47/PB/2014

Description:
  Laporan rekonsiliasi kas & bank pada akhir bulan

Features:
  ✅ Monthly reconciliation
  ✅ BKU vs Actual (Tunai + Bank)
  ✅ Selisih detection & explanation
  ✅ Approval workflow
  ✅ Print report (PDF)
  🆕 Cash Opname Digital (Berita acara) - NEW

Reconciliation Items:
  A. Saldo menurut BKU:
     - Kas Tunai (dari Buku Pembantu Kas)
     - Bank (dari Buku Pembantu Bank)

  B. Saldo Fisik:
     - Kas Tunai (hasil opname fisik)
     - Bank (dari rekening koran)

  C. Selisih:
     - Selisih Kas Tunai = A.Kas - B.Kas
     - Selisih Bank = A.Bank - B.Bank

  D. Penjelasan Selisih (jika ada):
     - Rincian penyebab selisih
     - Tindakan koreksi

✨ v3 Enhancement (Cash Opname Digital):
  🆕 Digital signature (Tim opname)
  🆕 Photo upload (bukti kas fisik)
  🆕 Barcode scanning (cek fisik uang)
  🆕 Berita acara auto-generate (PDF)

Workflow:
  1. Bendahara prepare reconciliation
  2. Tim opname (2-3 orang) verifikasi fisik
  3. Digital signature (all members)
  4. Upload photo bukti
  5. Pemimpin BLUD approve
  6. Laporan locked

Validations:
  ✅ Selisih harus dijelaskan (if any)
  ✅ Approval mandatory

UI Components:
  - Reconciliation form
  - Photo upload
  - Digital signature pad
  - Selisih explanation input

API Endpoints:
  - POST /api/laporan-penutupan-kas/:bulan/:tahun
  - GET /api/laporan-penutupan-kas/:bulan/:tahun
  - POST /api/laporan-penutupan-kas/:id/approve
  - GET /api/laporan-penutupan-kas/:id/pdf
```

---

### **MODULE 22-24: SPJ Administratif** 📑
```yaml
Status: ✅ Core Feature (Masterplan v2) ⭐ CRITICAL
Compliance: Permendagri 13/2006, Per-47/PB/2014

Description:
  Surat Pertanggungjawaban penggunaan UP/GU/TU oleh bendahara

Module 21: SPJ UP (Uang Persediaan)
  Features:
    ✅ Input pengeluaran harian (dari UP)
    ✅ Link ke BKU Pengeluaran
    ✅ Bukti pendukung upload (kuitansi, nota)
    ✅ Approval workflow
    ✅ Print SPJ form (format official)
    ✅ Link ke GU (untuk penggantian)

  Workflow:
    1. Bendahara terima UP (via SPP-UP → SP2D)
    2. Gunakan UP untuk belanja harian
    3. Catat di SPJ UP
    4. End of period: Submit SPJ UP
    5. Verifikator approve
    6. SPJ UP → Gabung ke SPJ GU

Module 22: SPJ GU (Ganti Uang)
  Features:
    ✅ Gabungan dari beberapa SPJ UP
    ✅ Auto-generate SPP-GU (replacement)
    ✅ Revolving mechanism (UP replenished)
    ✅ Status tracking
    ✅ History SPJ UP yang digabung

  Workflow:
    1. Kumpulkan beberapa SPJ UP (approved)
    2. Gabung ke SPJ GU
    3. Generate SPP-GU otomatis
    4. SPP-GU approved → SP2D
    5. UP replenished (kembali ke saldo awal)

Module 23: SPJ TU (Tambahan Uang)
  Features:
    ✅ Kebutuhan mendesak (> saldo UP)
    ✅ Justifikasi & approval khusus
    ✅ Pertanggungjawaban terpisah
    ✅ Setor sisa TU (jika ada)

  Workflow:
    1. Kebutuhan mendesak muncul
    2. Bendahara ajukan SPP-TU
    3. Approval (dengan justifikasi kuat)
    4. SP2D TU cair
    5. Gunakan TU
    6. SPJ TU (terpisah dari UP/GU)
    7. Setor sisa (jika ada)

Module 24: Register SPJ
  Features:
    ✅ Tracking semua SPJ (UP/GU/TU)
    ✅ Status pengesahan
    ✅ History lengkap
    ✅ Dashboard monitoring

UI Components:
  - SPJ entry forms (UP/GU/TU)
  - Document upload
  - Approval workflow tracker
  - Register table (all SPJ)

API Endpoints:
  - POST /api/spj/up
  - GET /api/spj/up
  - POST /api/spj/gu/generate (from multiple UP)
  - POST /api/spj/tu
  - GET /api/spj/register
```

---

### **MODULE 26: Jurnal** 📘
```yaml
Status: ✅ Core Feature (Masterplan v2) ⭐ CRITICAL
Compliance: SAP (PSAP 01), PMK 220/2016

Description:
  Pencatatan jurnal akuntansi (double-entry bookkeeping)

Jenis Jurnal:
  1. Jurnal Otomatis (Auto-posting):
     - Dari Pendapatan SIMRS
     - Dari SP2D (Belanja)
     - Dari Hibah
     - Dari Penyusutan
     - Dari Tax

  2. Jurnal Manual:
     - Entry manual oleh akuntansi
     - Untuk transaksi non-standard

  3. Jurnal Penyesuaian:
     - End of period adjustments
     - Accrual, prepaid, depreciation

  4. Jurnal Penutup:
     - End of year closing entries
     - Transfer surplus/deficit to equity

Features:
  ✅ Auto-posting dari transaksi (real-time)
  ✅ Manual entry (for adjustments)
  ✅ Validation: Debet = Kredit
  ✅ Approval workflow (for manual/adjustment)
  ✅ Reverse journal (koreksi)
  ✅ Print jurnal (PDF)

Auto-Posting Logic:
  Pendapatan SIMRS:
    Dr. Kas/Bank
    Cr. Pendapatan Jasa Layanan

  SP2D Belanja:
    Dr. Belanja (per jenis)
    Cr. Kas/Bank

  Hibah Uang:
    Dr. Kas
    Cr. Pendapatan Hibah

  Penyusutan:
    Dr. Beban Penyusutan
    Cr. Akumulasi Penyusutan

Validations:
  ✅ Debet total = Kredit total
  ✅ Kode rekening harus valid
  ✅ Tanggal tidak boleh future
  ✅ Manual jurnal harus ada keterangan

UI Components:
  - Jurnal entry form (multiple lines)
  - Auto-balance calculator
  - Approval status

API Endpoints:
  - POST /api/jurnal (manual entry)
  - GET /api/jurnal
  - GET /api/jurnal/:id
  - POST /api/jurnal/:id/approve
  - POST /api/jurnal/:id/reverse
  - GET /api/jurnal/auto-posting/:sourceType/:sourceId
```

---

### **MODULE 27: Buku Besar** 📕
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: SAP (PSAP 01)

Description:
  Ringkasan mutasi per akun (dari jurnal)

Features:
  ✅ Real-time update dari jurnal
  ✅ Per periode (bulan/tahun)
  ✅ Drill-down to jurnal detail
  ✅ Per kode rekening (6 level)
  ✅ Saldo awal, mutasi debet/kredit, saldo akhir

Calculation:
  Saldo Akhir = Saldo Awal + Mutasi Debet - Mutasi Kredit
  (untuk akun Debet normal: Aset, Belanja)

  Saldo Akhir = Saldo Awal - Mutasi Debet + Mutasi Kredit
  (untuk akun Kredit normal: Kewajiban, Ekuitas, Pendapatan)

UI Components:
  - Buku Besar table (per akun)
  - Filter: Periode, Kode Rekening
  - Drill-down to jurnal

API Endpoints:
  - GET /api/buku-besar/:kodeRekening/:tahun/:bulan
  - GET /api/buku-besar/:kodeRekening/range/:from/:to
```

---

### **MODULE 28: Neraca Saldo** ⚖️
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: SAP (PSAP 01)

Description:
  Trial balance - daftar saldo semua akun (check balanced)

Features:
  ✅ Auto-calculate dari buku besar
  ✅ Per periode (bulan/tahun)
  ✅ Balancing check (Total Debet = Total Kredit)
  ✅ Comparison (month-to-month, year-to-year)
  ✅ Export to Excel

Columns:
  - Kode Rekening
  - Nama Rekening
  - Saldo Awal (Debet/Kredit)
  - Mutasi (Debet/Kredit)
  - Saldo Akhir (Debet/Kredit)

Validation:
  ✅ Total Saldo Akhir Debet = Total Saldo Akhir Kredit

  IF Total Debet != Total Kredit THEN
    Alert: "Neraca Saldo tidak balance! Cek jurnal."
  END IF

UI Components:
  - Neraca Saldo table (all accounts)
  - Balance indicator (color-coded)
  - Export button

API Endpoints:
  - GET /api/neraca-saldo/:tahun/:bulan
  - GET /api/neraca-saldo/:tahun (full year)
  - GET /api/neraca-saldo/comparison/:from/:to
```

---

### **MODULE 29: Register Hutang (Accounts Payable)** 💳
```yaml
Status: ✨ NEW Feature (v3.0)
Compliance: SAP (PSAP 01) - Liabilitas Jangka Pendek

Description:
  Mencatat dan tracking SPP/SPM yang belum terbayarkan di tahun
  sebelumnya sebagai hutang yang harus dibayar di tahun berjalan

Business Context:
  SPP/SPM tahun lalu yang sudah disetujui tapi SP2D belum keluar
  sampai tutup buku → menjadi HUTANG (liabilitas) di tahun baru

Features:
  ✅ Import Hutang dari Tahun Sebelumnya:
     - Auto-detect SPP/SPM dengan status "Approved" tapi SP2D belum ada
     - Filter berdasarkan tanggal tutup buku (31 Des tahun lalu)
     - Kategori: Hutang Belanja / Hutang Gaji / Hutang PPh-PPN

  ✅ Register Hutang CRUD:
     - Nomor Register Hutang (auto-generated)
     - Tanggal timbul hutang (dari tanggal SPM)
     - Uraian/keterangan
     - Kreditor (nama pihak yang harus dibayar)
     - Nilai hutang (rupiah)
     - Status: Belum Dibayar / Dibayar Sebagian / Lunas
     - Sisa hutang
     - Referensi ke SPP/SPM asal (link)

  ✅ Aging Analysis (Umur Hutang):
     - Kategori umur: < 30 hari, 30-60 hari, 60-90 hari, > 90 hari
     - Color-coded indicator (hijau/kuning/merah)
     - Alert untuk hutang > 90 hari (overdue)
     - Chart pie untuk distribusi aging

  ✅ Jurnal Otomatis (saat pencatatan hutang di tutup buku):
     Debit: Beban [sesuai kode rekening SPP]
     Credit: Hutang Usaha (Liabilitas)

  ✅ Dashboard Hutang:
     - Total hutang outstanding
     - Total per kreditor
     - Aging summary (chart)
     - Hutang overdue (alert list)

Database Schema:
  Table: payables
    - id (uuid)
    - register_number (varchar) - auto-generated
    - spm_id (uuid) - link to SPM
    - spp_id (uuid) - link to SPP
    - payable_date (date) - tanggal timbul hutang
    - description (text)
    - creditor_name (varchar)
    - creditor_npwp (varchar)
    - amount (decimal)
    - paid_amount (decimal)
    - remaining_amount (decimal)
    - status (enum: unpaid, partial, paid)
    - category (enum: belanja, gaji, pajak)
    - fiscal_year_origin (int) - tahun anggaran asal
    - created_at, updated_at

  Table: payable_history
    - id (uuid)
    - payable_id (uuid)
    - action (varchar) - created, payment, status_change
    - old_value (json)
    - new_value (json)
    - user_id (uuid)
    - created_at

API Endpoints:
  - POST /api/payables/import-from-spm - Import SPM tahun lalu belum bayar
  - GET /api/payables - List hutang (filterable, paginated)
  - GET /api/payables/:id - Detail hutang
  - POST /api/payables - Create manual hutang
  - PATCH /api/payables/:id - Update hutang
  - DELETE /api/payables/:id - Delete hutang (jika salah input)
  - GET /api/payables/aging-report - Laporan umur hutang
  - GET /api/payables/by-creditor - Group by kreditor
  - GET /api/payables/dashboard - Dashboard summary

UI Components:
  - Form import hutang (wizard 3 steps):
    Step 1: Pilih tahun asal
    Step 2: Review SPM yang akan diimport
    Step 3: Confirm & generate jurnal

  - Tabel register hutang:
    Columns: No. Register, Tanggal, Kreditor, Uraian, Nilai,
             Dibayar, Sisa, Status, Umur, Action
    Filters: Status, Kreditor, Periode, Kategori
    Sort: Tanggal, Nilai, Umur

  - Detail hutang modal:
    - Info hutang (readonly data SPP/SPM asal)
    - History pembayaran
    - Jurnal terkait
    - Button: "Bayar Hutang"

  - Aging analysis dashboard:
    - Pie chart umur hutang
    - Table top 10 hutang terbesar
    - Alert list hutang overdue

User Stories:
  1. Sebagai Bendahara, saya ingin import SPM tahun lalu yang belum
     dibayar agar tercatat sebagai hutang di tahun baru

  2. Sebagai Bendahara, saya ingin melihat umur hutang agar tahu
     prioritas pembayaran

  3. Sebagai Auditor, saya ingin melihat history hutang agar dapat
     memverifikasi kewajiban BLUD

Acceptance Criteria:
  ✅ Import SPM tahun lalu berhasil dan tercatat sebagai hutang
  ✅ Jurnal hutang otomatis ter-posting
  ✅ Aging analysis tampil dengan benar
  ✅ Filter dan search berfungsi
  ✅ Export to Excel/PDF berhasil
```

---

### **MODULE 30: Pembayaran Hutang (Payable Payment)** 💰
```yaml
Status: ✨ NEW Feature (v3.0)
Compliance: SAP (PSAP 01)

Description:
  Mencatat pembayaran hutang yang berasal dari SPP/SPM tahun
  sebelumnya dengan SP2D tahun berjalan

Business Flow:
  1. Pilih hutang yang akan dibayar
  2. Input pembayaran (bisa partial/full)
  3. Link ke SP2D tahun berjalan
  4. Sistem update sisa hutang
  5. Jurnal pembayaran hutang otomatis

Features:
  ✅ Form Pembayaran Hutang:
     - Pilih hutang dari dropdown (hanya status: unpaid/partial)
     - Jumlah pembayaran (rupiah) - validasi max = sisa hutang
     - Tanggal pembayaran
     - Nomor SP2D tahun berjalan (link)
     - Rekening bank pembayaran
     - Upload bukti SP2D (PDF)
     - Keterangan (optional)

  ✅ Pelunasan Otomatis:
     - Kurangi sisa hutang otomatis
     - Update status:
       * Jika paid_amount = amount → status = "paid" (lunas)
       * Jika paid_amount < amount → status = "partial"
     - Remaining_amount = amount - paid_amount

  ✅ Jurnal Otomatis (saat pembayaran):
     Debit: Hutang Usaha (kurangi liabilitas)
     Credit: Kas/Bank (kurangi aset)

  ✅ Link to SP2D:
     - SP2D tahun berjalan di-flag: is_payable_payment = true
     - Cross-reference bidirectional (hutang ↔ SP2D)

  ✅ Rekonsiliasi:
     - Validasi jumlah pembayaran vs sisa hutang
     - Warning jika ada selisih
     - Cek SP2D sudah exist dan belum dipakai untuk hutang lain

  ✅ Laporan Pembayaran Hutang:
     - Per periode (bulan/tahun)
     - Per kreditor
     - Per jenis belanja
     - Export to Excel/PDF

Database Schema:
  Table: payable_payments
    - id (uuid)
    - payable_id (uuid) - FK to payables
    - payment_date (date)
    - amount (decimal)
    - sp2d_id (uuid) - link to SP2D tahun berjalan
    - sp2d_number (varchar)
    - bank_account_id (uuid)
    - proof_file_url (varchar) - upload SP2D PDF
    - notes (text)
    - jurnal_id (uuid) - link to journal entry
    - created_by (uuid)
    - created_at, updated_at

  Update Table: sp2d
    - Add column: is_payable_payment (boolean)
    - Add column: payable_payment_id (uuid) - FK to payable_payments

API Endpoints:
  - POST /api/payables/:id/payments - Catat pembayaran
  - GET /api/payables/:id/payments - History pembayaran per hutang
  - GET /api/payable-payments - List all payments
  - GET /api/payable-payments/:id - Detail payment
  - PATCH /api/payable-payments/:id - Update payment (jika salah)
  - DELETE /api/payable-payments/:id - Delete payment (rollback)
  - GET /api/payable-payments/report - Laporan pembayaran
  - GET /api/payables/:id/mark-as-paid - Manual mark lunas

UI Components:
  - Form pembayaran hutang:
    Fields: Hutang (dropdown), Sisa hutang (readonly),
            Jumlah bayar (input + validation), Tanggal, SP2D, Bank,
            Upload bukti, Notes
    Preview: Jurnal yang akan di-posting
    Button: Submit / Cancel

  - History pembayaran (tab di detail hutang):
    Table: Tanggal, Jumlah, SP2D, Bank, Bukti, User

  - Laporan pembayaran hutang:
    Filters: Periode, Kreditor, Kategori
    Table: Summary pembayaran per bulan
    Chart: Trend pembayaran hutang
    Export: Excel/PDF

User Stories:
  1. Sebagai Bendahara, saya ingin bayar hutang dengan SP2D tahun
     berjalan agar kewajiban berkurang

  2. Sebagai Bendahara, saya ingin bayar hutang secara bertahap
     (partial payment) jika anggaran terbatas

  3. Sebagai Auditor, saya ingin melihat history pembayaran hutang
     agar dapat trace pelunasan

Acceptance Criteria:
  ✅ Form pembayaran validasi jumlah max = sisa hutang
  ✅ Sisa hutang update otomatis setelah pembayaran
  ✅ Status hutang berubah menjadi "partial" atau "paid"
  ✅ Jurnal pembayaran otomatis ter-posting
  ✅ Link ke SP2D berhasil
  ✅ Upload bukti SP2D berhasil
  ✅ History pembayaran tampil di detail hutang
```

---

### **MODULE 31-37: Laporan Keuangan (7 Komponen WAJIB)** 📊
```yaml
Status: ✅ Core Feature (Masterplan v2) ⭐⭐⭐ SUPER CRITICAL
Compliance: PMK 220/2016, PSAP 13

Description:
  7 Laporan Keuangan WAJIB BLUD (regulatory requirement)

Module 28: LRA (Laporan Realisasi Anggaran)
  Content:
    I. Pendapatan-LRA
       - Pendapatan Operasional
       - Pendapatan Non-Operasional
       - Hibah
       - Transfer APBD

    II. Belanja
       - Belanja Operasi
       - Belanja Modal
       - Belanja Tak Terduga

    III. Transfer (jika ada)

    IV. Pembiayaan
       - Penerimaan Pembiayaan
       - Pengeluaran Pembiayaan

    V. SiLPA/SiKPA
       - Sisa Lebih/Kurang Pembiayaan Anggaran

  Features:
    ✅ Auto-generate from realisasi
    ✅ Budget vs Actual comparison
    ✅ Variance % calculation
    ✅ Print format SAP (official)
    ✅ Export Excel/PDF

  Validation:
    ✅ SiLPA = Pendapatan - Belanja + Pembiayaan Netto

Module 29: LPSAL (Laporan Perubahan SAL) ⭐ CRITICAL
  Content:
    - SAL Awal
    - Penggunaan SAL (untuk belanja)
    - SiLPA/SiKPA dari LRA (current year)
    - Koreksi kesalahan tahun lalu
    - SAL Akhir

  Features:
    ✅ Auto-calculate from LRA
    ✅ Link to Neraca (SAL = part of Ekuitas)
    ✅ Validation formula

  Formula:
    SAL Akhir = SAL Awal - Penggunaan SAL + SiLPA + Koreksi

  Why Critical:
    - SAL = uang cash yang bisa digunakan tahun depan
    - Salah hitung SAL → Salah perencanaan RBA tahun depan
    - BPK sering audit LPSAL (reconcile ke Neraca)

Module 30: Neraca
  Content:
    ASET:
      - Aset Lancar (Kas, Piutang, Persediaan, dll)
      - Aset Tidak Lancar (Aset Tetap, Investasi Jangka Panjang)

    KEWAJIBAN:
      - Kewajiban Jangka Pendek (Utang < 1 tahun)
      - Kewajiban Jangka Panjang (Utang > 1 tahun)

    EKUITAS:
      - Ekuitas Awal
      - Surplus/Defisit-LO (dari LO)
      - SAL (dari LPSAL) ⭐
      - Ekuitas Akhir

  Features:
    ✅ Auto-generate from Buku Besar
    ✅ Format SAP (bukan SAK!)
    ✅ Validation: Aset = Kewajiban + Ekuitas

  Validation:
    ✅ Total Aset = Total Kewajiban + Total Ekuitas

    IF Aset != Kewajiban + Ekuitas THEN
      Alert: "Neraca tidak balance!"
    END IF

Module 31: LO (Laporan Operasional)
  Content:
    - Pendapatan Operasional (basis akrual)
    - Beban Operasional (basis akrual)
    - Surplus/Defisit Operasional
    - Pendapatan Non-Operasional
    - Beban Non-Operasional
    - Pos Luar Biasa
    - Surplus/Defisit Sebelum Pos Luar Biasa
    - Surplus/Defisit-LO

  Features:
    ✅ Basis akrual (beda dengan LRA yang basis kas)
    ✅ Auto-generate from jurnal
    ✅ Link to LPE (Surplus/Defisit → Ekuitas)

  Key Difference LO vs LRA:
    LRA = Basis Kas (cash in/out)
    LO = Basis Akrual (revenue recognized, expense incurred)

Module 32: LAK (Laporan Arus Kas)
  Content:
    I. Arus Kas dari Aktivitas Operasi
       - Penerimaan kas (pendapatan, dll)
       - Pengeluaran kas (belanja, dll)

    II. Arus Kas dari Aktivitas Investasi
       - Penerimaan (penjualan aset, dll)
       - Pengeluaran (pembelian aset, dll)

    III. Arus Kas dari Aktivitas Pendanaan
       - Penerimaan (pinjaman, dll)
       - Pengeluaran (pelunasan pinjaman, dll)

    IV. Arus Kas dari Aktivitas Transitoris
       - Penerimaan (PFK, uang titipan, dll)
       - Pengeluaran (pengeluaran PFK, dll)

  Features:
    ✅ Direct method (preferred by SAP)
    ✅ Auto-generate from BKU
    ✅ Validation: Kenaikan Kas = selisih Kas Awal vs Akhir

Module 33: LPE (Laporan Perubahan Ekuitas)
  Content:
    - Ekuitas Awal
    - Surplus/Defisit-LO (dari LO)
    - Koreksi
    - Revaluasi Aset
    - Transfer In/Out
    - Ekuitas Akhir

  Features:
    ✅ Link from LO (Surplus/Defisit)
    ✅ Link to Neraca (Ekuitas Akhir)

  Formula:
    Ekuitas Akhir = Ekuitas Awal + Surplus/Defisit-LO + Koreksi + Revaluasi + Transfer

Module 34: CaLK (Catatan atas Laporan Keuangan) ⭐ CRITICAL
  Content (PSAP 13 - 7 Bab):
    Bab I. Pendahuluan
      - Maksud & Tujuan Penyusunan Laporan Keuangan
      - Landasan Hukum
      - Sistematika Penulisan CaLK

    Bab II. Ekonomi Makro & Kebijakan Keuangan
      - Kondisi ekonomi makro
      - Kebijakan keuangan BLUD

    Bab III. Ikhtisar Kinerja Keuangan
      - Pencapaian target pendapatan
      - Realisasi belanja
      - Hambatan & kendala

    Bab IV. Kebijakan Akuntansi
      - Entitas pelaporan
      - Basis akuntansi
      - Basis pengukuran
      - Kebijakan akuntansi untuk: Pendapatan, Beban, Aset, Kewajiban

    Bab V. Penjelasan Pos-Pos Laporan Keuangan
      - Penjelasan detail tiap pos di:
        * LRA (pendapatan, belanja, pembiayaan)
        * LPSAL (SAL awal, akhir)
        * Neraca (aset, kewajiban, ekuitas)
        * LO (pendapatan, beban)
        * LAK (arus kas)
        * LPE (ekuitas)

    Bab VI. Informasi Non-Keuangan
      - Kontinjensi (potential liabilities)
      - Komitmen (kontrak yang belum realized)
      - Peristiwa setelah tanggal neraca

    Bab VII. Penutup
      - Kesimpulan
      - Harapan

  Features:
    ✅ Auto-generate template (structure dari PSAP 13)
    ✅ Auto-populate dari data (angka-angka)
    ✅ Manual editable sections (narasi, penjelasan)
    ✅ Rich text editor (WYSIWYG)
    ✅ Print PDF (format official)

  Why Critical:
    - CaLK = penjelas atas angka-angka di laporan
    - BPK wajib baca CaLK (substantive testing)
    - Salah penjelasan → Temuan audit

Common Endpoints (All 7 Laporan):
  - GET /api/laporan/:jenis/:tahun/:bulan (generate)
  - GET /api/laporan/:jenis/:id/pdf
  - GET /api/laporan/:jenis/:id/excel
  - GET /api/laporan/calk/:tahun (special for CaLK)
  - PATCH /api/laporan/calk/:tahun (edit narasi)
```

---

### **MODULE 35-39: Laporan Penatausahaan (Triwulanan ke PPKD)** 📮
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: Permendagri 13/2006

Description:
  Laporan pertanggungjawaban bendahara kepada PPKD (setiap triwulan)

Module 35: Laporan Pendapatan BLUD
  Content:
    - Jasa Layanan (detail by jenis layanan)
    - Hibah (uang/barang/jasa)
    - Hasil Kerja Sama
    - Pendapatan Lain
    - Anggaran vs Realisasi (per jenis)
    - Per triwulan (Tw 1, 2, 3, 4)

  Features:
    ✅ Auto-generate from Pendapatan records
    ✅ Triwulan selector (Q1/Q2/Q3/Q4)
    ✅ Print PDF (format resmi)

Module 36: Laporan Pengeluaran Biaya BLUD
  Content:
    - Biaya Operasional
    - Biaya Umum & Administrasi
    - Biaya Non-Operasional
    - Per kode rekening
    - Anggaran vs Realisasi

  Features:
    ✅ Auto-generate from Belanja records
    ✅ Grouped by classification

Module 37: Rekap Pengeluaran Per Objek
  Content:
    - Detail breakdown (6 level rekening)
    - Per unit kerja
    - Per sumber dana (APBD/Fungsional/Hibah)

  Features:
    ✅ Drill-down capability
    ✅ Export Excel

Module 38: SPTJ (Surat Pernyataan Tanggung Jawab)
  Content:
    - Pernyataan Pemimpin BLUD
    - Conformity dengan: SPI, DPA, Standar Akuntansi
    - Link ke laporan (35-37)

  Features:
    ✅ Template form (auto-populate)
    ✅ Digital signature (Pemimpin BLUD)
    ✅ Print PDF

Module 39: SPJ Fungsional
  Content:
    - Workflow pertanggungjawaban belanja ke PPKD
    - SPM Pengesahan (untuk pengesahan belanja)
    - SP2D Pengesahan dari PPKD

  Features:
    ✅ Workflow lengkap (submit → review → approve)
    ✅ SPM Pengesahan generation
    ✅ SP2D tracking (from PPKD)
    ✅ Status tracking

  Workflow:
    1. BLUD submit SPJ Fungsional ke PPKD (triwulanan)
    2. PPKD review
    3. PPKD issue SPM Pengesahan
    4. BUD issue SP2D Pengesahan
    5. SPJ dianggap sah (belanja diakui PPKD)

API Endpoints:
  - GET /api/laporan-penatausahaan/pendapatan/:tahun/:triwulan
  - GET /api/laporan-penatausahaan/pengeluaran/:tahun/:triwulan
  - GET /api/laporan-penatausahaan/per-objek/:tahun/:triwulan
  - POST /api/laporan-penatausahaan/sptj/:tahun/:triwulan
  - POST /api/laporan-penatausahaan/spj-fungsional
  - GET /api/laporan-penatausahaan/spj-fungsional/:id/status
```

---

### **MODULE 41: Aset Management** 🏢
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: PSAP 07 (Aset Tetap)

Description:
  Pengelolaan aset tetap & penyusutan

Features:
  ✅ Register Aset (KIB A-F):
     - KIB A: Tanah
     - KIB B: Peralatan & Mesin
     - KIB C: Gedung & Bangunan
     - KIB D: Jalan, Jaringan, Irigasi
     - KIB E: Aset Tetap Lainnya
     - KIB F: Konstruksi Dalam Pengerjaan (KDP)

  ✅ Penyusutan Otomatis:
     - Method: Garis lurus / Saldo menurun
     - Monthly posting (auto-create jurnal)
     - Akumulasi penyusutan tracking
     - Nilai buku = Nilai perolehan - Akumulasi penyusutan

  ✅ Mutasi Aset:
     - Pembelian (from SP2D)
     - Transfer masuk/keluar
     - Penghapusan (disposal)
     - Revaluasi

  ✅ Stockopname:
     - Fisik vs sistem comparison
     - Selisih detection
     - Adjustment (if needed)
     - Berita acara stockopname

Penyusutan Rules:
  Tanah: Tidak disusutkan
  Gedung: 20 tahun (5% per tahun)
  Peralatan: 4-10 tahun
  Kendaraan: 5 tahun

UI Components:
  - Aset register table (filter by KIB)
  - Penyusutan calculator
  - Mutasi form
  - Stockopname interface (with barcode/QR)

API Endpoints:
  - POST /api/aset
  - GET /api/aset
  - GET /api/aset/:id
  - PATCH /api/aset/:id
  - DELETE /api/aset/:id (soft delete)
  - GET /api/aset/penyusutan/:tahun/:bulan
  - POST /api/aset/penyusutan/run/:bulan (trigger monthly)
  - POST /api/aset/:id/mutasi
  - GET /api/aset/stockopname/:tahun
```

---

### **MODULE 42: Gaji & Payroll** 💵
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: UU Kepegawaian, UU PPh

Description:
  Pengelolaan penggajian PNS & Non-PNS

Features:
  ✅ Gaji PNS:
     - Import data pegawai
     - Perhitungan gaji (gapok, tunjangan)
     - Potongan (PPh 21, BPJS Kesehatan, BPJS TK, iuran lain)
     - Generate SPP-LS Gaji otomatis
     - Slip gaji digital (PDF)

  ✅ Honorarium Non-PNS:
     - Master honorarium (per kegiatan)
     - Perhitungan PPh 21 (PTKP, tarif progresif)
     - Bulk payment (multiple recipients)
     - Slip honorarium

  ✅ Tax Calculation (PPh 21):
     - Penghasilan bruto
     - PTKP (status kawin, tanggungan)
     - Penghasilan netto
     - Tarif progresif (5%, 15%, 25%, 30%)
     - PPh 21 terutang

Workflow:
  1. Import data pegawai (from SIMPEG/manual)
  2. System calculate gaji (gapok + tunjangan - potongan)
  3. Review & approve
  4. Generate SPP-LS Gaji (auto)
  5. SPP approved → SP2D
  6. Generate slip gaji (PDF)
  7. Distribute slip (email/download)

UI Components:
  - Payroll dashboard (summary)
  - Employee data import
  - Payroll calculation table (editable)
  - Slip gaji generator

API Endpoints:
  - POST /api/gaji/import-pegawai (bulk)
  - POST /api/gaji/calculate/:bulan/:tahun
  - GET /api/gaji/:bulan/:tahun
  - POST /api/gaji/:bulan/:tahun/approve
  - POST /api/gaji/generate-spp/:bulan/:tahun
  - GET /api/gaji/slip/:pegawaiId/:bulan/:tahun/pdf
  - POST /api/honorarium
  - GET /api/honorarium/:id/slip/pdf
```

---

### **MODULE 43: Pengadaan & Kontrak** 📋
```yaml
Status: ✅ Core Feature (Masterplan v2)
Compliance: UU Pengadaan, Perpres 16/2018

Description:
  Pengelolaan kontrak pengadaan & monitoring pembayaran

Features:
  ✅ Kontrak Management:
     - CRUD kontrak (Barang/Jasa/Konstruksi)
     - Upload dokumen kontrak (PDF)
     - Vendor management (NPWP, alamat, dll)
     - Nilai kontrak & periode (start-end date)
     - Jaminan (performance bond, dll)

  ✅ Term Pembayaran (Termin):
     - Define termin (%, jumlah, tanggal)
     - Link termin → SPP (auto-create SPP per termin)
     - Progress tracking (sudah dibayar berapa %)
     - Outstanding monitoring

  ✅ Addendum:
     - Perubahan nilai/waktu/lingkup
     - History tracking (original vs amended)
     - Approval workflow
     - Upload addendum dokumen

  ✅ Monitoring:
     - Progress realisasi (%)
     - Alert jatuh tempo (reminder)
     - Budget vs commitment (kontrak yang sudah commit)
     - Outstanding payment (termin belum dibayar)

Budget Commitment:
  - Kontrak di-sign → Budget reserved (committed)
  - SPP dibuat → Budget committed
  - SP2D cair → Budget realized

UI Components:
  - Kontrak form (multi-step)
  - Termin table (add/edit/delete)
  - Progress tracker (visual %)
  - Alert dashboard (jatuh tempo)

API Endpoints:
  - POST /api/kontrak
  - GET /api/kontrak
  - GET /api/kontrak/:id
  - PATCH /api/kontrak/:id
  - DELETE /api/kontrak/:id
  - POST /api/kontrak/:id/termin
  - GET /api/kontrak/:id/termin
  - POST /api/kontrak/:id/addendum
  - GET /api/kontrak/:id/progress
  - GET /api/kontrak/alert-jatuh-tempo
```

---

## 3. New Features (v3 Enhancements)

### **FEATURE 43: SIMRS Real-time Webhook** ⚡
```yaml
Status: 🆕 NEW (v3 Enhancement)
Replaces: Polling mechanism (5 minutes) from v2

Description:
  Event-driven real-time integration dengan SIMRS (< 1 detik)

Features:
  🆕 Webhook endpoint (receive events from SIMRS)
  🆕 Event types: billing.created, billing.updated, billing.paid
  🆕 HMAC signature verification (security)
  🆕 Retry mechanism (BullMQ queue)
  🆕 Real-time dashboard update (WebSocket)
  🆕 Reconciliation tool (SIMRS vs Si-Kancil)

Benefits vs v2:
  ✅ <1 second sync (vs 5 minutes polling)
  ✅ Zero polling overhead (save server resources)
  ✅ Immediate data consistency
  ✅ Event-driven architecture (scalable)

Technical:
  - Webhook signature: HMAC-SHA256
  - Queue: BullMQ (Redis-based)
  - Real-time: WebSocket (Socket.io)

API Endpoints:
  - POST /api/webhooks/simrs/billing (receiver)
  - GET /api/webhooks/simrs/logs
  - POST /api/webhooks/simrs/retry/:eventId
```

---

### **FEATURE 44: Bank Integration (Host-to-Host + VA)** 🏦
```yaml
Status: 🆕 NEW (v3 Enhancement)

Description:
  Integrasi dengan bank untuk auto-reconciliation & payment

Features:
  🆕 Virtual Account (VA) Generation:
     - Unique VA per pasien/penjamin
     - Auto-create VA saat billing SIMRS
     - 7-day expiry (configurable)

  🆕 Bank Webhook (Payment Notification):
     - Real-time payment received notification
     - Auto-create Penerimaan record
     - Auto-posting jurnal
     - Auto-reconciliation (VA vs Billing)

  🆕 SP2D Online:
     - Submit SPM → Bank API
     - Bank process → SP2D issued
     - Bank callback → Update SP2D status

  🆕 Reconciliation Dashboard:
     - VA generated vs Paid
     - Outstanding VA (unpaid)
     - Selisih detection

Benefits:
  ✅ Zero manual reconciliation
  ✅ Real-time payment tracking
  ✅ Reduce human error
  ✅ Faster cash flow

Technical:
  - Bank API: SOAP/REST
  - VA Format: {bank_code}{blud_code}{patient_id}
  - Callback: HMAC signature verification

API Endpoints:
  - POST /api/bank/va/generate
  - GET /api/bank/va/:accountNumber
  - POST /api/webhooks/bank/payment (callback)
  - POST /api/bank/sp2d/submit/:spmId
  - GET /api/bank/reconciliation/:tahun/:bulan
```

---

### **FEATURE 45: SIPD RI Connector** 🌐
```yaml
Status: 🆕 NEW (v3 Enhancement)
Compliance: Mandatory pelaporan ke Kemendagri

Description:
  Export data realisasi ke SIPD RI (Sistem Informasi Pemerintah Daerah)

Features:
  🆕 Export format SIPD (XML/JSON):
     - Realisasi Pendapatan (per triwulan)
     - Realisasi Belanja (per kode rekening)
     - SPJ Fungsional (summary)

  🆕 API Submission (if SIPD API available):
     - Auto-submit ke SIPD API
     - Acknowledgment handling
     - Status tracking

  🆕 Manual Export (fallback):
     - Excel export (format template SIPD)
     - Validation before export

  🆕 Scheduled Export:
     - Auto-generate every end of quarter
     - Email notification (ready to submit)

Benefits:
  ✅ Compliance dengan Kemendagri
  ✅ Reduce manual entry to SIPD
  ✅ Data consistency (source of truth dari Si-Kancil)

API Endpoints:
  - POST /api/sipd/export/:tahun/:triwulan
  - POST /api/sipd/submit/:tahun/:triwulan (API)
  - GET /api/sipd/export/:tahun/:triwulan/excel (manual)
  - GET /api/sipd/status/:tahun/:triwulan
```

---

### **FEATURE 46: DJP Online Export (e-Bupot)** 📄
```yaml
Status: 🆕 NEW (v3 Enhancement)
Compliance: UU PPh, Mandatory SPT Masa

Description:
  Export data pajak ke format e-Bupot Unifikasi (DJP Online)

Features:
  🆕 CSV Export (e-Bupot format):
     - PPh 21 (Gaji)
     - PPh 22 (Pembelian)
     - PPh 23 (Jasa)
     - PPh 4(2) (Sewa)
     - PPN

  🆕 Bukti Potong Generator:
     - PDF format (per penerima)
     - Include NPWP, nama, alamat, jumlah, tarif

  🆕 SPT Masa Template:
     - Auto-populate from data
     - Excel format (ready to import to e-SPT/e-Bupot)

  🆕 NTPN Tracker:
     - Record NTPN (Nomor Tanda Penerimaan Negara)
     - Link NTPN to tax record

Benefits:
  ✅ Compliance dengan DJP
  ✅ Reduce manual entry to e-Bupot
  ✅ Accurate tax reporting

API Endpoints:
  - GET /api/pajak/export/ebupot/:jenis/:bulan/:tahun
  - GET /api/pajak/bukti-potong/:penerimaan/:bulan/pdf
  - GET /api/pajak/spt-masa/:jenis/:bulan/:tahun/excel
  - PATCH /api/pajak/:id/ntpn (record NTPN)
```

---

### **FEATURE 47: Budget Control Warning** ⚠️
```yaml
Status: 🆕 NEW (v3 Enhancement)
Extends: Module 14 (Budget Control)

Description:
  Pre-alert system untuk mencegah overspending

Features:
  🆕 Real-time Budget Monitoring:
     - Sisa pagu calculation (real-time)
     - Threshold-based alerts (20%, 10%, 5%)

  🆕 Email/SMS Notification:
     - Alert to PPTK (program owner)
     - Alert to Admin Keuangan
     - Configurable recipients

  🆕 Budget Freeze:
     - Auto-freeze budget saat SPP in-process
     - Prevent double-booking

  🆕 Budget Projection:
     - Forecast sisa pagu end of year
     - Based on trend realisasi

Alert Levels:
  🟡 Warning (80% used): "Budget hampir habis, monitor closely"
  🟠 Critical (90% used): "Budget critical, immediate action needed"
  🔴 Blocked (100% used): "Budget habis, tidak bisa SPP lagi"

Technical:
  - Trigger: SPP creation, approval, rejection
  - Channel: Email, SMS (Twilio/local provider)
  - Dashboard: Real-time budget status widget

API Endpoints:
  - GET /api/budget/alert/:outputId
  - POST /api/budget/alert/config (settings)
  - GET /api/budget/projection/:outputId
```

---

### **FEATURE 48: Smart Tax Wizard** 🧙
```yaml
Status: 🆕 NEW (v3 Enhancement)
Extends: Module 15 (Tax Calculation Engine)

Description:
  Interactive tax wizard untuk menghindari kesalahan hitung pajak

Features:
  🆕 Step-by-step Wizard:
     Step 1: Jenis transaksi (Gaji/Pembelian/Jasa/Sewa)
     Step 2: Penerima (NPWP/Nama/Alamat)
     Step 3: Nilai bruto
     Step 4: Auto-detect tax type & rate
     Step 5: Preview calculation
     Step 6: Confirm

  🆕 Auto-detection Logic:
     - Detect from jenis belanja
     - Lookup tax rate from config
     - Apply exemptions (if any)

  🆕 NPWP Validation:
     - Format validation (15 digit)
     - Check digit validation
     - Alert jika NPWP invalid

  🆕 Tax Calculator Preview:
     - Real-time calculation
     - Breakdown (bruto, tarif, PPh, netto)

  🆕 Save as Template:
     - Save frequently used calculations
     - Quick apply (for recurring payments)

Benefits:
  ✅ Reduce tax calculation errors
  ✅ User-friendly (no need to remember tax rules)
  ✅ Consistent calculation

UI Flow:
  1. User click "Smart Tax Wizard"
  2. Answer questions (wizard)
  3. System calculate (auto)
  4. Preview result
  5. Confirm → Apply to SPP

API Endpoints:
  - POST /api/tax/wizard/detect (auto-detect)
  - POST /api/tax/wizard/calculate (preview)
  - POST /api/tax/wizard/apply/:sppId
```

---

### **FEATURE 49: Auto-Reconciliation (Bank VA vs Billing)** ✅
```yaml
Status: 🆕 NEW (v3 Enhancement)
Related: Feature 44 (Bank Integration)

Description:
  Otomatis matching payment VA dengan billing SIMRS

Features:
  🆕 Auto-matching Logic:
     - VA payment received (from bank callback)
     - Find related billing (by VA number)
     - Match amount (exact/partial)
     - Auto-create Penerimaan
     - Auto-posting jurnal

  🆕 Partial Payment Handling:
     - Split payment (jika partial)
     - Track outstanding (sisa)

  🆕 Reconciliation Report:
     - Matched (VA vs Billing) ✅
     - Unmatched VA (payment tanpa billing) ⚠️
     - Unmatched Billing (billing tanpa payment) ⚠️
     - Selisih (amount difference) ⚠️

  🆕 Manual Reconciliation:
     - UI untuk manual matching (jika auto gagal)
     - Reason input (explanation)

Benefits:
  ✅ Zero manual reconciliation
  ✅ Real-time revenue recognition
  ✅ Accurate cash flow tracking

Workflow:
  1. Bank send payment notification
  2. System find billing by VA number
  3. Match amount (full/partial)
  4. Create Penerimaan record
  5. Post jurnal (Dr. Bank, Cr. Pendapatan)
  6. Update billing status (PAID/PARTIAL)
  7. Send notification (to finance team)

API Endpoints:
  - POST /api/reconciliation/auto (trigger)
  - GET /api/reconciliation/report/:tahun/:bulan
  - POST /api/reconciliation/manual-match
  - GET /api/reconciliation/unmatched
```

---

### **FEATURE 50: Fraud Detection System** 🔍
```yaml
Status: 🆕 NEW (v3 Enhancement)
Compliance: Anti-corruption, Internal control

Description:
  Sistem deteksi aktivitas mencurigakan untuk mencegah fraud

Detection Rules (7 Rules):
  1. ⏰ After-hours Activity:
     - Transaction created/approved after 22:00 or before 06:00
     - Severity: MEDIUM
     - Alert: Admin + Audit

  2. 🔪 Pemecahan Nominal (Invoice Splitting):
     - Multiple SPP to same supplier < threshold (e.g., < 50 juta)
     - Within 7 days
     - Total > threshold
     - Severity: HIGH
     - Alert: Admin + Audit + Management

  3. ⚡ Rapid Approval:
     - SPP created & approved within 5 minutes
     - Possible collusion
     - Severity: MEDIUM
     - Alert: Admin + Audit

  4. 💰 Large Amount:
     - SPP > threshold (e.g., 100 juta)
     - Severity: LOW (just FYI)
     - Alert: Admin

  5. 📅 Backdated Transaction:
     - Transaction date < system date - 7 days
     - Severity: MEDIUM
     - Alert: Admin + Audit

  6. 🔄 Frequent Reversals:
     - Jurnal reversed > 3x in a month
     - Severity: MEDIUM
     - Alert: Audit

  7. 👤 Same User Approval:
     - Creator = Approver (violation of SoD)
     - Severity: CRITICAL
     - Alert: ALL (Admin, Audit, Management)

Features:
  🆕 Real-time Detection:
     - Check on every transaction
     - Async processing (non-blocking)

  🆕 Alert System:
     - Email notification (configurable recipients)
     - SMS notification (for critical)
     - In-app notification

  🆕 Fraud Dashboard:
     - Summary fraud alerts (by severity)
     - Drill-down to detail
     - Status tracking (review/resolve)

  🆕 Rule Configuration:
     - Admin can configure rules (enable/disable)
     - Threshold adjustment
     - Alert recipient management

Benefits:
  ✅ Prevent corruption (pemecahan kuitansi, dll)
  ✅ Detect collusion (rapid approval)
  ✅ Compliance with SoD (segregation of duties)
  ✅ Audit trail for investigation

Technical:
  - Trigger: Transaction lifecycle events
  - Processing: BullMQ (async)
  - Storage: fraud_alerts table
  - Notification: Email (Nodemailer), SMS (Twilio)

API Endpoints:
  - GET /api/fraud/alerts
  - GET /api/fraud/alerts/:id
  - PATCH /api/fraud/alerts/:id/resolve
  - GET /api/fraud/dashboard
  - GET /api/fraud/rules (config)
  - PATCH /api/fraud/rules/:id (update config)
```

---

### **FEATURE 51: Immutable Audit Trail** 🔒
```yaml
Status: 🆕 NEW (v3 Enhancement)
Extends: Module 45 (Audit Trail)
Compliance: BPK audit requirement, Forensic investigation

Description:
  Tamper-proof audit log dengan hash chain

Features:
  🆕 Hash Chain (Blockchain-like):
     - Every log has hash of (prevHash + current data)
     - Tamper detection (if hash mismatch)
     - Cannot modify/delete (append-only)

  🆕 Comprehensive Capture:
     - Who: User ID, User Name, IP, User Agent
     - What: Action (CREATE, UPDATE, DELETE, APPROVE, etc.)
     - When: Timestamp (millisecond precision)
     - Where: Entity type, Entity ID
     - Why: Reason (for corrections, reversals)
     - Before/After: Old value, New value (JSON)

  🆕 Database Constraint:
     - Trigger: Prevent UPDATE/DELETE on audit_logs
     - Raise exception: "Audit logs are immutable"

  🆕 Verification Tool:
     - Verify hash integrity
     - Detect tampered logs

  🆕 10-year Retention:
     - Archive old logs (>1 year) to cold storage
     - Keep searchable index

Benefits:
  ✅ Non-repudiation (cannot deny action)
  ✅ Forensic investigation (if fraud detected)
  ✅ BPK audit compliance
  ✅ Tamper detection

Technical:
  - Hash: SHA-256
  - Storage: Separate schema (audit)
  - Trigger: PostgreSQL trigger (prevent UPDATE/DELETE)
  - Archive: S3/MinIO (cold storage)

API Endpoints:
  - GET /api/audit/logs (search)
  - GET /api/audit/logs/:id
  - POST /api/audit/verify/:id (integrity check)
  - GET /api/audit/timeline/:entityType/:entityId
```

---

### **FEATURE 52: Data Encryption (AES-256)** 🔐
```yaml
Status: 🆕 NEW (v3 Enhancement)
Compliance: UU PDP (Perlindungan Data Pribadi)

Description:
  Enkripsi data sensitif untuk compliance UU PDP

Encrypted Fields:
  - NIK (16 digit)
  - Nomor Rekening Bank
  - Data Pasien (from SIMRS):
    * Nama pasien
    * Alamat
    * Diagnosa (sensitive medical data)
  - Gaji & Honorarium (nilai)

Features:
  🆕 AES-256-GCM:
     - Symmetric encryption (fast)
     - Authenticated encryption (integrity)
     - Random IV (initialization vector)

  🆕 Transparent Encryption/Decryption:
     - Auto-encrypt on INSERT/UPDATE
     - Auto-decrypt on SELECT
     - Using TypeORM lifecycle hooks

  🆕 Key Management:
     - Encryption key from environment (never hardcoded)
     - Key rotation support (future)

  🆕 Access Control:
     - Only authorized users can access encrypted data
     - Audit log for access (who viewed NIK, etc.)

Technical:
  - Algorithm: AES-256-GCM
  - Key size: 32 bytes (256 bit)
  - IV: 16 bytes (random per record)
  - Storage format: IV:AuthTag:Encrypted

Example:
  Plain: "1234567890123456"
  Encrypted: "a1b2c3d4e5f6...:auth123...:encrypted456..."

API:
  - Transparent (no specific endpoints)
  - Application layer handles encryption/decryption
```

---

### **FEATURE 53: Cash Opname Digital** 📸
```yaml
Status: 🆕 NEW (v3 Enhancement)
Extends: Module 20 (Laporan Penutupan Kas)

Description:
  Digitalisasi proses opname kas (paperless)

Features:
  🆕 Digital Berita Acara:
     - Template form (auto-populate)
     - Tim opname (select members)
     - Tanggal & waktu opname

  🆕 Photo Upload:
     - Photo kas fisik (uang kertas, koin)
     - Photo safe (brankas)
     - Multiple photos support

  🆕 Digital Signature:
     - Signature pad (touch/mouse)
     - All members harus sign
     - Cannot submit until all signed

  🆕 Barcode/QR Scanning (Optional):
     - Scan barcode pada bundel uang
     - Auto-count (if supported)

  🆕 PDF Generation:
     - Berita acara official format
     - Include photos
     - Include signatures
     - Printable

Benefits:
  ✅ Paperless (no manual BA)
  ✅ Evidence (photos)
  ✅ Faster process (no waiting for signatures)
  ✅ Audit trail (who, when)

Workflow:
  1. Initiate cash opname (from Laporan Penutupan Kas)
  2. Select tim opname (2-3 people)
  3. Count cash (physical)
  4. Input result (amount)
  5. Upload photos (bukti)
  6. All members sign (digital)
  7. Generate BA (PDF)
  8. Submit to Pemimpin BLUD (approval)

API Endpoints:
  - POST /api/cash-opname
  - POST /api/cash-opname/:id/upload-photo
  - POST /api/cash-opname/:id/sign (digital signature)
  - GET /api/cash-opname/:id/pdf (BA download)
```

---

### **FEATURE 54: Real-time Dashboard** 📊
```yaml
Status: 🆕 NEW (v3 Enhancement)
Extends: Module Dashboard (from v2)

Description:
  Dashboard dengan update real-time via WebSocket

Features:
  🆕 WebSocket Connection:
     - Real-time data push (vs polling)
     - Subscribe to events (pendapatan, belanja, dll)
     - Auto-update charts (no refresh needed)

  🆕 Real-time Widgets:
     - Kas Position (real-time balance)
     - Pendapatan Hari Ini (live counter)
     - SPP Pending Approval (badge notification)
     - Budget Alert (color-coded indicators)

  🆕 Live Charts:
     - Pendapatan trend (update setiap transaksi)
     - Belanja trend
     - Cash flow (real-time)

  🆕 Notification Toast:
     - Pop-up notification for important events:
       * SPP approved
       * Fraud alert detected
       * Budget warning
       * Payment received (VA)

Benefits:
  ✅ No manual refresh (better UX)
  ✅ Instant feedback (after action)
  ✅ Real-time monitoring (for management)

Technical:
  - WebSocket: Socket.io
  - Events: Redis Pub/Sub
  - Frontend: React + Socket.io-client

Example Events:
  - pendapatan.created
  - spp.approved
  - fraud.alert
  - budget.warning

API:
  - WebSocket endpoint: ws://server/socket.io
  - Events: Subscribe/unsubscribe to channels
```

---

### **FEATURE 55: Performance Monitoring** 📈
```yaml
Status: 🆕 NEW (v3 Enhancement)

Description:
  Monitoring performa aplikasi via Grafana + Prometheus

Metrics Collected:
  Application Metrics:
    - Request count (per endpoint)
    - Response time (p50, p95, p99)
    - Error rate (4xx, 5xx)
    - Active users (concurrent sessions)
    - Queue length (BullMQ jobs pending)

  Business Metrics:
    - SPP created per hour/day
    - Pendapatan total (real-time)
    - Belanja total (real-time)
    - Kas position (real-time)

  System Metrics:
    - CPU usage (%)
    - Memory usage (MB)
    - Disk I/O (read/write)
    - Network I/O (throughput)
    - Database connections (active/idle)
    - Redis connections

Features:
  🆕 Grafana Dashboards:
     - Si-Kancil Overview (summary)
     - API Performance (response time, error rate)
     - Business KPIs (pendapatan, belanja, kas)
     - System Health (CPU, memory, disk)

  🆕 Alert Rules:
     - High error rate (> 5% in 5 min)
     - Slow response (p95 > 2s in 5 min)
     - High CPU (> 80% in 5 min)
     - Database connection high (> 80 in 5 min)

  🆕 Email/SMS Alerts:
     - Send to DevOps team (if alert triggered)
     - Include: Severity, description, value

Benefits:
  ✅ Proactive issue detection (before user complain)
  ✅ Performance optimization (identify bottlenecks)
  ✅ Capacity planning (trend analysis)

Technical:
  - Metrics: Prometheus (scrape /metrics endpoint)
  - Visualization: Grafana dashboards
  - Alerting: Prometheus Alertmanager

Endpoints:
  - GET /metrics (Prometheus format)
```

---

### **FEATURE 56: Advanced Alerts** 🔔
```yaml
Status: 🆕 NEW (v3 Enhancement)

Description:
  Notifikasi otomatis untuk events penting

Alert Types:
  1. Budget Alerts:
     - Budget hampir habis (80%, 90%, 100%)
     - Overspending detected

  2. Fraud Alerts:
     - Suspicious activity detected (7 rules)

  3. Workflow Alerts:
     - SPP pending approval (> 2 days)
     - SPJ pending (end of month reminder)
     - Kontrak jatuh tempo (7 days before)

  4. System Alerts:
     - SIMRS sync failed (> 5x)
     - Bank reconciliation failed
     - Performance degraded

  5. Compliance Alerts:
     - Laporan triwulanan due (PPKD)
     - Tax payment due (H+10 reminder)
     - BKU not approved (end of month)

Features:
  🆕 Multi-channel:
     - Email (high priority)
     - SMS (critical only)
     - In-app notification (all)
     - Push notification (mobile - future)

  🆕 Configurable Recipients:
     - Per alert type
     - Per role (PPTK, Admin, Audit, dll)

  🆕 Alert Frequency:
     - Real-time (fraud, system error)
     - Daily digest (budget, workflow)
     - Weekly summary (compliance)

  🆕 Snooze/Dismiss:
     - User can snooze alert (remind later)
     - Dismiss (mark as read)

Benefits:
  ✅ Proactive (prevent issues)
  ✅ Timely (action before deadline)
  ✅ Informed (management aware of status)

Technical:
  - Queue: BullMQ (scheduled jobs for digest)
  - Email: Nodemailer (SMTP)
  - SMS: Twilio / local provider
  - In-app: WebSocket (real-time)

API Endpoints:
  - GET /api/alerts (user's alerts)
  - PATCH /api/alerts/:id/read (mark read)
  - PATCH /api/alerts/:id/snooze (snooze)
  - POST /api/alerts/config (settings)
```

---

## 4. Compliance Features

### **Regulatory Compliance Checklist** ✅

```yaml
PMK 220/2016 (Sistem Akuntansi & Pelaporan Keuangan BLUD):
  ✅ 7 Laporan Keuangan (LRA, LPSAL, Neraca, LO, LAK, LPE, CaLK)
  ✅ Basis akrual (LO, Neraca, LPE)
  ✅ Basis kas (LRA, LAK)
  ✅ Program-Kegiatan-Output structure (RBA)
  ✅ Klasifikasi pendapatan (4 jenis)
  ✅ Laporan Penatausahaan (triwulanan ke PPKD)

Permendagri 13/2006 (Pengelolaan Keuangan Daerah):
  ✅ SPP-SPM-SP2D workflow
  ✅ DPA/DPPA
  ✅ SPJ Fungsional (ke PPKD)
  ✅ Konsolidasi ke LKPD (future)

Permendagri 61/2007 (Pedoman Teknis BLUD):
  ✅ RBA structure (sesuai pedoman)
  ✅ Tarif layanan (dari SIMRS)
  ✅ Fleksibilitas pengelolaan keuangan

Per-47/PB/2014 (Penatausahaan Bendahara BLU):
  ✅ BKU Penerimaan & Pengeluaran (harian)
  ✅ Buku Pembantu (9 jenis WAJIB)
  ✅ SPJ UP/GU/TU
  ✅ Laporan Penutupan Kas (monthly)
  ✅ 10-year retention (audit trail)

PSAP (Pernyataan Standar Akuntansi Pemerintahan):
  ✅ PSAP 01: Basis akuntansi akrual
  ✅ PSAP 07: Aset tetap & penyusutan
  ✅ PSAP 13: Penyajian Laporan Keuangan BLU/BLUD

UU PPh & PPN:
  ✅ PPh 21, 22, 23, 4(2) calculation
  ✅ PPN 11%
  ✅ Bukti potong generation
  ✅ SPT Masa (e-Bupot export)

UU PDP (Perlindungan Data Pribadi):
  ✅ Data encryption (NIK, data pasien)
  ✅ Access control (RBAC)
  ✅ Audit trail (who access what)

BPK Audit Requirements:
  ✅ Audit trail 100% coverage
  ✅ Immutable logs (tamper-proof)
  ✅ 10-year retention
  ✅ Segregation of Duties (SoD)
  ✅ Backup & recovery (tested)
```

---

## 5. Integration Features

### **External System Integration** 🔗

```yaml
1. SIMRS (Sistem Informasi Manajemen Rumah Sakit):
   Integration Type: Real-time Webhook (v3) / Polling (v2 fallback)
   Data Flow:
     - SIMRS → Si-Kancil: Billing data (pendapatan)
     - Frequency: Real-time (<1 second)
     - Auto-posting: Jurnal pendapatan

2. Bank (Core Banking):
   Integration Type: Host-to-Host API
   Data Flow:
     - Si-Kancil → Bank: VA generation, SP2D submission
     - Bank → Si-Kancil: Payment notification, SP2D status
     - Frequency: Real-time (webhook callback)
     - Auto-posting: Jurnal penerimaan

3. SIPD RI (Sistem Informasi Pemerintah Daerah):
   Integration Type: API submission (if available) / Excel export
   Data Flow:
     - Si-Kancil → SIPD: Realisasi pendapatan/belanja
     - Frequency: Triwulanan (quarterly)
     - Format: XML/JSON (API) or Excel (manual)

4. DJP Online (Direktorat Jenderal Pajak):
   Integration Type: CSV export (e-Bupot Unifikasi)
   Data Flow:
     - Si-Kancil → e-Bupot: Tax records (PPh, PPN)
     - Frequency: Monthly (SPT Masa)
     - Format: CSV (import to e-Bupot)

5. PPKD (Pejabat Pengelola Keuangan Daerah):
   Integration Type: Manual (PDF/Excel submission)
   Data Flow:
     - Si-Kancil → PPKD: Laporan Penatausahaan
     - Frequency: Triwulanan
     - Format: PDF (official) + Excel (data)

6. SIMPEG (Sistem Informasi Manajemen Pegawai):
   Integration Type: Manual import (CSV/Excel)
   Data Flow:
     - SIMPEG → Si-Kancil: Employee data (for payroll)
     - Frequency: Monthly (before payroll run)
     - Format: CSV/Excel template
```

---

## 6. Security Features

### **Security Layers** 🔒

```yaml
1. Authentication:
   ✅ JWT Token (Access + Refresh)
   ✅ Token rotation (on refresh)
   ✅ Blacklist (for logout/revoke)
   ✅ Multi-device session management
   ✅ Password hashing (bcrypt)
   ✅ Password policy (min length, complexity)

2. Authorization:
   ✅ RBAC (Role-Based Access Control)
   ✅ Granular permissions (per endpoint)
   ✅ Segregation of Duties (SoD):
      - Creator != Approver
      - Bendahara != Verifikator
   ✅ Resource-level access control

3. Data Protection:
   ✅ Encryption at rest (AES-256 for sensitive data)
   ✅ Encryption in transit (TLS 1.3)
   ✅ Database encryption (pgcrypto optional)
   ✅ Backup encryption

4. Input Validation:
   ✅ Request validation (class-validator)
   ✅ SQL injection prevention (ORM parameterized queries)
   ✅ XSS prevention (sanitize input)
   ✅ CSRF protection (token-based)

5. Rate Limiting:
   ✅ Global: 100 req/min per IP
   ✅ Auth endpoints: 5 req/15min per IP
   ✅ Heavy endpoints: 10 req/min per user

6. Security Headers:
   ✅ Helmet (X-Frame-Options, CSP, etc.)
   ✅ CORS (whitelist origins)
   ✅ HSTS (force HTTPS)

7. Audit & Monitoring:
   ✅ Immutable audit trail (all actions)
   ✅ Fraud detection (7 rules)
   ✅ Suspicious activity alerts
   ✅ Failed login attempts tracking

8. Backup & Recovery:
   ✅ Daily backup (PostgreSQL WAL + pg_dump)
   ✅ 30-day retention (online)
   ✅ 1-year retention (archive)
   ✅ Disaster recovery plan (RPO < 24h, RTO < 4h)
```

---

## 7. Reporting Features

### **Report Categories** 📄

```yaml
1. Laporan Keuangan (Financial Statements):
   ✅ LRA (Laporan Realisasi Anggaran)
   ✅ LPSAL (Laporan Perubahan SAL)
   ✅ Neraca (Balance Sheet)
   ✅ LO (Laporan Operasional)
   ✅ LAK (Laporan Arus Kas)
   ✅ LPE (Laporan Perubahan Ekuitas)
   ✅ CaLK (Catatan atas Laporan Keuangan)
   Format: PDF (official), Excel (data)
   Frequency: Monthly, Quarterly, Annually

2. Laporan Penatausahaan (Administration Reports):
   ✅ Laporan Pendapatan BLUD
   ✅ Laporan Pengeluaran Biaya BLUD
   ✅ Rekap Pengeluaran Per Objek
   ✅ SPTJ (Surat Pernyataan Tanggung Jawab)
   ✅ SPJ Fungsional
   Format: PDF
   Frequency: Quarterly (to PPKD)

3. Laporan Bendahara (Treasurer Reports):
   ✅ BKU Penerimaan
   ✅ BKU Pengeluaran
   ✅ Buku Pembantu (9 jenis)
   ✅ Laporan Penutupan Kas
   ✅ Register SPJ
   Format: PDF, Excel
   Frequency: Daily (entry), Monthly (approval)

4. Laporan Monitoring (Monitoring Reports):
   ✅ Realisasi Anggaran (per Program/Kegiatan/Output)
   ✅ Budget vs Actual Analysis
   ✅ Cash Flow Projection
   ✅ Aging Piutang
   ✅ Outstanding Kontrak
   Format: PDF, Excel, Dashboard
   Frequency: Real-time (dashboard), Monthly (report)

5. Laporan Pajak (Tax Reports):
   ✅ Rekap Pajak (PPh, PPN)
   ✅ Bukti Potong (per penerima)
   ✅ SPT Masa
   ✅ e-Bupot Export (CSV)
   Format: PDF, Excel, CSV
   Frequency: Monthly (SPT Masa)

6. Laporan Audit (Audit Reports):
   ✅ Audit Trail Log
   ✅ Fraud Alert Report
   ✅ User Activity Report
   ✅ Access Control Report
   Format: PDF, Excel
   Frequency: On-demand

7. Laporan Integrasi (Integration Reports):
   ✅ SIMRS Sync Status
   ✅ Bank Reconciliation
   ✅ VA Payment Report
   ✅ SIPD Export Log
   Format: PDF, Excel, Dashboard
   Frequency: Daily, Monthly
```

---

## 8. User Experience Features

### **UX Enhancements** 🎨

```yaml
1. Responsive Design:
   ✅ Desktop-first (primary use case)
   ✅ Tablet support (for review/approval)
   ✅ Mobile-friendly (for viewing/notifications)

2. Navigation:
   ✅ Sidebar menu (collapsible)
   ✅ Breadcrumb (current location)
   ✅ Search (global search for transactions)
   ✅ Recent items (quick access)

3. Forms:
   ✅ Multi-step wizard (for complex forms like RBA, SPP)
   ✅ Auto-save (draft mode)
   ✅ Validation (inline feedback)
   ✅ Smart defaults (pre-filled values)
   ✅ Calculator (for tax, budget check)

4. Tables:
   ✅ Sorting (multi-column)
   ✅ Filtering (per column)
   ✅ Pagination (server-side)
   ✅ Export (Excel, CSV, PDF)
   ✅ Column selection (show/hide)

5. Dashboard:
   ✅ Customizable widgets (drag & drop)
   ✅ Real-time updates (WebSocket)
   ✅ Interactive charts (drill-down)
   ✅ KPI cards (color-coded)

6. Notifications:
   ✅ Toast (real-time events)
   ✅ Badge (pending approvals count)
   ✅ Email (important alerts)
   ✅ SMS (critical alerts)

7. Help & Support:
   ✅ Tooltips (inline help)
   ✅ User guide (PDF)
   ✅ Video tutorials (YouTube/embedded)
   ✅ FAQs (common questions)
   ✅ Support ticket (for issues)

8. Accessibility:
   ✅ Keyboard navigation (shortcuts)
   ✅ Screen reader support (ARIA labels)
   ✅ High contrast mode (optional)
   ✅ Font size adjustment

9. Performance:
   ✅ Lazy loading (images, components)
   ✅ Code splitting (reduce bundle size)
   ✅ Caching (API responses, static assets)
   ✅ Optimistic updates (instant feedback)

10. Offline Support (Future):
    ⚠️ Not in v3 (future enhancement)
    - Service worker (cache assets)
    - IndexedDB (local storage)
    - Sync when online
```

---

## 9. Feature Comparison Matrix

### **v2 vs v3 Feature Comparison**

| Category | Masterplan v2 | Rekomendasi Tahap 3 | Features v3 (FINAL) |
|----------|---------------|---------------------|---------------------|
| **Total Modules** | 40 | ~42 | **45** (40 core + 5 new) |
| **Laporan Keuangan** | 7 (mandatory) | 7 | ✅ **7** |
| **SIMRS Integration** | Polling (<5 min) | **Webhook (<1 sec)** | ✅ **Webhook + Polling fallback** |
| **Bank Integration** | Manual/optional | **Host-to-Host + VA** | ✅ **Host-to-Host + VA + Auto-recon** |
| **Tax Calculation** | Auto-calculate | **Smart Tax Wizard** | ✅ **Smart Tax Wizard + Templates** |
| **Budget Control** | Basic check | **Warning alerts** | ✅ **Warning + Email/SMS + Freeze** |
| **Fraud Detection** | ❌ None | ✅ **7 rules** | ✅ **7 rules + Dashboard** |
| **Audit Trail** | Basic logging | **Immutable** | ✅ **Immutable + Hash chain** |
| **Data Encryption** | ❌ None | **AES-256** | ✅ **AES-256 + UU PDP compliance** |
| **Cash Opname** | Manual (paper) | **Digital** | ✅ **Digital + Photo + Signature** |
| **SIPD Connector** | ❌ None | **API Export** | ✅ **API + Excel export** |
| **DJP Export** | Manual | **e-Bupot CSV** | ✅ **e-Bupot CSV + Bukti Potong** |
| **Real-time Dashboard** | Static (refresh) | Not mentioned | ✅ **WebSocket + Live updates** |
| **Monitoring** | ❌ None | Not mentioned | ✅ **Grafana + Prometheus** |
| **Alerts** | Basic email | Not mentioned | ✅ **Multi-channel + Configurable** |
| **API Endpoints** | ~200 | Not specified | **~240** |
| **Database Tables** | ~73 | Not specified | **~73** |

---

## 10. Feature Roadmap

### **Implementation Priority** 🚀

```yaml
Phase 1 (Month 1-4): Core BLUD Modules
  Priority: P0 (Must Have)
  Modules:
    ✅ RBA Management (Module 1-4)
    ✅ Pendapatan (Module 5-9)
    ✅ Belanja (Module 10-15)
    ✅ Penatausahaan (Module 16-20)
    ✅ SPJ Administratif (Module 21-24)

Phase 2 (Month 5-8): Akuntansi & Laporan
  Priority: P0 (Must Have)
  Modules:
    ✅ Akuntansi (Module 25-27)
    ✅ Laporan Keuangan (Module 28-34) ⭐ CRITICAL
    ✅ Laporan Penatausahaan (Module 35-39)

Phase 3 (Month 9-10): Supporting Modules
  Priority: P1 (Should Have)
  Modules:
    ✅ Aset Management (Module 40)
    ✅ Gaji & Payroll (Module 41)
    ✅ Pengadaan & Kontrak (Module 42)

Phase 4 (Month 11-12): Integration & Automation
  Priority: P1 (Should Have)
  Features:
    🆕 SIMRS Real-time Webhook (Feature 43)
    🆕 Bank Integration + VA (Feature 44)
    🆕 Smart Tax Wizard (Feature 48)
    🆕 Budget Control Warning (Feature 47)

Phase 5 (Month 13-14): Security & Compliance
  Priority: P0 (Must Have)
  Features:
    🆕 Fraud Detection System (Feature 50)
    🆕 Immutable Audit Trail (Feature 51)
    🆕 Data Encryption (Feature 52)
    🆕 Cash Opname Digital (Feature 53)

Phase 6 (Month 15-16): External Integration
  Priority: P2 (Nice to Have)
  Features:
    🆕 SIPD RI Connector (Feature 45)
    🆕 DJP Online Export (Feature 46)
    🆕 Auto-Reconciliation (Feature 49)

Phase 7 (Month 17-18): Monitoring & Analytics
  Priority: P2 (Nice to Have)
  Features:
    🆕 Real-time Dashboard (Feature 54)
    🆕 Performance Monitoring (Feature 55)
    🆕 Advanced Alerts (Feature 56)

Future Enhancements (Post v3):
  ⚠️ Mobile App (native iOS/Android)
  ⚠️ Multi-BLUD / Multi-tenancy (SaaS)
  ⚠️ Advanced Analytics (ML/AI for prediction)
  ⚠️ E-procurement Integration
  ⚠️ SIMBADA Integration (aset daerah)
```

---

## Conclusion

**Features v3** adalah penggabungan terbaik dari:
- ✅ **40 Core Modules** dari Masterplan v2 (100% BLUD compliance)
- ✅ **15 New Features** dari Rekomendasi Tahap 3 (automation & real-time)
- ✅ **Tech Stack v3** (modern, scalable, production-ready)

**Total Features:**
- **45 Modules** (40 core + 5 new categories)
- **240+ API Endpoints**
- **73 Database Tables**
- **7 Laporan Keuangan WAJIB** (PMK 220/2016)
- **15+ Integration Points** (SIMRS, Bank, SIPD, DJP, PPKD)

**Unique Value Propositions:**
1. **100% Compliant:** Semua regulasi BLUD terpenuhi (PMK, Permendagri, PSAP)
2. **100% Automated:** Auto-posting jurnal, auto-reconciliation, smart tax
3. **100% Audit-Ready:** Immutable audit trail, fraud detection, 10-year retention
4. **Real-time Integration:** <1 second SIMRS sync (vs 5 minutes)
5. **Production-Ready:** Kubernetes HA, monitoring, alerts, security

**Success Criteria:**
- ✅ Zero BPK audit findings (compliance)
- ✅ <5 days to close monthly books (vs ~15 days)
- ✅ <1 second SIMRS sync (vs 5 minutes)
- ✅ 99.9% uptime (reliability)
- ✅ Zero fraud incidents (detection system)

---

**Document Control:**
- Version: 3.0
- Date: 15 Februari 2026
- Author: Si-Kancil Development Team
- Status: Final Feature Specification
- Next Review: Before UAT

---

**END OF FEATURES v3**
