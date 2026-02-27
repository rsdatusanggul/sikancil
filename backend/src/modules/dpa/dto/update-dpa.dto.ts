import { PartialType } from '@nestjs/swagger';
import { CreateDPADto } from './create-dpa.dto';

export class UpdateDPADto extends PartialType(CreateDPADto) {}
