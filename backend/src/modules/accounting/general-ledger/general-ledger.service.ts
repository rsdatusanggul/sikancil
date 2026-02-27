import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { GeneralLedger } from '../../../database/entities/general-ledger.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';
import { JournalEntry } from '../../../database/entities/journal-entry.entity';
import { JournalDetail } from '../../../database/entities/journal-detail.entity';
import { JournalPostedEvent } from '../../../common/events/journal.events';
import { format } from 'date-fns';

/**
 * General Ledger Service
 * Manages buku besar (general ledger) entries
 * Auto-updates GL when journals are posted
 */
@Injectable()
export class GeneralLedgerService {
  private readonly logger = new Logger(GeneralLedgerService.name);

  constructor(
    @InjectRepository(GeneralLedger)
    private readonly glRepository: Repository<GeneralLedger>,
    @InjectRepository(ChartOfAccount)
    private readonly coaRepository: Repository<ChartOfAccount>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalDetail)
    private readonly journalDetailRepository: Repository<JournalDetail>,
  ) {}

  /**
   * Event handler: Auto-update GL when journal is posted
   * This is triggered whenever a journal entry is posted
   */
  @OnEvent('journal.posted')
  async handleJournalPosted(event: JournalPostedEvent): Promise<void> {
    this.logger.log(`Updating GL for posted journal: ${event.nomorJurnal}`);

    try {
      // Fetch journal details
      const journalDetails = await this.journalDetailRepository.find({
        where: { journalId: event.journalId },
        relations: ['coa'],
      });

      if (!journalDetails || journalDetails.length === 0) {
        this.logger.warn(`No journal details found for journal ${event.journalId}`);
        return;
      }

      // Update GL for each journal detail
      for (const detail of journalDetails) {
        await this.updateGLEntry(
          detail.coaId,
          event.periode,
          detail.debet,
          detail.kredit,
        );
      }

      this.logger.log(`GL updated successfully for journal ${event.nomorJurnal}`);
    } catch (error) {
      this.logger.error(`Failed to update GL for journal ${event.nomorJurnal}:`, error.message);
      // Don't throw - we don't want to break journal posting if GL update fails
    }
  }

  /**
   * Update or create GL entry for a specific CoA and period
   */
  async updateGLEntry(
    coaId: string,
    periode: string, // Format: YYYY-MM
    debet: number,
    kredit: number,
  ): Promise<GeneralLedger> {
    // Find or create GL entry
    let glEntry = await this.glRepository.findOne({
      where: { coaId, periode },
    });

    if (!glEntry) {
      // Create new GL entry for this period
      const previousPeriod = this.getPreviousPeriod(periode);
      const previousGL = await this.glRepository.findOne({
        where: { coaId, periode: previousPeriod },
      });

      const saldoAwal = previousGL ? previousGL.saldoAkhir : 0;

      glEntry = this.glRepository.create({
        coaId,
        periode,
        saldoAwal,
        totalDebet: 0,
        totalKredit: 0,
        saldoAkhir: saldoAwal,
      });
    }

    // Update amounts
    glEntry.totalDebet += debet;
    glEntry.totalKredit += kredit;

    // Calculate saldo akhir based on normal balance
    // For DEBIT normal accounts (Assets, Expenses): saldoAkhir = saldoAwal + totalDebet - totalKredit
    // For CREDIT normal accounts (Liabilities, Equity, Revenue): saldoAkhir = saldoAwal + totalKredit - totalDebet
    const coa = await this.coaRepository.findOne({ where: { id: coaId } });
    if (!coa) {
      throw new NotFoundException(`CoA not found: ${coaId}`);
    }

    if (coa.normalBalance === 'DEBIT') {
      glEntry.saldoAkhir = glEntry.saldoAwal + glEntry.totalDebet - glEntry.totalKredit;
    } else {
      glEntry.saldoAkhir = glEntry.saldoAwal + glEntry.totalKredit - glEntry.totalDebet;
    }

    return await this.glRepository.save(glEntry);
  }

  /**
   * Get GL entries for a specific CoA
   */
  async getGLByCoA(
    coaId: string,
    periodeMulai?: string,
    periodeAkhir?: string,
  ): Promise<GeneralLedger[]> {
    const where: any = { coaId };

    if (periodeMulai && periodeAkhir) {
      // For string comparison, we can use Between if format is YYYY-MM
      where.periode = Between(periodeMulai, periodeAkhir);
    } else if (periodeMulai) {
      where.periode = Between(periodeMulai, '9999-12');
    } else if (periodeAkhir) {
      where.periode = Between('1900-01', periodeAkhir);
    }

    return await this.glRepository.find({
      where,
      relations: ['coa'],
      order: { periode: 'ASC' },
    });
  }

  /**
   * Get GL entries for a specific period (all CoAs)
   */
  async getGLByPeriod(periode: string): Promise<GeneralLedger[]> {
    return await this.glRepository.find({
      where: { periode },
      relations: ['coa'],
      order: { coaId: 'ASC' },
    });
  }

  /**
   * Get GL summary for a period with transaction details
   */
  async getGLSummaryWithDetails(
    coaId: string,
    periode: string,
  ): Promise<{
    glEntry: GeneralLedger;
    transactions: any[];
  }> {
    const glEntry = await this.glRepository.findOne({
      where: { coaId, periode },
      relations: ['coa'],
    });

    if (!glEntry) {
      throw new NotFoundException(
        `GL entry not found for CoA ${coaId} and period ${periode}`,
      );
    }

    // Get all journal details for this CoA in this period
    const [year, month] = periode.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const journalDetails = await this.journalDetailRepository
      .createQueryBuilder('detail')
      .leftJoinAndSelect('detail.journalEntry', 'journal')
      .where('detail.coaId = :coaId', { coaId })
      .andWhere('journal.tanggalJurnal BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('journal.isPosted = :isPosted', { isPosted: true })
      .orderBy('journal.tanggalJurnal', 'ASC')
      .addOrderBy('journal.nomorJurnal', 'ASC')
      .getMany();

    const transactions = journalDetails.map((detail) => ({
      tanggal: detail.journal.tanggalJurnal,
      nomorJurnal: detail.journal.nomorJurnal,
      uraian: detail.uraian,
      debet: detail.debet,
      kredit: detail.kredit,
    }));

    return {
      glEntry,
      transactions,
    };
  }

  /**
   * Rebuild GL for a specific period
   * Use this to recalculate GL if data is inconsistent
   */
  async rebuildGLForPeriod(periode: string): Promise<void> {
    this.logger.log(`Rebuilding GL for period ${periode}`);

    // Delete existing GL entries for this period
    await this.glRepository.delete({ periode });

    // Get all posted journals for this period
    const [year, month] = periode.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const journals = await this.journalEntryRepository.find({
      where: {
        tanggalJurnal: Between(startDate, endDate),
        isPosted: true,
      },
      relations: ['items'],
    });

    // Group journal details by CoA
    const detailsByCoA = new Map<string, { debet: number; kredit: number }>();

    for (const journal of journals) {
      for (const detail of journal.items) {
        const existing = detailsByCoA.get(detail.coaId) || { debet: 0, kredit: 0 };
        existing.debet += detail.debet;
        existing.kredit += detail.kredit;
        detailsByCoA.set(detail.coaId, existing);
      }
    }

    // Create GL entries
    for (const [coaId, amounts] of detailsByCoA.entries()) {
      await this.updateGLEntry(coaId, periode, amounts.debet, amounts.kredit);
    }

    this.logger.log(`GL rebuilt successfully for period ${periode}`);
  }

  /**
   * Get GL report for a period range
   */
  async getGLReport(
    periodeMulai: string,
    periodeAkhir: string,
    coaIds?: string[],
  ): Promise<any[]> {
    const queryBuilder = this.glRepository
      .createQueryBuilder('gl')
      .leftJoinAndSelect('gl.coa', 'coa')
      .where('gl.periode BETWEEN :periodeMulai AND :periodeAkhir', {
        periodeMulai,
        periodeAkhir,
      });

    if (coaIds && coaIds.length > 0) {
      queryBuilder.andWhere('gl.coaId IN (:...coaIds)', { coaIds });
    }

    queryBuilder
      .orderBy('coa.kodeRekening', 'ASC')
      .addOrderBy('gl.periode', 'ASC');

    const glEntries = await queryBuilder.getMany();

    // Group by CoA
    const groupedByCoA = new Map<string, any>();

    for (const entry of glEntries) {
      if (!groupedByCoA.has(entry.coaId)) {
        groupedByCoA.set(entry.coaId, {
          coaId: entry.coaId,
          kodeRekening: entry.coa.kodeRekening,
          namaRekening: entry.coa.namaRekening,
          jenisAkun: entry.coa.jenisAkun,
          normalBalance: entry.coa.normalBalance,
          periods: [],
        });
      }

      const coaData = groupedByCoA.get(entry.coaId);
      coaData.periods.push({
        periode: entry.periode,
        saldoAwal: entry.saldoAwal,
        totalDebet: entry.totalDebet,
        totalKredit: entry.totalKredit,
        saldoAkhir: entry.saldoAkhir,
      });
    }

    return Array.from(groupedByCoA.values());
  }

  /**
   * Get previous period (YYYY-MM format)
   */
  private getPreviousPeriod(periode: string): string {
    const [year, month] = periode.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return format(date, 'yyyy-MM');
  }

  /**
   * Initialize GL for a new period
   * Copies saldo akhir from previous period as saldo awal
   */
  async initializeNewPeriod(periode: string): Promise<void> {
    this.logger.log(`Initializing GL for new period ${periode}`);

    const previousPeriod = this.getPreviousPeriod(periode);

    // Get all GL entries from previous period
    const previousGLEntries = await this.glRepository.find({
      where: { periode: previousPeriod },
    });

    if (previousGLEntries.length === 0) {
      this.logger.warn(`No GL entries found for previous period ${previousPeriod}`);
      return;
    }

    // Create GL entries for new period with saldo awal from previous saldo akhir
    const newEntries: GeneralLedger[] = [];

    for (const prevEntry of previousGLEntries) {
      const newEntry = this.glRepository.create({
        coaId: prevEntry.coaId,
        periode,
        saldoAwal: prevEntry.saldoAkhir,
        totalDebet: 0,
        totalKredit: 0,
        saldoAkhir: prevEntry.saldoAkhir,
      });
      newEntries.push(newEntry);
    }

    await this.glRepository.save(newEntries);
    this.logger.log(`Initialized ${newEntries.length} GL entries for period ${periode}`);
  }

  /**
   * Get account balance for a specific date
   */
  async getAccountBalance(coaId: string, tanggal: Date): Promise<number> {
    const periode = format(tanggal, 'yyyy-MM');

    const glEntry = await this.glRepository.findOne({
      where: { coaId, periode },
      relations: ['coa'],
    });

    if (!glEntry) {
      // No GL entry means zero balance
      return 0;
    }

    // If date is end of month, return saldo akhir
    const lastDayOfMonth = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 0);
    if (tanggal.getDate() === lastDayOfMonth.getDate()) {
      return glEntry.saldoAkhir;
    }

    // For mid-month, calculate balance up to that date
    const startOfMonth = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);

    const journalDetails = await this.journalDetailRepository
      .createQueryBuilder('detail')
      .leftJoinAndSelect('detail.journalEntry', 'journal')
      .where('detail.coaId = :coaId', { coaId })
      .andWhere('journal.tanggalJurnal BETWEEN :startDate AND :endDate', {
        startDate: startOfMonth,
        endDate: tanggal,
      })
      .andWhere('journal.isPosted = :isPosted', { isPosted: true })
      .getMany();

    let totalDebet = 0;
    let totalKredit = 0;

    for (const detail of journalDetails) {
      totalDebet += detail.debet;
      totalKredit += detail.kredit;
    }

    const coa = glEntry.coa;
    let balance: number;

    if (coa.normalBalance === 'DEBIT') {
      balance = glEntry.saldoAwal + totalDebet - totalKredit;
    } else {
      balance = glEntry.saldoAwal + totalKredit - totalDebet;
    }

    return balance;
  }
}
