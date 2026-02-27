import { IsNotEmpty, IsString, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for Journal Item (Detail)
 */
export class JournalItemDto {
  @IsOptional()
  @IsNumber()
  lineNumber?: number;

  @IsNotEmpty()
  @IsUUID()
  coaId: string;

  @IsNotEmpty()
  @IsString()
  kodeRekening: string;

  @IsNotEmpty()
  @IsString()
  namaRekening: string;

  @IsOptional()
  @IsString()
  uraian?: string;

  @IsOptional()
  @IsUUID()
  unitKerjaId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  debet: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  kredit: number;
}
