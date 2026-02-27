import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsEnum,
  IsArray,
  IsOptional,
  IsUUID,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JournalEntryType } from '../../../../database/enums';
import { JournalItemDto } from './journal-item.dto';

/**
 * DTO for Creating Journal Entry
 */
export class CreateJournalDto {
  @IsOptional()
  @IsString()
  nomorJurnal?: string; // Auto-generated if not provided

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  tanggalJurnal: Date;

  @IsOptional()
  @IsString()
  periode?: string; // Auto-calculated from tanggalJurnal if not provided (YYYY-MM)

  @IsOptional()
  @IsNumber()
  tahun?: number; // Auto-calculated from tanggalJurnal if not provided

  @IsOptional()
  @IsEnum(JournalEntryType)
  jenisJurnal?: JournalEntryType;

  @IsOptional()
  @IsString()
  sourceType?: string; // PENDAPATAN, BELANJA, KAS_BANK, ASET, PAJAK, etc.

  @IsOptional()
  @IsUUID()
  sourceId?: string; // ID dari tabel sumber

  @IsOptional()
  @IsString()
  referenceType?: string; // Legacy: SP2D, STS, etc.

  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @IsOptional()
  @IsString()
  referenceNo?: string;

  @IsNotEmpty()
  @IsString()
  uraian: string;

  @IsOptional()
  @IsString()
  keterangan?: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2) // Minimal 2 items (debet dan kredit)
  @ValidateNested({ each: true })
  @Type(() => JournalItemDto)
  items: JournalItemDto[];

  @IsOptional()
  @IsString()
  createdBy?: string; // Will be set from auth context
}
