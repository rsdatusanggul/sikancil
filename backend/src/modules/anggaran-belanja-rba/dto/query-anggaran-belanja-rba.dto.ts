import { IsOptional, IsString, IsInt, IsUUID, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SumberDanaBLUD } from '../../../database/enums';

export class QueryAnggaranBelanjaRbaDto {
  @ApiPropertyOptional({ example: 'Gaji', description: 'Search by nama rekening' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Filter by sub kegiatan ID' })
  @IsUUID()
  @IsOptional()
  subKegiatanId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Filter by sub output ID' })
  @IsUUID()
  @IsOptional()
  subOutputId?: string;

  @ApiPropertyOptional({ example: '5.1.01.01', description: 'Filter by kode rekening' })
  @IsString()
  @IsOptional()
  kodeRekening?: string;

  @ApiPropertyOptional({
    example: 'APBD',
    description: 'Filter by sumber dana',
    enum: SumberDanaBLUD
  })
  @IsEnum(SumberDanaBLUD)
  @IsOptional()
  sumberDana?: SumberDanaBLUD;

  @ApiPropertyOptional({ example: 2024, description: 'Filter by tahun anggaran' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  tahun?: number;

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
