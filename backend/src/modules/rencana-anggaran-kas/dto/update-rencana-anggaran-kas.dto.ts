import { PartialType } from '@nestjs/swagger';
import { CreateRencanaAnggaranKasDto } from './create-rencana-anggaran-kas.dto';

export class UpdateRencanaAnggaranKasDto extends PartialType(CreateRencanaAnggaranKasDto) {}