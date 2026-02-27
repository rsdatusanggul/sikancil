import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralLedgerService } from './general-ledger.service';
import { GeneralLedgerController } from './general-ledger.controller';
import { GeneralLedger } from '../../../database/entities/general-ledger.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';
import { JournalEntry } from '../../../database/entities/journal-entry.entity';
import { JournalDetail } from '../../../database/entities/journal-detail.entity';

/**
 * General Ledger Module
 * Manages buku besar (general ledger) functionality
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      GeneralLedger,
      ChartOfAccount,
      JournalEntry,
      JournalDetail,
    ]),
  ],
  controllers: [GeneralLedgerController],
  providers: [GeneralLedgerService],
  exports: [GeneralLedgerService],
})
export class GeneralLedgerModule {}
