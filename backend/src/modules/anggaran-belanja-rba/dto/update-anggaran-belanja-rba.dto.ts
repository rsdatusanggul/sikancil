import { PartialType } from '@nestjs/swagger';
import { CreateAnggaranBelanjaRbaDto } from './create-anggaran-belanja-rba.dto';

export class UpdateAnggaranBelanjaRbaDto extends PartialType(CreateAnggaranBelanjaRbaDto) {}
