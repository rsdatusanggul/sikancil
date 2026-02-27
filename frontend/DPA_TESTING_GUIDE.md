# Testing Guide: Modul DPA/DPPA

## 🚀 Akses Modul DPA

Modul DPA sudah berhasil diimplementasi dan siap untuk ditest!

### 1. Cara Mengakses

#### Via Sidebar Menu:
1. Buka aplikasi frontend: `http://localhost:5173`
2. Login dengan kredensial Anda
3. Di sidebar kiri, klik **"Perencanaan & RBA"** untuk expand menu
4. Klik **"DPA/DPPA"** (menu terakhir setelah Revisi RBA)

#### Via Direct URL:
- **List Page**: http://localhost:5173/dpa
- **Create Page**: http://localhost:5173/dpa/create
- **Detail Page**: http://localhost:5173/dpa/{id} (ganti {id} dengan ID DPA)

---

## 🧪 Skenario Testing

### Test 1: View DPA List
1. Akses `/dpa`
2. ✅ Verify: Tabel DPA muncul (bisa kosong jika belum ada data)
3. ✅ Verify: Filter panel tersedia (Tahun, Status, Jenis Dokumen, Search)
4. ✅ Verify: Button "Buat DPA Baru" dan "Generate dari RBA" tersedia

### Test 2: Create DPA Manual
1. Click "Buat DPA Baru"
2. ✅ Form muncul dengan fields:
   - Jenis Dokumen (Radio: DPA/DPPA)
   - Nomor DPA
   - Tahun Pembuatan
   - Tahun Anggaran
   - Tanggal Dokumen/Berlaku/Selesai
3. Fill form dengan data:
   ```
   Jenis: DPA
   Nomor DPA: DPA-001/BLUD/2026
   Tahun: 2026
   Tahun Anggaran: 2026
   Tanggal Dokumen: (today)
   Tanggal Berlaku: 2026-01-01
   Tanggal Selesai: 2026-12-31
   ```
4. Click "Simpan DPA"
5. ✅ Verify: DPA berhasil dibuat
6. ✅ Verify: Redirect ke detail page

### Test 3: View DPA Detail
1. Dari list, click nomor DPA atau button "Lihat"
2. ✅ Verify: Header card menampilkan info DPA
3. ✅ Verify: Status badge muncul (DRAFT)
4. ✅ Verify: 5 tabs tersedia:
   - Ringkasan
   - Belanja
   - Pendapatan
   - Pembiayaan
   - Riwayat
5. ✅ Verify: Tab Ringkasan menampilkan 3 kartu (Belanja, Pendapatan, Pembiayaan)

### Test 4: Workflow - Submit for Approval
1. Di detail page DPA dengan status DRAFT
2. ✅ Verify: Button "Ajukan untuk Persetujuan" tersedia
3. Click button tersebut
4. Confirm dialog
5. ✅ Verify: Status berubah jadi SUBMITTED
6. ✅ Verify: Button berubah (Approve/Reject muncul untuk PPKD)

### Test 5: Workflow - Approve (PPKD Role)
1. DPA dengan status SUBMITTED
2. ✅ Verify: Button "Setujui" muncul (jika role PPKD/ADMIN)
3. Click "Setujui"
4. Modal muncul untuk input catatan (opsional)
5. Click "Setujui"
6. ✅ Verify: Status berubah jadi APPROVED
7. ✅ Verify: Button "Aktifkan DPA" muncul

### Test 6: Workflow - Activate
1. DPA dengan status APPROVED
2. Click "Aktifkan DPA"
3. Confirm dialog
4. ✅ Verify: Status berubah jadi ACTIVE
5. ✅ Verify: DPA ini menjadi DPA aktif untuk tahun anggaran tersebut

### Test 7: Filter & Search
1. Buat beberapa DPA dengan tahun/status berbeda
2. Test filter:
   - Filter by Tahun → Shows only DPA for that year
   - Filter by Status → Shows only DPA with that status
   - Search by Nomor → Finds specific DPA
3. ✅ Verify: Hasil filter sesuai

### Test 8: Pagination
1. Jika ada >10 DPA
2. ✅ Verify: Pagination controls muncul
3. Click next page
4. ✅ Verify: Data page berikutnya muncul

### Test 9: Edit DPA (DRAFT only)
1. DPA dengan status DRAFT
2. Click "Edit"
3. ✅ Verify: Form edit muncul dengan data terisi
4. Ubah Nomor DPA
5. Click "Simpan"
6. ✅ Verify: Perubahan tersimpan

### Test 10: Delete DPA (DRAFT only)
1. DPA dengan status DRAFT
2. Click "Hapus"
3. Confirm dialog
4. ✅ Verify: DPA terhapus dari list

