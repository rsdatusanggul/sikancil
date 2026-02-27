/**
 * Enum: DepreciationMethod
 * Metode penyusutan aset tetap
 */
export enum DepreciationMethod {
  STRAIGHT_LINE = 'STRAIGHT_LINE', // Garis Lurus
  DECLINING_BALANCE = 'DECLINING_BALANCE', // Saldo Menurun
  DOUBLE_DECLINING = 'DOUBLE_DECLINING', // Saldo Menurun Ganda
  UNITS_OF_PRODUCTION = 'UNITS_OF_PRODUCTION', // Unit Produksi
}
