-- =====================================================
-- SEED DATA: KODE REKENING BLUD (BADAN LAYANAN UMUM DAERAH)
-- Berdasarkan: Permendagri 64/2013
-- Untuk: Si-Kancil Financial Management System
-- =====================================================

-- Hapus data lama jika ada
TRUNCATE TABLE ms_kode_rekening RESTART IDENTITY CASCADE;

-- =====================================================
-- PENDAPATAN (4.X.X.XX.XX.XXXX)
-- =====================================================

-- Level 1: Kelompok Pendapatan
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('4', '4', 1, NULL, 'PENDAPATAN', true, true);

-- Level 2: Jenis Pendapatan
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('4.1', '4', 2, 1, 'PENDAPATAN ASLI DAERAH', true, true),
('4.2', '4', 2, 1, 'PENDAPATAN TRANSFER', true, true);

-- Level 3: Obyek Pendapatan PAD
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
-- PAD - Retribusi Daerah
('4.1.1', '4', 3, 2, 'Pendapatan Retribusi Daerah', true, true),
('4.1.2', '4', 3, 2, 'Pendapatan Hasil Pengelolaan Kekayaan Daerah yang Dipisahkan', true, true),
('4.1.3', '4', 3, 2, 'Lain-lain PAD yang Sah', true, true);

-- Level 4: Rincian Obyek - Retribusi Jasa Umum (Pelayanan Kesehatan)
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('4.1.1.01', '4', 4, 4, 'Retribusi Jasa Umum', true, true),
('4.1.1.02', '4', 4, 4, 'Retribusi Jasa Usaha', true, true);

-- Level 5: Sub Rincian Obyek - Detail Layanan Kesehatan
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
-- Retribusi Pelayanan Kesehatan
('4.1.1.01.01', '4', 5, 7, 'Retribusi Pelayanan Kesehatan', true, true);

-- Level 6: Detail Per Jenis Layanan (Sub-Sub Rincian Obyek)
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
-- Rawat Jalan
('4.1.1.01.01.0001', '4', 6, 9, 'Pendapatan Rawat Jalan Umum', false, true),
('4.1.1.01.01.0002', '4', 6, 9, 'Pendapatan Rawat Jalan Gigi', false, true),
('4.1.1.01.01.0003', '4', 6, 9, 'Pendapatan Rawat Jalan Spesialis', false, true),
('4.1.1.01.01.0004', '4', 6, 9, 'Pendapatan Rawat Jalan KIA/KB', false, true),
('4.1.1.01.01.0005', '4', 6, 9, 'Pendapatan Rawat Jalan Gawat Darurat', false, true),

-- Rawat Inap
('4.1.1.01.01.0006', '4', 6, 9, 'Pendapatan Rawat Inap Kelas III', false, true),
('4.1.1.01.01.0007', '4', 6, 9, 'Pendapatan Rawat Inap Kelas II', false, true),
('4.1.1.01.01.0008', '4', 6, 9, 'Pendapatan Rawat Inap Kelas I', false, true),
('4.1.1.01.01.0009', '4', 6, 9, 'Pendapatan Rawat Inap VIP', false, true),
('4.1.1.01.01.0010', '4', 6, 9, 'Pendapatan Rawat Inap Intensive Care (ICU/ICCU/NICU/PICU)', false, true),

-- Penunjang Medis
('4.1.1.01.01.0011', '4', 6, 9, 'Pendapatan Laboratorium', false, true),
('4.1.1.01.01.0012', '4', 6, 9, 'Pendapatan Radiologi', false, true),
('4.1.1.01.01.0013', '4', 6, 9, 'Pendapatan Farmasi', false, true),
('4.1.1.01.01.0014', '4', 6, 9, 'Pendapatan Kamar Operasi', false, true),
('4.1.1.01.01.0015', '4', 6, 9, 'Pendapatan Kamar Bersalin', false, true),
('4.1.1.01.01.0016', '4', 6, 9, 'Pendapatan Hemodialisa', false, true),
('4.1.1.01.01.0017', '4', 6, 9, 'Pendapatan Fisioterapi', false, true),
('4.1.1.01.01.0018', '4', 6, 9, 'Pendapatan Medical Check Up', false, true),

-- Ambulance & Jenazah
('4.1.1.01.01.0019', '4', 6, 9, 'Pendapatan Ambulance', false, true),
('4.1.1.01.01.0020', '4', 6, 9, 'Pendapatan Pelayanan Jenazah', false, true),

