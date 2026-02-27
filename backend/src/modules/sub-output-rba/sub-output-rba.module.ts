import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubOutputRbaService } from './sub-output-rba.service';
import { SubOutputRbaController } from './sub-output-rba.controller';
import { SubOutputRBA } from '../../database/entities/sub-output-rba.entity';
import { SubKegiatanRBA } from '../../database/entities/subkegiatan-rba.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubOutputRBA, SubKegiatanRBA])],
  controllers: [SubOutputRbaController],
  providers: [SubOutputRbaService],
  exports: [SubOutputRbaService],
})
export class SubOutputRbaModule {}
