import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendapatanOperasionalService } from './pendapatan-operasional.service';
import { PendapatanOperasionalController } from './pendapatan-operasional.controller';
import { PendapatanBLUD } from '../../database/entities/pendapatan-blud.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PendapatanBLUD])],
  controllers: [PendapatanOperasionalController],
  providers: [PendapatanOperasionalService],
  exports: [PendapatanOperasionalService],
})
export class PendapatanOperasionalModule {}
