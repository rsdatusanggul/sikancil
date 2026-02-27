import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrialBalance } from '../../../database/entities/trial-balance.entity';
import { GeneralLedger } from '../../../database/entities/general-ledger.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';
import { format } from 'date-fns';

/**
 * Trial Balance Service
 * Generates and manages neraca saldo (trial balance)
 */
@Injectable()
export class TrialBalanceService {
  private readonly logger = new Logger(TrialBalanceService.name);

  constructor(
    @InjectRepository(TrialBalance)
    private readonly tbRepository: Repository<TrialBalance>,
    @InjectRepository(GeneralLedger)
    private readonly glRepository: Repository<GeneralLedger>,
    @InjectRepository(ChartOfAccount)
    private readonly coaRepository: Repository<ChartOfAccount>,
  ) {}

  /**
   * Generate trial balance for a specific period
   * Materializes GL data into trial balance format
   */
  async generateTrialBalance(periode: string): Promise<TrialBalance[]> {
    this.logger.log(`Generating trial balance for period ${periode}`);

    // Delete existing trial balance for this period
    await this.tbRepository.delete({ periode });

    // Get all GL entries for this period
    const glEntries = await this.glRepository.find({
      where: { periode },
      relations: ['coa'],
      order: { kodeRekening: 'ASC' },
    });

    if (glEntries.length === 0) {
      this.logger.warn(`No GL entries found for period ${periode}`);
      return [];
    }

    // Create trial balance entries
    const tbEntries: TrialBalance[] = [];

    for (const glEntry of glEntries) {
      const coa = glEntry.coa;

      // Calculate debit and credit based on saldo akhir and normal balance
      let debet = 0;
      let kredit = 0;

      if (coa.normalBalance === 'DEBIT') {
        if (glEntry.saldoAkhir >= 0) {
          debet = glEntry.saldoAkhir;
        } else {
          kredit = Math.abs(glEntry.saldoAkhir);
        }
      } else {
        if (glEntry.saldoAkhir >= 0) {
          kredit = glEntry.saldoAkhir;
        } else {
          debet = Math.abs(glEntry.saldoAkhir);
        }
      }

      const tbEntry = this.tbRepository.create({
        coaId: glEntry.coaId,
        kodeRekening: coa.kodeRekening,
        namaRekening: coa.namaRekening,
        periode,
        tahun: glEntry.tahun,
        level: coa.level,
        parentCode: coa.parentKode,
        debet,
        kredit,
        debetAdjustment: 0,
        kreditAdjustment: 0,
        debetAdjusted: debet, // Initially same as debet
        kreditAdjusted: kredit, // Initially same as kredit
      });

      tbEntries.push(tbEntry);
    }

    const savedEntries = await this.tbRepository.save(tbEntries);
    this.logger.log(`Generated ${savedEntries.length} trial balance entries for period ${periode}`);

    return savedEntries;
  }

  /**
   * Get trial balance for a specific period
   */
  async getTrialBalance(periode: string): Promise<any> {
    const tbEntries = await this.tbRepository.find({
      where: { periode },
      relations: ['coa'],
      order: { kodeRekening: 'ASC' },
    });

    if (tbEntries.length === 0) {
      // Auto-generate if not exists
      this.logger.log(`Trial balance not found for ${periode}, auto-generating...`);
      const generated = await this.generateTrialBalance(periode);
      return this.formatTrialBalance(generated, periode);
    }

    return this.formatTrialBalance(tbEntries, periode);
  }

