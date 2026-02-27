import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsInt,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MappingRuleItemDto } from './mapping-rule-item.dto';

/**
 * DTO for creating Journal Mapping Rule
 */
export class CreateMappingRuleDto {
  @IsNotEmpty()
  @IsString()
  sourceType: string; // e.g., PENDAPATAN_JASA_LAYANAN

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MappingRuleItemDto)
  debitRules: MappingRuleItemDto[];

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MappingRuleItemDto)
  creditRules: MappingRuleItemDto[];

  @IsOptional()
  conditions?: Record<string, any>; // JSON object for conditional rules

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
