import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PenggunaanHibahDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  nilaiDigunakan: number;

  @IsNotEmpty()
  @IsDateString()
  tanggalPenggunaan: string;

  @IsNotEmpty()
  @IsString()
  keterangan: string;

  @IsOptional()
  @IsString()
  nomorBuktiPenggunaan?: string;

  @IsOptional()
  dokumenPendukung?: any;
}

export class LaporanPertanggungjawabanDto {
  @IsNotEmpty()
  @IsString()
  nomorLaporan: string;

  @IsNotEmpty()
  @IsDateString()
  tanggalLaporan: string;

  @IsNotEmpty()
  @IsString()
  isiLaporan: string;

  @IsOptional()
  @IsString()
  dokumenLaporan?: string;
}
