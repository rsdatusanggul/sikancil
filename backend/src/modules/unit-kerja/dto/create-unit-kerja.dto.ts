import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail, IsInt, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitKerjaDto {
  @ApiProperty({ example: 'UNT-001', description: 'Unique unit code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  kodeUnit: string;

  @ApiProperty({ example: 'Bagian Keuangan', description: 'Unit name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  namaUnit: string;

  @ApiPropertyOptional({ example: 'uuid-parent', description: 'Parent unit ID' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ example: 1, description: 'Organizational level' })
  @IsInt()
  @IsOptional()
  @Min(1)
  level?: number;

  @ApiPropertyOptional({ example: 'Dr. John Doe', description: 'Head of unit name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  kepalaNama?: string;

  @ApiPropertyOptional({ example: '198501012010011001', description: 'Head of unit NIP' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  kepalaNIP?: string;

  @ApiPropertyOptional({ example: 'keuangan@rsds.go.id', description: 'Unit email' })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ example: '021-12345678', description: 'Unit phone' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  telepon?: string;

  @ApiPropertyOptional({ example: 'Jl. Kesehatan No. 1', description: 'Unit address' })
  @IsString()
  @IsOptional()
  alamat?: string;

  @ApiPropertyOptional({ example: true, description: 'Unit is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
