import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ 
    example: 'uuid-of-fiscal-year',
    description: 'Optional fiscal year ID. If not provided, will use current active fiscal year',
    required: false 
  })
  @IsOptional()
  @IsUUID()
  fiscalYearId?: string;

  @ApiProperty({ 
    example: 'captcha_1234567890_abc123',
    description: 'CAPTCHA ID obtained from /auth/captcha endpoint',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  captchaId: string;

  @ApiProperty({ 
    example: 'AB12',
    description: 'CAPTCHA text shown in the image',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  captcha: string;
}
