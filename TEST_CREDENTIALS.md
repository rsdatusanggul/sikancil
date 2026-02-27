# 🔑 Test Credentials - Si-Kancil

Credentials untuk testing aplikasi Si-Kancil.

## 📋 Available Test Users

### 1. Super Admin
**Untuk testing full access & user management**

```
Username: simrs
Password: SIMRS@R5d5
Role: super_admin
Email: simrs@sikancil.id
Nama: Super Admin SIMRS
```

**Akses:**
- ✅ Semua fitur aplikasi
- ✅ User management (CRUD users)
- ✅ Role & permissions management
- ✅ System settings
- ✅ Audit trail

---

### 2. Administrator
**Untuk testing admin-level access**

```
Username: admin
Password: password123
Role: admin
Email: admin@sikancil.id
Nama: Administrator
```

**Akses:**
- ✅ Sebagian besar fitur aplikasi
- ✅ User management (terbatas)
- ⛔ System settings (limited)

---

### 3. Kepala BLUD
**Untuk testing kepala BLUD role**

```
Username: kepala
Password: password123
Role: kepala_blud
Email: kepala@sikancil.id
Nama: Kepala BLUD
Jabatan: Kepala BLUD
```

**Akses:**
- ✅ View semua laporan
- ✅ Approve RBA
- ✅ Approve SPP/SPM
- ⛔ Tidak bisa manage users

---

### 4. Bendahara
**Untuk testing bendahara role**

```
Username: bendahara
Password: password123
Role: bendahara
Email: bendahara@sikancil.id
Nama: Bendahara BLUD
Jabatan: Bendahara
```

**Akses:**
- ✅ Kelola SPP/SPM/SP2D
- ✅ Kelola BKU
- ✅ Kelola SPJ
- ✅ View laporan keuangan
- ⛔ Tidak bisa approve

---

### 5. Staff Keuangan
**Untuk testing staff level access**

```
Username: staff
Password: password123
Role: staff_keuangan
Email: staff@sikancil.id
Nama: Staff Keuangan
Jabatan: Staff Keuangan
```

**Akses:**
- ✅ Input data transaksi
- ✅ View laporan (terbatas)
- ⛔ Tidak bisa approve
- ⛔ Tidak bisa manage users

---

## 🧪 Testing Scenarios

### Authentication Tests

1. **Login Success**
   ```
   User: simrs
   Pass: SIMRS@R5d5
   Expected: Redirect to dashboard, display "Super Admin SIMRS"
   ```

2. **Login Failed (Invalid Password)**
   ```
   User: simrs
   Pass: wrongpassword
   Expected: Error message "Login gagal. Username atau password salah."
   ```

3. **Login Failed (Non-existent User)**
   ```
   User: nonexistent
   Pass: anypassword
   Expected: Error message
   ```

4. **Logout**
   ```
   Click logout button
   Expected: Redirect to /login, session cleared
   ```

5. **Session Persistence**
   ```
   1. Login as simrs
   2. Refresh page
   Expected: User still logged in, no redirect to login
   ```

6. **Protected Route Access (Unauthenticated)**
   ```
   1. Logout (or open incognito)
   2. Navigate to http://localhost:5173/dashboard
   Expected: Redirect to /login
   ```

### Role-Based Access Tests

1. **Super Admin Access**
   ```
   Login: simrs
   Navigate to: /users
   Expected: Can access (akan diimplementasi di Phase 2)
   ```

2. **Staff Access to Admin Pages**
   ```
   Login: staff
   Navigate to: /users
   Expected: "Akses Ditolak" message
   ```

3. **Header Display**
   ```
   Login: bendahara
   Check header
   Expected: Show "Bendahara BLUD" and "Bendahara" as jabatan
   ```

---

## 🚀 Quick Start Testing

### 1. Start Backend
```bash
cd /opt/sikancil/backend
npm run start:dev
```

### 2. Start Frontend
```bash
cd /opt/sikancil/frontend
npm run dev
```

### 3. Access Application
```
URL: http://localhost:5173/login
```

### 4. Login
```
Username: simrs
Password: SIMRS@R5d5
```

---

## 📊 User Roles Hierarchy

```
super_admin (simrs)
    │
    ├── admin (admin)
    │
    ├── kepala_blud (kepala)
    │
    ├── bendahara (bendahara)
    │
    └── staff_keuangan (staff)
```

---

## 🔒 Security Notes

⚠️ **IMPORTANT:**
- Credentials ini HANYA untuk development/testing
- **JANGAN** gunakan di production
- Password harus diganti setelah first login di production
- Super admin harus menggunakan password yang kuat

---

## 📝 Database Query (For Reference)

Jika perlu reset atau check users:

```sql
-- View all users
SELECT username, email, "fullName", role, status
FROM users
ORDER BY role;

-- Reset password for a user (hash for 'password123')
UPDATE users
SET password = '$2b$10$sUH2qv1W92ZCVaIyuBolkubgvcxthn0m16yYRJf01uCAOoD3jxFua'
WHERE username = 'simrs';

-- Change user role
UPDATE users
SET role = 'super_admin'
WHERE username = 'simrs';

-- Deactivate user
UPDATE users
SET status = 'inactive'
WHERE username = 'staff';
```

---

## 📚 API Testing (Postman/cURL)

### Login Request
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "simrs",
    "password": "SIMRS@R5d5"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

**Created:** 2026-02-15
**Last Updated:** 2026-02-15
**Status:** ✅ Active
