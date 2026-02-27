import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramRbaService } from './program-rba.service';
import { ProgramRbaController } from './program-rba.controller';
import { ProgramRBA } from '../../database/entities/program-rba.entity';
import { KegiatanRBA } from '../../database/entities/kegiatan-rba.entity';
import { KegiatanRbaModule } from '../kegiatan-rba/kegiatan-rba.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProgramRBA, KegiatanRBA]),
    // Import KegiatanRbaModule to avoid circular dependency
  ],
  controllers: [ProgramRbaController],
  providers: [ProgramRbaService],
  exports: [ProgramRbaService],
})
export class ProgramRbaModule {}
