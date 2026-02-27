import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KegiatanRbaService } from './kegiatan-rba.service';
import { KegiatanRbaController } from './kegiatan-rba.controller';
import { KegiatanRBA } from '../../database/entities/kegiatan-rba.entity';
import { ProgramRBA } from '../../database/entities/program-rba.entity';
import { SubKegiatanRBA } from '../../database/entities/subkegiatan-rba.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KegiatanRBA, ProgramRBA, SubKegiatanRBA])],
  controllers: [KegiatanRbaController],
  providers: [KegiatanRbaService],
  exports: [KegiatanRbaService],
})
export class KegiatanRbaModule {}
