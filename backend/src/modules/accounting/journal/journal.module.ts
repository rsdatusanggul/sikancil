import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { JournalEntry } from '../../../database/entities/journal-entry.entity';
import { JournalDetail } from '../../../database/entities/journal-detail.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, JournalDetail, ChartOfAccount])],
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