  /**
   * Format trial balance with totals and summary
   */
  private formatTrialBalance(entries: TrialBalance[], periode: string): any {
    let totalDebet = 0;
    let totalKredit = 0;
    let totalDebetAdjusted = 0;
    let totalKreditAdjusted = 0;

    const entriesData = entries.map((entry) => {
      totalDebet += Number(entry.debet);
      totalKredit += Number(entry.kredit);
      totalDebetAdjusted += Number(entry.debetAdjusted);
      totalKreditAdjusted += Number(entry.kreditAdjusted);

      return {
        coaId: entry.coaId,
        kodeRekening: entry.kodeRekening,
        namaRekening: entry.namaRekening,
        level: entry.level,
        debet: Number(entry.debet),
        kredit: Number(entry.kredit),
        debetAdjusted: Number(entry.debetAdjusted),
        kreditAdjusted: Number(entry.kreditAdjusted),
      };
    });

    return {
      periode,
      entries: entriesData,
      summary: {
        totalDebet,
        totalKredit,
        totalDebetAdjusted,
        totalKreditAdjusted,
        isBalanced: Math.abs(totalDebet - totalKredit) < 0.01,
        isBalancedAdjusted: Math.abs(totalDebetAdjusted - totalKreditAdjusted) < 0.01,
        difference: totalDebet - totalKredit,
        differenceAdjusted: totalDebetAdjusted - totalKreditAdjusted,
      },
    };
  }

  /**
   * Get trial balance grouped by account type
   */
  async getTrialBalanceGrouped(periode: string): Promise<any> {
    const tbEntries = await this.tbRepository.find({
      where: { periode },
      relations: ['coa'],
      order: { kodeRekening: 'ASC' },
    });

    if (tbEntries.length === 0) {
      // Auto-generate if not exists
      this.logger.log(`Trial balance not found for ${periode}, auto-generating...`);
      await this.generateTrialBalance(periode);
      return this.getTrialBalanceGrouped(periode);
    }

    // Group by jenisAkun from CoA
    const grouped = new Map<string, any>();

    for (const entry of tbEntries) {
      const jenisAkun = entry.coa.jenisAkun;

      if (!grouped.has(jenisAkun)) {
        grouped.set(jenisAkun, {
          jenisAkun,
          entries: [],
          subtotal: {
            debet: 0,
            kredit: 0,
            debetAdjusted: 0,
            kreditAdjusted: 0,
          },
        });
      }

      const group = grouped.get(jenisAkun);
      group.entries.push({
        coaId: entry.coaId,
        kodeRekening: entry.kodeRekening,
        namaRekening: entry.namaRekening,
        level: entry.level,
        debet: Number(entry.debet),
        kredit: Number(entry.kredit),
        debetAdjusted: Number(entry.debetAdjusted),
        kreditAdjusted: Number(entry.kreditAdjusted),
      });
      group.subtotal.debet += Number(entry.debet);
      group.subtotal.kredit += Number(entry.kredit);
      group.subtotal.debetAdjusted += Number(entry.debetAdjusted);
      group.subtotal.kreditAdjusted += Number(entry.kreditAdjusted);
    }

    // Calculate summary
    let totalDebet = 0;
    let totalKredit = 0;
    let totalDebetAdjusted = 0;
    let totalKreditAdjusted = 0;

    for (const group of grouped.values()) {
      totalDebet += group.subtotal.debet;
      totalKredit += group.subtotal.kredit;
      totalDebetAdjusted += group.subtotal.debetAdjusted;
      totalKreditAdjusted += group.subtotal.kreditAdjusted;
    }

    return {
      periode,
      groups: Array.from(grouped.values()),
      summary: {
        totalDebet,
        totalKredit,
        totalDebetAdjusted,
        totalKreditAdjusted,
        isBalanced: Math.abs(totalDebet - totalKredit) < 0.01,
        isBalancedAdjusted: Math.abs(totalDebetAdjusted - totalKreditAdjusted) < 0.01,
        difference: totalDebet - totalKredit,
        differenceAdjusted: totalDebetAdjusted - totalKreditAdjusted,
      },
    };
  }

  /**
   * Record adjustment entry for trial balance
   */
  async recordAdjustment(
    periode: string,
    coaId: string,
    adjustmentDebet: number,
    adjustmentKredit: number,
  ): Promise<TrialBalance> {
    const tbEntry = await this.tbRepository.findOne({
      where: { periode, coaId },
    });

    if (!tbEntry) {
      throw new Error(`Trial balance entry not found for CoA ${coaId} in period ${periode}`);
    }

    tbEntry.debetAdjusted = Number(tbEntry.debet) + adjustmentDebet;
    tbEntry.kreditAdjusted = Number(tbEntry.kredit) + adjustmentKredit;

    return await this.tbRepository.save(tbEntry);
  }

