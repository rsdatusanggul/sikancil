# Pendapatan Modules - Quick Start Guide

## Prerequisites

1. **Backend server running:**
   ```bash
   cd /opt/sikancil/backend
   npm run start:dev
   ```

2. **User authenticated (get JWT token):**
   ```bash
   # Register admin user (if not exists)
   curl -s -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username":"admin",
       "email":"admin@sikancil.id",
       "password":"Admin123",
       "fullName":"Administrator Si-Kancil"
     }'

   # Login to get token
   TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username":"admin",
       "password":"Admin123"
     }' | jq -r '.access_token')

   echo "Token: $TOKEN"
   ```

---

## Module 1: Pendapatan Operasional

### 1. Create Pendapatan Operasional - BPJS

```bash
curl -X POST http://localhost:3000/api/v1/pendapatan/operasional \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorBukti": "PO-2026-001",
    "tanggal": "2026-02-14",
    "sumberDana": "PNBP_FUNGSIONAL",
    "uraian": "Pendapatan Rawat Jalan BPJS - Poli Umum",
    "jumlah": 5000000,
    "jenisPenjamin": "BPJS_KESEHATAN"
  }' | jq
```

**Expected Response:**
```json
{
  "id": "uuid",
  "nomorBukti": "PO-2026-001",
  "tanggal": "2026-02-14T00:00:00.000Z",
  "kategoriPendapatan": "OPERASIONAL_JASA_LAYANAN",
  "sumberDana": "PNBP_FUNGSIONAL",
  "jenisPenjamin": "BPJS_KESEHATAN",
  "uraian": "Pendapatan Rawat Jalan BPJS - Poli Umum",
  "jumlah": 5000000,
  "status": "DRAFT",
  "isPosted": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 2. Create Pendapatan Operasional - Umum

```bash
curl -X POST http://localhost:3000/api/v1/pendapatan/operasional \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorBukti": "PO-2026-002",
    "tanggal": "2026-02-14",
    "sumberDana": "PNBP_FUNGSIONAL",
    "uraian": "Pendapatan IGD Pasien Umum",
    "jumlah": 2500000,
    "jenisPenjamin": "UMUM"
  }' | jq
```

### 3. List Pendapatan with Filters

```bash
# List all
curl -X GET "http://localhost:3000/api/v1/pendapatan/operasional" \
  -H "Authorization: Bearer $TOKEN" | jq

# Filter by date range
curl -X GET "http://localhost:3000/api/v1/pendapatan/operasional?tanggalMulai=2026-02-01&tanggalAkhir=2026-02-28" \
  -H "Authorization: Bearer $TOKEN" | jq

# Filter by penjamin
curl -X GET "http://localhost:3000/api/v1/pendapatan/operasional?jenisPenjamin=BPJS_KESEHATAN" \
  -H "Authorization: Bearer $TOKEN" | jq

# Search
curl -X GET "http://localhost:3000/api/v1/pendapatan/operasional?search=Rawat%20Jalan" \
  -H "Authorization: Bearer $TOKEN" | jq

# Pagination
curl -X GET "http://localhost:3000/api/v1/pendapatan/operasional?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. Workflow: Submit & Approve

```bash
# Get ID from created pendapatan
PENDAPATAN_ID="uuid-from-step-1"

# Submit for approval
curl -X POST "http://localhost:3000/api/v1/pendapatan/operasional/$PENDAPATAN_ID/submit" \
  -H "Authorization: Bearer $TOKEN" | jq

# Approve
curl -X POST "http://localhost:3000/api/v1/pendapatan/operasional/$PENDAPATAN_ID/approve" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 5. Get Summary Reports

```bash
# Summary by Penjamin (date range)
curl -X GET "http://localhost:3000/api/v1/pendapatan/operasional/summary/by-penjamin?tanggalMulai=2026-02-01&tanggalAkhir=2026-02-28" \
  -H "Authorization: Bearer $TOKEN" | jq

