import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoPostingService } from './auto-posting.service';
import { AutoPostingController } from './auto-posting.controller';
import { JournalEntry } from '../../../database/entities/journal-entry.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';
import { JournalMappingModule } from '../journal-mapping/journal-mapping.module';
import { JournalModule } from '../journal/journal.module';

/**
 * Auto-Posting Module
 * Handles automatic journal entry creation from transaction events
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([JournalEntry, ChartOfAccount]),
    JournalMappingModule,
    JournalModule,
  ],
  controllers: [AutoPostingController],
  providers: [AutoPostingService],
  exports: [AutoPostingService],
})
export class AutoPostingModule {}
