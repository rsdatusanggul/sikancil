import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnggaranBelanjaRbaService } from './anggaran-belanja-rba.service';
import { AnggaranBelanjaRbaController } from './anggaran-belanja-rba.controller';
import { AnggaranBelanjaRBA } from '../../database/entities/anggaran-belanja-rba.entity';
import { SubKegiatanRBA } from '../../database/entities/subkegiatan-rba.entity';
import { SubOutputRBA } from '../../database/entities/sub-output-rba.entity';
import { ChartOfAccount } from '../../database/entities/chart-of-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnggaranBelanjaRBA, SubKegiatanRBA, SubOutputRBA, ChartOfAccount])],
  controllers: [AnggaranBelanjaRbaController],
  providers: [AnggaranBelanjaRbaService],
  exports: [AnggaranBelanjaRbaService],
})
export class AnggaranBelanjaRbaModule {}
