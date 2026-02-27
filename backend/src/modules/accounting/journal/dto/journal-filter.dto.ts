import { IsOptional, IsString, IsEnum, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { JournalEntryType, TransactionStatus } from '../../../../database/enums';

/**
 * DTO for Filtering Journal Entries
 */
export class JournalFilterDto {
  @IsOptional()
  @IsString()
  nomorJurnal?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsString()
  periode?: string; // Format: YYYY-MM

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  tahun?: number;

  @IsOptional()
  @IsEnum(JournalEntryType)
  jenisJurnal?: JournalEntryType;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  kodeRekening?: string; // Filter by CoA code

  @IsOptional()
  @IsString()
  uraian?: string; // Search in description

  @IsOptional()
  @IsString()
  createdBy?: string;

  // Pagination
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  // Sorting
  @IsOptional()
  @IsString()
  sortBy?: string = 'tanggalJurnal';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
