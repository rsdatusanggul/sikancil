import type { ProgramRBA } from '../program-rba/types';

export enum JenisRevisiRBA {
  PERUBAHAN_PAGU = 'PERUBAHAN_PAGU',
  PERUBAHAN_VOLUME = 'PERUBAHAN_VOLUME',
  PERUBAHAN_WAKTU = 'PERUBAHAN_WAKTU',
  PERGESERAN_ANGGARAN = 'PERGESERAN_ANGGARAN',
  LAIN_LAIN = 'LAIN_LAIN',
}

export enum StatusRevisiRBA {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface PerubahanData {
  type: JenisRevisiRBA;
  outputId?: string;
  kodeRekening?: string;
  paguSebelum?: number;
  paguSesudah?: number;
  selisih?: number;
  volumeSebelum?: number;
  volumeSesudah?: number;
  waktuSebelum?: string;
  waktuSesudah?: string;
  keteranganTambahan?: string;
}

export interface RevisiRBA {
  id: string;
  rbaId: string;
  tanggalRevisi: string;
  alasanRevisi: string;
  perubahanData: PerubahanData;
  status: StatusRevisiRBA;
  approvedBy?: string;
  approvedAt?: string;
  catatanApproval?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  rba?: ProgramRBA;
  approver?: any;
  creator?: any;
}

export interface CreateRevisiRBADto {
  rbaId: string;
  tanggalRevisi: string;
  alasanRevisi: string;
  perubahanData: PerubahanData;
}

export interface UpdateRevisiRBADto extends Partial<CreateRevisiRBADto> {}

export interface ApproveRevisiDto {
  approved: boolean;
  catatan?: string;
}

export interface QueryRevisiRBAParams {
  rbaId?: string;
  status?: StatusRevisiRBA;
  tahun?: number;
  search?: string;
  page?: number;
  limit?: number;
}
