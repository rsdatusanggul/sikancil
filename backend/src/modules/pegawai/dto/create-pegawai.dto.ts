import { IsString, IsNotEmpty, IsOptional, IsEmail, MaxLength, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePegawaiDto {
  @ApiProperty({ example: '198501012010011001', description: 'Employee NIP (Nomor Induk Pegawai)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nip: string;

  @ApiProperty({ example: 'Dr. John Doe, Sp.PD', description: 'Full name of employee' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  namaLengkap: string;

  @ApiProperty({ example: 'uuid-unit-kerja', description: 'Unit Kerja ID where employee works' })
  @IsUUID()
  @IsNotEmpty()
  unitKerjaId: string;

  @ApiPropertyOptional({ example: 'Kepala Bagian Keuangan', description: 'Job position' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  jabatan?: string;

  @ApiProperty({ example: 'III/c', description: 'Employee grade/rank' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  golongan: string;

  @ApiPropertyOptional({ example: 'john.doe@rsds.go.id', description: 'Employee email' })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ example: '081234567890', description: 'Employee phone number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  telepon?: string;

  @ApiPropertyOptional({ example: '123456789012345', description: 'NPWP (Tax ID)' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  npwp?: string;

  @ApiPropertyOptional({ example: 'Bank Mandiri', description: 'Bank name for salary transfer' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  bankName?: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'Bank account number' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nomorRekening?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Bank account holder name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  namaRekening?: string;

  @ApiPropertyOptional({ example: '2010-01-01', description: 'Date when employee joined (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  tanggalMasuk?: Date;

  @ApiPropertyOptional({ example: 'ACTIVE', description: 'Employee status: ACTIVE, INACTIVE, RETIRED', default: 'ACTIVE' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  status?: string;
}
