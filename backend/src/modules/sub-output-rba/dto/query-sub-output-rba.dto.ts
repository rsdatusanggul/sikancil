import { IsOptional, IsString, IsInt, IsUUID, Min, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QuerySubOutputRbaDto {
  @ApiPropertyOptional({ example: 'Pelayanan', description: 'Search by nama sub output' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Filter by output ID' })
  @IsUUID()
  @IsOptional()
  outputId?: string;

  @ApiPropertyOptional({ example: 2024, description: 'Filter by tahun anggaran' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  tahun?: number;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status', default: true })
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
