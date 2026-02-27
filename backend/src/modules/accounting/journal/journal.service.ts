import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JournalEntry } from '../../../database/entities/journal-entry.entity';
import { JournalDetail } from '../../../database/entities/journal-detail.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';
import { CreateJournalDto, UpdateJournalDto, JournalFilterDto } from './dto';
import { TransactionStatus, JournalEntryType } from '../../../database/enums';
import { format } from 'date-fns';
import {
  JournalCreatedEvent,
  JournalPostedEvent,
  JournalReversedEvent,
  JournalApprovedEvent,
} from '../../../common/events';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntryRepository: Repository<JournalEntry>,
    private eventEmitter: EventEmitter2,
    @InjectRepository(JournalDetail)
    private journalDetailRepository: Repository<JournalDetail>,
    @InjectRepository(ChartOfAccount)
    private coaRepository: Repository<ChartOfAccount>,
  ) {}

  /**
   * Create a new journal entry
   */
  async create(createJournalDto: CreateJournalDto): Promise<JournalEntry> {
    // 1. Calculate periode and tahun if not provided
    const tanggalJurnal = new Date(createJournalDto.tanggalJurnal);
    const periode = createJournalDto.periode || format(tanggalJurnal, 'yyyy-MM');
    const tahun = createJournalDto.tahun || tanggalJurnal.getFullYear();

    // 2. Generate nomor jurnal if not provided
    const nomorJurnal =
      createJournalDto.nomorJurnal || (await this.generateNomorJurnal(tanggalJurnal));

    // 3. Validate items balancing
    const { totalDebit, totalCredit } = this.calculateTotals(createJournalDto.items);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01; // Allow 1 cent rounding

    if (!isBalanced) {
      throw new BadRequestException(
        `Journal not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`,
      );
    }

    // 4. Validate CoA exists for each item
    await this.validateCoAs(createJournalDto.items);

    // 5. Create journal entry
    const journalEntry = this.journalEntryRepository.create({
      nomorJurnal,
      tanggalJurnal,
      periode,
      tahun,
      jenisJurnal: createJournalDto.jenisJurnal || JournalEntryType.GENERAL,
      sourceType: createJournalDto.sourceType,
      sourceId: createJournalDto.sourceId,
      referenceType: createJournalDto.referenceType,
      referenceId: createJournalDto.referenceId,
      referenceNo: createJournalDto.referenceNo,
      uraian: createJournalDto.uraian,
      keterangan: createJournalDto.keterangan,
      totalDebit,
      totalCredit,
      isBalanced,
      status: TransactionStatus.DRAFT,
      createdBy: createJournalDto.createdBy || 'system',
    });

    const savedJournal = await this.journalEntryRepository.save(journalEntry);

    // 6. Create journal details
    const journalDetails = createJournalDto.items.map((item, index) =>
      this.journalDetailRepository.create({
        journalId: savedJournal.id,
        lineNumber: item.lineNumber || index + 1,
        coaId: item.coaId,
        kodeRekening: item.kodeRekening,
        namaRekening: item.namaRekening,
        uraian: item.uraian,
        unitKerjaId: item.unitKerjaId,
        debet: item.debet,
        kredit: item.kredit,
      }),
    );

    await this.journalDetailRepository.save(journalDetails);

    // 7. Emit event
    this.eventEmitter.emit(
      'journal.created',
      new JournalCreatedEvent(
        savedJournal.id,
        savedJournal.nomorJurnal,
        savedJournal.sourceType,
        savedJournal.sourceId,
      ),
    );

    // 8. Return with details
    return this.findOne(savedJournal.id);
  }

  /**
   * Find all journals with filtering and pagination
   */
  async findAll(filterDto: JournalFilterDto): Promise<{
    data: JournalEntry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, sortBy = 'tanggalJurnal', sortOrder = 'DESC' } = filterDto;

    const where: FindOptionsWhere<JournalEntry> = {};

    if (filterDto.nomorJurnal) {
      where.nomorJurnal = Like(`%${filterDto.nomorJurnal}%`);
    }

    if (filterDto.startDate && filterDto.endDate) {
      where.tanggalJurnal = Between(filterDto.startDate, filterDto.endDate);
    }

    if (filterDto.periode) {
      where.periode = filterDto.periode;
    }

    if (filterDto.tahun) {
      where.tahun = filterDto.tahun;
    }

    if (filterDto.jenisJurnal) {
      where.jenisJurnal = filterDto.jenisJurnal;
    }

    if (filterDto.sourceType) {
      where.sourceType = filterDto.sourceType;
    }

    if (filterDto.sourceId) {
      where.sourceId = filterDto.sourceId;
    }

    if (filterDto.status) {
      where.status = filterDto.status;
    }

    if (filterDto.createdBy) {
      where.createdBy = filterDto.createdBy;
    }

    if (filterDto.uraian) {
      where.uraian = Like(`%${filterDto.uraian}%`);
    }

    const [data, total] = await this.journalEntryRepository.findAndCount({
      where,
      relations: ['items', 'items.coa'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one journal by ID
   */
  async findOne(id: string): Promise<JournalEntry> {
    const journal = await this.journalEntryRepository.findOne({
      where: { id },
      relations: ['items', 'items.coa'],
    });

    if (!journal) {
      throw new NotFoundException(`Journal with ID ${id} not found`);
    }

    return journal;
  }

  /**
   * Update journal (only DRAFT status)
   */
  async update(id: string, updateJournalDto: UpdateJournalDto): Promise<JournalEntry> {
    const journal = await this.findOne(id);

    // Only allow update if status is DRAFT
    if (journal.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update journal with status ${journal.status}. Only DRAFT journals can be updated.`,
      );
    }

    // If items are provided, recalculate and validate
    if (updateJournalDto.items) {
      const { totalDebit, totalCredit } = this.calculateTotals(updateJournalDto.items);
      const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

      if (!isBalanced) {
        throw new BadRequestException(
          `Journal not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`,
        );
      }

      await this.validateCoAs(updateJournalDto.items);

      // Delete old details and create new ones
      await this.journalDetailRepository.delete({ journalId: id });

      const journalDetails = updateJournalDto.items.map((item, index) =>
        this.journalDetailRepository.create({
          journalId: id,
          lineNumber: item.lineNumber || index + 1,
          coaId: item.coaId,
          kodeRekening: item.kodeRekening,
          namaRekening: item.namaRekening,
          uraian: item.uraian,
          unitKerjaId: item.unitKerjaId,
          debet: item.debet,
          kredit: item.kredit,
        }),
      );

      await this.journalDetailRepository.save(journalDetails);

      // Update totals in journal entity
      journal.totalDebit = totalDebit;
      journal.totalCredit = totalCredit;
      journal.isBalanced = isBalanced;
    }

    // Update journal entry
    Object.assign(journal, updateJournalDto);
    return this.journalEntryRepository.save(journal);
  }

  /**
   * Delete journal (only DRAFT status)
   */
  async remove(id: string): Promise<void> {
    const journal = await this.findOne(id);

    if (journal.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot delete journal with status ${journal.status}. Only DRAFT journals can be deleted.`,
      );
    }

    await this.journalEntryRepository.remove(journal);
  }

  /**
   * Post journal to General Ledger
   */
  async post(id: string, postedBy: string): Promise<JournalEntry> {
    const journal = await this.findOne(id);

    if (journal.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(`Journal is already posted or has invalid status`);
    }

    if (!journal.isBalanced) {
      throw new BadRequestException(`Cannot post unbalanced journal`);
    }

    journal.status = TransactionStatus.POSTED;
    journal.isPosted = true;
    journal.postedBy = postedBy;
    journal.postedAt = new Date();

    const savedJournal = await this.journalEntryRepository.save(journal);

    // Emit event for General Ledger update
    this.eventEmitter.emit(
      'journal.posted',
      new JournalPostedEvent(
        savedJournal.id,
        savedJournal.nomorJurnal,
        savedJournal.periode,
        savedJournal.tahun,
        Number(savedJournal.totalDebit),
        Number(savedJournal.totalCredit),
      ),
    );

    return savedJournal;
  }

  /**
   * Approve journal (for manual journals)
   */
  async approve(id: string, approvedBy: string): Promise<JournalEntry> {
    const journal = await this.findOne(id);

    if (journal.jenisJurnal === JournalEntryType.AUTO) {
      throw new BadRequestException(`Auto journals do not require approval`);
    }

    if (journal.isApproved) {
      throw new BadRequestException(`Journal is already approved`);
    }

    journal.isApproved = true;
    journal.approvedBy = approvedBy;
    journal.approvedAt = new Date();

    // Auto-post after approval
    if (journal.status === TransactionStatus.DRAFT) {
      journal.status = TransactionStatus.POSTED;
      journal.isPosted = true;
      journal.postedBy = approvedBy;
      journal.postedAt = new Date();
    }

    const savedJournal = await this.journalEntryRepository.save(journal);

    // Emit events
    this.eventEmitter.emit(
      'journal.approved',
      new JournalApprovedEvent(savedJournal.id, savedJournal.nomorJurnal, approvedBy),
    );

    if (journal.isPosted) {
      this.eventEmitter.emit(
        'journal.posted',
        new JournalPostedEvent(
          savedJournal.id,
          savedJournal.nomorJurnal,
          savedJournal.periode,
          savedJournal.tahun,
          Number(savedJournal.totalDebit),
          Number(savedJournal.totalCredit),
        ),
      );
    }

    return savedJournal;
  }

  /**
   * Reverse journal
   */
  async reverse(id: string, reversedBy: string, reason: string): Promise<JournalEntry> {
    const journal = await this.findOne(id);

    if (!journal.isPosted) {
      throw new BadRequestException(`Can only reverse posted journals`);
    }

    if (journal.isReversed) {
      throw new BadRequestException(`Journal is already reversed`);
    }

    // Create reversal journal
    const reversalDto: CreateJournalDto = {
      tanggalJurnal: new Date(),
      jenisJurnal: JournalEntryType.REVERSAL,
      sourceType: journal.sourceType,
      sourceId: journal.sourceId,
      uraian: `REVERSAL: ${journal.uraian}`,
      keterangan: `Reason: ${reason}. Original Journal: ${journal.nomorJurnal}`,
      items: journal.items.map((item) => ({
        coaId: item.coaId,
        kodeRekening: item.kodeRekening,
        namaRekening: item.namaRekening,
        uraian: item.uraian,
        unitKerjaId: item.unitKerjaId,
        debet: item.kredit, // Swap debet and kredit
        kredit: item.debet,
      })),
      createdBy: reversedBy,
    };

    const reversalJournal = await this.create(reversalDto);
    await this.post(reversalJournal.id, reversedBy);

    // Mark original as reversed
    journal.isReversed = true;
    journal.reversedBy = reversedBy;
    journal.reversedAt = new Date();
    journal.reversalJournalId = reversalJournal.id;
    journal.status = TransactionStatus.CANCELLED;

    await this.journalEntryRepository.save(journal);

    // Emit event
    this.eventEmitter.emit(
      'journal.reversed',
      new JournalReversedEvent(id, reversalJournal.id, reason),
    );

    return this.findOne(id);
  }

  /**
   * Calculate totals from journal items
   */
  private calculateTotals(items: any[]): { totalDebit: number; totalCredit: number } {
    const totalDebit = items.reduce((sum, item) => sum + Number(item.debet), 0);
    const totalCredit = items.reduce((sum, item) => sum + Number(item.kredit), 0);
    return { totalDebit, totalCredit };
  }

  /**
   * Validate that all CoAs exist
   */
  private async validateCoAs(items: any[]): Promise<void> {
    const coaIds = items.map((item) => item.coaId);
    const uniqueCoaIds = [...new Set(coaIds)];

    const coas = await this.coaRepository.findBy({ id: In(uniqueCoaIds) as any });

    if (coas.length !== uniqueCoaIds.length) {
      throw new BadRequestException(`One or more Chart of Accounts not found`);
    }

    // Validate CoA is active
    const inactiveCoas = coas.filter((coa) => !coa.isActive);
    if (inactiveCoas.length > 0) {
      throw new BadRequestException(
        `Inactive Chart of Accounts: ${inactiveCoas.map((c) => c.kodeRekening).join(', ')}`,
      );
    }
  }

  /**
   * Generate nomor jurnal
   * Format: JU/YYYY/MM/NNNN
   */
  private async generateNomorJurnal(tanggal: Date): Promise<string> {
    const year = tanggal.getFullYear();
    const month = String(tanggal.getMonth() + 1).padStart(2, '0');

    // Find last journal for this month
    const lastJournal = await this.journalEntryRepository.findOne({
      where: {
        periode: `${year}-${month}`,
      },
      order: { nomorJurnal: 'DESC' },
    });

    let sequence = 1;
    if (lastJournal && lastJournal.nomorJurnal) {
      const lastSequence = parseInt(lastJournal.nomorJurnal.split('/').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `JU/${year}/${month}/${String(sequence).padStart(4, '0')}`;
  }
}
