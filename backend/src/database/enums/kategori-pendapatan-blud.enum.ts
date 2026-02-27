/**
 * Enum: KategoriPendapatanBLUD
 * Klasifikasi kategori pendapatan untuk BLUD
 * Sesuai dengan PMK 220/2016 tentang BLUD
 */
export enum KategoriPendapatanBLUD {
  OPERASIONAL_JASA_LAYANAN = 'OPERASIONAL_JASA_LAYANAN', // Pendapatan dari jasa layanan kesehatan
  OPERASIONAL_USAHA_LAINNYA = 'OPERASIONAL_USAHA_LAINNYA', // Usaha lain yang mendukung operasional
  NON_OPERASIONAL = 'NON_OPERASIONAL', // Pendapatan di luar usaha utama (bunga, investasi, dll)
  HIBAH = 'HIBAH', // Hibah dari pihak ketiga
  TRANSFER_APBD = 'TRANSFER_APBD', // Transfer dari APBD (kapitasi, BOK, subsidi)
}

/**
 * Enum: JenisPenjamin
 * Klasifikasi penjamin untuk pendapatan jasa layanan
 */
export enum JenisPenjamin {
  BPJS_KESEHATAN = 'BPJS_KESEHATAN', // BPJS Kesehatan
  UMUM = 'UMUM', // Pasien umum (bayar sendiri)
  ASURANSI_SWASTA = 'ASURANSI_SWASTA', // Asuransi swasta (Prudential, Allianz, dll)
  JAMINAN_PERUSAHAAN = 'JAMINAN_PERUSAHAAN', // Jaminan dari perusahaan
  LAINNYA = 'LAINNYA', // Penjamin lainnya
}

/**
 * Enum: JenisHibah
 * Klasifikasi jenis hibah
 */
export enum JenisHibah {
  UANG = 'UANG', // Hibah dalam bentuk uang/kas
  BARANG = 'BARANG', // Hibah dalam bentuk barang
  JASA = 'JASA', // Hibah dalam bentuk jasa
}

/**
 * Enum: StatusHibah
 * Status pengelolaan hibah
 */
export enum StatusHibah {
  DITERIMA = 'DITERIMA', // Hibah sudah diterima, belum digunakan
  SEBAGIAN_DIGUNAKAN = 'SEBAGIAN_DIGUNAKAN', // Sebagian sudah digunakan
  SUDAH_DIGUNAKAN = 'SUDAH_DIGUNAKAN', // Sudah digunakan semua
  DILAPORKAN = 'DILAPORKAN', // Sudah dilaporkan pertanggungjawabannya
}
