import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalMappingService } from '../journal-mapping/journal-mapping.service';
import { JournalService } from '../journal/journal.service';
import { JournalEntry } from '../../../database/entities/journal-entry.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';
import { TransactionCreatedEvent, TransactionUpdatedEvent, TransactionDeletedEvent } from '../../../common/events/transaction.events';
import { CreateJournalDto } from '../journal/dto/create-journal.dto';
import { JournalItemDto } from '../journal/dto/journal-item.dto';

/**
 * Auto-Posting Service
 * Automatically creates journal entries from transaction events using mapping rules
 */
@Injectable()
export class AutoPostingService {
  private readonly logger = new Logger(AutoPostingService.name);

  constructor(
    private readonly journalMappingService: JournalMappingService,
    private readonly journalService: JournalService,
    @InjectRepository(JournalEntry)
    private journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(ChartOfAccount)
    private coaRepository: Repository<ChartOfAccount>,
  ) {}

  /**
   * Handle transaction created event
   * Creates journal entry automatically based on mapping rules
   */
  @OnEvent('transaction.created')
  async handleTransactionCreated(event: TransactionCreatedEvent): Promise<void> {
    this.logger.log(`Auto-posting for transaction created: ${event.sourceType} - ${event.sourceId}`);

    try {
      // Find mapping rule for this source type
      const mappingRule = await this.journalMappingService.findBySourceType(event.sourceType);

      if (!mappingRule) {
        this.logger.warn(`No mapping rule found for sourceType: ${event.sourceType}`);
        return;
      }

      if (!mappingRule.isActive) {
        this.logger.warn(`Mapping rule for ${event.sourceType} is inactive, skipping auto-posting`);
        return;
      }

      // Build journal from mapping rule and transaction data
      const journalDto = await this.buildJournalFromRule(
        mappingRule,
        event.data,
        event.sourceType,
        event.sourceId,
      );

      // Create journal entry
      const journal = await this.journalService.create(journalDto);
      this.logger.log(`Journal created: ${journal.nomorJurnal} for ${event.sourceType}`);

      // Auto-post immediately (always post auto-created journals)
      await this.journalService.post(journal.id, 'system');
      this.logger.log(`Journal auto-posted: ${journal.nomorJurnal}`)

    } catch (error) {
      this.logger.error(`Failed to auto-post for ${event.sourceType}:`, error.message);
      // Don't throw - we don't want to break the transaction if auto-posting fails
    }
  }

  /**
   * Handle transaction updated event
   * Updates or reverses existing journal entry
   */
  @OnEvent('transaction.updated')
  async handleTransactionUpdated(event: TransactionUpdatedEvent): Promise<void> {
    this.logger.log(`Auto-posting for transaction updated: ${event.sourceType} - ${event.sourceId}`);

    try {
      // Find existing journal for this transaction
      const existingJournal = await this.journalEntryRepository.findOne({
        where: {
          sourceType: event.sourceType,
          sourceId: event.sourceId,
          isReversed: false,
        },
      });

      if (!existingJournal) {
        this.logger.warn(`No existing journal found for ${event.sourceType} - ${event.sourceId}`);
        return;
      }

      // Check if journal is already posted
      if (existingJournal.isPosted) {
        // Reverse the old journal
        await this.journalService.reverse(
          existingJournal.id,
          'system',
          `Updated transaction ${event.sourceId}`,
        );
        this.logger.log(`Reversed journal ${existingJournal.nomorJurnal} due to transaction update`);
      } else {
        // Delete draft journal if not posted yet
        await this.journalService.remove(existingJournal.id);
        this.logger.log(`Deleted draft journal ${existingJournal.nomorJurnal} due to transaction update`);
      }

      // Create new journal for updated transaction
      const mappingRule = await this.journalMappingService.findBySourceType(event.sourceType);

      if (!mappingRule || !mappingRule.isActive) {
        this.logger.warn(`Cannot create new journal: mapping rule not found or inactive`);
        return;
      }

      const journalDto = await this.buildJournalFromRule(
        mappingRule,
        event.newData,
        event.sourceType,
        event.sourceId,
      );

      const journal = await this.journalService.create(journalDto);
      this.logger.log(`New journal created after update: ${journal.nomorJurnal}`);

      // Auto-post immediately
      await this.journalService.post(journal.id, 'system');
      this.logger.log(`New journal auto-posted: ${journal.nomorJurnal}`)

    } catch (error) {
      this.logger.error(`Failed to handle transaction update for ${event.sourceType}:`, error.message);
    }
  }

  /**
   * Handle transaction deleted event
   * Reverses the associated journal entry
   */
  @OnEvent('transaction.deleted')
  async handleTransactionDeleted(event: TransactionDeletedEvent): Promise<void> {
    this.logger.log(`Auto-posting for transaction deleted: ${event.sourceType} - ${event.sourceId}`);

    try {
      // Find existing journal for this transaction
      const existingJournal = await this.journalEntryRepository.findOne({
        where: {
          sourceType: event.sourceType,
          sourceId: event.sourceId,
          isReversed: false,
        },
      });

      if (!existingJournal) {
        this.logger.warn(`No existing journal found for ${event.sourceType} - ${event.sourceId}`);
        return;
      }

      // Reverse the journal if posted, delete if draft
      if (existingJournal.isPosted) {
        await this.journalService.reverse(
          existingJournal.id,
          'system',
          `Deleted transaction ${event.sourceId}`,
        );
        this.logger.log(`Reversed journal ${existingJournal.nomorJurnal} due to transaction deletion`);
      } else {
        await this.journalService.remove(existingJournal.id);
        this.logger.log(`Deleted draft journal ${existingJournal.nomorJurnal} due to transaction deletion`);
      }

    } catch (error) {
      this.logger.error(`Failed to handle transaction deletion for ${event.sourceType}:`, error.message);
    }
  }

