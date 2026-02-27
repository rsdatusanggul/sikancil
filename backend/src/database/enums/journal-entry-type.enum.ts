/**
 * Enum: JournalEntryType
 * Jenis jurnal entry
 */
export enum JournalEntryType {
  GENERAL = 'GENERAL', // Jurnal Umum
  ADJUSTMENT = 'ADJUSTMENT', // Jurnal Penyesuaian
  CLOSING = 'CLOSING', // Jurnal Penutup
  REVERSAL = 'REVERSAL', // Jurnal Pembalik
  AUTO = 'AUTO', // Jurnal Otomatis dari sistem
}
