# Bug Fix: Bukti Bayar Creation Errors

## Problem Description

Saat pembuatan bukti bayar, setelah memilih kode rekening dan input nominal:
1. Perhitungan pajak tidak muncul
2. Tidak bisa melakukan simpan dengan error:
```json
{
  "message": [
    "property month should not exist",
    "property payeeAddress should not exist",
    "property payeeNpwp should not exist",
    "voucherDate should not be empty",
    "voucherDate must be a valid ISO 8601 date string",
    "programId should not be empty",
    "programId must be a UUID",
    "programCode must be shorter than or equal to 30 characters",
    "programCode should not be empty",
    "programCode must be a string",
    "kegiatanId should not be empty",
    "kegiatanId must be a UUID",
    "kegiatanCode must be shorter than or equal to 30 characters",
    "kegiatanCode should not be empty",
    "kegiatanCode must be a string"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Root Cause Analysis

### Issues Identified:

1. **Missing Required Fields**: Frontend DTO tidak sesuai dengan backend DTO (`CreatePaymentVoucherDto`)
   - `voucherDate` tidak ada
   - `programId`, `programCode`, `kegiatanId`, `kegiatanCode` tidak ada

2. **Incorrect Field Names**:
   - Frontend menggunakan `payeeAddress` dan `payeeNpwp`
   - Backend mengharapkan `vendorAddress` dan `vendorNpwp`

3. **Unnecessary Field**:
   - Frontend mengirim `month` tetapi backend meng-ekstraknya dari `voucherDate`

4. **Tax Preview Not Working**:
   - Karena kegiatanId kosong (required field), tax preview tidak ter-trigger

## Changes Made

### 1. Updated `frontend/src/features/bukti-bayar/types.ts`

**Before:**
```typescript
export interface CreateBuktiBayarDto {
  programId?: string;
  kegiatanId?: string;
  subKegiatanId?: string;
  accountCode: string;
  accountName?: string;
  payeeName: string;
  payeeAddress?: string;
  payeeNpwp?: string;
  grossAmount: number;
  paymentPurpose: string;
  month: number;
  fiscalYear: number;
  receiverName?: string;
  receiverNip?: string;
}
```

**After:**
```typescript
export interface CreateBuktiBayarDto {
  voucherDate: string;
  fiscalYear: number;
  unitCode?: string;
  programId: string;
  programCode: string;
  programName?: string;
  kegiatanId: string;
  kegiatanCode: string;
  kegiatanName?: string;
  subKegiatanId?: string;
  subKegiatanCode?: string;
  subKegiatanName?: string;
  accountCode: string;
  accountName: string;
  payeeName?: string;
  paymentPurpose: string;
  vendorName?: string;
  vendorNpwp?: string;
  vendorAddress?: string;
  grossAmount: number;
  // Tax fields (optional - auto-calculated by backend)
  pph21Rate?: number;
  pph21Amount?: number;
  pph22Rate?: number;
  pph22Amount?: number;
  pph23Rate?: number;
  pph23Amount?: number;
  pph24Rate?: number;
  pph24Amount?: number;
  ppnRate?: number;
  ppnAmount?: number;
  otherDeductions?: number;
  otherDeductionsNote?: string;
  // UMKM data (optional)
  skUmkmNumber?: string;
  skUmkmExpiry?: string;
}
```

### 2. Updated `frontend/src/features/bukti-bayar/BuktiBayarCreate.tsx`

#### Changes:
1. **Form Initialization**: Added required fields with default values
2. **Tax Preview Query**: Changed `payeeNpwp` to `vendorNpwp`
3. **Budget Check Query**: Extracted month from `voucherDate` instead of using separate `month` field
4. **Added Program & Kegiatan Section**: New form section with all required fields
5. **Updated Vendor Fields**: Changed from `payeeAddress/payeeNpwp` to `vendorAddress/vendorNpwp`

**New Form Sections Added:**

**Program & Kegiatan:**
- Kode Program (required)
- Kode Kegiatan (required)
- ID Program/UUID (required)
- ID Kegiatan/UUID (required)
- Nama Program (optional)
- Nama Kegiatan (optional)

**Updated General Info:**
- Tahun Anggaran (required)
- Tanggal Bukti Bayar (required) - replaces "Bulan" field

**Updated Vendor Info:**
- Penerima Uang (required)
- Alamat Vendor (optional) - was "Alamat Penerima"
- NPWP Vendor (optional) - was "NPWP Penerima"

## How to Test

### Prerequisites:
1. Pastikan data Program dan Kegiatan RBA sudah ada untuk tahun anggaran yang dipilih
2. Pastikan data Kode Rekening sudah tersedia

### Test Steps:

1. **Buka Form Bukti Bayar Baru**
   - Navigate to `/bukti-bayar/create`

2. **Isi Informasi Umum**
   - Tahun Anggaran: `2025`
   - Tanggal Bukti Bayar: Pilih tanggal hari ini

3. **Isi Program & Kegiatan**
   - Kode Program: `01.02.02` (contoh)
   - Kode Kegiatan: `1.02.02.2.02` (contoh)
   - ID Program: Masukkan UUID program yang valid
   - ID Kegiatan: Masukkan UUID kegiatan yang valid
   - Nama Program: Isi sesuai data
   - Nama Kegiatan: Isi sesuai data

4. **Isi Informasi Pembayaran**
   - Penerima Uang: `PT. CONTOH SEJAHTERA`
   - Alamat Vendor: `Jl. Contoh No. 1`
   - NPWP Vendor: `01.234.567.8-901.000`
   - Kode Rekening: Ketik minimal 2 karakter, pilih dari dropdown
   - Jumlah Tagihan: `10000000`
   - Tujuan Pembayaran: Isi deskripsi pembayaran

5. **Verifikasi Tax Preview Muncul**
   - Setelah input kode rekening dan nominal, preview pajak harus muncul
   - Cek perhitungan PPh 21, PPh 22, PPh 23, PPh 24, dan PPN

6. **Verifikasi Budget Check Muncul**
   - Cek ketersediaan anggaran
   - Pastikan tidak ada error

7. **Simpan Draft**
   - Klik "Simpan Draft"
   - Seharusnya berhasil dan redirect ke detail page

## Validation Rules

### Backend Validation (from `CreatePaymentVoucherDto`):
- `voucherDate`: Required, ISO 8601 date string
- `fiscalYear`: Required, number
- `programId`: Required, valid UUID
- `programCode`: Required, max 30 characters
- `kegiatanId`: Required, valid UUID
- `kegiatanCode`: Required, max 30 characters
- `accountCode`: Required, max 60 characters
- `accountName`: Required
- `paymentPurpose`: Required
- `grossAmount`: Required, positive number

### Important Notes:
- Backend auto-calculates tax based on `tax_rules` table
- Tax fields (pph21Rate, pph22Rate, etc.) are optional
- If tax fields not provided, backend will calculate automatically
- Backend extracts month from `voucherDate`, no separate month field needed

## Related Files Modified

1. `frontend/src/features/bukti-bayar/types.ts`
   - Updated `CreateBuktiBayarDto` interface

2. `frontend/src/features/bukti-bayar/BuktiBayarCreate.tsx`
   - Updated form initialization
   - Added Program & Kegiatan section
   - Updated field names (vendorAddress, vendorNpwp)
   - Fixed tax preview and budget check queries
   - Replaced month field with voucherDate

## Future Improvements

### Recommended Enhancements:

1. **Autocomplete for Program & Kegiatan**:
   - Fetch programs from `/program-rba/active/:tahun`
   - Fetch kegiatan from `/kegiatan-rba/by-program/:programId`
   - Display dropdown with code and name
   - Auto-fill ID/UUID when selected

2. **Auto-fill Program Code**:
   - When user selects program from dropdown, auto-fill:
     - `programId` (UUID)
     - `programCode`
     - `programName`

3. **Auto-fill Kegiatan Code**:
   - When user selects kegiatan from dropdown, auto-fill:
     - `kegiatanId` (UUID)
     - `kegiatanCode`
     - `kegiatanName`

4. **Better Validation**:
   - Validate UUID format before submission
   - Show helpful error messages
   - Real-time validation feedback

5. **Form State Management**:
   - Use Formik or React Hook Form for better form handling
   - Better error handling
   - Form reset functionality

## Conclusion

Bug ini disebabkan oleh ketidaksesuaian antara frontend DTO dan backend DTO. Perbaikan dilakukan dengan:
1. Menambahkan semua required fields yang hilang
2. Mengoreksi nama field yang salah
3. Menghapus field yang tidak dibutuhkan backend
4. Menambahkan section Program & Kegiatan yang lengkap

Setelah perbaikan, form sekarang:
- ✓ Menampilkan tax preview dengan benar
- ✓ Menampilkan budget check dengan benar
- ✓ Bisa menyimpan draft tanpa error
- ✓ Sesuai dengan validasi backend