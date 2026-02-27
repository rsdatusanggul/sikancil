import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDPADto {
  @ApiProperty({ example: 'DPA-001/BLUD/2026' })
  @IsString()
  nomorDPA: string;

  @ApiProperty({ example: 'DPA', enum: ['DPA', 'DPPA'] })
  @IsEnum(['DPA', 'DPPA'])
  jenisDokumen: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  tahun: number;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  tahunAnggaran: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  tanggalDokumen?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  tanggalBerlaku?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  tanggalSelesai?: Date;

  @ApiPropertyOptional({ description: 'UUID of approved RBA revision' })
  @IsOptional()
  @IsUUID()
  revisiRBAId?: string;

  @ApiPropertyOptional({ description: 'UUID of previous DPA (for DPPA)' })
  @IsOptional()
  @IsUUID()
  dpaSebelumnyaId?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  nomorRevisi?: number;

  @ApiPropertyOptional({ description: 'Required for DPPA' })
  @IsOptional()
  @IsString()
  alasanRevisi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nomorSK?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  tanggalSK?: Date;

  @ApiProperty()
  @IsString()
  createdBy: string;
}
