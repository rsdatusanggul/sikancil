import type { SubKegiatanRBA } from '../subkegiatan-rba/types';

export interface KodeBelanja {
  id: string;
  kodeRekening: string;
  namaRekening: string;
  subOutputId: string;
  jenisBelanja: 'OPERASIONAL' | 'MODAL';
  kategori?: string;
  sumberDana: 'APBD' | 'FUNGSIONAL' | 'HIBAH';
  pagu: number;
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
  tahun: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AktivitasRBA {
  id: string;
  kodeSubOutput: string; // kode aktivitas e.g. "01.01.001.01"
  namaSubOutput: string; // nama aktivitas
  subKegiatanId: string;
  subKegiatan?: SubKegiatanRBA; // parent relation
  volumeTarget: number;
  satuan: string;
  totalPagu: number;
  tahun: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  anggaranBelanja?: KodeBelanja[];
}

export interface CreateAktivitasRBADto {
  kodeSubOutput: string;
  namaSubOutput: string;
  subKegiatanId: string;
  tahun: number;
  volumeTarget: number;
  satuan: string;
  totalPagu?: number;
  deskripsi?: string;
}

export interface UpdateAktivitasRBADto extends Partial<CreateAktivitasRBADto> {}

export interface QueryAktivitasRBAParams {
  tahun?: number;
  subKegiatanId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateKodeBelanjaDto {
  kodeRekening: string;
  namaRekening: string;
  subOutputId: string;
  jenisBelanja: 'OPERASIONAL' | 'MODAL';
  kategori?: string;
  sumberDana: 'APBD' | 'FUNGSIONAL' | 'HIBAH';
  pagu: number;
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
  tahun: number;
}

export interface UpdateKodeBelanjaDto extends Partial<CreateKodeBelanjaDto> {}