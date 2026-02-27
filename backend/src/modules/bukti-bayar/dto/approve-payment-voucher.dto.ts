import { IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO untuk approval level Technical Officer
 */
export class ApproveTechnicalDto {
  @ApiPropertyOptional({
    description: 'Catatan dari pejabat teknis',
    example: 'Dokumen lengkap, disetujui untuk diproses',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

/**
 * DTO untuk approval level Treasurer (Bendahara)
 */
export class ApproveTreasurerDto {
  @ApiPropertyOptional({
    description: 'Catatan dari bendahara pengeluaran',
    example: 'Perhitungan pajak telah sesuai',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

/**
 * DTO untuk approval final (Direktur/PA)
 */
export class ApproveFinalDto {
  @ApiPropertyOptional({
    description: 'Catatan dari approver akhir',
    example: 'Disetujui untuk dibayarkan',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

/**
 * DTO untuk reject payment voucher
 */
export class RejectPaymentVoucherDto {
  @ApiProperty({
    description: 'Alasan penolakan (wajib diisi)',
    example: 'Dokumen invoice tidak lengkap, mohon dilengkapi',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  rejectionReason: string;
}
