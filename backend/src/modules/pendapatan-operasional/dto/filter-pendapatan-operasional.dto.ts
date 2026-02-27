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
  SumberDanaBLUD,
  JenisPenjamin,
  TransactionStatus,
} from '../../../database/enums';

export class FilterPendapatanOperasionalDto {
  @IsOptional()
  @IsDateString()
  tanggalMulai?: string;

  @IsOptional()
  @IsDateString()
  tanggalAkhir?: string;

  @IsOptional()
  @IsEnum(SumberDanaBLUD)
  sumberDana?: SumberDanaBLUD;

  @IsOptional()
  @IsEnum(JenisPenjamin)
  jenisPenjamin?: JenisPenjamin;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsUUID()
  unitKerjaId?: string;

  @IsOptional()
  @IsString()
  search?: string; // Search in nomorBukti or uraian

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
  sortBy?: string = 'tanggal';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
