import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusBuktiBayar, JenisBelanjaBuktiBayar } from '../../../database/enums';

export class BuktiBayarResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nomorBuktiBayar: string;

  @ApiProperty()
  tanggalBuktiBayar: Date;

  @ApiProperty()
  tahunAnggaran: number;

  @ApiProperty()
  bulan: number;

  @ApiProperty()
  anggaranKasId: string;

  @ApiProperty()
  nilaiPembayaran: number;

  @ApiProperty()
  uraian: string;

  @ApiPropertyOptional()
  keterangan?: string;

  @ApiProperty({ enum: JenisBelanjaBuktiBayar })
  jenisBelanja: JenisBelanjaBuktiBayar;

  @ApiProperty()
  namaPenerima: string;

  @ApiPropertyOptional()
  npwpPenerima?: string;

  @ApiPropertyOptional()
  alamatPenerima?: string;

  @ApiPropertyOptional()
  bankPenerima?: string;

  @ApiPropertyOptional()
  rekeningPenerima?: string;

  @ApiPropertyOptional()
  atasNamaRekening?: string;

  @ApiProperty({ enum: StatusBuktiBayar })
  status: StatusBuktiBayar;

  @ApiPropertyOptional()
  submittedBy?: string;

  @ApiPropertyOptional()
  submittedAt?: Date;

  @ApiPropertyOptional()
  verifiedBy?: string;

  @ApiPropertyOptional()
  verifiedAt?: Date;

  @ApiPropertyOptional()
  approvedBy?: string;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiPropertyOptional()
  rejectedBy?: string;

  @ApiPropertyOptional()
  rejectedAt?: Date;

  @ApiPropertyOptional()
  alasanReject?: string;

  @ApiPropertyOptional()
  fileLampiran?: string;

  @ApiPropertyOptional()
  fileBuktiBayar?: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Relasi
  @ApiPropertyOptional()
  anggaranKas?: any;

  @ApiPropertyOptional()
  spp?: any[];
}
