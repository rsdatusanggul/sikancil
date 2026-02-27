import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsArray, IsUUID, MaxLength, Min, Max, Matches, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateKegiatanRbaDto {
  @ApiProperty({
    example: '1.02.01',
    description: 'Kode kegiatan RBA (unique per tahun). Format fleksibel: X.XX atau X.XX.XX'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  kodeKegiatan: string;

  @ApiProperty({ example: 'Penyediaan Jasa Komunikasi, Sumber Daya Air dan Listrik', description: 'Nama kegiatan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  namaKegiatan: string;

  @ApiProperty({ example: 'uuid-program-id', description: 'ID Program RBA parent' })
  @IsUUID()
  @IsNotEmpty()
  programId: string;

  @ApiProperty({ example: 2024, description: 'Tahun anggaran' })
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  tahun: number;

  @ApiPropertyOptional({
    example: 'Kegiatan untuk menyediakan jasa komunikasi dan utilitas',
    description: 'Deskripsi kegiatan'
  })
  @IsString()
  @IsOptional()
  deskripsi?: string;

  @ApiPropertyOptional({
    example: [
      { nama: 'Jumlah tagihan terbayar', satuan: 'tagihan', target: 12 },
      { nama: 'Tingkat ketersediaan layanan', satuan: '%', target: 99 }
    ],
    description: 'Array indikator kegiatan dalam format JSON',
    type: 'array'
  })
  @IsArray()
  @IsOptional()
  indikatorKegiatan?: any[];

  @ApiPropertyOptional({ example: 5000000000, description: 'Pagu anggaran kegiatan dalam Rupiah' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  paguAnggaran?: number;

  @ApiPropertyOptional({ example: true, description: 'Status aktif kegiatan' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