# Daily Revenue (monthly)
curl -X GET "http://localhost:3000/api/v1/pendapatan/operasional/summary/daily?tahun=2026&bulan=2" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Module 2: Hibah Management

### 1. Create Hibah - Uang

```bash
curl -X POST http://localhost:3000/api/v1/pendapatan/hibah \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorHibah": "HB-2026-001",
    "nomorSKHibah": "SK/HIB/2026/001",
    "tanggalSKHibah": "2026-02-01",
    "namaPemberiHibah": "Yayasan Peduli Kesehatan Indonesia",
    "alamatPemberiHibah": "Jl. Sudirman No. 123, Jakarta",
    "teleponPemberiHibah": "021-1234567",
    "emailPemberiHibah": "info@ypki.org",
    "jenisHibah": "UANG",
    "uraianHibah": "Hibah untuk pengadaan alat medis dan peningkatan fasilitas RS",
    "nilaiHibah": 100000000,
    "tanggalTerima": "2026-02-14",
    "catatan": "Hibah diterima melalui transfer bank"
  }' | jq
```

**Expected Response:**
```json
{
  "id": "uuid",
  "nomorHibah": "HB-2026-001",
  "nomorSKHibah": "SK/HIB/2026/001",
  "tanggalSKHibah": "2026-02-01T00:00:00.000Z",
  "namaPemberiHibah": "Yayasan Peduli Kesehatan Indonesia",
  "jenisHibah": "UANG",
  "nilaiHibah": 100000000,
  "nilaiTerpakai": 0,
  "sisaHibah": 100000000,
  "statusPenggunaan": "DITERIMA",
  "status": "DRAFT",
  "sudahDilaporkan": false,
  ...
}
```

### 2. Create Hibah - Barang

```bash
curl -X POST http://localhost:3000/api/v1/pendapatan/hibah \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorHibah": "HB-2026-002",
    "nomorSKHibah": "SK/HIB/2026/002",
    "tanggalSKHibah": "2026-02-10",
    "namaPemberiHibah": "PT Teknologi Medis Indonesia",
    "jenisHibah": "BARANG",
    "uraianHibah": "Hibah 5 unit ventilator dan 10 unit infusion pump",
    "detailBarangJasa": [
      {
        "namaBarang": "Ventilator ICU",
        "kuantitas": 5,
        "satuan": "unit",
        "nilaiEstimasi": 250000000
      },
      {
        "namaBarang": "Infusion Pump",
        "kuantitas": 10,
        "satuan": "unit",
        "nilaiEstimasi": 50000000
      }
    ],
    "tanggalTerima": "2026-02-14"
  }' | jq
```

### 3. List Hibah with Filters

```bash
# List all
curl -X GET "http://localhost:3000/api/v1/pendapatan/hibah" \
  -H "Authorization: Bearer $TOKEN" | jq

# Filter by jenis
curl -X GET "http://localhost:3000/api/v1/pendapatan/hibah?jenisHibah=UANG" \
  -H "Authorization: Bearer $TOKEN" | jq

# Filter by status penggunaan
curl -X GET "http://localhost:3000/api/v1/pendapatan/hibah?statusPenggunaan=DITERIMA" \
  -H "Authorization: Bearer $TOKEN" | jq

# Search
curl -X GET "http://localhost:3000/api/v1/pendapatan/hibah?search=Yayasan" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. Workflow: Submit & Approve

```bash
HIBAH_ID="uuid-from-step-1"

# Submit for approval
curl -X POST "http://localhost:3000/api/v1/pendapatan/hibah/$HIBAH_ID/submit" \
  -H "Authorization: Bearer $TOKEN" | jq

# Approve
curl -X POST "http://localhost:3000/api/v1/pendapatan/hibah/$HIBAH_ID/approve" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 5. Record Penggunaan Hibah

