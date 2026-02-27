import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  IsArray,
  IsEmail,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JenisHibah } from '../../../database/enums';

export class CreateHibahDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nomorHibah: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  nomorSKHibah: string;

  @IsNotEmpty()
  @IsDateString()
  tanggalSKHibah: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  namaPemberiHibah: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  alamatPemberiHibah?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  teleponPemberiHibah?: string;

  @IsOptional()
  @IsEmail()
  emailPemberiHibah?: string;

  @IsNotEmpty()
  @IsEnum(JenisHibah)
  jenisHibah: JenisHibah;

  @IsNotEmpty()
  @IsString()
  uraianHibah: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  nilaiHibah?: number;

  @IsOptional()
  @IsArray()
  detailBarangJasa?: any[];

  @IsOptional()
  @IsDateString()
  tanggalTerima?: string;

  @IsOptional()
  @IsString()
  dokumenSKHibah?: string;

  @IsOptional()
  @IsArray()
  dokumenPendukung?: any[];

  @IsOptional()
  @IsUUID()
  unitKerjaId?: string;

  @IsOptional()
  @IsString()
  catatan?: string;
}
