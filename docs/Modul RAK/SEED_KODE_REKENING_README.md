# 📊 SEED DATA KODE REKENING BLUD - COMPLETE

## 📋 Overview

File seed data **LENGKAP** untuk master kode rekening BLUD (Badan Layanan Umum Daerah) yang sesuai dengan **Permendagri 64/2013** dan kebutuhan modern RSUD/Puskesmas.

**File:** `seed_kode_rekening_blud_COMPLETE.sql`  
**Total Records:** ~264 kode rekening  
**Total Lines:** 504 lines  
**Database:** PostgreSQL 17+  

---

## 🎯 Apa yang Termasuk

### **PENDAPATAN (4.X.X.XX.XX.XXXX)**

#### 1️⃣ Retribusi Pelayanan Kesehatan
- ✅ Rawat Jalan (5 jenis: Umum, Gigi, Spesialis, KIA/KB, IGD)
- ✅ Rawat Inap (5 kelas: Kelas III, II, I, VIP, ICU/ICCU/NICU/PICU)
- ✅ Penunjang Medis (8 jenis: Lab, Radiologi, Farmasi, OK, Bersalin, Hemodialisa, Fisioterapi, MCU)
- ✅ Ambulance & Jenazah
- ✅ Jasa Layanan Lainnya (Visum, Surat Sehat, Sewa Alkes)

**Total:** 23 detail kode pendapatan layanan kesehatan

#### 2️⃣ Dana Transfer
- ✅ Dana Kapitasi JKN (JPK & Non-JPK)
- ✅ Dana BOK (Bantuan Operasional Kesehatan)
- ✅ Transfer Pemerintah Pusat & Provinsi
- ✅ Pendapatan Hibah & Lain-lain

---

### **BELANJA (5.X.X.XX.XX.XXXX)**

#### 3️⃣ Belanja Pegawai (5.1.1.XX.XX)
- ✅ Gaji & Tunjangan PNS (11 komponen)
- ✅ Tambahan Penghasilan PNS (TPP)
- ✅ Jasa Pelayanan BLUD:
  - Jasa Pelayanan Kesehatan (JPK): Dokter, Perawat, Bidan, Tenaga Kesehatan Lainnya
  - Jasa Pelayanan Non-Kesehatan: Admin, Keuangan, Teknisi, Cleaning Service, Security
  - Honorarium, Lembur, Insentif Kinerja

**Total:** ~20 detail kode belanja pegawai

#### 4️⃣ Belanja Barang dan Jasa (5.1.2.XX.XX)

##### 🏥 Medical Supplies
- ✅ **Obat-obatan** (5.1.2.02.01)
- ✅ **Bahan Medis Habis Pakai (BMHP)** (5.1.2.02.02)
- ✅ **Alat Kesehatan Habis Pakai** (5.1.2.02.03)
- ✅ **Reagensia Laboratorium** (5.1.2.02.04)
- ✅ **Film Rontgen** (5.1.2.02.05)
- ✅ **Bahan Kimia & Gas Medis** (5.1.2.02.06)
- ✅ **Bahan Makanan Pasien** (5.1.2.02.07)
- ✅ **Bahan Linen/Laundry** (5.1.2.02.08)

##### 🏢 Jasa Kantor & Operasional
- ✅ Listrik, Air, Telepon, Internet (5.1.2.03.XX)
- ✅ **Jasa Pengelolaan Limbah Medis** (5.1.2.03.07)
- ✅ **Jasa Cleaning Service** (5.1.2.03.09)
- ✅ **Jasa Security** (5.1.2.03.10)
- ✅ **Jasa Kalibrasi Alat Kesehatan** (5.1.2.03.12)
- ✅ **Jasa Sterilisasi** (5.1.2.03.13)
- ✅ **Jasa Laundry** (5.1.2.03.14)

##### 💻 IT & Digital Services (5.1.2.20.XX) - **BARU!**