-- Pendapatan Lain-lain Jasa Layanan
('4.1.1.01.01.0021', '4', 6, 9, 'Pendapatan Jasa Visum et Repertum', false, true),
('4.1.1.01.01.0022', '4', 6, 9, 'Pendapatan Surat Keterangan Sehat', false, true),
('4.1.1.01.01.0023', '4', 6, 9, 'Pendapatan Jasa Sewa Alat Kesehatan', false, true);

-- Pendapatan Hasil Pengelolaan Kekayaan Daerah
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('4.1.2.01', '4', 4, 5, 'Bagian Laba atas Penyertaan Modal pada BLUD', true, true),
('4.1.2.01.01', '4', 5, 33, 'Bagian Laba atas Penyertaan Modal pada BLUD', false, true);

-- Lain-lain PAD yang Sah
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('4.1.3.01', '4', 4, 6, 'Pendapatan Hibah', true, true),
('4.1.3.02', '4', 4, 6, 'Pendapatan Lainnya', true, true),
('4.1.3.01.01', '4', 5, 35, 'Pendapatan Hibah dari Pemerintah', false, true),
('4.1.3.01.02', '4', 5, 35, 'Pendapatan Hibah dari Masyarakat/Lembaga', false, true),
('4.1.3.02.01', '4', 5, 36, 'Pendapatan Jasa Giro', false, true),
('4.1.3.02.02', '4', 5, 36, 'Pendapatan Bunga Deposito', false, true),
('4.1.3.02.03', '4', 5, 36, 'Pendapatan Denda Keterlambatan', false, true),
('4.1.3.02.04', '4', 5, 36, 'Pendapatan Kerjasama Operasional', false, true);

-- Pendapatan Transfer
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('4.2.1', '4', 3, 3, 'Transfer Pemerintah Pusat - Dana Perimbangan', true, true),
('4.2.2', '4', 3, 3, 'Transfer Pemerintah Pusat Lainnya', true, true),
('4.2.3', '4', 3, 3, 'Transfer Pemerintah Provinsi', true, true),

-- Dana Kapitasi JKN
('4.2.2.01', '4', 4, 43, 'Dana Kapitasi JKN', true, true),
('4.2.2.01.01', '4', 5, 45, 'Dana Kapitasi JKN - Jasa Pelayanan Kesehatan (JPK)', false, true),
('4.2.2.01.02', '4', 5, 45, 'Dana Kapitasi JKN - Non JPK', false, true),

-- Dana BOK (Bantuan Operasional Kesehatan)
('4.2.2.02', '4', 4, 43, 'Dana Bantuan Operasional Kesehatan (BOK)', true, true),
('4.2.2.02.01', '4', 5, 48, 'Dana BOK', false, true),

-- Transfer Pemerintah Provinsi
('4.2.3.01', '4', 4, 44, 'Dana Hibah Provinsi', true, true),
('4.2.3.01.01', '4', 5, 50, 'Dana Hibah dari Pemerintah Provinsi', false, true);

-- =====================================================
-- BELANJA (5.X.X.XX.XX.XXXX)
-- =====================================================

-- Level 1: Kelompok Belanja
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5', '5', 1, NULL, 'BELANJA', true, true);

-- Level 2: Jenis Belanja
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1', '5', 2, 52, 'BELANJA OPERASI', true, true),
('5.2', '5', 2, 52, 'BELANJA MODAL', true, true),
('5.3', '5', 2, 52, 'BELANJA TIDAK TERDUGA', true, true);

-- =====================================================
-- BELANJA OPERASI
-- =====================================================

-- Level 3: Obyek Belanja Operasi
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.1', '5', 3, 53, 'Belanja Pegawai', true, true),
('5.1.2', '5', 3, 53, 'Belanja Barang dan Jasa', true, true),
('5.1.3', '5', 3, 53, 'Belanja Bunga', true, true),
('5.1.4', '5', 3, 53, 'Belanja Subsidi', true, true),
('5.1.5', '5', 3, 53, 'Belanja Hibah', true, true),
('5.1.6', '5', 3, 53, 'Belanja Bantuan Sosial', true, true);

-- =====================================================
-- BELANJA PEGAWAI (5.1.1)
-- =====================================================

INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
-- Level 4: Rincian Obyek Belanja Pegawai
('5.1.1.01', '5', 4, 56, 'Belanja Gaji dan Tunjangan', true, true),
('5.1.1.02', '5', 4, 56, 'Belanja Tambahan Penghasilan PNS', true, true),
('5.1.1.03', '5', 4, 56, 'Belanja Insentif Pemungutan Retribusi Daerah', true, true),
('5.1.1.04', '5', 4, 56, 'Belanja Pegawai BLUD', true, true);

