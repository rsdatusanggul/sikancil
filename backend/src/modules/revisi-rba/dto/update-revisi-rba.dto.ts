import { PartialType } from '@nestjs/swagger';
import { CreateRevisiRbaDto } from './create-revisi-rba.dto';

export class UpdateRevisiRbaDto extends PartialType(CreateRevisiRbaDto) {}