### Test 11: Reject DPA
1. DPA dengan status SUBMITTED
2. Click "Tolak" (PPKD role)
3. Modal muncul
4. Input alasan penolakan (wajib)
5. Click "Tolak"
6. ✅ Verify: Status berubah jadi REJECTED
7. ✅ Verify: Alasan penolakan tersimpan

### Test 12: Create DPPA (Revisi)
1. Click "Buat DPA Baru"
2. Pilih radio "DPPA (Perubahan)"
3. ✅ Verify: Field tambahan muncul:
   - DPA Sebelumnya (dropdown)
   - Nomor Revisi
   - Alasan Revisi (wajib)
4. Fill form
5. ✅ Verify: DPPA berhasil dibuat

---

## 🐛 Troubleshooting

### Issue: Modul DPA tidak muncul di sidebar
**Solution**:
1. Pastikan login sebagai user yang punya akses
2. Refresh browser (Ctrl+F5)
3. Clear browser cache
4. Restart dev server: `cd /opt/sikancil/frontend && npm run dev`

### Issue: Error saat akses /dpa
**Possible Causes**:
1. Backend tidak running → Start backend: `cd /opt/sikancil/backend && npm run start:dev`
2. Database belum migrate → Run migration
3. TypeScript errors → Check console

### Issue: Data tidak muncul
**Solution**:
1. Cek backend API: `curl http://localhost:3000/api/dpa`
2. Cek network tab di browser DevTools
3. Cek console untuk error

### Issue: Hot reload tidak working
**Solution**:
1. Kill dev server: `pkill -f vite`
2. Restart: `cd /opt/sikancil/frontend && npm run dev`

---

## 📊 Expected Data Flow

```
1. Create DPA (DRAFT)
   ↓
2. Submit (DRAFT → SUBMITTED)
   ↓
3. Approve/Reject (SUBMITTED → APPROVED/REJECTED)
   ↓
4. Activate (APPROVED → ACTIVE)
```

---

## ✅ Acceptance Criteria

Module DPA dianggap **working** jika:

- ✅ DPA menu item muncul di sidebar
- ✅ List page accessible dan menampilkan tabel
- ✅ Create form berfungsi dan bisa save DPA
- ✅ Detail page menampilkan semua info DPA
- ✅ Workflow transitions berfungsi (Submit → Approve → Activate)
- ✅ Filter & search berfungsi
- ✅ Pagination berfungsi (jika ada banyak data)
- ✅ Edit hanya untuk DRAFT/REJECTED
- ✅ Delete hanya untuk DRAFT
- ✅ Status badges menampilkan warna yang benar
- ✅ No console errors

---

## 🔍 Debug Checklist

Jika ada masalah, cek:

1. **Backend Status**
   ```bash
   curl http://localhost:3000/api/dpa
   ```
   Expected: JSON response with DPA list

2. **Frontend Build**
   ```bash
   cd /opt/sikancil/frontend
   npm run build
   ```
   Expected: No TypeScript errors for DPA module

3. **Browser Console**
   - F12 → Console tab
   - Check for errors (red text)

4. **Network Tab**
   - F12 → Network tab
   - Access /dpa page
   - Check API calls (should be 200 OK)

5. **React DevTools**
   - Install React DevTools extension
   - Check component tree
   - Verify DPA component loaded

---

## 📝 Test Data Examples

### Sample DPA 1 (DRAFT)
```json
{
  "nomorDPA": "DPA-001/BLUD/2026",
  "jenisDokumen": "DPA",
  "tahun": 2026,
  "tahunAnggaran": 2026,
  "tanggalDokumen": "2026-01-15",
  "tanggalBerlaku": "2026-01-01",
  "tanggalSelesai": "2026-12-31"
}
```

### Sample DPA 2 (DPPA)
```json
{
  "nomorDPA": "DPPA-001/BLUD/2026",
  "jenisDokumen": "DPPA",
  "tahun": 2026,
  "tahunAnggaran": 2026,
  "dpaSebelumnyaId": "{id-dpa-sebelumnya}",
  "nomorRevisi": 1,
  "alasanRevisi": "Perubahan pagu sesuai Perda No. 5 Tahun 2026",
  "tanggalDokumen": "2026-06-15",
  "tanggalBerlaku": "2026-07-01",
  "tanggalSelesai": "2026-12-31"
}
```

---

## 🎯 Performance Check

Test dengan data:
- 10 DPA → Should load instantly
- 100 DPA → Should load in <2s
- 1000 DPA → Should use pagination (10/page)

---

## 📞 Support

Jika masih ada masalah:
1. Check dokumentasi: `IMPLEMENTATION_PLAN_DPA.md`
2. Check summary: `DPA_IMPLEMENTATION_SUMMARY.md`
3. Check backend README: `/backend/src/modules/dpa/README.md`

---

**Last Updated**: 15 Februari 2026
**Tested On**: Chrome 120+, Firefox 120+
**Status**: ✅ Ready for Testing
