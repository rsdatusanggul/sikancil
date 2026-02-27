/**
 * Enum: BankTransactionType
 * Jenis transaksi bank
 */
export enum BankTransactionType {
  DEBIT = 'DEBIT', // Debit (masuk)
  CREDIT = 'CREDIT', // Kredit (keluar)
  TRANSFER_IN = 'TRANSFER_IN', // Transfer masuk
  TRANSFER_OUT = 'TRANSFER_OUT', // Transfer keluar
  ADJUSTMENT = 'ADJUSTMENT', // Penyesuaian
}
