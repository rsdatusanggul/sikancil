import { PartialType } from '@nestjs/swagger';
import { CreateProgramRbaDto } from './create-program-rba.dto';

export class UpdateProgramRbaDto extends PartialType(CreateProgramRbaDto) {}
