import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRakDetailDto {
  @ApiProperty({ description: 'UUID Kode Rekening' })
  @IsUUID()
  kode_rekening_id: string;

  @ApiProperty({ description: 'Jumlah Anggaran Tahunan', example: 30000000 })
  @IsNumber()
  @Min(0)
  jumlah_anggaran: number;

  @ApiPropertyOptional({ description: 'Rencana Januari', example: 2500000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  januari?: number;

  @ApiPropertyOptional({ description: 'Rencana Februari' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  februari?: number;

  @ApiPropertyOptional({ description: 'Rencana Maret' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maret?: number;

  @ApiPropertyOptional({ description: 'Rencana April' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  april?: number;

  @ApiPropertyOptional({ description: 'Rencana Mei' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  mei?: number;

  @ApiPropertyOptional({ description: 'Rencana Juni' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  juni?: number;

  @ApiPropertyOptional({ description: 'Rencana Juli' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  juli?: number;

  @ApiPropertyOptional({ description: 'Rencana Agustus' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  agustus?: number;

  @ApiPropertyOptional({ description: 'Rencana September' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  september?: number;

  @ApiPropertyOptional({ description: 'Rencana Oktober' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  oktober?: number;

  @ApiPropertyOptional({ description: 'Rencana November' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  november?: number;

  @ApiPropertyOptional({ description: 'Rencana Desember' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  desember?: number;
}