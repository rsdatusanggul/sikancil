import { IsString, IsNotEmpty, IsOptional, IsEmail, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'SUP-001', description: 'Unique supplier code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  kodeSupplier: string;

  @ApiProperty({ example: 'PT. Maju Jaya', description: 'Supplier name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  namaSupplier: string;

  @ApiPropertyOptional({ example: '01.234.567.8-901.000', description: 'NPWP number' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  npwp?: string;

  @ApiPropertyOptional({ example: 'Jl. Raya No. 123', description: 'Supplier address' })
  @IsString()
  @IsOptional()
  alamat?: string;

  @ApiPropertyOptional({ example: 'Jakarta', description: 'City' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  kota?: string;

  @ApiPropertyOptional({ example: '12345', description: 'Postal code' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  kodePos?: string;

  @ApiPropertyOptional({ example: '021-12345678', description: 'Phone number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  telepon?: string;

  @ApiPropertyOptional({ example: 'supplier@example.com', description: 'Email address' })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Contact person name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactPerson?: string;

  @ApiPropertyOptional({ example: '081234567890', description: 'Contact person phone' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'Bank Mandiri', description: 'Bank name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  bankName?: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'Account number' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nomorRekening?: string;

  @ApiPropertyOptional({ example: 'PT. Maju Jaya', description: 'Account holder name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  namaRekening?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    description: 'Supplier status',
    enum: ['ACTIVE', 'INACTIVE', 'BLACKLIST'],
    default: 'ACTIVE'
  })
  @IsString()
  @IsOptional()
  @Matches(/^(ACTIVE|INACTIVE|BLACKLIST)$/, {
    message: 'Status must be one of: ACTIVE, INACTIVE, BLACKLIST'
  })
  status?: string;

  @ApiPropertyOptional({ example: 'Notes about supplier', description: 'Additional notes' })
  @IsString()
  @IsOptional()
  catatan?: string;
}
