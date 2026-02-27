import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  KategoriPendapatanBLUD,
  SumberDanaBLUD,
  JenisPenjamin,
} from '../../../database/enums';

export class CreatePendapatanOperasionalDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nomorBukti: string;

  @IsNotEmpty()
  @IsDateString()
  tanggal: string;

  @IsNotEmpty()
  @IsEnum(SumberDanaBLUD)
  sumberDana: SumberDanaBLUD;

  @IsNotEmpty()
  @IsString()
  uraian: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  jumlah: number;

  @IsNotEmpty()
  @IsEnum(JenisPenjamin)
  jenisPenjamin: JenisPenjamin;

  @IsOptional()
  @IsUUID()
  simrsBillingId?: string;

  @IsOptional()
  @IsString()
  simrsReferenceId?: string;

  @IsOptional()
  simrsData?: any;

  @IsOptional()
  @IsUUID()
  unitKerjaId?: string;

  @IsOptional()
  @IsString()
  catatan?: string;
}
