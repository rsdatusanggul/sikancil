import { IsOptional, IsString, IsBoolean, IsInt, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryKegiatanRbaDto {
  @ApiPropertyOptional({ example: 'Penyediaan', description: 'Search by nama kegiatan' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'uuid-program-id', description: 'Filter by program ID' })
  @IsUUID()
  @IsOptional()
  programId?: string;

  @ApiPropertyOptional({ example: 2024, description: 'Filter by tahun anggaran' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  tahun?: number;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

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
