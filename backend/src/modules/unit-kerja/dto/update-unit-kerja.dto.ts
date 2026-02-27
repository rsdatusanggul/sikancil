import { PartialType } from '@nestjs/swagger';
import { CreateUnitKerjaDto } from './create-unit-kerja.dto';

export class UpdateUnitKerjaDto extends PartialType(CreateUnitKerjaDto) {}
