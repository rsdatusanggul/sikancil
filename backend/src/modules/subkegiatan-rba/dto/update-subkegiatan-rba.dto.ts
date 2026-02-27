import { PartialType } from '@nestjs/swagger';
import { CreateSubKegiatanRbaDto } from './create-subkegiatan-rba.dto';

export class UpdateSubKegiatanRbaDto extends PartialType(CreateSubKegiatanRbaDto) {}
