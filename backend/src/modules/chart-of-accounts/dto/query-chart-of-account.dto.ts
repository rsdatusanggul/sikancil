import { IsOptional, IsEnum, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AccountType } from '../../../database/enums';

export class QueryChartOfAccountDto {
  @ApiPropertyOptional({ example: 'Kas', description: 'Search by account name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: AccountType, description: 'Filter by account type' })
  @IsEnum(AccountType)
  @IsOptional()
  jenisAkun?: AccountType;

  @ApiPropertyOptional({ example: 1, description: 'Filter by level' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  level?: number;

  @ApiPropertyOptional({ example: true, description: 'Filter by detail accounts only' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isDetail?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ example: '1.1', description: 'Filter by parent code' })
  @IsString()
  @IsOptional()
  parentKode?: string;

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