-- Level 5: Sub Rincian Obyek - Gaji dan Tunjangan
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.1.01.01', '5', 5, 63, 'Belanja Gaji Pokok PNS', false, true),
('5.1.1.01.02', '5', 5, 63, 'Belanja Tunjangan Keluarga', false, true),
('5.1.1.01.03', '5', 5, 63, 'Belanja Tunjangan Jabatan', false, true),
('5.1.1.01.04', '5', 5, 63, 'Belanja Tunjangan Fungsional', false, true),
('5.1.1.01.05', '5', 5, 63, 'Belanja Tunjangan Fungsional Umum', false, true),
('5.1.1.01.06', '5', 5, 63, 'Belanja Tunjangan Beras', false, true),
('5.1.1.01.07', '5', 5, 63, 'Belanja Tunjangan PPh/Tunjangan Khusus', false, true),
('5.1.1.01.08', '5', 5, 63, 'Belanja Pembulatan Gaji', false, true),
('5.1.1.01.09', '5', 5, 63, 'Belanja Iuran Asuransi Kesehatan', false, true),
('5.1.1.01.10', '5', 5, 63, 'Belanja Iuran JKK', false, true),
('5.1.1.01.11', '5', 5, 63, 'Belanja Iuran JKM', false, true);

-- Tambahan Penghasilan PNS (TPP)
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.1.02.01', '5', 5, 64, 'Belanja Tambahan Penghasilan berdasarkan Beban Kerja', false, true),
('5.1.1.02.02', '5', 5, 64, 'Belanja Tambahan Penghasilan berdasarkan Prestasi Kerja', false, true),
('5.1.1.02.03', '5', 5, 64, 'Belanja Tambahan Penghasilan berdasarkan Kondisi Kerja', false, true);

-- Belanja Pegawai BLUD
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.1.04.01', '5', 5, 66, 'Belanja Jasa Pelayanan Kesehatan (JPK) - Dokter', false, true),
('5.1.1.04.02', '5', 5, 66, 'Belanja Jasa Pelayanan Kesehatan (JPK) - Perawat', false, true),
('5.1.1.04.03', '5', 5, 66, 'Belanja Jasa Pelayanan Kesehatan (JPK) - Bidan', false, true),
('5.1.1.04.04', '5', 5, 66, 'Belanja Jasa Pelayanan Kesehatan (JPK) - Tenaga Kesehatan Lainnya', false, true),
('5.1.1.04.05', '5', 5, 66, 'Belanja Jasa Pelayanan Non Kesehatan - Administrasi', false, true),
('5.1.1.04.06', '5', 5, 66, 'Belanja Jasa Pelayanan Non Kesehatan - Keuangan', false, true),
('5.1.1.04.07', '5', 5, 66, 'Belanja Jasa Pelayanan Non Kesehatan - Teknisi', false, true),
('5.1.1.04.08', '5', 5, 66, 'Belanja Jasa Pelayanan Non Kesehatan - Cleaning Service', false, true),
('5.1.1.04.09', '5', 5, 66, 'Belanja Jasa Pelayanan Non Kesehatan - Security', false, true),
('5.1.1.04.10', '5', 5, 66, 'Belanja Honorarium Tenaga Ahli/Narasumber', false, true),
('5.1.1.04.11', '5', 5, 66, 'Belanja Uang Lembur', false, true),
('5.1.1.04.12', '5', 5, 66, 'Belanja Insentif Kinerja', false, true);

-- =====================================================
-- BELANJA BARANG DAN JASA (5.1.2)
-- =====================================================

INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
-- Level 4: Rincian Obyek Belanja Barang dan Jasa
('5.1.2.01', '5', 4, 57, 'Belanja Bahan Pakai Habis', true, true),
('5.1.2.02', '5', 4, 57, 'Belanja Bahan/Material', true, true),
('5.1.2.03', '5', 4, 57, 'Belanja Jasa Kantor', true, true),
('5.1.2.04', '5', 4, 57, 'Belanja Premi Asuransi', true, true),
('5.1.2.05', '5', 4, 57, 'Belanja Perawatan Kendaraan Bermotor', true, true),
('5.1.2.06', '5', 4, 57, 'Belanja Cetak dan Penggandaan', true, true),
('5.1.2.07', '5', 4, 57, 'Belanja Sewa Rumah/Gedung/Gudang/Parkir', true, true),
('5.1.2.08', '5', 4, 57, 'Belanja Sewa Sarana Mobilitas', true, true),
('5.1.2.09', '5', 4, 57, 'Belanja Sewa Alat Berat', true, true),
('5.1.2.10', '5', 4, 57, 'Belanja Sewa Perlengkapan dan Peralatan Kantor', true, true),
('5.1.2.11', '5', 4, 57, 'Belanja Makanan dan Minuman', true, true),
('5.1.2.12', '5', 4, 57, 'Belanja Pakaian Dinas dan Atributnya', true, true),
('5.1.2.13', '5', 4, 57, 'Belanja Pakaian Kerja', true, true),
('5.1.2.14', '5', 4, 57, 'Belanja Pakaian Khusus dan Hari-hari Tertentu', true, true),
('5.1.2.15', '5', 4, 57, 'Belanja Perjalanan Dinas', true, true),
('5.1.2.16', '5', 4, 57, 'Belanja Pemeliharaan', true, true),
('5.1.2.17', '5', 4, 57, 'Belanja Jasa Konsultansi', true, true),
('5.1.2.18', '5', 4, 57, 'Belanja Barang untuk Diserahkan kepada Masyarakat', true, true),
('5.1.2.19', '5', 4, 57, 'Belanja Barang untuk Dijual kepada Masyarakat', true, true);

-- Level 5: Detail Belanja Bahan Pakai Habis (CRITICAL untuk BLUD Kesehatan)
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.2.01.01', '5', 5, 88, 'Belanja Alat Tulis Kantor', false, true),
('5.1.2.01.02', '5', 5, 88, 'Belanja Alat Listrik dan Elektronik (Lampu Pijar, Battery Kering)', false, true),
('5.1.2.01.03', '5', 5, 88, 'Belanja Perangko, Materai dan Benda Pos Lainnya', false, true),
('5.1.2.01.04', '5', 5, 88, 'Belanja Peralatan Kebersihan dan Bahan Pembersih', false, true),
('5.1.2.01.05', '5', 5, 88, 'Belanja Bahan Bakar Minyak/Gas', false, true),
('5.1.2.01.06', '5', 5, 88, 'Belanja Pengisian Tabung Pemadam Kebakaran', false, true),
('5.1.2.01.07', '5', 5, 88, 'Belanja Pengisian Tabung Gas', false, true);

-- Belanja Bahan/Material (KHUSUS MEDIS)
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.2.02.01', '5', 5, 89, 'Belanja Obat-obatan', false, true),
('5.1.2.02.02', '5', 5, 89, 'Belanja Bahan Medis Habis Pakai (BMHP)', false, true),
('5.1.2.02.03', '5', 5, 89, 'Belanja Alat Kesehatan Habis Pakai', false, true),
('5.1.2.02.04', '5', 5, 89, 'Belanja Reagensia Laboratorium', false, true),
('5.1.2.02.05', '5', 5, 89, 'Belanja Film Rontgen', false, true),
('5.1.2.02.06', '5', 5, 89, 'Belanja Bahan Kimia dan Gas Medis', false, true),
('5.1.2.02.07', '5', 5, 89, 'Belanja Bahan Makanan Pasien', false, true),
('5.1.2.02.08', '5', 5, 89, 'Belanja Bahan Linen/Laundry', false, true);

-- Belanja Jasa Kantor
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.2.03.01', '5', 5, 90, 'Belanja Telepon', false, true),
('5.1.2.03.02', '5', 5, 90, 'Belanja Air', false, true),
('5.1.2.03.03', '5', 5, 90, 'Belanja Listrik', false, true),
('5.1.2.03.04', '5', 5, 90, 'Belanja Jasa Pengiriman Surat Dinas Pos Pusat', false, true),
('5.1.2.03.05', '5', 5, 90, 'Belanja Kawat/Faksimili/Internet/Intranet/TV Kabel/TV Satelit', false, true),
('5.1.2.03.06', '5', 5, 90, 'Belanja Jasa Pengumuman Lelang/Pemenang Lelang', false, true),
('5.1.2.03.07', '5', 5, 90, 'Belanja Jasa Pengelolaan Limbah Medis', false, true),
('5.1.2.03.08', '5', 5, 90, 'Belanja Jasa Pengelolaan Sampah', false, true),
('5.1.2.03.09', '5', 5, 90, 'Belanja Jasa Cleaning Service', false, true),
('5.1.2.03.10', '5', 5, 90, 'Belanja Jasa Security/Satpam', false, true),
('5.1.2.03.11', '5', 5, 90, 'Belanja Jasa Pemeliharaan Aplikasi/Software', false, true),
('5.1.2.03.12', '5', 5, 90, 'Belanja Jasa Kalibrasi Alat Kesehatan', false, true),
('5.1.2.03.13', '5', 5, 90, 'Belanja Jasa Sterilisasi', false, true),
('5.1.2.03.14', '5', 5, 90, 'Belanja Jasa Laundry', false, true);

