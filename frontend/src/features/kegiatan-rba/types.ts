import type { ProgramRBA } from '../program-rba/types';

export interface IndikatorKegiatan {
  nama: string;
  satuan: string;
  target: number;
}

export interface KegiatanRBA {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  deskripsi?: string;
  programId: string;
  indikatorKegiatan?: IndikatorKegiatan[];
  paguAnggaran?: number;
  tahun: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  program?: ProgramRBA;
  subKegiatan?: any[]; // Sub kegiatan RBA (Level 3)
}

export interface CreateKegiatanRBADto {
  kodeKegiatan: string;
  namaKegiatan: string;
  programId: string;
  tahun: number;
  deskripsi?: string;
  indikatorKegiatan?: IndikatorKegiatan[];
  paguAnggaran?: number;
  isActive?: boolean;
}

export interface UpdateKegiatanRBADto extends Partial<CreateKegiatanRBADto> {}

export interface QueryKegiatanRBAParams {
  tahun?: number;
  programId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedKegiatanRBAResponse {
  data: KegiatanRBA[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