```bash
# Record penggunaan sebagian
curl -X POST "http://localhost:3000/api/v1/pendapatan/hibah/$HIBAH_ID/penggunaan" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nilaiDigunakan": 50000000,
    "tanggalPenggunaan": "2026-02-20",
    "keterangan": "Pembelian 2 unit ventilator senilai 50 juta",
    "nomorBuktiPenggunaan": "SPJ-HIB-001"
  }' | jq
```

**Expected Response:**
```json
{
  "id": "uuid",
  "nomorHibah": "HB-2026-001",
  "nilaiHibah": 100000000,
  "nilaiTerpakai": 50000000,
  "sisaHibah": 50000000,
  "statusPenggunaan": "SEBAGIAN_DIGUNAKAN",
  ...
}
```

### 6. Get Tracking Detail

```bash
curl -X GET "http://localhost:3000/api/v1/pendapatan/hibah/$HIBAH_ID/tracking" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "nomorHibah": "HB-2026-001",
  "namaPemberiHibah": "Yayasan Peduli Kesehatan Indonesia",
  "jenisHibah": "UANG",
  "nilaiHibah": 100000000,
  "nilaiTerpakai": 50000000,
  "sisaHibah": 50000000,
  "persentasePenggunaan": 50,
  "statusPenggunaan": "SEBAGIAN_DIGUNAKAN",
  "sudahDilaporkan": false,
  "nomorLaporan": null,
  "tanggalLaporan": null
}
```

### 7. Submit Laporan Pertanggungjawaban

```bash
# After hibah fully used (nilaiTerpakai = nilaiHibah)
curl -X POST "http://localhost:3000/api/v1/pendapatan/hibah/$HIBAH_ID/laporan-pertanggungjawaban" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorLaporan": "LPJ/HIB/2026/001",
    "tanggalLaporan": "2026-03-01",
    "isiLaporan": "Hibah telah digunakan seluruhnya untuk pembelian ventilator sesuai proposal",
    "dokumenLaporan": "/uploads/lpj-hib-001.pdf"
  }' | jq
```

### 8. Get Summary Statistics

```bash
# Overall summary
curl -X GET "http://localhost:3000/api/v1/pendapatan/hibah/summary" \
  -H "Authorization: Bearer $TOKEN" | jq

# Summary for specific year
curl -X GET "http://localhost:3000/api/v1/pendapatan/hibah/summary?tahun=2026" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**
```json
{
  "byJenis": [
    {
      "jenisHibah": "UANG",
      "jumlah": 5,
      "totalNilai": 500000000,
      "totalTerpakai": 250000000,
      "totalSisa": 250000000
    },
    {
      "jenisHibah": "BARANG",
      "jumlah": 3,
      "totalNilai": 0,
      "totalTerpakai": 0,
      "totalSisa": 0
    }
  ],
  "byStatus": [
    {
      "statusPenggunaan": "DITERIMA",
      "jumlah": 2
    },
    {
      "statusPenggunaan": "SEBAGIAN_DIGUNAKAN",
      "jumlah": 3
    },
    {
      "statusPenggunaan": "SUDAH_DIGUNAKAN",
      "jumlah": 2
    },
    {
      "statusPenggunaan": "DILAPORKAN",
      "jumlah": 1
    }
  ],
  "total": {
    "totalHibah": 8,
    "totalNilaiHibah": 500000000,
    "totalNilaiTerpakai": 250000000,
    "totalSisaHibah": 250000000
  }
}
```

---

## Common Scenarios

### Scenario 1: Daily Revenue Entry (BPJS + Umum + Asuransi)

```bash
# Morning: Input BPJS revenue
curl -X POST http://localhost:3000/api/v1/pendapatan/operasional \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorBukti": "PO-2026-014-001",
    "tanggal": "2026-02-14",
    "sumberDana": "PNBP_FUNGSIONAL",
    "uraian": "Rawat Jalan BPJS - 50 pasien",
    "jumlah": 7500000,
    "jenisPenjamin": "BPJS_KESEHATAN"
  }' | jq

