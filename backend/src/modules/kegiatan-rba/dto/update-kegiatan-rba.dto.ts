import { PartialType } from '@nestjs/swagger';
import { CreateKegiatanRbaDto } from './create-kegiatan-rba.dto';

export class UpdateKegiatanRbaDto extends PartialType(CreateKegiatanRbaDto) {}
