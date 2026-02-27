import { IsString, IsNotEmpty, IsOptional, IsInt, IsUUID, IsNumber, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSubKegiatanRbaDto {
  @ApiProperty({ example: '1.02.01.001', description: 'Kode sub kegiatan RBA (unique per tahun)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  kodeSubKegiatan: string;

  @ApiProperty({ example: 'Pelayanan Rawat Jalan', description: 'Nama sub kegiatan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  namaSubKegiatan: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID Kegiatan RBA' })
  @IsUUID()
  @IsNotEmpty()
  kegiatanId: string;

  @ApiProperty({ example: 2024, description: 'Tahun anggaran' })
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  tahun: number;

  @ApiProperty({ example: 1000, description: 'Volume target output' })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  volumeTarget: number;

  @ApiProperty({ example: 'Orang', description: 'Satuan volume (Orang, Kunjungan, Kegiatan, dll)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  satuan: string;

  @ApiPropertyOptional({ example: 'Poli Umum, Gedung A Lt. 1', description: 'Lokasi pelaksanaan sub kegiatan' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  lokasi?: string;

  @ApiPropertyOptional({ example: 1, description: 'Bulan mulai pelaksanaan (1-12)' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  bulanMulai?: number;

  @ApiPropertyOptional({ example: 12, description: 'Bulan selesai pelaksanaan (1-12)' })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  bulanSelesai?: number;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'ID Unit Kerja pelaksana' })
  @IsUUID()
  @IsOptional()
  unitKerjaId?: string;

  @ApiPropertyOptional({ example: 5000000.00, description: 'Total pagu anggaran sub kegiatan' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  totalPagu?: number;

  @ApiPropertyOptional({ example: 'Deskripsi sub kegiatan RBA', description: 'Deskripsi detail sub kegiatan' })
  @IsString()
  @IsOptional()
  deskripsi?: string;
}
