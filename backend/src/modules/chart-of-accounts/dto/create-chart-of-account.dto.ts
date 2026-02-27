import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '../../../database/enums';

export class CreateChartOfAccountDto {
  @ApiProperty({ example: '1.1.01.01', description: 'Account code (BLUD format)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  kodeRekening: string;

  @ApiProperty({ example: 'Kas di Bendahara Penerimaan', description: 'Account name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  namaRekening: string;

  @ApiPropertyOptional({ example: 'Cash held by receiving treasurer', description: 'Account description' })
  @IsString()
  @IsOptional()
  deskripsi?: string;

  @ApiProperty({ enum: AccountType, example: AccountType.ASSET, description: 'Account type' })
  @IsEnum(AccountType)
  @IsNotEmpty()
  jenisAkun: AccountType;

  @ApiProperty({ example: 1, description: 'Account level (1-6)' })
  @IsNotEmpty()
  level: number;

  @ApiPropertyOptional({ example: '1.1.01', description: 'Parent account code' })
  @IsString()
  @IsOptional()
  parentKode?: string;

  @ApiPropertyOptional({ example: true, description: 'Can be used in transactions' })
  @IsBoolean()
  @IsOptional()
  isDetail?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Account is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
