import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChartOfAccountsModule } from './modules/chart-of-accounts/chart-of-accounts.module';
import { UnitKerjaModule } from './modules/unit-kerja/unit-kerja.module';
import { PegawaiModule } from './modules/pegawai/pegawai.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { BankAccountModule } from './modules/bank-account/bank-account.module';
import { FiscalYearModule } from './modules/fiscal-year/fiscal-year.module';
import { ProgramRbaModule } from './modules/program-rba/program-rba.module';
import { KegiatanRbaModule } from './modules/kegiatan-rba/kegiatan-rba.module';
import { SubKegiatanRbaModule } from './modules/subkegiatan-rba/subkegiatan-rba.module';
import { SubOutputRbaModule } from './modules/sub-output-rba/sub-output-rba.module';
import { AnggaranBelanjaRbaModule } from './modules/anggaran-belanja-rba/anggaran-belanja-rba.module';
import { RencanaAnggaranKasModule } from './modules/rencana-anggaran-kas/rencana-anggaran-kas.module';
import { RakModule } from './modules/rak/rak.module';
import { RevisiRbaModule } from './modules/revisi-rba/revisi-rba.module';
import { PendapatanOperasionalModule } from './modules/pendapatan-operasional/pendapatan-operasional.module';
import { HibahModule } from './modules/hibah/hibah.module';
import { DPAModule } from './modules/dpa/dpa.module';
import { BuktiBayarModule } from './modules/bukti-bayar/bukti-bayar.module';
import { JournalModule } from './modules/accounting/journal/journal.module';
import { JournalMappingModule } from './modules/accounting/journal-mapping/journal-mapping.module';
import { AutoPostingModule } from './modules/accounting/auto-posting/auto-posting.module';
import { GeneralLedgerModule } from './modules/accounting/general-ledger/general-ledger.module';
import { TrialBalanceModule } from './modules/accounting/trial-balance/trial-balance.module';
import { EventsModule } from './common/events/events.module';
import { AuditModule } from './modules/audit/audit.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),

    // Rate limiting for security
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 100, // max 100 requests per ttl
    }]),

    // ✅ Redis Cache Module for CAPTCHA storage (multi-instance safe)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<number>('REDIS_PORT');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');

        return {
          store: await redisStore({
            socket: {
              host: redisHost || 'localhost',
              port: redisPort || 6379,
            },
            password: redisPassword || undefined,
            ttl: 300000, // Default 5 minutes in milliseconds
          }),
        };
      },
      inject: [ConfigService],
    }),

    // BullMQ — antrian job async (shared Redis connection)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host:     configService.get<string>('REDIS_HOST') || 'localhost',
          port:     configService.get<number>('REDIS_PORT') || 6379,
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      }),
      inject: [ConfigService],
    }),

    // Event Emitter for auto-posting
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    AuthModule,

    UsersModule,

    // Master Data Modules
    ChartOfAccountsModule,

    UnitKerjaModule,

    PegawaiModule,

    SupplierModule,

    BankAccountModule,

    FiscalYearModule,

    ProgramRbaModule,

    KegiatanRbaModule,

    SubKegiatanRbaModule,

    SubOutputRbaModule,

    AnggaranBelanjaRbaModule,

    RencanaAnggaranKasModule,
    RakModule,
    RevisiRbaModule,

    // Pendapatan Modules (Week 6-7)
    PendapatanOperasionalModule,

    HibahModule,

    // DPA/DPPA Module
    DPAModule,

    // Belanja Modules - Workflow: Rencana Anggaran Kas > Bukti Bayar > SPP > SPM > SP2D
    BuktiBayarModule,

    // Accounting Modules
    JournalModule,
    JournalMappingModule,
    AutoPostingModule,
    GeneralLedgerModule,
    TrialBalanceModule,

    // Common/Shared Modules
    EventsModule,

    // Audit Log Module (Global)
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ✅ ADD GLOBAL THROTTLER GUARD
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}