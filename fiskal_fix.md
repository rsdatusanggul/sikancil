# Fix: Fiscal Year Dropdown "Loading..." Bug di Header

## Masalah

Di `Header.tsx`, dropdown tahun fiskal menampilkan teks **"Loading..."** terus-menerus setelah login, karena `activeFiscalYear` selalu bernilai `null`.

## Root Cause

### 1. Token localStorage selalu null
`FiscalYearContext.tsx` mencoba membaca `fiscalYearId` dari `localStorage.getItem('token')`, tapi aplikasi menggunakan **httpOnly cookies** — tidak ada token di localStorage. Akibatnya kode selalu jatuh ke fallback.

### 2. Query error sebelum login
`FiscalYearContext` mengquery `/fiscal-year` (authenticated endpoint) tanpa `enabled` guard. Saat user belum login, endpoint ini mengembalikan **401**, query masuk error state setelah retry. Akibatnya `fiscalYears = []` saat login berhasil dan `useEffect` tidak pernah jalan (kondisi `fiscalYears.length > 0` tidak terpenuhi), sehingga `activeFiscalYear` tetap `null`.

### 3. `fiscalYear` dari login response dibuang
`auth.store.ts` menerima parameter `fiscalYear` di `login()` tapi **tidak menyimpannya sama sekali**.

## File yang Dimodifikasi

- `frontend/src/stores/auth.store.ts`
- `frontend/src/contexts/FiscalYearContext.tsx`

---

## Perubahan

### `auth.store.ts`

Tambah field `activeFiscalYearId: string | null` ke state:
- Set dari `fiscalYear?.id` di fungsi `login()`
- Clear ke `null` di `logout()`
- Tambah action `setActiveFiscalYearId(id: string | null)`
- Sertakan di `partialize` agar persisten (tahan page refresh)

### `FiscalYearContext.tsx`

1. **Guard query dengan `enabled: isAuthenticated`** — query tidak jalan sebelum login, tidak ada 401 error
2. **Ganti localStorage token parsing** dengan membaca `activeFiscalYearId` dari auth store
3. **Update auth store saat user ganti tahun** dari header dropdown agar persisten saat refresh

---

## Alur Data Setelah Fix

```
Login → authApi.login() → response { user, fiscalYear }
  → auth.store.login(user, fiscalYear) → simpan { user, activeFiscalYearId: fiscalYear.id }
  → navigate('/dashboard')
  → FiscalYearContext: isAuthenticated = true → query '/fiscal-year' enabled → fetch berhasil
  → useEffect: currentUser ✓, fiscalYears ✓, activeFiscalYearId ✓
  → setActiveFiscalYearState(fiscalYear yang dipilih user)
  → Header dropdown menampilkan tahun yang benar ✓
```

**Page refresh:**
- `activeFiscalYearId` persisten di Zustand storage → langsung tersedia
- Query `/fiscal-year` fetch → fiscalYears populated → useEffect set activeFiscalYear dari persisted ID ✓

---

## Verifikasi

1. Login dengan memilih tahun anggaran → header menampilkan tahun yang dipilih (bukan "Loading...")
2. Refresh halaman → header tetap menampilkan tahun yang sama
3. Ganti tahun dari dropdown header → refresh → tahun baru tetap tampil
4. Logout → login lagi dengan tahun berbeda → header menampilkan tahun yang baru dipilih
