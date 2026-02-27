import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty({ message: 'Username wajib diisi' })
  @MinLength(3, { message: 'Username minimal 3 karakter' })
  @MaxLength(50, { message: 'Username maksimal 50 karakter' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username hanya boleh mengandung huruf, angka, dan underscore',
  })
  username: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(100, { message: 'Password maksimal 100 karakter' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter spesial (@$!%*?&)',
    }
  )
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @MinLength(3, { message: 'Nama lengkap minimal 3 karakter' })
  @MaxLength(100, { message: 'Nama lengkap maksimal 100 karakter' })
  fullName: string;

  @ApiProperty({ example: 'captcha_abc123xyz' })
  @IsString()
  @IsNotEmpty({ message: 'CAPTCHA ID wajib diisi' })
  captchaId: string;

  @ApiProperty({ example: 'AB12' })
  @IsString()
  @IsNotEmpty({ message: 'CAPTCHA wajib diisi' })
  @MinLength(4, { message: 'CAPTCHA minimal 4 karakter' })
  @MaxLength(6, { message: 'CAPTCHA maksimal 6 karakter' })
  captcha: string;
}