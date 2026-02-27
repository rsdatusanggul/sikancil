import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateFiscalYearDto {
  @ApiProperty({ 
    example: 'uuid-of-fiscal-year',
    description: 'ID of the fiscal year to set as active for the user'
  })
  @IsUUID()
  @IsNotEmpty()
  fiscalYearId: string;
}