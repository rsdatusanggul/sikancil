import { IsOptional, IsString, IsBoolean, IsInt, Min, Max, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryFiscalYearDto {
  @ApiPropertyOptional({
    example: 'OPEN',
    description: 'Filter by status',
    enum: ['OPEN', 'CLOSED', 'LOCKED']
  })
  @IsString()
  @IsOptional()
  @Matches(/^(OPEN|CLOSED|LOCKED)$/, {
    message: 'Status must be one of: OPEN, CLOSED, LOCKED'
  })
  status?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by current fiscal year' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isCurrent?: boolean;

  @ApiPropertyOptional({ example: 2024, description: 'Filter by specific year' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(2000)
  @Max(2100)
  tahun?: number;

  @ApiPropertyOptional({ example: 2023, description: 'Filter by year range - from year' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(2000)
  @Max(2100)
  yearFrom?: number;

  @ApiPropertyOptional({ example: 2024, description: 'Filter by year range - to year' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(2000)
  @Max(2100)
  yearTo?: number;

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
