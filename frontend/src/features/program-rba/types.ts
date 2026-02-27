export interface ProgramRBA {
  id: string;
  kodeProgram: string;
  namaProgram: string;
  deskripsi?: string;
  indikatorProgram: IndikatorProgram[];
  paguAnggaran?: number;
  tahun: number;
  kegiatan?: any[]; // Relasi ke KegiatanRBA
  createdAt: string;
  updatedAt: string;
}

export interface IndikatorProgram {
  nama: string;
  satuan: string;
  target: number;
}

export interface CreateProgramRBADto {
  kodeProgram: string;
  namaProgram: string;
  deskripsi?: string;
  indikatorProgram: IndikatorProgram[];
  paguAnggaran?: number;
  tahun: number;
}

export interface UpdateProgramRBADto extends Partial<CreateProgramRBADto> {}
