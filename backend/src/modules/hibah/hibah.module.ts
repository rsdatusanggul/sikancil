import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HibahService } from './hibah.service';
import { HibahController } from './hibah.controller';
import { HibahBLUD } from '../../database/entities/hibah-blud.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HibahBLUD])],
  controllers: [HibahController],
  providers: [HibahService],
  exports: [HibahService],
})
export class HibahModule {}
