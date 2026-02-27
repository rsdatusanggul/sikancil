import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubKegiatanRbaService } from './subkegiatan-rba.service';
import { SubKegiatanRbaController } from './subkegiatan-rba.controller';
import { SubKegiatanRBA } from '../../database/entities/subkegiatan-rba.entity';
import { KegiatanRBA } from '../../database/entities/kegiatan-rba.entity';
import { UnitKerja } from '../../database/entities/unit-kerja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubKegiatanRBA, KegiatanRBA, UnitKerja])],
  controllers: [SubKegiatanRbaController],
  providers: [SubKegiatanRbaService],
  exports: [SubKegiatanRbaService],
})
export class SubKegiatanRbaModule {}
