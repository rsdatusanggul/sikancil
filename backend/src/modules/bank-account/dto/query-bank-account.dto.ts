import { IsOptional, IsString, IsBoolean, IsInt, Min, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryBankAccountDto {
  @ApiPropertyOptional({ example: 'Mandiri', description: 'Search by bank name or account number' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'Bank Mandiri', description: 'Filter by bank name' })
  @IsString()
  @IsOptional()
  namaBank?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'Filter by status',
    enum: ['ACTIVE', 'INACTIVE', 'CLOSED']
  })
  @IsString()
  @IsOptional()
  @Matches(/^(ACTIVE|INACTIVE|CLOSED)$/, {
    message: 'Status must be one of: ACTIVE, INACTIVE, CLOSED'
  })
  status?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by primary account' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 'IDR', description: 'Filter by currency' })
  @IsString()
  @IsOptional()
  currency?: string;

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
