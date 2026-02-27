import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { JenisRencanaAnggaranKas } from '../../../database/enums';

export class CreateRencanaAnggaranKasDto {
  @ApiProperty({ example: 2024, description: 'Tahun anggaran' })
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  tahun: number;

  @ApiProperty({ example: 1, description: 'Bulan (1-12)' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  bulan: number;

  @ApiProperty({
    example: 'PENERIMAAN',
    description: 'Jenis anggaran (PENERIMAAN atau PENGELUARAN)',
    enum: JenisRencanaAnggaranKas
  })
  @IsEnum(JenisRencanaAnggaranKas)
  @IsNotEmpty()
  jenisAnggaran: JenisRencanaAnggaranKas;

  @ApiProperty({ example: '4.1.01.01', description: 'Kode rekening' })
  @IsString()
  @IsNotEmpty()
  kodeRekening: string;

  @ApiProperty({ example: 'Pendapatan Jasa Layanan Rawat Jalan', description: 'Uraian anggaran kas' })
  @IsString()
  @IsNotEmpty()
  uraian: string;

  @ApiProperty({ example: 50000000.00, description: 'Jumlah anggaran' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  jumlahAnggaran: number;

  @ApiPropertyOptional({ example: 0, description: 'Realisasi', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  realisasi?: number;

  @ApiPropertyOptional({ example: 'Keterangan tambahan', description: 'Keterangan' })
  @IsString()
  @IsOptional()
  keterangan?: string;
}