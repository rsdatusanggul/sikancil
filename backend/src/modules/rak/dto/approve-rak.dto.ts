import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveRakDto {
  @ApiPropertyOptional({
    description: 'Catatan persetujuan',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  approval_notes?: string;
}

export class RejectRakDto {
  @ApiPropertyOptional({
    description: 'Alasan penolakan',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  rejection_reason: string;
}