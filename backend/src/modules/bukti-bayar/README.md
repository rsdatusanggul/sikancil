# Modul Bukti Bayar

## 📋 Overview

Modul Bukti Bayar adalah bagian dari workflow belanja BLUD yang berfungsi sebagai **gatekeeper** untuk memastikan bahwa setiap pembayaran tidak melebihi saldo anggaran kas yang tersedia.

### Workflow Belanja BLUD
```
Anggaran Kas → Bukti Bayar → SPP → SPM → SP2D
```

## 🎯 Tujuan

1. **Validasi Saldo**: Memastikan setiap pembayaran memiliki dana yang cukup di anggaran kas
2. **Kontrol Pengeluaran**: Mencegah over-spending pada setiap jenis belanja
3. **Audit Trail**: Melacak semua bukti pembayaran dengan workflow approval
4. **Integrasi**: Menjadi dasar pembuatan SPP dalam workflow belanja

## 🔑 Fitur Utama

### 1. Validasi Saldo Otomatis
- ✅ Mengecek saldo anggaran kas sebelum membuat bukti bayar
- ✅ Validasi per jenis belanja (Pegawai, Barang/Jasa, Modal, Lain)
- ✅ Menghitung total bukti bayar yang sudah dibuat
- ✅ Error handling yang jelas jika saldo tidak mencukupi

### 2. Workflow Approval
```
DRAFT → SUBMITTED → VERIFIED → APPROVED → USED
   ↓                   ↓
REJECTED ←────────────┘
```

**Status Description:**
- `DRAFT`: Masih draft, bisa diedit/dihapus
- `SUBMITTED`: Sudah diajukan untuk verifikasi
- `VERIFIED`: Sudah diverifikasi oleh verifikator
- `APPROVED`: Sudah disetujui, siap dibuat SPP
- `REJECTED`: Ditolak (bisa direvisi)
- `USED`: Sudah digunakan untuk membuat SPP

### 3. CRUD Operations
- Create: Buat bukti bayar baru dengan validasi saldo
- Read: List dengan filter, detail dengan relasi
- Update: Update data (hanya DRAFT & REJECTED)
- Delete: Hapus bukti bayar (hanya DRAFT & REJECTED)

### 4. Approval Actions
- Submit: Ajukan untuk verifikasi
- Verify: Verifikasi oleh verifikator
- Approve: Setujui oleh approver
- Reject: Tolak dengan alasan

## 📊 Database Schema

### Table: `bukti_bayar`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| nomorBuktiBayar | VARCHAR(100) | Nomor unik bukti bayar |
| tanggalBuktiBayar | TIMESTAMP | Tanggal bukti bayar |
| tahunAnggaran | INT | Tahun anggaran |
| bulan | INT | Bulan (1-12) |
| anggaranKasId | UUID | FK ke anggaran_kas |
| nilaiPembayaran | DECIMAL(15,2) | Nilai pembayaran |
| uraian | TEXT | Uraian pembayaran |
| jenisBelanja | ENUM | PEGAWAI, BARANG_JASA, MODAL, LAIN |
| status | ENUM | Status workflow |
| ... | | (approval fields) |

### Relations

```
AnggaranKas (1) ──< (N) BuktiBayar (1) ──< (N) SPP
```

- **BuktiBayar** belongs to **AnggaranKas** (Many-to-One)
- **BuktiBayar** has many **SPP** (One-to-Many)

## 🔌 API Endpoints

### CRUD Operations

```http
POST   /bukti-bayar
GET    /bukti-bayar
GET    /bukti-bayar/:id
PUT    /bukti-bayar/:id
DELETE /bukti-bayar/:id
```

### Workflow Actions

```http
POST   /bukti-bayar/:id/submit
POST   /bukti-bayar/:id/verify
POST   /bukti-bayar/:id/approve
POST   /bukti-bayar/:id/reject
```

### Helper Endpoints

```http
GET    /bukti-bayar/:anggaranKasId/sisa-saldo/:jenisBelanja
```

## 📝 Request & Response Examples

### Create Bukti Bayar

