export enum RakStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISED = 'REVISED',
}

export interface MonthlyBreakdown {
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
}

export interface QuarterlyBreakdown {
  triwulan_1: number;  // Jan + Feb + Mar
  triwulan_2: number;  // Apr + May + Jun
  triwulan_3: number;  // Jul + Aug + Sep
  triwulan_4: number;  // Oct + Nov + Dec
}

export interface ExpandedState {
  tw1: boolean;
  tw2: boolean;
  tw3: boolean;
  tw4: boolean;
}

export interface KodeRekening {
  id: string;
  kode: string;
  uraian: string;
}

export interface Subkegiatan {
  id: string;
  kode: string;
  uraian: string;
  program_id: string;
  kegiatan_id: string;
}

export interface RakDetail extends MonthlyBreakdown {
  id: string;
  rak_subkegiatan_id: string;
  kode_rekening_id: string;
  kode_rekening: KodeRekening;
  jumlah_anggaran: number;
  created_at: string;
  updated_at: string;
}

export interface RakSubkegiatan {
  id: string;
  subkegiatan_id: string;
  subkegiatan: Subkegiatan;
  tahun_anggaran: number;
  total_pagu: number;
  status: RakStatus;
  revision_number: number;

  // Submission
  submitted_at?: string;
  submitted_by?: string;

  // Approval
  approved_at?: string;
  approved_by?: string;
  approval_notes?: string;

  // Rejection
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;

  // Relations
  details?: RakDetail[];

  // Metadata
  created_at: string;
  updated_at: string;
}

export interface CreateRakPayload {
  subkegiatan_id: string;
  tahun_anggaran: number;
  total_pagu?: number;
  details?: CreateRakDetailPayload[];
}

export interface CreateRakDetailPayload extends Partial<MonthlyBreakdown> {
  kode_rekening_id: string;
  jumlah_anggaran: number;
}

export interface UpdateRakPayload extends Partial<CreateRakPayload> {}

export interface ApproveRakPayload {
  approval_notes?: string;
}

export interface RejectRakPayload {
  rejection_reason: string;
}

export interface RakQueryParams {
  tahun_anggaran?: number;
  subkegiatan_id?: string;
  status?: RakStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RakListResponse {
  data: RakSubkegiatan[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// UI-specific types
export interface RakMatrixData {
  kode_rekening_id: string;
  kode: string;
  uraian: string;
  jumlah_anggaran: number;
  monthly: MonthlyBreakdown;
  semester_1: number;
  semester_2: number;
  triwulan_1: number;
  triwulan_2: number;
  triwulan_3: number;
  triwulan_4: number;
}

export interface RakSummary {
  total_pagu: number;
  total_rencana: number;
  selisih: number;
  status: RakStatus;
}

export interface CashFlowData {
  bulan: string;
  penerimaan: number;
  pengeluaran: number;
  saldo: number;
}