import { IsOptional, IsString, IsInt, Min, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryPegawaiDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Search by employee name or NIP' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'uuid-unit-kerja', description: 'Filter by Unit Kerja ID' })
  @IsUUID()
  @IsOptional()
  unitKerjaId?: string;

  @ApiPropertyOptional({ example: 'ACTIVE', description: 'Filter by status: ACTIVE, INACTIVE, RETIRED' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Kepala Bagian', description: 'Filter by job position' })
  @IsString()
  @IsOptional()
  jabatan?: string;

  @ApiPropertyOptional({ example: 'III/c', description: 'Filter by grade/rank' })
  @IsString()
  @IsOptional()
  golongan?: string;

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
