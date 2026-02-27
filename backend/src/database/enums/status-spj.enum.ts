/**
 * Enum: StatusSPJ
 * Status untuk SPJ (UP/GU/TU)
 */
export enum StatusSPJ {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SPJ_APPROVED = 'SPJ_APPROVED', // Untuk GU: SPJ sudah disahkan
  SPP_CREATED = 'SPP_CREATED', // Untuk GU: SPP sudah dibuat
  SPM_ISSUED = 'SPM_ISSUED', // Untuk GU: SPM sudah terbit
  SP2D_ISSUED = 'SP2D_ISSUED', // Untuk GU: SP2D sudah terbit
  USED = 'USED', // Untuk TU: sudah digunakan
  SETTLED = 'SETTLED', // Untuk TU: sudah dipertanggungjawabkan
}
