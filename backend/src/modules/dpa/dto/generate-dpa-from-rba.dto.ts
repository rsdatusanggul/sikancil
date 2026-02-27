import { IsUUID, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateDPAFromRBADto {
  @ApiProperty({ description: 'UUID of approved RBA revision' })
  @IsUUID()
  revisiRBAId: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  tahunAnggaran: number;

  @ApiProperty({ example: 'DPA-001/BLUD/2026' })
  @IsString()
  nomorDPA: string;

  @ApiProperty()
  @IsString()
  createdBy: string;
}