**Cloud Services & SaaS:**
- ✅ `5.1.2.20.01` - Cloud Storage (Google One, Dropbox, OneDrive)
- ✅ `5.1.2.20.02` - Cloud Computing (AWS, Azure, Google Cloud)
- ✅ `5.1.2.20.03` - Software Produktivitas (Microsoft 365, Google Workspace)
- ✅ `5.1.2.20.04` - **Design Tools (Canva Pro, Adobe Creative Cloud)**
- ✅ `5.1.2.20.05` - **AI Tools (ChatGPT Plus, Claude Pro, GitHub Copilot)**
- ✅ `5.1.2.20.06` - Project Management (Asana, Trello, Notion)
- ✅ `5.1.2.20.07` - Video Conference (Zoom Premium, Google Meet)
- ✅ `5.1.2.20.08` - Antivirus/Security Software
- ✅ `5.1.2.20.09` - Backup Services
- ✅ `5.1.2.20.10` - Database Services (MongoDB Atlas, Supabase)

**Domain & Hosting:**
- ✅ `5.1.2.20.11` - Domain & Hosting Website
- ✅ `5.1.2.20.12` - SSL Certificate
- ✅ `5.1.2.20.13` - CDN Services (Cloudflare, Akamai)

**Software Licenses:**
- ✅ `5.1.2.20.14` - Lisensi Software Aplikasi
- ✅ `5.1.2.20.15` - Lisensi Operating System (Windows Server)
- ✅ `5.1.2.20.16` - Lisensi Database (Oracle, SQL Server)
- ✅ `5.1.2.20.17` - **Lisensi Software Medis (SIMRS, RME)**

**IT Services:**
- ✅ `5.1.2.20.18` - **Maintenance Software/Aplikasi** (untuk Si-Kancil!)
- ✅ `5.1.2.20.19` - Pengembangan Software Custom
- ✅ `5.1.2.20.20` - IT Support/Helpdesk
- ✅ `5.1.2.20.21` - Konsultan IT/Digital Transformation
- ✅ `5.1.2.20.22` - Cybersecurity/Penetration Testing
- ✅ `5.1.2.20.23` - Disaster Recovery/Business Continuity

**Internet & Connectivity:**
- ✅ `5.1.2.20.24` - **Langganan Internet Dedicated/Fiber Optic**
- ✅ `5.1.2.20.25` - VPN Services
- ✅ `5.1.2.20.26` - API Services/Integration Platform

**Data & Analytics:**
- ✅ `5.1.2.20.27` - BI Tools (Tableau, Power BI)
- ✅ `5.1.2.20.28` - Analytics Platform (Google Analytics 360)

**Communication & Collaboration:**
- ✅ `5.1.2.20.29` - Email Marketing (Mailchimp, SendGrid)
- ✅ `5.1.2.20.30` - Digital Signature (DocuSign, Adobe Sign)
- ✅ `5.1.2.20.31` - CRM Software (Salesforce, HubSpot)

**Total IT Services:** 31 kode rekening baru!

##### 🍽️ Makanan & Minuman
- ✅ Makanan Rapat, Tamu
- ✅ **Makanan Pasien** (5.1.2.11.03)
- ✅ **Makanan Pegawai Piket/Shift** (5.1.2.11.04)

##### 🔧 Pemeliharaan
- ✅ Pemeliharaan Gedung & Bangunan
- ✅ **Pemeliharaan Peralatan Medis** (5.1.2.16.02)
- ✅ **Pemeliharaan Peralatan Non-Medis** (5.1.2.16.03)
- ✅ Pemeliharaan Jaringan & Instalasi
- ✅ Pemeliharaan Komputer & Printer

**Total Belanja Barang & Jasa:** ~100 kode rekening

#### 5️⃣ Belanja Modal (5.2.X.XX.XX)

