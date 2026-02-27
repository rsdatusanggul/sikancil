# 📋 Panduan Akses Si-Kancil untuk Tim BA & QA/Tester

**Tanggal Setup**: 15 Februari 2026
**Environment**: Development Server
**Metodologi**: Hybrid Agile (2-week sprints)

---

## 🌐 URL Akses (Cukup Gunakan IP, Tidak Perlu Ubah /etc/hosts)

### **Akses Utama**

```
🏠 Frontend (Aplikasi Si-Kancil):
   http://192.168.11.30/

🔌 Backend API:
   http://192.168.11.30/api/v1

📚 API Documentation (Swagger):
   http://192.168.11.30/api/docs

🏥 Server Health Check:
   http://192.168.11.30/health
```

---

## 👤 Login Credentials

⚠️ **IMPORTANT**: Login menggunakan **Username**, bukan Email!

### **Super Admin (Full Access)**
```
Username: simrs
Password: SIMRS@R5d5
Email:    simrs@sikancil.id
Role:     Super Admin
```


## 🎯 Cara Menggunakan untuk Testing

### **1. Akses Frontend**

Buka browser (Chrome/Firefox/Edge), ketik:
```
http://192.168.11.30/
```

**Anda akan melihat:**
- Halaman login Si-Kancil
- Logo dan form login

**Login dengan:**
- Email: `superadmin@sikancil.id`
- Password: `Admin123!@#`

### **2. Eksplorasi API (untuk QA/Tester)**

**Swagger UI** - Interactive API Documentation:
```
http://192.168.11.30/api/docs
```

**Di Swagger, Anda bisa:**
- ✅ Melihat semua API endpoints
- ✅ Test API langsung dari browser
- ✅ Lihat request/response format
- ✅ Download OpenAPI spec

**Contoh Test API dengan curl:**
```bash
# Test login
curl -X POST http://192.168.11.30/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@sikancil.id","password":"Admin123!@#"}'

# Test get users (butuh token dari login)
curl http://192.168.11.30/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ Fitur-Fitur yang Sudah Bisa Ditest

### **Modul Sudah Ready (Sprint 1-2)**

✅ **Authentication & Authorization**
   - Login/Logout
   - Role-based access control
   - Session management

✅ **Master Data Management**
   - User Management
   - Role & Permission
   - BLUD Configuration
   - Unit Kerja
   - Chart of Accounts (COA)

✅ **Dashboard**
   - Dashboard Eksekutif
   - Dashboard Keuangan
   - Dashboard Bendahara

### **Modul Under Development (Sprint 3+)**

🚧 **Pendapatan (Revenue)**
   - SIMRS integration (webhook)
   - Klasifikasi pendapatan
   - Piutang tracking

🚧 **Belanja (Expenditure)**
   - SPP-SPM-SP2D workflow
   - Budget control
   - Tax calculation

🚧 **Penatausahaan Kas**
   - BKU (Buku Kas Umum)
   - Buku Pembantu
   - Cash reconciliation

---

## 🔄 Auto-Refresh & Hot Module Replacement (HMR)

**Kabar Baik untuk Developer & Tester:**

✅ **Frontend Auto-Reload**
   - Jika developer ubah code → Browser otomatis refresh
   - Tidak perlu manual refresh
   - Vite HMR via Nginx (WebSocket)

✅ **Backend Auto-Restart**
   - Jika developer ubah backend code → NestJS restart otomatis
   - PM2 auto-restart jika crash

**Catatan:**
Jika sedang test dan tiba-tiba error, mungkin developer sedang coding.
Tunggu 5-10 detik, lalu refresh browser.

---

## 📅 Schedule Testing (Agile Sprint)

### **Sprint Planning (Setiap 2 Minggu)**

**Monday Week 1:**
- 📢 Sprint Planning Meeting
- 🎯 Sprint Goal dijelaskan
- 📋 User stories yang akan dikerjakan
- **BA/QA**: Dapat akses fitur baru di server dev

**Tuesday - Thursday (Week 1-2):**
- 💻 Developer coding
- 🧪 BA/QA bisa test sewaktu-waktu
- 📝 Report bug via [Jira/Linear/Slack]

**Friday Week 2:**
- 🎬 Sprint Review/Demo (1 jam)
- 🔍 Sprint Retrospective
- ✅ BA validation: Apakah fitur sudah sesuai requirement?

### **Bi-Weekly Validation Session**

**Tuesday (Week 2):**
- 👥 Finance Team + BA + PM
- 🔍 Business rules validation
- 📊 Demo progress ke finance team

**Rekomendasi Testing Time:**
- **Best time**: Selasa - Kamis (09:00 - 16:00 WIB)
- **Avoid**: Jumat sore (Sprint Retrospective)
- **Critical**: Sprint Review (mandatory attendance)

---

## 🐛 Cara Report Bug

### **Template Bug Report**

```markdown
**Bug Title:** [Singkat & Jelas]

