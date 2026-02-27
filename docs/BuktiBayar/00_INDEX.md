# Modul Bukti Pembayaran - Implementation Guide
## SI-KANCIL | RSUD Datu Sanggul Rantau

**Version:** 1.0  
**Date:** 17 Februari 2026  
**Status:** Ready for Development

---

## Daftar File Implementasi

| File | Isi | Priority |
|------|-----|----------|
| `01_DATABASE.md` | Schema PostgreSQL, migrations, seed data | 🔴 P1 |
| `02_PRISMA_SCHEMA.md` | Prisma schema & TypeORM entities | 🔴 P1 |
| `03_BACKEND_STRUCTURE.md` | NestJS module structure & file list | 🔴 P1 |
| `04_DTO.md` | Request/Response DTOs lengkap | 🔴 P1 |
| `05_SERVICE.md` | Business logic & service layer | 🔴 P1 |
| `06_CONTROLLER.md` | REST API controllers & endpoints | 🔴 P1 |
| `07_TAX_ENGINE.md` | Smart tax calculation engine | 🔴 P1 |
| `08_BUDGET_VALIDATION.md` | Budget & RAK validation logic | 🔴 P1 |
| `09_NUMBERING.md` | Auto-numbering system | 🔴 P1 |
| `10_WORKFLOW.md` | Approval workflow & status machine | 🟡 P2 |
| `11_PDF_TEMPLATE.md` | PDF generation & print template | 🟡 P2 |
| `12_QR_CODE.md` | QR code generation & verification | 🟡 P2 |
| `13_FRONTEND.md` | React components & UI guide | 🟡 P2 |
| `14_TESTING.md` | Unit, integration & E2E tests | 🟢 P3 |
| `15_SEED_DATA.md` | Tax rules & sample data seed | 🟡 P2 |

---

## Ringkasan Modul

### Posisi dalam Workflow BLUD:
```
RAK (disetujui)
    ↓
PPTK → BUKTI PEMBAYARAN  ← [MODUL INI]
    ↓ (jika pagu & RAK cukup)
SPP (Surat Permintaan Pembayaran)
    ↓
SPM (Surat Perintah Membayar)
    ↓
SP2D (Surat Perintah Pencairan Dana)
    ↓
BKU (Buku Kas Umum)
```

### Formula Keuangan:
```
GROSS AMOUNT  = Nilai Invoice/Tagihan dari Vendor
TOTAL PAJAK   = PPh21 + PPh22 + PPh23 + PPh24 + PPN + Lainnya
NET PAYMENT   = GROSS - TOTAL PAJAK  ← Yang diterima vendor

Dokumen menampilkan:
  Uang Sejumlah  → GROSS
  Jumlah Diterima → NET
  Potongan       → hanya yang > 0 yang ditampilkan
```

### Format Nomor:
```
nomorurut / koderekening / bulan / unit / tahun
0023      / 5.2.02.10.01.0003 / 01  / RSUD-DS / 2025
```

### Layout Tanda Tangan (Pyramid):
```
[Pejabat Teknis]     [Yang Menerima / PPTK]
       [Bendahara Pengeluaran BLUD]
              [Direktur RSUD]
                                         [QR]
```

---

## Tech Stack yang Digunakan

- **Backend:** NestJS 11.x + TypeORM 0.3.x
- **Database:** PostgreSQL 17
- **Cache:** Redis 7
- **PDF:** Puppeteer / PDFKit
- **QR Code:** qrcode library
- **Frontend:** React + Vite + Tailwind CSS
- **Testing:** Jest + Supertest

---

## Estimasi Development

| Task | Estimasi |
|------|----------|
| Database & Migration | 1 hari |
| Backend API (CRUD + Workflow) | 3 hari |
| Tax Engine | 2 hari |
| Budget Validation | 1 hari |
| PDF & QR Code | 2 hari |
| Frontend UI | 3 hari |
| Testing | 2 hari |
| **Total** | **~14 hari** |
