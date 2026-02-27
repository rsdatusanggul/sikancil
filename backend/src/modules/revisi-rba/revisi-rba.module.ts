import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevisiRbaService } from './revisi-rba.service';
import { RevisiRbaController } from './revisi-rba.controller';
import { RevisiRBA } from '../../database/entities/revisi-rba.entity';
import { RBA } from '../../database/entities/rba.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RevisiRBA, RBA])],
  controllers: [RevisiRbaController],
  providers: [RevisiRbaService],
  exports: [RevisiRbaService],
})
export class RevisiRbaModule {}