##### 🏥 Alat Kedokteran (5.2.2.07.XX)
- ✅ Alat Kedokteran Umum
- ✅ Alat Kedokteran Gigi
- ✅ Alat Kedokteran THT, Mata
- ✅ Alat Kedokteran Bedah
- ✅ **Alat Radiologi**
- ✅ **Alat Anastesi**
- ✅ Alat Rehabilitasi Medik
- ✅ **Alat Kebidanan & Kandungan**
- ✅ **Alat Kesehatan Anak**
- ✅ **Alat ICU/ICCU/NICU/PICU**
- ✅ **Alat Hemodialisa**
- ✅ **Ambulance**

**Total:** 13 jenis alat kedokteran

##### 🔬 Alat Laboratorium (5.2.2.08.XX)
- ✅ Alat Lab Kimia
- ✅ Alat Lab Patologi Klinik
- ✅ Alat Lab Mikrobiologi
- ✅ Alat Lab Patologi Anatomi

##### 💻 Peralatan IT (5.2.2.05.03.XXXX & 5.2.2.09.XX) - **BARU!**

**Komputer & Peripheral:**
- ✅ `5.2.2.05.03.0001` - Personal Computer/Desktop
- ✅ `5.2.2.05.03.0002` - Laptop/Notebook
- ✅ `5.2.2.05.03.0003` - Tablet/iPad
- ✅ `5.2.2.05.03.0004` - Printer
- ✅ `5.2.2.05.03.0005` - Scanner
- ✅ `5.2.2.05.03.0006` - Projector/Display
- ✅ `5.2.2.05.03.0007` - UPS
- ✅ `5.2.2.05.03.0008` - External Storage/NAS

**Infrastruktur IT (5.2.2.09.XX):**
- ✅ `5.2.2.09.01` - **Server (Rack/Tower/Blade)**
- ✅ `5.2.2.09.02` - Storage Server/SAN
- ✅ `5.2.2.09.03` - Network Switch (Managed/Unmanaged)
- ✅ `5.2.2.09.04` - Router
- ✅ `5.2.2.09.05` - Firewall/Security Appliance
- ✅ `5.2.2.09.06` - Access Point/Wireless Controller
- ✅ `5.2.2.09.07` - Rack Server Cabinet
- ✅ `5.2.2.09.08` - CCTV System & NVR
- ✅ `5.2.2.09.09` - Telepon IP/PABX System
- ✅ `5.2.2.09.10` - Video Conference Equipment
- ✅ `5.2.2.09.11` - Barcode Scanner/RFID System
- ✅ `5.2.2.09.12` - Biometric Device (Fingerprint/Face Recognition)

**Total IT Hardware:** 20 kode rekening baru!

##### 🏗️ Gedung & Instalasi (5.2.3.01.XX)
- ✅ Bangunan Gedung Tempat Kerja/Tinggal
- ✅ **Instalasi Gas Medis** (5.2.3.01.06)
- ✅ **Instalasi Pengolahan Sampah** (5.2.3.01.07)
- ✅ `5.2.3.01.08` - **Data Center/Server Room** (BARU!)
- ✅ `5.2.3.01.09` - **Instalasi Jaringan Kabel/Structured Cabling** (BARU!)
- ✅ `5.2.3.01.10` - **Instalasi Fiber Optic** (BARU!)

**Total Belanja Modal:** ~60 kode rekening

---

## 🚀 Cara Menggunakan

### 1. **Setup Database**

```bash
# Masuk ke PostgreSQL
psql -U sikancil_user -d sikancil_dev

# Pastikan tabel ms_kode_rekening sudah ada
# Jika belum, buat dulu sesuai schema Prisma
```

### 2. **Import Seed Data**

```bash
# Opsi A: Via psql command line
psql -U sikancil_user -d sikancil_dev -f seed_kode_rekening_blud_COMPLETE.sql

# Opsi B: Via psql interactive
\i /path/to/seed_kode_rekening_blud_COMPLETE.sql
```

### 3. **Verifikasi Import**

