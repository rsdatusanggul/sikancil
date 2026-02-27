import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, Or } from 'typeorm';
import { BankAccount } from '../../database/entities/bank-account.entity';
import { CreateBankAccountDto, UpdateBankAccountDto, QueryBankAccountDto } from './dto';

@Injectable()
export class BankAccountService {
  private readonly logger = new Logger(BankAccountService.name);

  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  /**
   * Create a new bank account
   */
  async create(createDto: CreateBankAccountDto, userId: string): Promise<BankAccount> {
    this.logger.log(`Creating new bank account: ${createDto.kodeBank}`);

    // Check if kodeBank already exists
    const existingCode = await this.bankAccountRepository.findOne({
      where: { kodeBank: createDto.kodeBank },
    });

    if (existingCode) {
      throw new ConflictException(`Bank code ${createDto.kodeBank} already exists`);
    }

    // Check if nomorRekening already exists
    const existingAccount = await this.bankAccountRepository.findOne({
      where: { nomorRekening: createDto.nomorRekening },
    });

    if (existingAccount) {
      throw new ConflictException(`Account number ${createDto.nomorRekening} already exists`);
    }

    // If setting as primary, unset other primary accounts
    if (createDto.isPrimary) {
      await this.unsetPrimaryAccounts();
    }

    const bankAccount = this.bankAccountRepository.create({
      ...createDto,
      createdBy: userId,
    });

    const saved = await this.bankAccountRepository.save(bankAccount);
    this.logger.log(`Bank account created successfully: ${saved.kodeBank}`);

    return saved;
  }

  /**
   * Find all bank accounts with filtering and pagination
   */
  async findAll(queryDto: QueryBankAccountDto): Promise<{
    data: BankAccount[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, namaBank, status, isPrimary, currency, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<BankAccount> | FindOptionsWhere<BankAccount>[] = {};

    if (search) {
      // Search in bank name or account number
      return this.searchBankAccounts(search, page, limit);
    }

    if (namaBank) {
      where.namaBank = Like(`%${namaBank}%`);
    }

    if (status) {
      where.status = status;
    }

    if (isPrimary !== undefined) {
      where.isPrimary = isPrimary;
    }

    if (currency) {
      where.currency = currency;
    }

    const [data, total] = await this.bankAccountRepository.findAndCount({
      where,
      order: { kodeBank: 'ASC' },
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
   * Search bank accounts by name or number
   */
  private async searchBankAccounts(search: string, page: number, limit: number): Promise<{
    data: BankAccount[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [data, total] = await this.bankAccountRepository.findAndCount({
      where: [
        { namaBank: Like(`%${search}%`) },
        { nomorRekening: Like(`%${search}%`) },
        { namaPemilik: Like(`%${search}%`) },
      ],
      order: { kodeBank: 'ASC' },
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
   * Find one bank account by ID
   */
  async findOne(id: string): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository.findOne({ where: { id } });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    return bankAccount;
  }

  /**
   * Find bank account by account number
   */
  async findByAccountNumber(nomorRekening: string): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { nomorRekening }
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with number ${nomorRekening} not found`);
    }

    return bankAccount;
  }

  /**
   * Get all active bank accounts
   */
  async getActiveAccounts(): Promise<BankAccount[]> {
    return this.bankAccountRepository.find({
      where: { status: 'ACTIVE' },
      order: { kodeBank: 'ASC' },
    });
  }

  /**
   * Get accounts by bank name
   */
  async getAccountsByBank(namaBank: string): Promise<BankAccount[]> {
    return this.bankAccountRepository.find({
      where: { namaBank: Like(`%${namaBank}%`) },
      order: { kodeBank: 'ASC' },
    });
  }

  /**
   * Get primary account
   */
  async getPrimaryAccount(): Promise<BankAccount | null> {
    const primary = await this.bankAccountRepository.findOne({
      where: { isPrimary: true, status: 'ACTIVE' },
    });

    return primary;
  }

  /**
   * Update bank account
   */
  async update(id: string, updateDto: UpdateBankAccountDto, userId: string): Promise<BankAccount> {
    const bankAccount = await this.findOne(id);

    // If kodeBank is being updated, check for conflicts
    if (updateDto.kodeBank && updateDto.kodeBank !== bankAccount.kodeBank) {
      const existing = await this.bankAccountRepository.findOne({
        where: { kodeBank: updateDto.kodeBank },
      });

      if (existing) {
        throw new ConflictException(`Bank code ${updateDto.kodeBank} already exists`);
      }
    }

    // If nomorRekening is being updated, check for conflicts
    if (updateDto.nomorRekening && updateDto.nomorRekening !== bankAccount.nomorRekening) {
      const existing = await this.bankAccountRepository.findOne({
        where: { nomorRekening: updateDto.nomorRekening },
      });

      if (existing) {
        throw new ConflictException(`Account number ${updateDto.nomorRekening} already exists`);
      }
    }

    // If setting as primary, unset other primary accounts
    if (updateDto.isPrimary && !bankAccount.isPrimary) {
      await this.unsetPrimaryAccounts();
    }

    Object.assign(bankAccount, updateDto);

    const updated = await this.bankAccountRepository.save(bankAccount);
    this.logger.log(`Bank account updated: ${updated.kodeBank} by ${userId}`);

    return updated;
  }

  /**
   * Delete bank account (soft delete by setting status to INACTIVE)
   */
  async remove(id: string): Promise<void> {
    const bankAccount = await this.findOne(id);

    // TODO: Check if account has transactions (once transaction modules are implemented)
    this.logger.warn('Transaction check not yet implemented - skipping validation');

    // Prevent deletion of primary account
    if (bankAccount.isPrimary) {
      throw new BadRequestException('Cannot delete the primary bank account. Set another account as primary first.');
    }

    bankAccount.status = 'INACTIVE';
    await this.bankAccountRepository.save(bankAccount);

    this.logger.log(`Bank account deactivated: ${bankAccount.kodeBank}`);
  }

  /**
   * Close bank account (set status to CLOSED)
   */
  async closeAccount(id: string): Promise<BankAccount> {
    const bankAccount = await this.findOne(id);

    if (bankAccount.isPrimary) {
      throw new BadRequestException('Cannot close the primary bank account. Set another account as primary first.');
    }

    bankAccount.status = 'CLOSED';
    const updated = await this.bankAccountRepository.save(bankAccount);

    this.logger.log(`Bank account closed: ${bankAccount.kodeBank}`);

    return updated;
  }

  /**
   * Private: Unset all primary accounts
   */
  private async unsetPrimaryAccounts(): Promise<void> {
    await this.bankAccountRepository.update(
      { isPrimary: true },
      { isPrimary: false }
    );
  }
}
