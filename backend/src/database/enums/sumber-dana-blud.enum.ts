/**
 * Enum: SumberDanaBLUD
 * Klasifikasi sumber dana untuk BLUD
 * Sesuai dengan regulasi PMK tentang BLUD
 */
export enum SumberDanaBLUD {
  APBD = 'APBD', // Rupiah Murni dari APBD
  PNBP_FUNGSIONAL = 'PNBP_FUNGSIONAL', // Pendapatan Fungsional/Mandiri
  HIBAH = 'HIBAH', // Hibah dari pihak ketiga
  PINJAMAN = 'PINJAMAN', // Pinjaman/Pembiayaan
  LAIN_LAIN = 'LAIN_LAIN', // Sumber dana lainnya
}