```sql
-- Hitung total records
SELECT COUNT(*) FROM ms_kode_rekening;
-- Expected: ~264 records

-- Lihat struktur hierarki PENDAPATAN
SELECT 
    kode,
    REPEAT('  ', level - 1) || uraian AS uraian_indented,
    is_header
FROM ms_kode_rekening
WHERE kelompok = '4'
ORDER BY kode;

-- Lihat struktur hierarki BELANJA
SELECT 
    kode,
    REPEAT('  ', level - 1) || uraian AS uraian_indented,
    is_header
FROM ms_kode_rekening
WHERE kelompok = '5' AND level <= 4
ORDER BY kode;

-- Lihat semua kode IT
SELECT kode, uraian 
FROM ms_kode_rekening 
WHERE kode LIKE '5.1.2.20%' OR kode LIKE '5.2.2.09%'
ORDER BY kode;
```

---

## 📖 Contoh Penggunaan Real

| Keperluan | Kode Rekening | Uraian |
|-----------|--------------|---------|
| **Pendapatan rawat inap VIP** | `4.1.1.01.01.0009` | Pendapatan Rawat Inap VIP |
| **Pendapatan Lab** | `4.1.1.01.01.0011` | Pendapatan Laboratorium |
| **Dana Kapitasi JKN** | `4.2.2.01.01` | Dana Kapitasi JKN - JPK |
| **Gaji PNS** | `5.1.1.01.01` | Belanja Gaji Pokok PNS |
| **Jasa Pelayanan Dokter** | `5.1.1.04.01` | Belanja JPK - Dokter |
| **Beli obat-obatan** | `5.1.2.02.01` | Belanja Obat-obatan |
| **Beli reagensia lab** | `5.1.2.02.04` | Belanja Reagensia Laboratorium |
| **Bayar listrik** | `5.1.2.03.03` | Belanja Listrik |
| **Jasa pengelolaan limbah medis** | `5.1.2.03.07` | Belanja Jasa Pengelolaan Limbah Medis |
| **Langganan Google One 2TB** | `5.1.2.20.01` | Belanja Langganan Cloud Storage |
| **Langganan Claude Pro** | `5.1.2.20.05` | Belanja Langganan AI Tools |
| **Langganan Canva Pro** | `5.1.2.20.04` | Belanja Langganan Design Tools |
| **Internet Dedicated 100Mbps** | `5.1.2.20.24` | Belanja Langganan Internet Dedicated |
| **Maintenance Si-Kancil** | `5.1.2.20.18` | Belanja Jasa Maintenance Software |
| **Lisensi Windows Server** | `5.1.2.20.15` | Belanja Lisensi Operating System |
| **Beli Server Dell** | `5.2.2.09.01` | Belanja Modal Server |
| **Beli alat USG** | `5.2.2.07.09` | Belanja Modal Alat Kebidanan |
| **Beli Ambulance** | `5.2.2.07.13` | Belanja Modal Ambulance |

---

## ⚡ Fitur Utama

✅ **100% Compliance** - Sesuai Permendagri 64/2013  
✅ **Hospital-Ready** - Fokus kebutuhan RSUD/Puskesmas  
✅ **Modern IT Support** - 50+ kode IT & Digital Services  
✅ **Hierarchical Structure** - Parent-child relationship yang benar  
✅ **Audit-Ready** - Field is_header & is_active untuk kontrol  
✅ **Complete Coverage** - Level 1 sampai Level 6  

---

## 📝 Catatan Penting

### 1. **Kapitalisasi Belanja**
- Belanja **< Rp 5 juta** → Masuk **Belanja Barang dan Jasa** (5.1.X)
- Belanja **≥ Rp 5 juta** + umur ekonomis > 1 tahun → Masuk **Belanja Modal** (5.2.X)

### 2. **Subscription vs License**
- **Subscription** (bulanan/tahunan) → `5.1.2.20.XX` (Belanja Jasa)
- **License Perpetual** (sekali bayar) → `5.1.2.20.14-17` (Belanja Jasa)
- **Hardware/Equipment** → `5.2.2.XX` (Belanja Modal)

