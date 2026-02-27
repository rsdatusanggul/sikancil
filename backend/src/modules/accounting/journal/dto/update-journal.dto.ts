import { PartialType } from '@nestjs/mapped-types';
import { CreateJournalDto } from './create-journal.dto';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for Updating Journal Entry
 * Only DRAFT journals can be updated
 */
export class UpdateJournalDto extends PartialType(CreateJournalDto) {
  @IsOptional()
  @IsString()
  updatedBy?: string; // Will be set from auth context
}
