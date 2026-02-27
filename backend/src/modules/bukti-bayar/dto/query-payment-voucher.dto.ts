import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusBuktiBayar } from '../../../database/enums';

export class QueryPaymentVoucherDto {
  // ══════════════════════════════════════════════════════════
  // FILTER PARAMETERS
  // ══════════════════════════════════════════════════════════

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tahun anggaran',
    example: 2025,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fiscalYear?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan bulan (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status',
    enum: StatusBuktiBayar,
    example: StatusBuktiBayar.DRAFT,
  })
  @IsOptional()
  @IsEnum(StatusBuktiBayar)
  status?: StatusBuktiBayar;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan kode rekening (partial match)',
    example: '5.2.02.10',
  })
  @IsOptional()
  @IsString()
  accountCode?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID PPTK',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  pptkId?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan nama vendor (partial match)',
    example: 'PT. MENSA',
  })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID kegiatan',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsString()
  kegiatanId?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID sub kegiatan',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsString()
  subKegiatanId?: string;

  @ApiPropertyOptional({
    description: 'Filter tanggal dari (voucher_date >= dateFrom)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter tanggal sampai (voucher_date <= dateTo)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter nomor voucher (partial match)',
    example: '0001/5.2.02',
  })
  @IsOptional()
  @IsString()
  voucherNumber?: string;

  // ══════════════════════════════════════════════════════════
  // PAGINATION & SORTING
  // ══════════════════════════════════════════════════════════

  @ApiPropertyOptional({
    description: 'Halaman (dimulai dari 1)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Jumlah data per halaman',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Field untuk sorting',
    example: 'voucherDate',
    default: 'voucherDate',
    enum: [
      'voucherDate',
      'voucherNumber',
      'grossAmount',
      'netPayment',
      'status',
      'createdAt',
      'updatedAt',
    ],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'voucherDate';

  @ApiPropertyOptional({
    description: 'Urutan sorting',
    example: 'DESC',
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
