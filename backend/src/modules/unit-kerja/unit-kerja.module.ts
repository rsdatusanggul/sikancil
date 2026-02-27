import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitKerjaService } from './unit-kerja.service';
import { UnitKerjaController } from './unit-kerja.controller';
import { UnitKerja } from '../../database/entities/unit-kerja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnitKerja])],
  controllers: [UnitKerjaController],
  providers: [UnitKerjaService],
  exports: [UnitKerjaService],
})
export class UnitKerjaModule {}
