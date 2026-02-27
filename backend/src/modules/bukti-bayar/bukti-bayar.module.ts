import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { ChartOfAccountsModule } from '../chart-of-accounts/chart-of-accounts.module';

// Controllers
import { BuktiBayarController, BuktiBayarPublicController } from './bukti-bayar.controller';

// Main Service
import { BuktiBayarService } from './bukti-bayar.service';

// Specialized Services
import { TaxCalculationService } from './services/tax-calculation.service';
import { BudgetValidationService } from './services/budget-validation.service';
import { VoucherNumberingService } from './services/voucher-numbering.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { QrCodeService } from './services/qr-code.service';

// Entities
import { PaymentVoucher } from '../../database/entities/payment-voucher.entity';
import { PaymentVoucherAuditLog } from '../../database/entities/payment-voucher-audit-log.entity';
import { PaymentVoucherAttachment } from '../../database/entities/payment-voucher-attachment.entity';
import { TaxRule } from '../../database/entities/tax-rule.entity';
import { ShortUrl } from '../../database/entities/short-url.entity';
import { ChartOfAccount } from '../../database/entities/chart-of-account.entity';

// Legacy entities (for backward compatibility)
import { BuktiBayar } from '../../database/entities/bukti-bayar.entity';
import { RencanaAnggaranKas } from '../../database/entities/rencana-anggaran-kas.entity';

@Module({
  imports: [
    ChartOfAccountsModule,
    TypeOrmModule.forFeature([
      // New entities
      PaymentVoucher,
      PaymentVoucherAuditLog,
      PaymentVoucherAttachment,
      TaxRule,
      ShortUrl,

      // Legacy entities (keep for backward compatibility)
      BuktiBayar,
      RencanaAnggaranKas,
    ]),
  ],
  controllers: [
    BuktiBayarController,
    BuktiBayarPublicController, // Public QR verification endpoint
  ],
  providers: [
    BuktiBayarService,
    TaxCalculationService,
    BudgetValidationService,
    VoucherNumberingService,
    PdfGeneratorService,
    QrCodeService,
  ],
  exports: [BuktiBayarService],
})
export class BuktiBayarModule {}
