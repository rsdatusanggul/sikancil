import { IsOptional, IsUUID, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryRevisiRbaDto {
  @ApiPropertyOptional({ example: 'uuid-rba-id', description: 'Filter by RBA ID' })
  @IsUUID()
  @IsOptional()
  rbaId?: string;

  @ApiPropertyOptional({ example: 'Perubahan', description: 'Search in alasan revisi' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'uuid-user', description: 'Filter by approved by' })
  @IsString()
  @IsOptional()
  approvedBy?: string;

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