**Environment:** Development (http://192.168.11.30)

**Steps to Reproduce:**
1. Login sebagai bendahara
2. Klik menu "RBA"
3. Klik tombol "Tambah RBA"
4. ...

**Expected Result:**
Form RBA terbuka

**Actual Result:**
Error 500 muncul

**Screenshot:**
[Attach screenshot]

**Browser:** Chrome 131.0 / Firefox 120.0

**Priority:** P0 (Blocker) / P1 (Critical) / P2 (Major) / P3 (Minor)

**Reporter:** [Nama Anda]
**Date:** 2026-02-15
```

### **Priority Guideline**

- **P0 (Blocker)**: Login tidak bisa, sistem down, data hilang
- **P1 (Critical)**: Fitur utama error, salah perhitungan
- **P2 (Major)**: Fitur minor error, UI broken
- **P3 (Minor)**: Typo, UI kurang rapi, suggestion

### **Report Channel**

- **Slack**: #sikancil-bugs (preferred)
- **Email**: project-sikancil@example.com
- **Jira**: [Link to project]

---

## ⚠️ Troubleshooting

### **Problem 1: Tidak Bisa Akses http://192.168.11.30**

**Cek:**
1. Apakah komputer Anda di network yang sama?
   ```bash
   # Coba ping server
   ping 192.168.11.30
   ```

2. Apakah browser dapat akses internet?

3. Coba akses health check:
   ```
   http://192.168.11.30/health
   ```
   Jika muncul "OK", server running.

**Solution:**
- Pastikan connected ke network kantor/VPN
- Contact IT support jika network issue

---

### **Problem 2: Login Berhasil, Tapi Dashboard Blank/Error**

**Kemungkinan:**
- Backend sedang restart (developer update code)
- Token expired

**Solution:**
1. **Logout** lalu **Login** lagi
2. **Clear browser cache**: Ctrl+Shift+Del → Clear cache
3. Tunggu 1-2 menit, refresh browser
4. Jika masih error, report ke developer

---

### **Problem 3: "CORS Error" di Browser Console**

**Error message:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Artinya:**
Backend tidak allow request dari origin Anda.

**Solution:**
1. **TIDAK perlu action dari Anda**
2. Screenshot error dan report ke developer
3. Developer akan fix di backend (tambah origin ke CORS)

---

### **Problem 4: Halaman Lambat / Tidak Load**

**Cek:**
1. Apakah internet/network stabil?
2. Buka browser console (F12) → lihat error

**Temporary Fix:**
- Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- Buka Incognito mode
- Ganti browser (Chrome → Firefox, vice versa)

**Report jika:**
- Lambat > 10 detik
- Consistently slow (bukan sekali-kali)

---

## 🔧 Developer Commands (FYI - Tidak Perlu Dijalankan oleh BA/QA)

**PM2 Status:**
```bash
pm2 status
pm2 logs sikancil-backend
pm2 logs sikancil-frontend
```

**Restart Services:**
```bash
pm2 restart sikancil-backend
pm2 restart sikancil-frontend
```

**Server Status:**
```bash
# Check Nginx
systemctl status nginx

# Check server ports
netstat -tlnp | grep -E ":80|:3000|:5173"
```

---

## 📞 Contact Developer Team

**Developer on Duty (Sprint Hours):**
- **Nama**: [TBD]
- **Slack**: @developer-sikancil
- **Phone**: [TBD] (Emergency only)

**Project Manager:**
- **Nama**: [TBD]
- **Email**: pm-sikancil@example.com
- **Phone**: [TBD]

**Senior BA (BLUD Expert):**
- **Nama**: [TBD]
- **Email**: ba-sikancil@example.com

---

## 📖 Dokumentasi Tambahan

- **Master Plan v3.0**: `/opt/sikancil/docs/Sikancil_Masterplan_v3.md`
- **Features Detail**: `/opt/sikancil/docs/Sikancil_Features_v3.md`
- **Tech Stack**: `/opt/sikancil/docs/Sikancil_Tech_Stack_v3.md`
- **API Documentation**: http://192.168.11.30/api/docs

---

## ✨ Tips untuk Effective Testing

### **1. Test Mindset (untuk QA)**

✅ **DO:**
- Test happy path (normal flow)
- Test edge cases (boundary values)
- Test error scenarios (invalid input)
- Test user journeys (end-to-end)
- Test dengan berbagai roles (bendahara, akuntansi, etc.)

❌ **DON'T:**
- Hanya test sekali lalu done
- Asumsikan "pasti works" tanpa verify
- Skip testing error messages

### **2. Business Validation (untuk BA)**

✅ **Validate:**
- Apakah fitur sesuai requirement?
- Apakah business rules benar? (e.g., PPh calculation)
- Apakah workflow sesuai PMK/Permendagri?
- Apakah laporan format sesuai regulasi?
- Apakah terminologi BLUD benar?

### **3. User Experience Testing**

✅ **Check:**
- Apakah UI intuitif? (mudah dipahami bendahara?)
- Apakah error message jelas?
- Apakah loading time acceptable? (< 3 detik)
- Apakah mobile-friendly? (responsive design)

---

## 🎉 Happy Testing!

**Remember:**
- 🚀 Server available **24/7** (auto-restart)
- 🔄 Code update → auto-reload (HMR)
- 🐛 Report bugs early & often
- 💬 Communication is key (Slack/Email)
- 🎯 Focus on Sprint Goal

**Your feedback drives the product quality!**

---

**Document Version:** 1.0
**Last Updated:** 15 Februari 2026
**Maintained by:** Si-Kancil Development Team
