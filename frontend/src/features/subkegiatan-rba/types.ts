import type { KegiatanRBA } from '../kegiatan-rba/types';

export interface SubKegiatanRBA {
  id: string;
  kodeSubKegiatan: string;
  namaSubKegiatan: string;
  deskripsi?: string;
  kegiatanId: string;
  volumeTarget: number;
  satuan: string;
  lokasi?: string;
  bulanMulai?: number;
  bulanSelesai?: number;
  unitKerjaId?: string;
  totalPagu: number;
  tahun: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  kegiatan?: KegiatanRBA;
  unitKerja?: {
    id: string;
    kodeUnitKerja: string;
    namaUnitKerja: string;
  };
}

export interface CreateSubKegiatanRBADto {
  kodeSubKegiatan: string;
  namaSubKegiatan: string;
  kegiatanId: string;
  tahun: number;
  volumeTarget: number;
  satuan: string;
  lokasi?: string;
  bulanMulai?: number;
  bulanSelesai?: number;
  unitKerjaId?: string;
  totalPagu?: number;
  deskripsi?: string;
}

export interface UpdateSubKegiatanRBADto extends Partial<CreateSubKegiatanRBADto> {}

export interface QuerySubKegiatanRBAParams {
  tahun?: number;
  kegiatanId?: string;
  unitKerjaId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Legacy aliases for backward compatibility during migration
export type OutputRBA = SubKegiatanRBA;
export type CreateOutputRBADto = CreateSubKegiatanRBADto;
export type UpdateOutputRBADto = UpdateSubKegiatanRBADto;
export type QueryOutputRBAParams = QuerySubKegiatanRBAParams;
