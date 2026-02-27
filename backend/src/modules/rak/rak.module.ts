import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RakController } from './controllers/rak.controller';
import { RakService } from './services/rak.service';
import { RakValidationService } from './services/rak-validation.service';
import { RakSubkegiatan } from './entities/rak-subkegiatan.entity';
import { RakDetail } from './entities/rak-detail.entity';
import { SubKegiatanRBA } from '../../database/entities/subkegiatan-rba.entity';
import { ChartOfAccount } from '../../database/entities/chart-of-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RakSubkegiatan, RakDetail, SubKegiatanRBA, ChartOfAccount])],
  controllers: [RakController],
  providers: [RakService, RakValidationService],
  exports: [RakService],
})
export class RakModule {}
