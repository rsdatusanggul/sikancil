import { IsString, IsNotEmpty, IsOptional, IsInt, IsUUID, IsNumber, IsEnum, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SumberDanaBLUD } from '../../../database/enums';

export class CreateAnggaranBelanjaRbaDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID Sub Kegiatan RBA (optional if subOutputId provided)' })
  @IsUUID()
  @IsOptional()
  subKegiatanId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'ID Sub Output RBA (optional if subKegiatanId provided)' })
  @IsUUID()
  @IsOptional()
  subOutputId?: string;

  @ApiProperty({ example: '5.1.01.01', description: 'Kode rekening (6 level)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  kodeRekening: string;

  @ApiProperty({ example: 'Belanja Gaji PNS', description: 'Nama rekening' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  namaRekening: string;

  @ApiProperty({ example: 'OPERASIONAL', description: 'Jenis belanja (OPERASIONAL, MODAL, TAK_TERDUGA)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  jenisBelanja: string;

  @ApiProperty({ example: 'PEGAWAI', description: 'Kategori belanja (PEGAWAI, BARANG_JASA, MODAL)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  kategori: string;

  @ApiProperty({
    example: 'APBD',
    description: 'Sumber dana',
    enum: SumberDanaBLUD
  })
  @IsEnum(SumberDanaBLUD)
  @IsNotEmpty()
  sumberDana: SumberDanaBLUD;

  @ApiProperty({ example: 50000000.00, description: 'Pagu anggaran' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  pagu: number;

  @ApiPropertyOptional({ example: 0, description: 'Realisasi anggaran', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  realisasi?: number;

  @ApiPropertyOptional({ example: 0, description: 'Komitmen anggaran', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  komitmen?: number;

  @ApiProperty({ example: 2024, description: 'Tahun anggaran' })
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  tahun: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan Januari', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  januari?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan Februari', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  februari?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan Maret', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  maret?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan April', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  april?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan Mei', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  mei?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan Juni', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  juni?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan Juli', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  juli?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan Agustus', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  agustus?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan September', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  september?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan Oktober', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  oktober?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan November', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  november?: number;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Anggaran bulan Desember', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  desember?: number;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002', description: 'ID Unit Kerja' })
  @IsUUID()
  @IsOptional()
  unitKerjaId?: string;

  @ApiPropertyOptional({ example: 'Keterangan tambahan', description: 'Keterangan' })
  @IsString()
  @IsOptional()
  keterangan?: string;
}
