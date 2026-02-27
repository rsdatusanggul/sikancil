import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsArray, MaxLength, Min, Max, Matches, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProgramRbaDto {
  @ApiProperty({ example: '1.02.02', description: 'Kode program RBA level 3 (format: 1.XX.XX)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d\.\d{2}\.\d{2}$/, { message: 'Format kode program harus 1.XX.XX (contoh: 1.02.02)' })
  @MaxLength(20)
  kodeProgram: string;

  @ApiProperty({ example: 'PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN', description: 'Nama program' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  namaProgram: string;

  @ApiProperty({ example: 2024, description: 'Tahun anggaran' })
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  tahun: number;

  @ApiPropertyOptional({
    example: 'Program untuk meningkatkan kualitas pelayanan administrasi',
    description: 'Deskripsi program'
  })
  @IsString()
  @IsOptional()
  deskripsi?: string;

  @ApiPropertyOptional({
    example: [
      { nama: 'Persentase kepuasan layanan', satuan: '%', target: 85 },
      { nama: 'Jumlah dokumen terproses', satuan: 'dokumen', target: 1000 }
    ],
    description: 'Array indikator program dalam format JSON',
    type: 'array'
  })
  @IsArray()
  @IsOptional()
  indikatorProgram?: any[];

  @ApiPropertyOptional({ example: 10000000000, description: 'Pagu anggaran program dalam Rupiah' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  paguAnggaran?: number;

  @ApiPropertyOptional({ example: true, description: 'Status aktif program' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