-- Belanja Premi Asuransi
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.2.04.01', '5', 5, 91, 'Belanja Premi Asuransi Kesehatan', false, true),
('5.1.2.04.02', '5', 5, 91, 'Belanja Premi Asuransi Kendaraan', false, true),
('5.1.2.04.03', '5', 5, 91, 'Belanja Premi Asuransi Kebakaran', false, true),
('5.1.2.04.04', '5', 5, 91, 'Belanja Premi Asuransi Peralatan Medis', false, true);

-- Belanja Perawatan Kendaraan Bermotor
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.2.05.01', '5', 5, 92, 'Belanja Jasa Service Kendaraan Bermotor', false, true),
('5.1.2.05.02', '5', 5, 92, 'Belanja Penggantian Suku Cadang Kendaraan Bermotor', false, true),
('5.1.2.05.03', '5', 5, 92, 'Belanja Bahan Bakar Minyak/Gas dan Pelumas Kendaraan Bermotor', false, true);

-- Belanja Makanan dan Minuman
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.2.11.01', '5', 5, 98, 'Belanja Makanan dan Minuman Rapat', false, true),
('5.1.2.11.02', '5', 5, 98, 'Belanja Makanan dan Minuman Tamu', false, true),
('5.1.2.11.03', '5', 5, 98, 'Belanja Makanan dan Minuman Pasien', false, true),
('5.1.2.11.04', '5', 5, 98, 'Belanja Makanan dan Minuman Pegawai (Piket/Shift)', false, true);

-- Belanja Perjalanan Dinas
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.2.15.01', '5', 5, 102, 'Belanja Perjalanan Dinas Dalam Daerah', false, true),
('5.1.2.15.02', '5', 5, 102, 'Belanja Perjalanan Dinas Luar Daerah', false, true),
('5.1.2.15.03', '5', 5, 102, 'Belanja Perjalanan Dinas Rujukan Pasien', false, true);

-- Belanja Pemeliharaan
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.1.2.16.01', '5', 5, 103, 'Belanja Pemeliharaan Gedung dan Bangunan', false, true),
('5.1.2.16.02', '5', 5, 103, 'Belanja Pemeliharaan Peralatan Medis', false, true),
('5.1.2.16.03', '5', 5, 103, 'Belanja Pemeliharaan Peralatan Non Medis', false, true),
('5.1.2.16.04', '5', 5, 103, 'Belanja Pemeliharaan Jaringan dan Instalasi', false, true),
('5.1.2.16.05', '5', 5, 103, 'Belanja Pemeliharaan Komputer dan Printer', false, true);

-- =====================================================
-- BELANJA MODAL (5.2)
-- =====================================================

INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
-- Level 3: Obyek Belanja Modal
('5.2.1', '5', 3, 54, 'Belanja Modal Tanah', true, true),
('5.2.2', '5', 3, 54, 'Belanja Modal Peralatan dan Mesin', true, true),
('5.2.3', '5', 3, 54, 'Belanja Modal Gedung dan Bangunan', true, true),
('5.2.4', '5', 3, 54, 'Belanja Modal Jalan, Irigasi dan Jaringan', true, true),
('5.2.5', '5', 3, 54, 'Belanja Modal Aset Tetap Lainnya', true, true);

-- Level 4: Rincian Obyek Belanja Modal Peralatan dan Mesin (CRITICAL untuk BLUD)
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.2.2.01', '5', 4, 150, 'Belanja Modal Alat-alat Berat', true, true),
('5.2.2.02', '5', 4, 150, 'Belanja Modal Alat-alat Angkutan', true, true),
('5.2.2.03', '5', 4, 150, 'Belanja Modal Alat-alat bengkel dan Alat Ukur', true, true),
('5.2.2.04', '5', 4, 150, 'Belanja Modal Alat-alat Pertanian', true, true),
('5.2.2.05', '5', 4, 150, 'Belanja Modal Alat-alat Kantor dan Rumah Tangga', true, true),
('5.2.2.06', '5', 4, 150, 'Belanja Modal Alat Studio dan Alat Komunikasi', true, true),
('5.2.2.07', '5', 4, 150, 'Belanja Modal Alat-alat Kedokteran', true, true),
('5.2.2.08', '5', 4, 150, 'Belanja Modal Alat-alat Laboratorium', true, true);

