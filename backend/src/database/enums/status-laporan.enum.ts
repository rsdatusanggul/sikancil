/**
 * Enum: StatusLaporan
 * Status untuk laporan-laporan penatausahaan
 */
export enum StatusLaporan {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SIGNED = 'SIGNED', // Untuk SPTJ yang sudah ditandatangani
}
