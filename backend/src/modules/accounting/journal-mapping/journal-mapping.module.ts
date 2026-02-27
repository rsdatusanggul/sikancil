import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalMappingService } from './journal-mapping.service';
import { JournalMappingController } from './journal-mapping.controller';
import { JournalMappingRule } from '../../../database/entities/journal-mapping-rule.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JournalMappingRule, ChartOfAccount])],
  controllers: [JournalMappingController],
  providers: [JournalMappingService],
  exports: [JournalMappingService],
})
export class JournalMappingModule {}
