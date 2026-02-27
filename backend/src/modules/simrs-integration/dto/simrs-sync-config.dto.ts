import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SIMRSSyncConfigDto {
  @IsNotEmpty()
  @IsString()
  simrsBaseUrl: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  @Type(() => Number)
  syncIntervalMinutes?: number = 5; // Default 5 minutes

  @IsOptional()
  @IsBoolean()
  autoSync?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  maxRetries?: number = 3;
}

export class SIMRSMappingDto {
  @IsNotEmpty()
  @IsString()
  jenisLayananSIMRS: string; // Jenis layanan dari SIMRS

  @IsNotEmpty()
  @IsString()
  kodeRekeningPendapatan: string; // Kode rekening di Si-Kancil

  @IsOptional()
  @IsString()
  keterangan?: string;
}
