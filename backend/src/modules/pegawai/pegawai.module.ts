import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PegawaiService } from './pegawai.service';
import { PegawaiController } from './pegawai.controller';
import { Pegawai } from '../../database/entities/pegawai.entity';
import { UnitKerja } from '../../database/entities/unit-kerja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pegawai, UnitKerja])],
  controllers: [PegawaiController],
  providers: [PegawaiService],
  exports: [PegawaiService],
})
export class PegawaiModule {}
