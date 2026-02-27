import {
  IsUUID,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRakDetailDto {
  @ApiProperty({ 
    description: 'UUID Kode Rekening',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  kode_rekening_id: string;

  @ApiProperty({ 
    description: 'Jumlah Anggaran Total',
    example: 120000000 
  })
  @IsNumber()
  @Min(0)
  jumlah_anggaran: number;

  // Monthly breakdown (optional - will be auto-calculated from quarterly if not provided)
  @ApiProperty({ 
    description: 'Januari',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  januari?: number;

  @ApiProperty({ 
    description: 'Februari',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  februari?: number;

  @ApiProperty({ 
    description: 'Maret',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maret?: number;

  @ApiProperty({ 
    description: 'April',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  april?: number;

  @ApiProperty({ 
    description: 'Mei',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  mei?: number;

  @ApiProperty({ 
    description: 'Juni',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  juni?: number;

  @ApiProperty({ 
    description: 'Juli',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  juli?: number;

  @ApiProperty({ 
    description: 'Agustus',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  agustus?: number;

  @ApiProperty({ 
    description: 'September',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  september?: number;

  @ApiProperty({ 
    description: 'Oktober',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  oktober?: number;

  @ApiProperty({ 
    description: 'November',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  november?: number;

  @ApiProperty({ 
    description: 'Desember',
    example: 10000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  desember?: number;

  // Quarterly breakdown (for quarterly input - will auto-distribute to months)
  @ApiProperty({ 
    description: 'Triwulan 1 (Jan-Mar)',
    example: 30000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  triwulan_1?: number;

  @ApiProperty({ 
    description: 'Triwulan 2 (Apr-Jun)',
    example: 30000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  triwulan_2?: number;

  @ApiProperty({ 
    description: 'Triwulan 3 (Jul-Sep)',
    example: 30000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  triwulan_3?: number;

  @ApiProperty({ 
    description: 'Triwulan 4 (Oct-Dec)',
    example: 30000000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  triwulan_4?: number;
}

export class CreateRakDto {
  @ApiProperty({ 
    description: 'UUID Subkegiatan',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  subkegiatan_id: string;

  @ApiProperty({ 
    description: 'Tahun Anggaran',
    example: 2025 
  })
  @IsInt()
  tahun_anggaran: number;

  @ApiProperty({ 
    description: 'Array of RAK details (optional - will auto-populate from RBA if not provided)',
    type: [CreateRakDetailDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRakDetailDto)
  details?: CreateRakDetailDto[];

  @ApiProperty({ 
    description: 'Auto-populate from RBA (default: true)',
    example: true,
    required: false
  })
  @IsOptional()
  auto_populate?: boolean;
}
