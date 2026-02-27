import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  JenisHibah,
  StatusHibah,
  TransactionStatus,
} from '../../../database/enums';

export class FilterHibahDto {
  @IsOptional()
  @IsDateString()
  tanggalMulai?: string;

  @IsOptional()
  @IsDateString()
  tanggalAkhir?: string;

  @IsOptional()
  @IsEnum(JenisHibah)
  jenisHibah?: JenisHibah;

  @IsOptional()
  @IsEnum(StatusHibah)
  statusPenggunaan?: StatusHibah;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsUUID()
  unitKerjaId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'tanggalSKHibah';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
