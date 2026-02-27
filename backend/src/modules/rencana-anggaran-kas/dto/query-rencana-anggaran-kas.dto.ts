import { IsOptional, IsString, IsInt, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { JenisRencanaAnggaranKas } from '../../../database/enums';

export class QueryRencanaAnggaranKasDto {
  @ApiPropertyOptional({ example: 'Pendapatan', description: 'Search by uraian' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 2024, description: 'Filter by tahun' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  tahun?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by bulan (1-12)' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  bulan?: number;

  @ApiPropertyOptional({
    example: 'PENERIMAAN',
    description: 'Filter by jenis anggaran',
    enum: JenisRencanaAnggaranKas
  })
  @IsEnum(JenisRencanaAnggaranKas)
  @IsOptional()
  jenisAnggaran?: JenisRencanaAnggaranKas;

  @ApiPropertyOptional({ example: '4.1.01.01', description: 'Filter by kode rekening' })
  @IsString()
  @IsOptional()
  kodeRekening?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page', default: 20 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}