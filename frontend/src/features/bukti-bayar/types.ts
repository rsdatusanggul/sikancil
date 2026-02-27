// Bukti Bayar Types & Interfaces

// Status enum - hanya DRAFT dan FINAL
export enum BuktiBayarStatus {
  DRAFT = 'DRAFT',
  FINAL = 'FINAL',
}

// Kode Rekening search result (untuk autocomplete)
export interface KodeRekeningSearchResult {
  id: string;
  kodeRekening: string;
  namaRekening: string;
  level: number;
}

// Subkegiatan dropdown item
export interface SubkegiatanDropdownItem {
  id: string;
  kodeSubKegiatan: string;
  namaSubKegiatan: string;
  kegiatanId: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  programId: string;
  kodeProgram: string;
  namaProgram: string;
  tahun: number;
}

// Main Bukti Bayar interface
export interface BuktiBayar {
  id: string;
  voucherNumber: string;
  voucherDate: string;
  fiscalYear: number;

  // Program-Kegiatan-SubKegiatan
  programId: string | null;
  kegiatanId: string | null;
  subKegiatanId: string | null;
  programCode: string | null;
  programName: string | null;
  kegiatanCode: string | null;
  kegiatanName: string | null;
  subKegiatanCode: string | null;
  subKegiatanName: string | null;

  // Account
  accountCode: string;
  accountName: string;

  // Payment details
  payeeName: string;
  payeeAddress: string | null;
  payeeNpwp: string | null;
  grossAmount: number;
  grossAmountText: string;
  paymentPurpose: string;

  // Tax deductions
  pph21Rate: number;
  pph21Amount: number;
  pph22Rate: number;
  pph22Amount: number;
  pph23Rate: number;
  pph23Amount: number;
  pph24Rate: number;
  pph24Amount: number;
  ppnRate: number;
  ppnAmount: number;
  otherDeductions: number;
  otherDeductionsNote: string | null;
  totalDeductions: number;
  netPayment: number;

  // Month
  month: number;

  // Status & workflow
  status: BuktiBayarStatus;
  rejectionReason: string | null;

  // Approval technical
  technicalOfficerName: string | null;
  technicalOfficerNip: string | null;
  technicalApprovedAt: string | null;
  technicalApprovalNotes: string | null;

  // Approval treasurer
  treasurerName: string | null;
  treasurerNip: string | null;
  treasurerApprovedAt: string | null;
  treasurerApprovalNotes: string | null;

  // Final approval
  approverName: string | null;
  approverNip: string | null;
  finalApprovedAt: string | null;
  finalApprovalNotes: string | null;

  // Receiver (PPTK)
  receiverName: string | null;
  receiverNip: string | null;

  // SPP reference
  sppId: string | null;

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs - Must match backend CreatePaymentVoucherDto
export interface CreateBuktiBayarDto {
  voucherDate: string;
  fiscalYear: number;
  unitCode?: string;
  programId: string;
  programCode: string;
  programName?: string;
  kegiatanId: string;
  kegiatanCode: string;
  kegiatanName?: string;
  subKegiatanId?: string;
  subKegiatanCode?: string;
  subKegiatanName?: string;
  accountCode: string;
  accountName: string;
  payeeName?: string;
  paymentPurpose: string;
  vendorName?: string;
  vendorNpwp?: string;
  vendorAddress?: string;
  grossAmount: number;
  // Tax fields (optional - auto-calculated by backend)
  pph21Rate?: number;
  pph21Amount?: number;
  pph22Rate?: number;
  pph22Amount?: number;
  pph23Rate?: number;
  pph23Amount?: number;
  pph24Rate?: number;
  pph24Amount?: number;
  ppnRate?: number;
  ppnAmount?: number;
  otherDeductions?: number;
  otherDeductionsNote?: string;
  // UMKM data (optional)
  skUmkmNumber?: string;
  skUmkmExpiry?: string;
}

export interface UpdateBuktiBayarDto extends Partial<CreateBuktiBayarDto> {}

export interface QueryBuktiBayarParams {
  page?: number;
  limit?: number;
  fiscalYear?: number;
  month?: number;
  status?: BuktiBayarStatus;
  programCode?: string;
  kegiatanCode?: string;
  accountCode?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Workflow DTOs
export interface ApproveTechnicalDto {
  officerName: string;
  officerNip: string;
  notes?: string;
}

export interface ApproveTreasurerDto {
  treasurerName: string;
  treasurerNip: string;
  notes?: string;
}

export interface ApproveFinalDto {
  approverName: string;
  approverNip: string;
  notes?: string;
}

export interface RejectBuktiBayarDto {
  reason: string;
}

// Tax preview
export interface TaxPreview {
  pph21Rate: number;
  pph21Amount: number;
  pph22Rate: number;
  pph22Amount: number;
  pph23Rate: number;
  pph23Amount: number;
  pph24Rate: number;
  pph24Amount: number;
  ppnRate: number;
  ppnAmount: number;
  totalDeductions: number;
  netPayment: number;
}

// Budget check
export interface BudgetCheck {
  availablePagu: number;
  remainingRak: number;
  rakMonthlyLimit: number;
  canProceed: boolean;
  warning?: string;
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

// Summary stats
export interface BuktiBayarSummary {
  totalDraft: number;
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  totalAmount: number;
  totalNetPayment: number;
}