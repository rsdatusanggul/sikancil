import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for individual mapping rule (debit/credit)
 */
export class MappingRuleItemDto {
  @IsNotEmpty()
  @IsString()
  coaCode: string; // e.g., "1.1.1.01.01"

  @IsNotEmpty()
  @IsString()
  description: string; // e.g., "Kas di Bendahara Penerimaan"

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  percentage?: number; // Percentage of total amount (0-100)

  @IsOptional()
  @IsBoolean()
  isFixed?: boolean; // If true, use fixedAmount instead of percentage

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fixedAmount?: number; // Fixed amount (if isFixed = true)

  @IsOptional()
  @IsString()
  note?: string; // Additional notes
}
