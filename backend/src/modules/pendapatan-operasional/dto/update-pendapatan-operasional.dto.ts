import { PartialType } from '@nestjs/mapped-types';
import { CreatePendapatanOperasionalDto } from './create-pendapatan-operasional.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { TransactionStatus } from '../../../database/enums';

export class UpdatePendapatanOperasionalDto extends PartialType(
  CreatePendapatanOperasionalDto,
) {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
