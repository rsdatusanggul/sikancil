import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RencanaAnggaranKasService } from './rencana-anggaran-kas.service';
import { RencanaAnggaranKasController } from './rencana-anggaran-kas.controller';
import { RencanaAnggaranKas } from '../../database/entities/rencana-anggaran-kas.entity';
import { ChartOfAccount } from '../../database/entities/chart-of-account.entity';
import { RBA } from '../../database/entities/rba.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RencanaAnggaranKas, ChartOfAccount, RBA])],
  controllers: [RencanaAnggaranKasController],
  providers: [RencanaAnggaranKasService],
  exports: [RencanaAnggaranKasService],
})
export class RencanaAnggaranKasModule {}