### 3. **Kode Header vs Transaksi**
- `is_header = true` → Hanya untuk grouping, **TIDAK BISA** dipakai transaksi
- `is_header = false` → Kode detail yang **BISA** dipakai transaksi

### 4. **Customization**
Seed ini adalah **baseline standard**. Anda bisa:
- Menambah kode detail sesuai kebutuhan RSUD spesifik
- Menonaktifkan kode yang tidak dipakai (`is_active = false`)
- Menambah level 7-8 jika diperlukan detail lebih granular

---

## 🔗 Integrasi dengan Si-Kancil

### Database Schema (Prisma)
```prisma
model ms_kode_rekening {
  id          Int      @id @default(autoincrement())
  kode        String   @unique @db.VarChar(20)
  kelompok    String   @db.Char(1)
  level       Int
  parent_id   Int?
  uraian      String   @db.Text
  is_header   Boolean  @default(false)
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  parent      ms_kode_rekening?  @relation("KodeRekeningHierarchy", fields: [parent_id], references: [id])
  children    ms_kode_rekening[] @relation("KodeRekeningHierarchy")

  // Relasi ke tabel lain
  rba_details          rba_detail[]
  realisasi_pendapatan realisasi_pendapatan[]
  realisasi_belanja    realisasi_belanja[]

  @@index([kode])
  @@index([parent_id])
  @@index([kelompok])
  @@map("ms_kode_rekening")
}
```

---

## 📚 Referensi Regulasi

1. **Permendagri 64/2013** - Penerapan SAP Berbasis Akrual pada Pemda
2. **PMK 220/2016** - Pengelolaan Keuangan BLUD
3. **Permendagri 61/2007** - Pedoman Teknis Pengelolaan Keuangan BLUD
4. **Permendagri 79/2018** - BLUD di Lingkungan Pemda

---

## 📊 Statistik File

```
Total Lines:           504
Total INSERT blocks:   39
Total Records:         ~264 kode rekening
File Size:             ~45 KB
Encoding:              UTF-8
Database:              PostgreSQL 17+
```

---

## ✅ Checklist Kelengkapan

- ✅ Pendapatan Retribusi Kesehatan (23 detail)
- ✅ Dana Kapitasi JKN & BOK
- ✅ Belanja Pegawai BLUD (JPK/Non-JPK)
- ✅ Belanja Obat & BMHP (8 kategori)
- ✅ Belanja Jasa Medis (Limbah, Sterilisasi, Kalibrasi, Laundry)
- ✅ **Belanja IT & Digital Services (31 kode) - NEW!**
- ✅ Belanja Modal Alat Kedokteran (13 spesialisasi)
- ✅ Belanja Modal Alat Laboratorium (4 jenis)
- ✅ **Belanja Modal IT Infrastructure (20 kode) - NEW!**
- ✅ Belanja Modal Instalasi Medis (Gas, Limbah, Fiber Optic)

---

## 🎯 Next Steps

1. ✅ **Import seed data** ke database development
2. 🔄 **Generate Prisma Client** setelah schema update
3. 🔄 **Buat API endpoints** untuk CRUD kode rekening
4. 🔄 **Buat UI autocomplete** untuk input RBA
5. 🔄 **Mapping RBA** (Program-Kegiatan-Output) ke kode rekening
6. 🔄 **Validasi** dengan DPKAD/Bapenda setempat

---

## 📧 Support

Untuk pertanyaan atau customization, hubungi tim RSDS_DEV.

**Project:** Si-Kancil Financial Management System  
**Version:** 1.0.0  
**Last Updated:** February 2026  
**License:** Proprietary - RSDS_DEV

---

**🎉 Selamat Menggunakan! Database kode rekening BLUD Anda sudah LENGKAP dan siap production!**
