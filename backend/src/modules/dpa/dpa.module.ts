import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DPAController } from './dpa.controller';
import { DPAService } from './dpa.service';
import { DPA } from '../../database/entities/dpa.entity';
import { DPABelanja } from '../../database/entities/dpa-belanja.entity';
import { DPAPendapatan } from '../../database/entities/dpa-pendapatan.entity';
import { DPAPembiayaan } from '../../database/entities/dpa-pembiayaan.entity';
import { DPAHistory } from '../../database/entities/dpa-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DPA,
      DPABelanja,
      DPAPendapatan,
      DPAPembiayaan,
      DPAHistory,
    ]),
  ],
  controllers: [DPAController],
  providers: [DPAService],
  exports: [DPAService],
})
export class DPAModule {}
