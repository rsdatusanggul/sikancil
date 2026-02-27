import { IsString, IsNotEmpty, IsUUID, IsDateString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRevisiRbaDto {
  @ApiProperty({ example: 'uuid-rba-id', description: 'RBA ID yang akan direvisi' })
  @IsUUID()
  @IsNotEmpty()
  rbaId: string;

  @ApiProperty({ example: '2024-03-15', description: 'Tanggal revisi' })
  @IsDateString()
  @IsNotEmpty()
  tanggalRevisi: string;

  @ApiProperty({ example: 'Perubahan pagu akibat efisiensi belanja', description: 'Alasan revisi' })
  @IsString()
  @IsNotEmpty()
  alasanRevisi: string;

  @ApiProperty({
    example: {
      type: 'PERUBAHAN_PAGU',
      outputId: 'uuid',
      kodeRekening: '5.1.1.01.01',
      paguSebelum: 10000000,
      paguSesudah: 12000000,
      selisih: 2000000
    },
    description: 'Data perubahan dalam format JSON'
  })
  @IsObject()
  @IsNotEmpty()
  perubahanData: any;

  @ApiPropertyOptional({ example: 'uuid-user', description: 'User yang menyetujui' })
  @IsString()
  @IsOptional()
  approvedBy?: string;
}