**Request:**
```json
{
  "nomorBuktiBayar": "BB-001/BLUD/2026",
  "tanggalBuktiBayar": "2026-02-15",
  "tahunAnggaran": 2026,
  "bulan": 2,
  "anggaranKasId": "uuid-anggaran-kas",
  "nilaiPembayaran": 5000000,
  "uraian": "Pembayaran gaji pegawai Februari 2026",
  "jenisBelanja": "PEGAWAI",
  "namaPenerima": "John Doe",
  "bankPenerima": "Bank Mandiri",
  "rekeningPenerima": "1234567890"
}
```

**Response:**
```json
{
  "id": "uuid",
  "nomorBuktiBayar": "BB-001/BLUD/2026",
  "status": "DRAFT",
  "anggaranKas": {
    "id": "uuid",
    "bulan": 2,
    "tahun": 2026,
    "belanjaPegawai": 50000000
  },
  ...
}
```

### Check Sisa Saldo

**Request:**
```http
GET /bukti-bayar/uuid-anggaran-kas/sisa-saldo/PEGAWAI
```

**Response:**
```json
{
  "sisaSaldo": 45000000,
  "totalTerpakai": 5000000,
  "totalAnggaran": 50000000
}
```

## 🔒 Business Rules

### 1. Validasi Saldo
- Sistem akan mengecek saldo anggaran kas berdasarkan jenis belanja
- Total bukti bayar (status bukan DRAFT/REJECTED) + nilai baru ≤ anggaran
- Jika saldo tidak cukup, sistem akan reject dengan error message

### 2. Update & Delete
- Hanya status `DRAFT` dan `REJECTED` yang bisa diupdate/delete
- Status lain sudah masuk workflow dan tidak bisa diubah

### 3. Workflow
- Submit: DRAFT → SUBMITTED
- Verify: SUBMITTED → VERIFIED
- Approve: VERIFIED → APPROVED
- Reject: SUBMITTED/VERIFIED → REJECTED
- Used: APPROVED → USED (otomatis saat SPP dibuat)

### 4. Nomor Bukti Bayar
- Harus unik
- Format: BB-XXX/BLUD/YYYY
- Disarankan auto-generate di frontend

## 🧪 Testing

### Test Scenarios

1. **Create dengan Saldo Cukup**
   - ✅ Berhasil membuat bukti bayar
   - ✅ Status = DRAFT

2. **Create dengan Saldo Tidak Cukup**
   - ❌ Error: Saldo tidak mencukupi
   - ❌ Tidak membuat record

3. **Update Status APPROVED**
   - ❌ Error: Tidak bisa update status APPROVED

4. **Delete Status DRAFT**
   - ✅ Berhasil dihapus

5. **Workflow Complete**
   - ✅ DRAFT → SUBMITTED → VERIFIED → APPROVED

## 📁 File Structure

```
src/modules/bukti-bayar/
├── dto/
│   ├── create-bukti-bayar.dto.ts
│   ├── update-bukti-bayar.dto.ts
│   ├── bukti-bayar-response.dto.ts
│   └── index.ts
├── bukti-bayar.controller.ts
├── bukti-bayar.service.ts
├── bukti-bayar.module.ts
└── README.md (this file)
```

## 🔗 Dependencies

### Entities
- `BuktiBayar` - Main entity
- `AnggaranKas` - Source of funds
- `SPP` - Related payment requests

### Enums
- `StatusBuktiBayar` - Status workflow
- `JenisBelanjaBuktiBayar` - Expenditure types

## 🚀 Future Enhancements

1. **Auto-numbering**: Generate nomor bukti bayar otomatis
2. **Notifikasi**: Email/push notification untuk approval
3. **Attachment**: Upload file lampiran pendukung
4. **Bulk Create**: Buat multiple bukti bayar sekaligus
5. **Report**: Laporan bukti bayar per periode
6. **Export**: Export ke PDF/Excel

## 👥 Users & Permissions

| Role | Permissions |
|------|-------------|
| **Pembuat** | Create, Submit |
| **Verifikator** | Verify, Reject |
| **Approver** | Approve, Reject |
| **Admin** | Full access |

## 📞 Support

Jika ada pertanyaan atau issue terkait modul ini, silakan hubungi:
- **Backend Team**
- **Documentation**: [MODULE_INDEX.md](/opt/sikancil/frontend/MODULE_INDEX.md)

---

**Created**: 2026-02-15
**Version**: 1.0.0
**Author**: Backend Team
