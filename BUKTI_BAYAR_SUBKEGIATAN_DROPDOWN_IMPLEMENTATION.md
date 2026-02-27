# Implementasi Dropdown Subkegiatan untuk Bukti Bayar

## Masalah
User merasa form bukti bayar terlalu ribet karena harus input manual:
- Kode Program
- ID Program (UUID)
- Kode Kegiatan
- ID Kegiatan (UUID)
- Nama Program
- Nama Kegiatan

Padahal pagu sudah dipecah sampai level subkegiatan, jadi lebih efisien jika user hanya memilih subkegiatan dari dropdown.

## Solusi
Mengubah form bukti bayar untuk menggunakan dropdown subkegiatan dengan pencarian, yang otomatis mengisi semua field terkait (program dan kegiatan).

## Perubahan yang Dilakukan

### Backend

#### 1. Controller: `backend/src/modules/bukti-bayar/bukti-bayar.controller.ts`
- Menambahkan endpoint `GET /payment-vouchers/subkegiatan`
- Menerima query parameter:
  - `tahun` (opsional): Filter berdasarkan tahun anggaran
  - `search` (opsional): Pencarian berdasarkan kode atau nama subkegiatan

```typescript
@Get('subkegiatan')
async getSubkegiatanDropdown(
  @Query('tahun') tahun?: number,
  @Query('search') search?: string,
) {
  return await this.budgetSvc.getSubkegiatanDropdown(tahun, search);
}
```

#### 2. Service: `backend/src/modules/bukti-bayar/services/budget-validation.service.ts`
- Menambahkan method `getSubkegiatanDropdown()`
- Mengambil data subkegiatan dengan JOIN ke program dan kegiatan
- Mengembalikan data lengkap:
  - id
  - kodeSubKegiatan, namaSubKegiatan
  - kegiatanId, kodeKegiatan, namaKegiatan
  - programId, kodeProgram, namaProgram
  - tahun

Query SQL:
```sql
SELECT 
  sk.id as id,
  sk.kode_subkegiatan as "kodeSubKegiatan",
  sk.nama_subkegiatan as "namaSubKegiatan",
  sk.kegiatan_id as "kegiatanId",
  k.kode_kegiatan as "kodeKegiatan",
  k.nama_kegiatan as "namaKegiatan",
  k.program_id as "programId",
  p.kode_program as "kodeProgram",
  p.nama_program as "namaProgram",
  sk.tahun as "tahun"
FROM subkegiatan_rba sk
LEFT JOIN kegiatan_rba k ON sk.kegiatan_id = k.id
LEFT JOIN program_rba p ON k.program_id = p.id
WHERE sk.is_active = true
ORDER BY sk.tahun DESC, p.kode_program ASC, k.kode_kegiatan ASC, sk.kode_subkegiatan ASC
LIMIT 100
```

### Frontend

#### 3. Component: `frontend/src/features/bukti-bayar/BuktiBayarCreate.tsx`
Mengubah section "Program & Kegiatan" menjadi "Pilih Subkegiatan":

**Fitur Baru:**
- Dropdown dengan pencarian real-time
- Menampilkan 3 baris informasi per item:
  - Subkegiatan (kode dan nama)
  - Kegiatan (kode dan nama)
  - Program (kode dan nama) | Tahun
- Saat item dipilih, otomatis mengisi semua field:
  - subKegiatanId, subKegiatanCode, subKegiatanName
  - kegiatanId, kegiatanCode, kegiatanName
  - programId, programCode, programName
- Menampilkan box informasi terpilih setelah memilih subkegiatan
- Filter otomatis berdasarkan tahun anggaran yang dipilih
- Pencarian minimal 2 karakter

**State Baru:**
```typescript
const [subkegiatanQuery, setSubkegiatanQuery] = useState('');
const [showSubkegiatanDropdown, setShowSubkegiatanDropdown] = useState(false);

// Query untuk fetch data
const { data: subkegiatanList = [] } = useQuery({
  queryKey: ['subkegiatan-dropdown', formData.fiscalYear, subkegiatanQuery],
  queryFn: () => apiClient.get('/payment-vouchers/subkegiatan', {
    params: { 
      tahun: formData.fiscalYear,
      search: subkegiatanQuery.length >= 2 ? subkegiatanQuery : undefined 
    },
  }).then((res) => res.data),
  enabled: !!formData.fiscalYear,
});
```

**Handler untuk memilih subkegiatan:**
```typescript
const handleSubkegiatanSelect = (item: SubkegiatanDropdownItem) => {
  setFormData({ 
    ...formData, 
    subKegiatanId: item.id,
    subKegiatanCode: item.kodeSubKegiatan,
    subKegiatanName: item.namaSubKegiatan,
    kegiatanId: item.kegiatanId,
    kegiatanCode: item.kodeKegiatan,
    kegiatanName: item.namaKegiatan,
    programId: item.programId,
    programCode: item.kodeProgram,
    programName: item.namaProgram,
  });
  setSubkegiatanQuery(`${item.kodeSubKegiatan} - ${item.namaSubKegiatan}`);
  setShowSubkegiatanDropdown(false);
};
```

#### 4. Types: `frontend/src/features/bukti-bayar/types.ts`
Menambahkan interface baru:

```typescript
export interface SubkegiatanDropdownItem {
  id: string;
  kodeSubKegiatan: string;
  namaSubKegiatan: string;
  kegiatanId: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  programId: string;
  kodeProgram: string;
  namaProgram: string;
  tahun: number;
}
```

## Manfaat

1. **UX Lebih Baik**: User tidak perlu mengingat dan menginput manual kode-kode yang rumit
2. **Mengurangi Error**: Mencegah typo atau mismatch antara kode dan UUID
3. **Efisiensi**: Satu klik mengisi 9 field sekaligus
4. **Konsistensi**: Data yang terjamin konsisten karena diambil langsung dari database
5. **Pencarian**: User bisa mencari berdasarkan kode atau nama subkegiatan
6. **Filter Tahun**: Otomatis filter berdasarkan tahun anggaran yang dipilih

## Alur Penggunaan

1. User memilih tahun anggaran
2. User mulai mengetik di field "Subkegiatan"
3. Sistem menampilkan dropdown dengan hasil pencarian (min. 2 karakter)
4. User melihat informasi lengkap (subkegiatan, kegiatan, program) di dropdown
5. User mengklik item yang diinginkan
6. Sistem otomatis mengisi semua field terkait
7. Budget check dijalankan menggunakan subkegiatanId yang terpilih

## Testing

Untuk testing fitur ini:

1. Pastikan ada data subkegiatan di database
2. Buka halaman buat bukti bayar
3. Pilih tahun anggaran
4. Ketik kode atau nama subkegiatan di field pencarian
5. Verifikasi dropdown muncul dengan data yang sesuai
6. Pilih salah satu subkegiatan
7. Verifikasi semua field program dan kegiatan terisi otomatis
8. Verifikasi box informasi terpilih muncul dengan data yang benar
9. Isi field lainnya (kode rekening, jumlah, dll)
10. Verifikasi budget check bekerja dengan subkegiatanId yang terpilih
11. Submit dan verifikasi bukti bayar berhasil dibuat

## Catatan Penting

- Budget check sekarang menggunakan `subKegiatanId` sebagai parameter utama
- Field kegiatanId tetap dikirim ke backend untuk backward compatibility
- Validasi backend sudah support subkegiatanId
- Dropdown memiliki limit 100 item untuk performance