-- Level 5: Detail Belanja Modal Alat Kedokteran (SUPER CRITICAL)
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.2.2.07.01', '5', 5, 158, 'Belanja Modal Alat Kedokteran Umum', false, true),
('5.2.2.07.02', '5', 5, 158, 'Belanja Modal Alat Kedokteran Gigi', false, true),
('5.2.2.07.03', '5', 5, 158, 'Belanja Modal Alat Kedokteran THT', false, true),
('5.2.2.07.04', '5', 5, 158, 'Belanja Modal Alat Kedokteran Mata', false, true),
('5.2.2.07.05', '5', 5, 158, 'Belanja Modal Alat Kedokteran Bedah', false, true),
('5.2.2.07.06', '5', 5, 158, 'Belanja Modal Alat Kedokteran Radiologi', false, true),
('5.2.2.07.07', '5', 5, 158, 'Belanja Modal Alat Kedokteran Anastesi', false, true),
('5.2.2.07.08', '5', 5, 158, 'Belanja Modal Alat Kedokteran Rehabilitasi Medik', false, true),
('5.2.2.07.09', '5', 5, 158, 'Belanja Modal Alat Kedokteran Kebidanan dan Penyakit Kandungan', false, true),
('5.2.2.07.10', '5', 5, 158, 'Belanja Modal Alat Kedokteran Kesehatan Anak', false, true),
('5.2.2.07.11', '5', 5, 158, 'Belanja Modal Alat Kedokteran ICU/ICCU/NICU/PICU', false, true),
('5.2.2.07.12', '5', 5, 158, 'Belanja Modal Alat Kedokteran Hemodialisa', false, true),
('5.2.2.07.13', '5', 5, 158, 'Belanja Modal Ambulance', false, true);

-- Belanja Modal Alat Laboratorium
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.2.2.08.01', '5', 5, 159, 'Belanja Modal Alat Laboratorium Kimia', false, true),
('5.2.2.08.02', '5', 5, 159, 'Belanja Modal Alat Laboratorium Patologi Klinik', false, true),
('5.2.2.08.03', '5', 5, 159, 'Belanja Modal Alat Laboratorium Mikrobiologi', false, true),
('5.2.2.08.04', '5', 5, 159, 'Belanja Modal Alat Laboratorium Patologi Anatomi', false, true);

-- Belanja Modal Alat Kantor
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.2.2.05.01', '5', 5, 156, 'Belanja Modal Alat Kantor', false, true),
('5.2.2.05.02', '5', 5, 156, 'Belanja Modal Alat Rumah Tangga', false, true),
('5.2.2.05.03', '5', 5, 156, 'Belanja Modal Komputer', false, true),
('5.2.2.05.04', '5', 5, 156, 'Belanja Modal Meubelair', false, true),
('5.2.2.05.05', '5', 5, 156, 'Belanja Modal Alat Dapur', false, true);

-- Belanja Modal Angkutan
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.2.2.02.01', '5', 5, 153, 'Belanja Modal Kendaraan Dinas Bermotor Perorangan', false, true),
('5.2.2.02.02', '5', 5, 153, 'Belanja Modal Kendaraan Dinas Bermotor Penumpang', false, true),
('5.2.2.02.03', '5', 5, 153, 'Belanja Modal Kendaraan Dinas Bermotor Angkutan Barang', false, true),
('5.2.2.02.04', '5', 5, 153, 'Belanja Modal Kendaraan Dinas Bermotor Khusus (Ambulance)', false, true);

-- Belanja Modal Gedung dan Bangunan
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.2.3.01', '5', 4, 151, 'Belanja Modal Bangunan Gedung', true, true),
('5.2.3.02', '5', 4, 151, 'Belanja Modal Monumen', true, true),

('5.2.3.01.01', '5', 5, 190, 'Belanja Modal Bangunan Gedung Tempat Kerja', false, true),
('5.2.3.01.02', '5', 5, 190, 'Belanja Modal Bangunan Gedung Tempat Tinggal', false, true),
('5.2.3.01.03', '5', 5, 190, 'Belanja Modal Bangunan Menara', false, true),
('5.2.3.01.04', '5', 5, 190, 'Belanja Modal Bangunan Instalasi Pengolahan Air', false, true),
('5.2.3.01.05', '5', 5, 190, 'Belanja Modal Bangunan Instalasi Listrik dan Telepon', false, true),
('5.2.3.01.06', '5', 5, 190, 'Belanja Modal Bangunan Instalasi Gas Medis', false, true),
('5.2.3.01.07', '5', 5, 190, 'Belanja Modal Bangunan Instalasi Pengolahan Sampah', false, true);

