# Si-Kancil

**Sistem Informasi Keuangan Cepat Lincah untuk BLUD** (Badan Layanan Umum Daerah).

Si-Kancil adalah platform manajemen keuangan terintegrasi yang dirancang khusus untuk memenuhi kebutuhan operasional dan pelaporan institusi BLUD. Proyek ini terdiri dari dua komponen utama: Backend API dan Frontend Web Application.

## 🏗️ Arsitektur Proyek

Proyek ini dibangun menggunakan arsitektur modern dengan pemisahan yang jelas antara backend dan frontend:

- **[Backend](./backend)**: NestJS API yang robust dengan PostgreSQL sebagai database utama. Mengelola autentikasi, otorisasi (RBAC), dan logika bisnis keuangan.
- **[Frontend](./frontend)**: Aplikasi React modern menggunakan Vite, Tailwind CSS, dan TanStack Query untuk pengalaman pengguna yang responsif dan performan.

## 🚀 Fitur Utama

- ✅ **Dashboard Analitik**: Visualisasi data keuangan secara real-time.
- ✅ **Perencanaan & RBA**: Manajemen Rencana Bisnis dan Anggaran.
- ✅ **Penatausahaan**: BKU Penerimaan/Pengeluaran, Buku Pembantu, dan Penutupan Kas.
- ✅ **Pelaporan Keuangan**: LRA, Neraca, Arus Kas, dan CaLK sesuai standar BLUD.
- ✅ **Keamanan Enterprise**: Autentikasi JWT, Role-Based Access Control (RBAC), dan Audit Trail lengkap.

## 🛠️ Stack Teknologi

| Komponen | Teknologi |
| :--- | :--- |
| **Framework Backend** | NestJS (Node.js) |
| **Framework Frontend** | React + Vite |
| **Bahasa** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | TypeORM |
| **Styling** | Tailwind CSS |
| **State Management** | Zustand |

## 🏁 Memulai (Quick Start)

### Prasyarat

- **Node.js**: Versi 20 LTS (direkomendasikan)
- **Database**: PostgreSQL 17
- **Package Manager**: `pnpm` (direkomendasikan)

### Langkah Instalasi

1. **Clone Repository**:
   ```bash
   git clone https://github.com/rsdatusanggul/sikancil.git
   cd sikancil
   ```

2. **Setup Backend**:
   Jalankan instruksi di [Backend README](./backend/README.md).
   ```bash
   cd backend
   pnpm install
   cp .env.example .env
   # Konfigurasi database di .env
   pnpm run start:dev
   ```

3. **Setup Frontend**:
   Jalankan instruksi di [Frontend README](./frontend/README.md).
   ```bash
   cd ../frontend
   pnpm install
   cp .env.example .env
   # Konfigurasi VITE_API_URL di .env
   pnpm dev
   ```

## 📄 Dokumentasi

- **Dokumentasi API**: Bisa diakses di `http://localhost:3000/api/docs` saat backend berjalan.
- **Masterplan Proyek**: Detail roadmap bisa dilihat di [SIKANCIL_MASTERPLAN_v2_FINAL.md](./docs/SIKANCIL_MASTERPLAN_v2_FINAL.md).

## 🤝 Kontribusi

Silakan ajukan Pull Request untuk fitur baru atau laporkan bug melalui GitHub Issues.

## 📜 Lisensi

Proprietary - RSDS (Rumah Sakit Daerah Sikancil). Seluruh hak cipta dilindungi.

---

**Versi**: 2.0.0-alpha  
**Pengembang**: RSDS Dev Team
