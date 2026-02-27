import { PartialType } from '@nestjs/mapped-types';
import { CreateHibahDto } from './create-hibah.dto';
import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { StatusHibah, TransactionStatus } from '../../../database/enums';
import { Type } from 'class-transformer';

export class UpdateHibahDto extends PartialType(CreateHibahDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  nilaiTerpakai?: number;

  @IsOptional()
  @IsEnum(StatusHibah)
  statusPenggunaan?: StatusHibah;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
