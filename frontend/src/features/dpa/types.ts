// DPA/DPPA Types & Interfaces

// Status enum
export enum DPAStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  REVISED = 'REVISED',
}

// Jenis Dokumen
export enum JenisDokumenDPA {
  DPA = 'DPA',
  DPPA = 'DPPA',
}

// Jenis Belanja
export enum JenisBelanja {
  OPERASIONAL = 'OPERASIONAL',
  MODAL = 'MODAL',
  TAK_TERDUGA = 'TAK_TERDUGA',
}

// Kategori Belanja
export enum KategoriBelanja {
  PEGAWAI = 'PEGAWAI',
  BARANG_JASA = 'BARANG_JASA',
  MODAL = 'MODAL',
}

// Sumber Dana
export enum SumberDana {
  APBD = 'APBD',
  FUNGSIONAL = 'FUNGSIONAL',
  HIBAH = 'HIBAH',
  LAINNYA = 'LAINNYA',
}

// Jenis Pendapatan
export enum JenisPendapatan {
  OPERASIONAL = 'OPERASIONAL',
  NON_OPERASIONAL = 'NON_OPERASIONAL',
  HIBAH = 'HIBAH',
  TRANSFER_APBD = 'TRANSFER_APBD',
}

// Kategori Pendapatan
export enum KategoriPendapatan {
  JASA_LAYANAN = 'JASA_LAYANAN',
  USAHA_LAIN = 'USAHA_LAIN',
  BUNGA = 'BUNGA',
  SEWA = 'SEWA',
  LAINNYA = 'LAINNYA',
}

// Jenis Pembiayaan
export enum JenisPembiayaan {
  PENERIMAAN = 'PENERIMAAN',
  PENGELUARAN = 'PENGELUARAN',
}

// Main DPA interface
export interface DPA {
  id: string;
  nomorDPA: string;
  jenisDokumen: JenisDokumenDPA;
  tahun: number;
  tahunAnggaran: number;
  status: DPAStatus;
  tanggalDokumen: string | null;
  tanggalBerlaku: string | null;
  tanggalSelesai: string | null;

  // Relations
  revisiRBAId: string | null;
  dpaSebelumnyaId: string | null;
  nomorRevisi: number;
  alasanRevisi: string | null;

  // Totals
  totalPaguPendapatan: number;
  totalPaguBelanja: number;
  totalPaguPembiayaan: number;
  totalRealisasiPendapatan: number;
  totalRealisasiBelanja: number;
  totalRealisasiPembiayaan: number;

  // Approval
  diajukanOleh: string | null;
  tanggalPengajuan: string | null;
  disetujuiOleh: string | null;
  tanggalPersetujuan: string | null;
  catatanPersetujuan: string | null;

  // SK
  nomorSK: string | null;
  tanggalSK: string | null;
  fileSK: string | null;

  // Files
  fileDPA: string | null;

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Relations (populated)
  belanja?: DPABelanja[];
  pendapatan?: DPAPendapatan[];
  pembiayaan?: DPAPembiayaan[];
  history?: DPAHistory[];
  dpaSebelumnya?: DPA;
}

// DPA Belanja
export interface DPABelanja {
  id: string;
  dpaId: string;

  // Program-Kegiatan-Output
  programId: string | null;
  kegiatanId: string | null;
  outputId: string | null;
  subOutputId: string | null;

  kodeProgram: string;
  namaProgram: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  kodeOutput: string;
  namaOutput: string;
  kodeSubOutput: string | null;
  namaSubOutput: string | null;

  // Rekening
  kodeRekening: string;
  namaRekening: string;

  // Klasifikasi
  jenisBelanja: string;
  kategori: string;
  sumberDana: string;

  // Target
  volumeTarget: number | null;
  satuan: string | null;

  // Pagu
  pagu: number;

  // Monthly breakdown
  januari: number;
  februari: number;
  maret: number;
  april: number;
  mei: number;
  juni: number;
  juli: number;
  agustus: number;
  september: number;
  oktober: number;
  november: number;
  desember: number;

  // Realisasi
  realisasi: number;
  komitmen: number;
  sisa: number;
  persentaseRealisasi: number;

  // Unit
  unitKerjaId: string | null;
  keterangan: string | null;

  createdAt: string;
  updatedAt: string;
}

// DPA Pendapatan
export interface DPAPendapatan {
  id: string;
  dpaId: string;

  // Rekening
  kodeRekening: string;
  namaRekening: string;

  // Klasifikasi
  jenisPendapatan: string;
  kategori: string;
  sumberPendapatan: string | null;

  // Pagu
  pagu: number;

  // Monthly breakdown
  januari: number;
  februari: number;
  maret: number;
  april: number;
  mei: number;
  juni: number;
  juli: number;
  agustus: number;
  september: number;
  oktober: number;
  november: number;
  desember: number;

  // Realisasi
  realisasi: number;
  sisa: number;
  persentaseRealisasi: number;

  unitKerjaId: string | null;
  keterangan: string | null;

  createdAt: string;
  updatedAt: string;
}

// DPA Pembiayaan
export interface DPAPembiayaan {
  id: string;
  dpaId: string;

  kodeRekening: string;
  namaRekening: string;

  jenisPembiayaan: string;
  kategori: string;

  pagu: number;

  // Monthly breakdown
  januari: number;
  februari: number;
  maret: number;
  april: number;
  mei: number;
  juni: number;
  juli: number;
  agustus: number;
  september: number;
  oktober: number;
  november: number;
  desember: number;

  realisasi: number;
  sisa: number;
  persentaseRealisasi: number;

  keterangan: string | null;

  createdAt: string;
  updatedAt: string;
}

// History
export interface DPAHistory {
  id: string;
  dpaId: string;
  action: string;
  userId: string;
  userName: string;
  oldValue: string | null;
  newValue: string | null;
  notes: string | null;
  createdAt: string;
}

// DTOs
export interface CreateDPADto {
  nomorDPA: string;
  jenisDokumen: JenisDokumenDPA;
  tahun: number;
  tahunAnggaran: number;
  tanggalDokumen?: string;
  tanggalBerlaku?: string;
  tanggalSelesai?: string;
  dpaSebelumnyaId?: string;
  nomorRevisi?: number;
  alasanRevisi?: string;
}

export interface UpdateDPADto extends Partial<CreateDPADto> {}

export interface GenerateDPAFromRBADto {
  revisiRBAId: string;
  tahunAnggaran: number;
  nomorDPA: string;
}

export interface QueryDPAParams {
  page?: number;
  limit?: number;
  tahunAnggaran?: number;
  status?: DPAStatus;
  jenisDokumen?: JenisDokumenDPA;
  search?: string;
}

export interface DPASummary {
  dpa: DPA;
  totalBelanja: {
    pagu: number;
    realisasi: number;
    komitmen: number;
    sisa: number;
    persentase: number;
  };
  totalPendapatan: {
    pagu: number;
    realisasi: number;
    sisa: number;
    persentase: number;
  };
  totalPembiayaan: {
    penerimaan: number;
    pengeluaran: number;
    net: number;
  };
  silpa: number;
}

// Pagination response
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
