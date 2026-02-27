import { IsString, IsNotEmpty, IsInt, IsUUID, IsNumber, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSubOutputRbaDto {
  @ApiProperty({ example: '01.01.001.01', description: 'Kode sub output RBA (unique per tahun)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  kodeSubOutput: string;

  @ApiProperty({ example: 'Pelayanan Rawat Jalan Poli Umum', description: 'Nama sub output' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  namaSubOutput: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID Sub Kegiatan RBA' })
  @IsUUID()
  @IsNotEmpty()
  subKegiatanId: string;

  @ApiProperty({ example: 2024, description: 'Tahun anggaran' })
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  tahun: number;

  @ApiProperty({ example: 500, description: 'Volume target sub output' })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  volumeTarget: number;

  @ApiProperty({ example: 'Pasien', description: 'Satuan volume (Pasien, Orang, Kegiatan, dll)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  satuan: string;

  @ApiPropertyOptional({ example: 2500000.00, description: 'Total pagu anggaran sub output' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  totalPagu: number;
}
