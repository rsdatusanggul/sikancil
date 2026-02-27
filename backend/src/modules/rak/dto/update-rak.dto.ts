import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRakDto } from './create-rak.dto';

export class UpdateRakDto extends PartialType(
  OmitType(CreateRakDto, ['subkegiatan_id', 'tahun_anggaran'] as const),
) {}