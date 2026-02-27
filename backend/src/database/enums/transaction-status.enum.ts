/**
 * Enum: TransactionStatus
 * Status umum transaksi keuangan
 */
export enum TransactionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
  VOID = 'VOID',
}
