import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBuktiBayarDto } from './create-bukti-bayar.dto';

export class UpdateBuktiBayarDto extends PartialType(
  OmitType(CreateBuktiBayarDto, ['nomorBuktiBayar', 'anggaranKasId'] as const),
) {}
