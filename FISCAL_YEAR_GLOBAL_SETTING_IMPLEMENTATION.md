# Implementasi Pengaturan Tahun Anggaran Global

## Ringkasan
Mengubah sistem pengaturan tahun anggaran dari per-modul menjadi global (satu pengaturan untuk seluruh aplikasi).

## Perubahan Utama

### 1. Backend Changes

#### 1.1 Database Schema
- **File**: `backend/src/database/migrations/1771142131000-AddActiveFiscalYearToUsers.ts`
- Menambahkan kolom `activeFiscalYearId` pada tabel `users`
- Kolom ini menyimpan ID tahun anggaran yang aktif untuk setiap user

#### 1.2 User Entity
- **File**: `backend/src/modules/users/entities/user.entity.ts`
- Menambahkan property `activeFiscalYearId` dengan tipe `uuid | null`

#### 1.3 Login DTO
- **File**: `backend/src/modules/auth/dto/login.dto.ts`
- Menambahkan field `fiscalYearId` (optional)
- Memungkinkan user memilih tahun anggaran saat login

#### 1.4 Auth Service
- **File**: `backend/src/modules/auth/auth.service.ts`
- Update `login()` method untuk:
  - Menerima `fiscalYearId` dari login request
  - Menyimpan `fiscalYearId` ke JWT token
  - Update kolom `activeFiscalYearId` di database jika fiscal year diberikan

#### 1.5 Users Service
- **File**: `backend/src/modules/users/users.service.ts`
- Menambahkan method `updateActiveFiscalYear(userId, fiscalYearId)`
- Method ini memvalidasi fiscal year dan update kolom `activeFiscalYearId`

#### 1.6 Users Controller
- **File**: `backend/src/modules/users/users.controller.ts`
- Menambahkan 2 endpoints baru:
  - `PATCH /users/me/fiscal-year` - Update tahun anggaran user sendiri
  - `PATCH /users/:id/fiscal-year` - Update tahun anggaran user lainnya

### 2. Frontend Changes

#### 2.1 FiscalYearContext
- **File**: `frontend/src/contexts/FiscalYearContext.tsx`
- Membuat context baru untuk manajemen tahun anggaran global
- Fitur:
  - Fetch semua available fiscal years
  - Menyimpan active fiscal year dari JWT token
  - Method untuk mengganti active fiscal year
  - Query invalidation saat fiscal year berubah

#### 2.2 App.tsx
- **File**: `frontend/src/App.tsx`
- Membungkus aplikasi dengan `FiscalYearProvider`

#### 2.3 Login Form
- **File**: `frontend/src/features/auth/components/LoginForm.tsx`
- Menambahkan dropdown "Tahun Anggaran"
- Default selection: tahun berjalan (current fiscal year)
- Field ini opsional tapi direkomendasikan

#### 2.4 Header Component
- **File**: `frontend/src/components/layout/Header.tsx`
- Menambahkan dropdown tahun anggaran di pojok kanan atas
- Tampilkan tahun aktif saat ini
- User dapat mengganti tahun kapan saja
- Saat tahun diganti, halaman akan di-reload untuk refresh semua data

#### 2.5 RAK Module
- **Files**: 
  - `frontend/src/features/rak/pages/RakList.tsx`
  - `frontend/src/features/rak/pages/RakCreate.tsx`
- **Perubahan**:
  - Menghapus dropdown tahun anggaran lokal
  - Menggunakan `useFiscalYear()` hook untuk mendapatkan tahun dari context
  - Data RAK otomatis filter berdasarkan tahun aktif di header

#### 2.6 Bukti Bayar Module
- **File**: `frontend/src/features/bukti-bayar/BuktiBayarList.tsx`
- **Perubahan**:
  - Menghapus dropdown tahun anggaran
  - Menampilkan info tahun aktif di filter section
  - Data bukti bayar otomatis filter berdasarkan tahun aktif di header

### 3. User Experience Flow

#### Flow 1: Login dengan Tahun Anggaran
1. User membuka halaman login
2. User memilih tahun anggaran dari dropdown (default: tahun berjalan)
3. User memasukkan username dan password
4. Login dikirim dengan `fiscalYearId`
5. JWT token berisi `fiscalYearId`
6. User redirect ke dashboard
7. Header menampilkan tahun anggaran yang dipilih
8. Semua data (RAK, Bukti Bayar, dll) filter berdasarkan tahun ini

#### Flow 2: Mengganti Tahun Anggaran
1. User klik icon kalender di pojok kanan atas
2. Dropdown muncul dengan daftar tahun anggaran
3. User pilih tahun lain
4. API call: `PATCH /users/me/fiscal-year`
5. Database diupdate dengan tahun baru
6. Halaman di-reload
7. JWT token di-refresh dengan tahun baru
8. Semua data di-refresh dengan tahun baru

## Keuntungan

1. **Centralized Configuration**: Tahun anggaran dikelola di satu tempat saja
2. **Consistent User Experience**: Tidak ada kebingungan tentang tahun anggaran yang aktif
3. **Easy Year Switching**: User bisa mengganti tahun dengan satu klik
4. **Reduced Code Duplication**: Tidak perlu dropdown tahun di setiap modul
5. **Better Data Integrity**: Semua query menggunakan tahun yang sama dari context

## Migration Instructions

### Database Migration
```bash
cd backend
npm run migration:run
```

### Backend Restart
```bash
# Stop backend
npm run stop

# Start backend
npm run start:dev
```

### Frontend Restart
```bash
cd frontend
npm run dev
```

## Testing Checklist

- [ ] Login berhasil dengan tahun anggaran
- [ ] Header menampilkan tahun anggaran yang benar
- [ ] Dropdown tahun anggaran di header berfungsi
- [ ] Ganti tahun anggaran di header refresh halaman
- [ ] Data RAK filter sesuai tahun aktif
- [ ] Data Bukti Bayar filter sesuai tahun aktif
- [ ] Data DPA filter sesuai tahun aktif
- [ ] Logout dan login dengan tahun berbeda berfungsi

## Notes

- `fiscalYearId` di login adalah opsional untuk backward compatibility
- Jika tidak dipilih saat login, akan menggunakan tahun default (tahun berjalan)
- JWT token akan berisi `fiscalYearId` yang digunakan oleh context
- Setiap perubahan tahun akan reload halaman untuk memastikan data konsisten