-- =====================================================
-- BELANJA TIDAK TERDUGA (5.3)
-- =====================================================

INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.3.1', '5', 3, 55, 'Belanja Tidak Terduga', true, true),
('5.3.1.01', '5', 4, 198, 'Belanja Tidak Terduga', true, true),
('5.3.1.01.01', '5', 5, 199, 'Belanja Tidak Terduga', false, true);

-- =====================================================
-- UPDATE parent_id untuk relasi hierarki
-- =====================================================

-- Selesai! Total sekitar 200+ kode rekening standar BLUD

COMMENT ON TABLE ms_kode_rekening IS 'Master Kode Rekening BLUD sesuai Permendagri 64/2013';
-- =====================================================
-- SUPPLEMENT: KODE REKENING IT & DIGITAL SERVICES
-- Tambahan untuk Belanja Teknologi Informasi BLUD
-- =====================================================

-- =====================================================
-- BELANJA BARANG DAN JASA - IT & DIGITAL
-- =====================================================

-- Tambahkan Rincian Obyek untuk Belanja Jasa IT
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
-- Ambil parent_id dari '5.1.2' (Belanja Barang dan Jasa)
('5.1.2.20', '5', 4, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2'), 'Belanja Jasa Teknologi Informasi dan Komunikasi', true, true);

-- Level 5: Detail Belanja Jasa TIK
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
-- Cloud Services & SaaS Subscriptions
('5.1.2.20.01', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Cloud Storage (Google One, Dropbox, OneDrive, dll)', false, true),
('5.1.2.20.02', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Cloud Computing/Server (AWS, Azure, Google Cloud, dll)', false, true),
('5.1.2.20.03', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Software Produktivitas (Microsoft 365, Google Workspace)', false, true),
('5.1.2.20.04', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Design Tools (Canva Pro, Adobe Creative Cloud)', false, true),
('5.1.2.20.05', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan AI Tools (ChatGPT Plus, Claude Pro, Copilot)', false, true),
('5.1.2.20.06', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Project Management Tools (Asana, Trello, Notion)', false, true),
('5.1.2.20.07', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Video Conference (Zoom, Google Meet Premium)', false, true),
('5.1.2.20.08', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Antivirus/Security Software', false, true),
('5.1.2.20.09', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Backup Software/Services', false, true),
('5.1.2.20.10', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Database Services (MongoDB Atlas, Supabase)', false, true),

-- Domain & Hosting
('5.1.2.20.11', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Domain & Hosting Website', false, true),
('5.1.2.20.12', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan SSL Certificate', false, true),
('5.1.2.20.13', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan CDN Services (Cloudflare, Akamai)', false, true),

-- Software Licenses
('5.1.2.20.14', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Lisensi Software Aplikasi (non-subscription)', false, true),
('5.1.2.20.15', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Lisensi Operating System (Windows Server, dll)', false, true),
('5.1.2.20.16', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Lisensi Database (Oracle, SQL Server)', false, true),
('5.1.2.20.17', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Lisensi Software Medis (SIMRS, Rekam Medis Elektronik)', false, true),

-- IT Services
('5.1.2.20.18', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Jasa Maintenance Software/Aplikasi', false, true),
('5.1.2.20.19', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Jasa Pengembangan Software/Aplikasi Custom', false, true),
('5.1.2.20.20', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Jasa IT Support/Helpdesk', false, true),
('5.1.2.20.21', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Jasa Konsultan IT/Digital Transformation', false, true),
('5.1.2.20.22', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Jasa Cybersecurity/Penetration Testing', false, true),
('5.1.2.20.23', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Jasa Disaster Recovery/Business Continuity', false, true),

-- Internet & Connectivity
('5.1.2.20.24', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Internet Dedicated/Fiber Optic', false, true),
('5.1.2.20.25', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan VPN Services', false, true),
('5.1.2.20.26', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan API Services/Integration Platform', false, true),

-- Data & Analytics
('5.1.2.20.27', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Business Intelligence Tools (Tableau, Power BI)', false, true),
('5.1.2.20.28', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Analytics Platform (Google Analytics 360)', false, true),

-- Communication & Collaboration
('5.1.2.20.29', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Email Marketing (Mailchimp, SendGrid)', false, true),
('5.1.2.20.30', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan Digital Signature (DocuSign, Adobe Sign)', false, true),
('5.1.2.20.31', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.1.2.20'), 'Belanja Langganan CRM Software (Salesforce, HubSpot)', false, true);

-- =====================================================
-- BELANJA MODAL - PERALATAN IT
-- =====================================================

-- Tambahkan detail untuk Belanja Modal Komputer (sudah ada di seed utama sebagai 5.2.2.05.03)
-- Kita perlu breakdown lebih detail

INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
-- Level 6: Detail Komputer & Perangkat IT (child dari 5.2.2.05.03 yang sudah ada)
('5.2.2.05.03.0001', '5', 6, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.05.03'), 'Belanja Modal Personal Computer/Desktop', false, true),
('5.2.2.05.03.0002', '5', 6, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.05.03'), 'Belanja Modal Laptop/Notebook', false, true),
('5.2.2.05.03.0003', '5', 6, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.05.03'), 'Belanja Modal Tablet/iPad', false, true),
('5.2.2.05.03.0004', '5', 6, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.05.03'), 'Belanja Modal Printer', false, true),
('5.2.2.05.03.0005', '5', 6, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.05.03'), 'Belanja Modal Scanner', false, true),
('5.2.2.05.03.0006', '5', 6, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.05.03'), 'Belanja Modal Projector/Display', false, true),
('5.2.2.05.03.0007', '5', 6, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.05.03'), 'Belanja Modal UPS (Uninterruptible Power Supply)', false, true),
('5.2.2.05.03.0008', '5', 6, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.05.03'), 'Belanja Modal External Storage/NAS', false, true);

-- Tambahkan Rincian Obyek baru untuk Infrastruktur IT
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.2.2.09', '5', 4, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2'), 'Belanja Modal Peralatan Jaringan dan Infrastruktur IT', true, true);

-- Level 5: Detail Infrastruktur IT
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.2.2.09.01', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Server (Rack/Tower/Blade)', false, true),
('5.2.2.09.02', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Storage Server/SAN', false, true),
('5.2.2.09.03', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Network Switch (Managed/Unmanaged)', false, true),
('5.2.2.09.04', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Router', false, true),
('5.2.2.09.05', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Firewall/Security Appliance', false, true),
('5.2.2.09.06', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Access Point/Wireless Controller', false, true),
('5.2.2.09.07', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Rack Server Cabinet', false, true),
('5.2.2.09.08', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal CCTV System & NVR', false, true),
('5.2.2.09.09', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Telepon IP/PABX System', false, true),
('5.2.2.09.10', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Video Conference Equipment', false, true),
('5.2.2.09.11', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Barcode Scanner/RFID System', false, true),
('5.2.2.09.12', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.2.09'), 'Belanja Modal Biometric Device (Fingerprint/Face Recognition)', false, true);

-- =====================================================
-- BELANJA MODAL - GEDUNG & INSTALASI IT
-- =====================================================

-- Tambahkan instalasi IT dalam Belanja Modal Gedung
INSERT INTO ms_kode_rekening (kode, kelompok, level, parent_id, uraian, is_header, is_active) VALUES
('5.2.3.01.08', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.3.01'), 'Belanja Modal Bangunan Data Center/Server Room', false, true),
('5.2.3.01.09', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.3.01'), 'Belanja Modal Instalasi Jaringan Kabel (Structured Cabling)', false, true),
('5.2.3.01.10', '5', 5, (SELECT id FROM ms_kode_rekening WHERE kode = '5.2.3.01'), 'Belanja Modal Instalasi Fiber Optic', false, true);

-- =====================================================
-- CATATAN PENGGUNAAN
-- =====================================================

COMMENT ON COLUMN ms_kode_rekening.kode IS 'Kode rekening dengan format hierarki sesuai Permendagri 64/2013';

-- Contoh Penggunaan:
-- 1. Langganan Google One (1 TB) = 5.1.2.20.01
-- 2. Langganan Claude Pro = 5.1.2.20.05  
-- 3. Langganan Canva Pro = 5.1.2.20.04
-- 4. Pembelian Server Dell PowerEdge = 5.2.2.09.01
-- 5. Maintenance Si-Kancil = 5.1.2.20.18
-- 6. Langganan Internet Dedicated 100 Mbps = 5.1.2.20.24
-- 7. Pembelian Microsoft 365 Business = 5.1.2.20.03

-- =====================================================
-- QUERY TESTING
-- =====================================================

-- Test: Tampilkan semua kode IT
-- SELECT kode, uraian, is_header
-- FROM ms_kode_rekening
-- WHERE kode LIKE '5.1.2.20%' OR kode LIKE '5.2.2.09%' OR kode LIKE '5.2.2.05.03%'
-- ORDER BY kode;

COMMIT;
