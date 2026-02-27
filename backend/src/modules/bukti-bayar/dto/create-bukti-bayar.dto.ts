import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JenisBelanjaBuktiBayar } from '../../../database/enums';

export class CreateBuktiBayarDto {
  @ApiProperty({
    description: 'Nomor Bukti Bayar (contoh: BB-001/BLUD/2026)',
    example: 'BB-001/BLUD/2026',
  })
  @IsNotEmpty()
  @IsString()
  nomorBuktiBayar: string;

  @ApiProperty({
    description: 'Tanggal Bukti Bayar',
    example: '2026-02-15T00:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  tanggalBuktiBayar: string;

  @ApiProperty({
    description: 'Tahun Anggaran',
    example: 2026,
  })
  @IsNotEmpty()
  @IsNumber()
  tahunAnggaran: number;

  @ApiProperty({
    description: 'Bulan (1-12)',
    example: 2,
    minimum: 1,
    maximum: 12,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  bulan: number;

  @ApiProperty({
    description: 'ID Anggaran Kas sebagai sumber dana',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  anggaranKasId: string;

  @ApiProperty({
    description: 'Nilai Pembayaran',
    example: 5000000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  nilaiPembayaran: number;

  @ApiProperty({
    description: 'Uraian pembayaran',
    example: 'Pembayaran gaji pegawai bulan Februari 2026',
  })
  @IsNotEmpty()
  @IsString()
  uraian: string;

  @ApiPropertyOptional({
    description: 'Keterangan tambahan',
    example: 'Pembayaran sesuai SK Nomor 123/2026',
  })
  @IsOptional()
  @IsString()
  keterangan?: string;

  @ApiProperty({
    description: 'Jenis Belanja',
    enum: JenisBelanjaBuktiBayar,
    example: JenisBelanjaBuktiBayar.PEGAWAI,
  })
  @IsNotEmpty()
  @IsEnum(JenisBelanjaBuktiBayar)
  jenisBelanja: JenisBelanjaBuktiBayar;

  @ApiProperty({
    description: 'Nama Penerima Pembayaran',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  namaPenerima: string;

  @ApiPropertyOptional({
    description: 'NPWP Penerima',
    example: '12.345.678.9-012.345',
  })
  @IsOptional()
  @IsString()
  npwpPenerima?: string;

  @ApiPropertyOptional({
    description: 'Alamat Penerima',
    example: 'Jl. Merdeka No. 123, Jakarta',
  })
  @IsOptional()
  @IsString()
  alamatPenerima?: string;

  @ApiPropertyOptional({
    description: 'Nama Bank Penerima',
    example: 'Bank Mandiri',
  })
  @IsOptional()
  @IsString()
  bankPenerima?: string;

  @ApiPropertyOptional({
    description: 'Nomor Rekening Penerima',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  rekeningPenerima?: string;

  @ApiPropertyOptional({
    description: 'Atas Nama Rekening',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  atasNamaRekening?: string;

  @ApiPropertyOptional({
    description: 'Path file lampiran pendukung',
    example: 'uploads/bukti-bayar/lampiran-bb-001.pdf',
  })
  @IsOptional()
  @IsString()
  fileLampiran?: string;
}
