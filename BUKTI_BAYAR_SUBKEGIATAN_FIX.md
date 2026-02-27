# Perbaikan Dropdown Subkegiatan di Bukti Bayar

## Masalah
Pencarian subkegiatan di form pembuatan Bukti Bayar tidak berfungsi. Saat user mengetik "rehab", data subkegiatan tidak muncul di dropdown.

## Root Cause
Query SQL menggunakan nama kolom snake_case (`kegiatan_id`) padahal database menggunakan camelCase (`kegiatanId`).

## Solusi

### 1. Perbaikan Query SQL
**File**: `backend/src/modules/bukti-bayar/services/budget-validation.service.ts`

Perbaikan pada method `getSubkegiatanDropdown()`:

```typescript
// Sebelumnya (SALAH - menggunakan snake_case)
LEFT JOIN kegiatan_rba k ON sk.kegiatan_id = k.id

// Sesudah (BENAR - menggunakan camelCase dengan quote)
LEFT JOIN kegiatan_rba k ON sk."kegiatanId" = k.id
```

Query lengkap yang benar:

```sql
SELECT 
  sk.id as id,
  sk."kodeSubKegiatan" as "kodeSubKegiatan",
  sk."namaSubKegiatan" as "namaSubKegiatan",
  sk."kegiatanId" as "kegiatanId",
  k."kodeKegiatan" as "kodeKegiatan",
  k."namaKegiatan" as "namaKegiatan",
  k."programId" as "programId",
  p."kodeProgram" as "kodeProgram",
  p."namaProgram" as "namaProgram",
  sk.tahun as "tahun"
FROM subkegiatan_rba sk
LEFT JOIN kegiatan_rba k ON sk."kegiatanId" = k.id
LEFT JOIN program_rba p ON k."programId" = p.id
WHERE sk."isActive" = true
```

### 2. Struktur Database
Berikut adalah struktur tabel `subkegiatan_rba` yang valid:

```
Column         | Type                | Nullable
----------------+---------------------+----------
id              | uuid                | NOT NULL
kodeSubKegiatan | character varying(20)| NOT NULL
namaSubKegiatan | character varying(500)| NOT NULL
kegiatanId      | uuid                | NOT NULL
isActive        | boolean             | NOT NULL
tahun           | integer             | NOT NULL
```

### 3. Fitur Pencarian
Method mendukung:
- **Filter by tahun**: `?tahun=2025`
- **Search**: `?search=rehab` (mencari di kode dan nama subkegiatan)
- Case-insensitive search menggunakan `ILIKE`

### 4. Endpoint API
```
GET /api/payment-vouchers/subkegiatan?tahun=2025&search=rehab
```

Response format:
```json
[
  {
    "id": "uuid",
    "kodeSubKegiatan": "1.02.01",
    "namaSubKegiatan": "Rehabilitasi Gedung",
    "kegiatanId": "uuid",
    "kodeKegiatan": "1.02",
    "namaKegiatan": "Pemeliharaan Gedung",
    "programId": "uuid",
    "kodeProgram": "1",
    "namaProgram": "Program Bangunan",
    "tahun": 2025
  }
]
```

## Implementasi Frontend

### File: `frontend/src/features/bukti-bayar/BuktiBayarCreate.tsx`

Form sekarang menggunakan dropdown subkegiatan dengan autocomplete:

```typescript
<FormField label="Subkegiatan">
  <Combobox
    value={formData.subkegiatanId}
    onChange={(value) => setFieldValue('subkegiatanId', value)}
    options={subkegiatanOptions}
    placeholder="Pilih subkegiatan..."
    searchable
    searchPlaceholder="Ketik untuk mencari..."
    displayValue={(option) => 
      `${option.kodeSubKegiatan} - ${option.namaSubKegiatan}`
    }
  />
</FormField>
```

### File: `frontend/src/features/bukti-bayar/api.ts`

API function untuk mengambil data subkegiatan:

```typescript
export async function getSubkegiatanDropdown(
  tahun?: number,
  search?: string
): Promise<SubkegiatanDropdownItem[]> {
  const params = new URLSearchParams();
  if (tahun) params.append('tahun', tahun.toString());
  if (search) params.append('search', search);

  const response = await fetch(
    `${API_URL}/payment-vouchers/subkegiatan?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  
  if (!response.ok) throw new Error('Failed to fetch subkegiatan');
  return response.json();
}
```

## Cara Testing

### 1. Test di Browser
1. Buka aplikasi di browser
2. Login sebagai user yang memiliki akses Bukti Bayar
3. Navigasi ke menu **Bukti Bayar** > **Buat Baru**
4. Cari field **Subkegiatan**
5. Ketik "rehab" di field pencarian
6. Verifikasi bahwa dropdown muncul dengan data subkegiatan yang mengandung kata "rehab"

### 2. Test via API (dengan curl)
```bash
# Test tanpa filter
curl "http://localhost:3001/api/payment-vouchers/subkegiatan" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test dengan filter tahun
curl "http://localhost:3001/api/payment-vouchers/subkegiatan?tahun=2025" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test dengan search
curl "http://localhost:3001/api/payment-vouchers/subkegiatan?search=rehab" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test dengan filter tahun dan search
curl "http://localhost:3001/api/payment-vouchers/subkegiatan?tahun=2025&search=rehab" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test via Browser DevTools
1. Buka Browser DevTools (F12)
2. Tab Network
3. Cari request ke `/api/payment-vouchers/subkegiatan`
4. Cek status code (harus 200)
5. Cek response JSON

## Troubleshooting

### Masalah: Backend error "column sk.kegiatan_id does not exist"
**Solusi**: Pastikan query SQL menggunakan camelCase dengan quote: `sk."kegiatanId"`

### Masalah: Dropdown tidak muncul
**Solusi**: 
1. Cek apakah backend sudah direstart
2. Cek log backend: `pm2 logs sikancil-backend --lines 50`
3. Verifikasi token authorization valid

### Masalah: Pencarian tidak berfungsi
**Solusi**:
1. Pastikan parameter `search` dikirim dengan benar
2. Cek apakah ada data subkegiatan yang cocok
3. Verifikasi parameter `tahun` sesuai dengan data yang ada

## Status Implementasi

✅ Backend service method `getSubkegiatanDropdown()` sudah diperbaiki
✅ Query SQL sudah menggunakan camelCase yang benar
✅ Frontend sudah memiliki dropdown subkegiatan dengan autocomplete
✅ API endpoint sudah terdaftar di controller
✅ Types sudah didefinisikan di `types.ts`
✅ Error handling sudah diimplementasikan

## Catatan Penting

1. **Nama kolom di database menggunakan camelCase**, bukan snake_case
2. **PostgreSQL mengharuskan quote `"` untuk nama kolom camelCase**
3. **Query SQL harus menggunakan `ILIKE` untuk case-insensitive search**
4. **Frontend mengirim parameter `tahun` otomatis berdasarkan tahun anggaran saat ini**

## Related Files

- Backend: `backend/src/modules/bukti-bayar/services/budget-validation.service.ts`
- Backend: `backend/src/modules/bukti-bayar/bukti-bayar.controller.ts`
- Frontend: `frontend/src/features/bukti-bayar/BuktiBayarCreate.tsx`
- Frontend: `frontend/src/features/bukti-bayar/api.ts`
- Frontend: `frontend/src/features/bukti-bayar/types.ts`