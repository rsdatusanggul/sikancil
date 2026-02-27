export enum JenisAnggaranKas {
  PENERIMAAN = 'PENERIMAAN',
  PENGELUARAN = 'PENGELUARAN',
}

export interface AnggaranKas {
  id: string;
  tahun: number;
  bulan: number;
  jenisAnggaran: JenisAnggaranKas;
  kodeRekening: string;
  uraian: string;
  jumlahAnggaran: number;
  realisasi: number;
  keterangan?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnggaranKasDto {
  tahun: number;
  bulan: number;
  jenisAnggaran: JenisAnggaranKas;
  kodeRekening: string;
  uraian: string;
  jumlahAnggaran: number;
  realisasi?: number;
  keterangan?: string;
}

export interface UpdateAnggaranKasDto extends Partial<CreateAnggaranKasDto> {}

export interface QueryAnggaranKasParams {
  tahun?: number;
  bulan?: number;
  jenisAnggaran?: JenisAnggaranKas;
  kodeRekening?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CashFlowProjection {
  bulan: number;
  namaBulan: string;
  penerimaan: number;
  pengeluaran: number;
  saldo: number;
  saldoKumulatif: number;
}

export interface MonthlyTotal {
  tahun: number;
  bulan: number;
  penerimaan: number;
  pengeluaran: number;
  saldo: number;
}
