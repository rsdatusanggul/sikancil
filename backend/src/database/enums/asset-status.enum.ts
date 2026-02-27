/**
 * Enum: AssetStatus
 * Status aset tetap
 */
export enum AssetStatus {
  ACTIVE = 'ACTIVE', // Aktif digunakan
  INACTIVE = 'INACTIVE', // Tidak aktif
  MAINTENANCE = 'MAINTENANCE', // Dalam pemeliharaan
  DISPOSED = 'DISPOSED', // Sudah dihapus/dijual
  LOST = 'LOST', // Hilang
}