  /**
   * Compare trial balance between two periods
   */
  async compareTrialBalance(periode1: string, periode2: string): Promise<any> {
    const tb1 = await this.getTrialBalance(periode1);
    const tb2 = await this.getTrialBalance(periode2);

    const comparison: any[] = [];

    // Create map of periode2 entries for quick lookup
    const tb2Map = new Map(
      tb2.entries.map((entry: any) => [entry.coaId, entry]),
    );

    for (const entry1 of tb1.entries) {
      const entry2: any = tb2Map.get(entry1.coaId);

      const debetChange = entry2 ? entry2.debet - entry1.debet : -entry1.debet;
      const kreditChange = entry2 ? entry2.kredit - entry1.kredit : -entry1.kredit;

      comparison.push({
        coaId: entry1.coaId,
        kodeRekening: entry1.kodeRekening,
        namaRekening: entry1.namaRekening,
        level: entry1.level,
        periode1: {
          debet: entry1.debet,
          kredit: entry1.kredit,
        },
        periode2: {
          debet: entry2 ? entry2.debet : 0,
          kredit: entry2 ? entry2.kredit : 0,
        },
        changes: {
          debet: debetChange,
          kredit: kreditChange,
          debetPercentage: entry1.debet !== 0 ? (debetChange / entry1.debet) * 100 : 0,
          kreditPercentage: entry1.kredit !== 0 ? (kreditChange / entry1.kredit) * 100 : 0,
        },
      });
    }

    return {
      periode1,
      periode2,
      comparison,
      summary: {
        periode1: tb1.summary,
        periode2: tb2.summary,
      },
    };
  }

  /**
   * Get trial balance for multiple periods (for trend analysis)
   */
  async getTrialBalanceTrend(
    periodeMulai: string,
    periodeAkhir: string,
    coaIds?: string[],
  ): Promise<any> {
    const queryBuilder = this.tbRepository
      .createQueryBuilder('tb')
      .leftJoinAndSelect('tb.coa', 'coa')
      .where('tb.periode BETWEEN :periodeMulai AND :periodeAkhir', {
        periodeMulai,
        periodeAkhir,
      });

    if (coaIds && coaIds.length > 0) {
      queryBuilder.andWhere('tb.coaId IN (:...coaIds)', { coaIds });
    }

    queryBuilder
      .orderBy('coa.kodeRekening', 'ASC')
      .addOrderBy('tb.periode', 'ASC');

    const tbEntries = await queryBuilder.getMany();

    // Group by CoA
    const groupedByCoA = new Map<string, any>();

    for (const entry of tbEntries) {
      if (!groupedByCoA.has(entry.coaId)) {
        groupedByCoA.set(entry.coaId, {
          coaId: entry.coaId,
          kodeRekening: entry.kodeRekening,
          namaRekening: entry.namaRekening,
          level: entry.level,
          jenisAkun: entry.coa.jenisAkun,
          normalBalance: entry.coa.normalBalance,
          periods: [],
        });
      }

      const coaData = groupedByCoA.get(entry.coaId);
      coaData.periods.push({
        periode: entry.periode,
        debet: Number(entry.debet),
        kredit: Number(entry.kredit),
        debetAdjusted: Number(entry.debetAdjusted),
        kreditAdjusted: Number(entry.kreditAdjusted),
      });
    }

    return {
      periodeMulai,
      periodeAkhir,
      accounts: Array.from(groupedByCoA.values()),
    };
  }

  /**
   * Export trial balance to structured format for Excel/PDF
   */
  async exportTrialBalance(periode: string, grouped: boolean = false): Promise<any> {
    if (grouped) {
      return await this.getTrialBalanceGrouped(periode);
    } else {
      return await this.getTrialBalance(periode);
    }
  }
}
