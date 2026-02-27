import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  IsArray,
  IsPositive,
  Min,
  MaxLength,
  IsNotEmpty,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentVoucherDto {
  // ══════════════════════════════════════════════════════════
  // IDENTITAS DOKUMEN
  // ══════════════════════════════════════════════════════════

  @ApiProperty({
    description: 'Tanggal bukti pembayaran',
    example: '2025-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  voucherDate: string;

  @ApiProperty({
    description: 'Tahun anggaran',
    example: 2025,
  })
  @IsNumber()
  @IsNotEmpty()
  fiscalYear: number;

  @ApiPropertyOptional({
    description: 'Kode unit kerja',
    example: 'RSUD-DS',
    default: 'RSUD-DS',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unitCode?: string;

  // ══════════════════════════════════════════════════════════
  // HIERARKI ANGGARAN
  // ══════════════════════════════════════════════════════════

  @ApiProperty({
    description: 'ID Program RBA',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  programId: string;

  @ApiProperty({
    description: 'Kode Program',
    example: '01.02.02',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  programCode: string;

  @ApiPropertyOptional({
    description: 'Nama Program',
    example: 'Penyelenggaraan Rumah Sakit',
  })
  @IsOptional()
  @IsString()
  programName?: string;

  @ApiProperty({
    description: 'ID Kegiatan RBA',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsNotEmpty()
  kegiatanId: string;

  @ApiProperty({
    description: 'Kode Kegiatan',
    example: '1.02.02.2.02',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  kegiatanCode: string;

  @ApiPropertyOptional({
    description: 'Nama Kegiatan',
    example: 'Pelayanan Kesehatan Rujukan',
  })
  @IsOptional()
  @IsString()
  kegiatanName?: string;

  @ApiPropertyOptional({
    description: 'ID Sub Kegiatan / Output RBA',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  subKegiatanId?: string;

  @ApiPropertyOptional({
    description: 'Kode Sub Kegiatan / Output',
    example: '1.02.02.2.02.032',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  subKegiatanCode?: string;

  @ApiPropertyOptional({
    description: 'Nama Sub Kegiatan / Output',
    example: 'Pelayanan Kesehatan Rawat Inap',
  })
  @IsOptional()
  @IsString()
  subKegiatanName?: string;

  @ApiProperty({
    description: 'Kode Rekening Belanja',
    example: '5.2.02.10.01.0003',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  accountCode: string;

  @ApiProperty({
    description: 'Nama Rekening Belanja',
    example: 'Belanja Obat-obatan',
  })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  // ══════════════════════════════════════════════════════════
  // DETAIL PEMBAYARAN
  // ══════════════════════════════════════════════════════════

  @ApiPropertyOptional({
    description: 'Nama pihak yang menerima pembayaran',
    example: 'BENDAHARA PENGELUARAN RSUD DATU SANGGUL RANTAU',
    default: 'BENDAHARA PENGELUARAN RSUD DATU SANGGUL RANTAU',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  payeeName?: string;

  @ApiProperty({
    description: 'Tujuan/uraian pembayaran',
    example: 'Pembayaran Belanja BMHP PT. MENSA BINA SUKSES Invoice CD250967456',
  })
  @IsString()
  @IsNotEmpty()
  paymentPurpose: string;

  @ApiPropertyOptional({
    description: 'Nama vendor/pemasok',
    example: 'PT. MENSA BINA SUKSES',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  vendorName?: string;

  @ApiPropertyOptional({
    description: 'NPWP vendor',
    example: '01.234.567.8-901.000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  vendorNpwp?: string;

  @ApiPropertyOptional({
    description: 'Alamat vendor',
    example: 'Jl. Sudirman No.1, Jakarta',
  })
  @IsOptional()
  @IsString()
  vendorAddress?: string;

  @ApiPropertyOptional({
    description: 'Nomor-nomor invoice/faktur (array)',
    example: ['CD250967456', 'CD250967457'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  invoiceNumbers?: string[];

  @ApiPropertyOptional({
    description: 'Tanggal invoice',
    example: '2025-01-10',
  })
  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  // ══════════════════════════════════════════════════════════
  // JUMLAH & PERHITUNGAN PAJAK
  // ══════════════════════════════════════════════════════════

  @ApiProperty({
    description: 'Jumlah bruto tagihan dari vendor',
    example: 18938178,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  grossAmount: number;

  // ══════════════════════════════════════════════════════════
  // PAJAK (OPTIONAL - AUTO-CALCULATED)
  // Jika tidak diisi, sistem akan auto-calculate berdasarkan tax_rules
  // ══════════════════════════════════════════════════════════

  @ApiPropertyOptional({
    description: 'Tarif PPh 21 (%) - opsional, auto-calculated dari tax_rules',
    example: 0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  pph21Rate?: number;

  @ApiPropertyOptional({
    description: 'Jumlah potongan PPh 21 - opsional, auto-calculated',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pph21Amount?: number;

  @ApiPropertyOptional({
    description: 'Tarif PPh 22 (%) - opsional, auto-calculated dari tax_rules',
    example: 1.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  pph22Rate?: number;

  @ApiPropertyOptional({
    description: 'Jumlah potongan PPh 22 - opsional, auto-calculated',
    example: 255921,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pph22Amount?: number;

  @ApiPropertyOptional({
    description: 'Tarif PPh 23 (%) - opsional, auto-calculated dari tax_rules',
    example: 2.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  pph23Rate?: number;

  @ApiPropertyOptional({
    description: 'Jumlah potongan PPh 23 - opsional, auto-calculated',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pph23Amount?: number;

  @ApiPropertyOptional({
    description: 'Tarif PPh 4 ayat 2 (%) - opsional, auto-calculated dari tax_rules',
    example: 0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  pph4a2Rate?: number;

  @ApiPropertyOptional({
    description: 'Jumlah potongan PPh 4 ayat 2 - opsional, auto-calculated',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pph4a2Amount?: number;

  @ApiPropertyOptional({
    description: 'Tarif PPh Final UMKM (%) - opsional, auto-calculated dari tax_rules',
    example: 0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  pphFinalUmkmRate?: number;

  @ApiPropertyOptional({
    description: 'Jumlah potongan PPh Final UMKM - opsional, auto-calculated',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pphFinalUmkmAmount?: number;

  @ApiPropertyOptional({
    description: 'Tarif PPh 24 (%) - opsional, auto-calculated dari tax_rules',
    example: 0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  pph24Rate?: number;

  @ApiPropertyOptional({
    description: 'Jumlah potongan PPh 24 - opsional, auto-calculated',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pph24Amount?: number;

  @ApiPropertyOptional({
    description: 'Tarif PPN (%) - opsional, auto-calculated dari tax_rules',
    example: 11.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  ppnRate?: number;

  @ApiPropertyOptional({
    description: 'Jumlah potongan PPN - opsional, auto-calculated',
    example: 1876757,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  ppnAmount?: number;

  @ApiPropertyOptional({
    description: 'Potongan lain-lain',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  otherDeductions?: number;

  @ApiPropertyOptional({
    description: 'Keterangan potongan lain-lain',
    example: 'Denda keterlambatan',
  })
  @IsOptional()
  @IsString()
  otherDeductionsNote?: string;

  // ══════════════════════════════════════════════════════════
  // DATA UMKM (jika vendor adalah UMKM)
  // ══════════════════════════════════════════════════════════

  @ApiPropertyOptional({
    description: 'Nomor SK UMKM dari KPP',
    example: 'SK-123/KPP/2024',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  skUmkmNumber?: string;

  @ApiPropertyOptional({
    description: 'Tanggal berlaku s.d. SK UMKM',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  skUmkmExpiry?: string;
}