# Noon: Input Umum revenue
curl -X POST http://localhost:3000/api/v1/pendapatan/operasional \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorBukti": "PO-2026-014-002",
    "tanggal": "2026-02-14",
    "sumberDana": "PNBP_FUNGSIONAL",
    "uraian": "Rawat Jalan Umum - 20 pasien",
    "jumlah": 5000000,
    "jenisPenjamin": "UMUM"
  }' | jq

# Evening: Check daily total
curl -X GET "http://localhost:3000/api/v1/pendapatan/operasional/summary/daily?tahun=2026&bulan=2" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Scenario 2: Hibah Lifecycle (Received → Used → Reported)

```bash
# Step 1: Create hibah
HIBAH_RESP=$(curl -s -X POST http://localhost:3000/api/v1/pendapatan/hibah \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorHibah": "HB-TEST-001",
    "nomorSKHibah": "SK/TEST/001",
    "tanggalSKHibah": "2026-02-01",
    "namaPemberiHibah": "Test Foundation",
    "jenisHibah": "UANG",
    "uraianHibah": "Test hibah",
    "nilaiHibah": 10000000
  }')

HIBAH_ID=$(echo $HIBAH_RESP | jq -r '.id')
echo "Created Hibah ID: $HIBAH_ID"

# Step 2: Submit & Approve
curl -s -X POST "http://localhost:3000/api/v1/pendapatan/hibah/$HIBAH_ID/submit" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.status'

curl -s -X POST "http://localhost:3000/api/v1/pendapatan/hibah/$HIBAH_ID/approve" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.status'

# Step 3: Use hibah (full amount)
curl -X POST "http://localhost:3000/api/v1/pendapatan/hibah/$HIBAH_ID/penggunaan" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nilaiDigunakan": 10000000,
    "tanggalPenggunaan": "2026-02-20",
    "keterangan": "Full usage for medical equipment"
  }' | jq -r '.statusPenggunaan'

# Step 4: Submit report
curl -X POST "http://localhost:3000/api/v1/pendapatan/hibah/$HIBAH_ID/laporan-pertanggungjawaban" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorLaporan": "LPJ/TEST/001",
    "tanggalLaporan": "2026-03-01",
    "isiLaporan": "Completed"
  }' | jq -r '.statusPenggunaan'

# Should print: DITERIMA → APPROVED → SUDAH_DIGUNAKAN → DILAPORKAN
```

---

## Validation Tests

### Test 1: Duplicate nomorBukti (should fail)

```bash
# Create first
curl -X POST http://localhost:3000/api/v1/pendapatan/operasional \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorBukti": "DUPLICATE-TEST",
    "tanggal": "2026-02-14",
    "sumberDana": "PNBP_FUNGSIONAL",
    "uraian": "Test",
    "jumlah": 1000,
    "jenisPenjamin": "UMUM"
  }'

# Try to create duplicate (should fail with 409 Conflict)
curl -X POST http://localhost:3000/api/v1/pendapatan/operasional \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorBukti": "DUPLICATE-TEST",
    "tanggal": "2026-02-14",
    "sumberDana": "PNBP_FUNGSIONAL",
    "uraian": "Test",
    "jumlah": 1000,
    "jenisPenjamin": "UMUM"
  }'
```

### Test 2: Over-use Hibah (should fail)

```bash
# Create hibah with 10M
# Try to use 15M (should fail with 400 Bad Request)
curl -X POST "http://localhost:3000/api/v1/pendapatan/hibah/$HIBAH_ID/penggunaan" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nilaiDigunakan": 15000000,
    "tanggalPenggunaan": "2026-02-20",
    "keterangan": "Over-use test"
  }'
```

---

## Next Steps

After testing these modules:

1. ✅ **Verify all CRUD operations work**
2. ✅ **Test workflow (Draft → Submit → Approve)**
3. ✅ **Test validation rules**
4. ✅ **Test summary reports**
5. ⏭️ **Proceed to SIMRS Integration** (next priority)
6. ⏭️ **Implement Auto-Posting Journal**
7. ⏭️ **Implement Piutang Module**

---

**Happy Testing! 🚀**
