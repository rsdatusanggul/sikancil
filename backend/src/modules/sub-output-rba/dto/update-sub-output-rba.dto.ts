import { PartialType } from '@nestjs/swagger';
import { CreateSubOutputRbaDto } from './create-sub-output-rba.dto';

export class UpdateSubOutputRbaDto extends PartialType(CreateSubOutputRbaDto) {}
