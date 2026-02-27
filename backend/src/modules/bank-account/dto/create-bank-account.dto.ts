import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, MaxLength, Matches, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'BNK-001', description: 'Unique bank code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  kodeBank: string;

  @ApiProperty({ example: 'Bank Mandiri', description: 'Bank name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  namaBank: string;

  @ApiProperty({ example: '1234567890', description: 'Account number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nomorRekening: string;

  @ApiProperty({ example: 'RSUD XYZ', description: 'Account holder name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  namaPemilik: string;

  @ApiPropertyOptional({ example: 'Cabang Jakarta Pusat', description: 'Branch name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  cabang?: string;

  @ApiPropertyOptional({ example: 'BMRIIDJA', description: 'SWIFT code' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  swift?: string;

  @ApiPropertyOptional({ example: 10000000, description: 'Initial balance', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  saldoAwal?: number;

  @ApiPropertyOptional({ example: 10000000, description: 'Current balance', default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  saldoBerjalan?: number;

  @ApiPropertyOptional({ example: 'IDR', description: 'Currency code', default: 'IDR' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  currency?: string;

  @ApiPropertyOptional({ example: false, description: 'Is this the primary account', default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'Account status',
    enum: ['ACTIVE', 'INACTIVE', 'CLOSED'],
    default: 'ACTIVE'
  })
  @IsString()
  @IsOptional()
  @Matches(/^(ACTIVE|INACTIVE|CLOSED)$/, {
    message: 'Status must be one of: ACTIVE, INACTIVE, CLOSED'
  })
  status?: string;

  @ApiPropertyOptional({ example: 'Main operating account', description: 'Notes about this account' })
  @IsString()
  @IsOptional()
  keterangan?: string;
}
