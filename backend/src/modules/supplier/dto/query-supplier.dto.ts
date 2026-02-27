import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QuerySupplierDto {
  @ApiPropertyOptional({ example: 'Maju Jaya', description: 'Search by supplier name or code' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'Filter by status',
    enum: ['ACTIVE', 'INACTIVE', 'BLACKLIST']
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Jakarta', description: 'Filter by city' })
  @IsString()
  @IsOptional()
  kota?: string;

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
