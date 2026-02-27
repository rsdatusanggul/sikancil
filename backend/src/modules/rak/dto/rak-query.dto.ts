import {
  IsOptional,
  IsInt,
  IsEnum,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RakStatus } from '../entities/rak-subkegiatan.entity';

export class RakQueryDto {
  @ApiPropertyOptional({ description: 'Tahun Anggaran', example: 2025 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  @IsOptional()
  tahun_anggaran?: number;

  @ApiPropertyOptional({ description: 'Search by subkegiatan code or name' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'UUID Subkegiatan',
  })
  @IsUUID()
  @IsOptional()
  subkegiatan_id?: string;

  @ApiPropertyOptional({
    enum: RakStatus,
    description: 'Status RAK',
  })
  @IsEnum(RakStatus)
  @IsOptional()
  status?: RakStatus;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}