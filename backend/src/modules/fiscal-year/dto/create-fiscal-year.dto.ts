import { IsInt, IsNotEmpty, IsOptional, IsString, IsBoolean, IsDateString, Min, Max, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFiscalYearDto {
  @ApiProperty({ example: 2024, description: 'Fiscal year (e.g., 2024)' })
  @IsInt()
  @IsNotEmpty()
  @Min(2000)
  @Max(2100)
  tahun: number;

  @ApiProperty({ example: '2024-01-01', description: 'Start date of fiscal year' })
  @IsDateString()
  @IsNotEmpty()
  tanggalMulai: Date;

  @ApiProperty({ example: '2024-12-31', description: 'End date of fiscal year' })
  @IsDateString()
  @IsNotEmpty()
  tanggalSelesai: Date;

  @ApiPropertyOptional({
    example: 'OPEN',
    description: 'Fiscal year status',
    enum: ['OPEN', 'CLOSED', 'LOCKED'],
    default: 'OPEN'
  })
  @IsString()
  @IsOptional()
  @Matches(/^(OPEN|CLOSED|LOCKED)$/, {
    message: 'Status must be one of: OPEN, CLOSED, LOCKED'
  })
  status?: string;

  @ApiPropertyOptional({ example: true, description: 'Is this the current active fiscal year', default: false })
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;

  @ApiPropertyOptional({ example: 'Fiscal year 2024', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  keterangan?: string;
}
