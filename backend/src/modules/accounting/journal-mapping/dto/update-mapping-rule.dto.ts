import { PartialType } from '@nestjs/mapped-types';
import { CreateMappingRuleDto } from './create-mapping-rule.dto';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating Journal Mapping Rule
 */
export class UpdateMappingRuleDto extends PartialType(CreateMappingRuleDto) {
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