  /**
   * Build journal DTO from mapping rule and transaction data
   * This is the core logic that converts transaction to journal format
   */
  private async buildJournalFromRule(
    mappingRule: any,
    transactionData: any,
    sourceType: string,
    sourceId: string,
  ): Promise<CreateJournalDto> {
    // Extract transaction details
    const { tanggal, uraian, jumlah, details } = this.extractTransactionData(transactionData);

    if (!jumlah || jumlah <= 0) {
      throw new BadRequestException('Transaction amount must be greater than 0');
    }

    // Build journal items from debit rules
    const debitItems: JournalItemDto[] = [];
    for (const rule of mappingRule.debitRules) {
      const amount = this.calculateAmount(rule, jumlah, details);
      if (amount > 0) {
        const coa = await this.getCoaByCode(rule.coaCode);
        debitItems.push({
          coaId: coa.id,
          kodeRekening: coa.kodeRekening,
          namaRekening: coa.namaRekening,
          uraian: rule.description || uraian,
          debet: amount,
          kredit: 0,
        });
      }
    }

    // Build journal items from credit rules
    const creditItems: JournalItemDto[] = [];
    for (const rule of mappingRule.creditRules) {
      const amount = this.calculateAmount(rule, jumlah, details);
      if (amount > 0) {
        const coa = await this.getCoaByCode(rule.coaCode);
        creditItems.push({
          coaId: coa.id,
          kodeRekening: coa.kodeRekening,
          namaRekening: coa.namaRekening,
          uraian: rule.description || uraian,
          debet: 0,
          kredit: amount,
        });
      }
    }

    // Combine debit and credit items
    const items = [...debitItems, ...creditItems];

    if (items.length === 0) {
      throw new BadRequestException('No journal items generated from mapping rule');
    }

    // Validate balancing
    const totalDebit = debitItems.reduce((sum, item) => sum + item.debet, 0);
    const totalCredit = creditItems.reduce((sum, item) => sum + item.kredit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Journal not balanced: Debit=${totalDebit}, Credit=${totalCredit}`,
      );
    }

    // Build CreateJournalDto
    const journalDto: CreateJournalDto = {
      tanggalJurnal: tanggal,
      uraian: `${mappingRule.description || sourceType} - ${uraian}`,
      sourceType,
      sourceId,
      items,
    };

    return journalDto;
  }

  /**
   * Extract standard transaction data from various transaction formats
   */
  private extractTransactionData(data: any): {
    tanggal: Date;
    uraian: string;
    jumlah: number;
    details?: any;
  } {
    // Handle different transaction data formats
    return {
      tanggal: data.tanggal || data.tanggalTransaksi || new Date(),
      uraian: data.uraian || data.keterangan || data.description || 'Auto-posted transaction',
      jumlah: data.jumlah || data.totalJumlah || data.amount || 0,
      details: data.details || data.items || null,
    };
  }

  /**
   * Calculate amount based on rule (percentage or fixed)
   */
  private calculateAmount(rule: any, totalAmount: number, details?: any): number {
    // If rule has condition, check if it applies
    if (rule.condition && details) {
      const conditionMet = this.evaluateCondition(rule.condition, details);
      if (!conditionMet) {
        return 0;
      }
    }

    // Calculate amount
    if (rule.isFixed) {
      return rule.fixedAmount || 0;
    } else {
      const percentage = rule.percentage || 100;
      return (totalAmount * percentage) / 100;
    }
  }

  /**
   * Evaluate condition (for future conditional mapping rules)
   */
  private evaluateCondition(condition: any, details: any): boolean {
    // Simple condition evaluation - can be extended
    // Example: { field: 'jenisLayanan', operator: '==', value: 'RAWAT_INAP' }
    if (condition.field && condition.operator && details[condition.field] !== undefined) {
      const fieldValue = details[condition.field];
      const expectedValue = condition.value;

      switch (condition.operator) {
        case '==':
          return fieldValue === expectedValue;
        case '!=':
          return fieldValue !== expectedValue;
        case '>':
          return fieldValue > expectedValue;
        case '<':
          return fieldValue < expectedValue;
        default:
          return true;
      }
    }
    return true;
  }

  /**
   * Get CoA by code (helper method)
   */
  private async getCoaByCode(coaCode: string): Promise<ChartOfAccount> {
    const coa = await this.coaRepository.findOne({
      where: { kodeRekening: coaCode },
    });

    if (!coa) {
      throw new BadRequestException(`Chart of Account not found: ${coaCode}`);
    }

    if (!coa.isActive) {
      throw new BadRequestException(`Chart of Account is inactive: ${coaCode}`);
    }

    return coa;
  }

  /**
   * Manual trigger for auto-posting (for testing or re-posting)
   */
  async manualAutoPost(
    sourceType: string,
    sourceId: string,
    transactionData: any,
  ): Promise<JournalEntry> {
    this.logger.log(`Manual auto-post triggered for ${sourceType} - ${sourceId}`);

    const mappingRule = await this.journalMappingService.findBySourceType(sourceType);

    if (!mappingRule) {
      throw new BadRequestException(`No mapping rule found for sourceType: ${sourceType}`);
    }

    if (!mappingRule.isActive) {
      throw new BadRequestException(`Mapping rule for ${sourceType} is inactive`);
    }

    const journalDto = await this.buildJournalFromRule(
      mappingRule,
      transactionData,
      sourceType,
      sourceId,
    );

    const journal = await this.journalService.create(journalDto);

    // Auto-post immediately
    await this.journalService.post(journal.id, 'system');

    return journal;
  }
}
