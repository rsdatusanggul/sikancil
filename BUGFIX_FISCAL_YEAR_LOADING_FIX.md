# Bug Fix: Fiscal Year Loading Issue di Dashboard

## Deskripsi Masalah

Tahun fiskal di dashboard hanya menampilkan tulisan "Loading..." dan tidak pernah menampilkan tahun fiskal yang sebenarnya.

## Root Cause

Masalah terjadi di file `frontend/src/contexts/FiscalYearContext.tsx` dalam `useEffect` hook yang mengatur active fiscal year:

1. Ketika user login, sistem mencoba mengambil `fiscalYearId` dari JWT token
2. Sistem mencari fiscal year tersebut di daftar `fiscalYears`
3. **Jika fiscal year dari token tidak ditemukan** (misalnya: fiscal year di database berubah/tidak cocok), maka `activeFiscalYearState` tetap `null`
4. Komponen `Header` menampilkan `{activeFiscalYear?.tahun || 'Loading...'}` sehingga selalu menampilkan "Loading..." karena `activeFiscalYear` adalah `null`

## Solusi

Menambahkan logic fallback di `FiscalYearContext.tsx`:

```typescript
// Set active fiscal year from user's JWT token
useEffect(() => {
  if (currentUser && fiscalYears.length > 0) {
    // Get fiscal year info from JWT token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const fiscalYearId = payload.fiscalYearId;
        
        if (fiscalYearId) {
          const fiscalYear = fiscalYears.find((fy) => fy.id === fiscalYearId);
          if (fiscalYear) {
            setActiveFiscalYearState(fiscalYear);
            return; // Exit early if fiscal year is found
          }
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
    
    // Fallback: set to current fiscal year if no match found in token
    const currentFiscalYear = fiscalYears.find((fy) => fy.isCurrent);
    if (currentFiscalYear) {
      setActiveFiscalYearState(currentFiscalYear);
    } else if (fiscalYears.length > 0) {
      // Last resort: set to the first available fiscal year
      setActiveFiscalYearState(fiscalYears[0]);
    }
  }
}, [currentUser, fiscalYears]);
```

### Hierarki Fallback:

1. **Pertama**: Coba gunakan fiscal year dari JWT token
2. **Kedua**: Jika tidak ditemukan di token, gunakan fiscal year yang ditandai `isCurrent: true`
3. **Ketiga**: Jika tidak ada yang isCurrent, gunakan fiscal year pertama yang tersedia

## File yang Dimodifikasi

- `frontend/src/contexts/FiscalYearContext.tsx`

## Pengujian

1. Login ke aplikasi
2. Periksa dashboard - tahun fiskal seharusnya sudah tampil dengan benar
3. Coba ganti tahun fiskal dari dropdown
4. Pastikan tahun fiskal yang dipilih tersimpan dan ditampilkan dengan benar

## Catatan

- Perbaikan ini memastikan bahwa user selalu memiliki active fiscal year yang valid, bahkan jika data di token JWT sudah tidak valid lagi
- User masih bisa mengganti tahun fiskal melalui dropdown di header
- Setelah mengganti tahun fiskal, halaman akan direfresh untuk memuat ulang data dengan tahun fiskal yang baru

## Tanggal Implementasi

19 Februari 2026