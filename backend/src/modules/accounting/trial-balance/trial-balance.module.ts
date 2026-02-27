import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrialBalanceService } from './trial-balance.service';
import { TrialBalanceController } from './trial-balance.controller';
import { TrialBalance } from '../../../database/entities/trial-balance.entity';
import { GeneralLedger } from '../../../database/entities/general-ledger.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';

/**
 * Trial Balance Module
 * Manages neraca saldo (trial balance) functionality
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrialBalance,
      GeneralLedger,
      ChartOfAccount,
    ]),
  ],
  controllers: [TrialBalanceController],
  providers: [TrialBalanceService],
  exports: [TrialBalanceService],
})
export class TrialBalanceModule {}
