import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveRevisiDto {
  @ApiPropertyOptional({ example: 'Disetujui sesuai prosedur', description: 'Catatan persetujuan' })
  @IsString()
  @IsOptional()
  catatan?: string;
}
