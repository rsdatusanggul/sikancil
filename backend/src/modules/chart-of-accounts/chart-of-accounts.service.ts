import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, Or, SelectQueryBuilder } from 'typeorm';
import { ChartOfAccount } from '../../database/entities/chart-of-account.entity';
import { CreateChartOfAccountDto, UpdateChartOfAccountDto, QueryChartOfAccountDto } from './dto';
import { AccountType } from '../../database/enums';

@Injectable()
export class ChartOfAccountsService {
  private readonly logger = new Logger(ChartOfAccountsService.name);

  constructor(
    @InjectRepository(ChartOfAccount)
    private readonly coaRepository: Repository<ChartOfAccount>,
  ) {}

  /**
   * Create a new chart of account
   */
  async create(createDto: CreateChartOfAccountDto, userId: string): Promise<ChartOfAccount> {
    this.logger.log(`Creating new COA: ${createDto.kodeRekening}`);

    // Check if kodeRekening already exists
    const existing = await this.coaRepository.findOne({
      where: { kodeRekening: createDto.kodeRekening },
    });

    if (existing) {
      throw new ConflictException(`Account code ${createDto.kodeRekening} already exists`);
    }

    // Validate parent if provided
    if (createDto.parentKode) {
      const parent = await this.coaRepository.findOne({
        where: { kodeRekening: createDto.parentKode },
      });

      if (!parent) {
        throw new BadRequestException(`Parent account ${createDto.parentKode} not found`);
      }

      // Validate level consistency
      if (createDto.level <= parent.level) {
        throw new BadRequestException('Child account level must be greater than parent level');
      }
    }

    // Determine normal balance based on account type
    const normalBalance = this.getNormalBalance(createDto.jenisAkun);

    // Determine if this is a header account (not detail)
    const isHeader = createDto.isDetail !== undefined ? !createDto.isDetail : false;

    const coa = this.coaRepository.create({
      ...createDto,
      normalBalance,
      isHeader,
      createdBy: userId,
    });

    const saved = await this.coaRepository.save(coa);
    this.logger.log(`COA created successfully: ${saved.kodeRekening}`);

    return saved;
  }

  /**
   * Find all chart of accounts with filtering and pagination
   */
  async findAll(queryDto: QueryChartOfAccountDto): Promise<{
    data: ChartOfAccount[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { search, jenisAkun, level, isDetail, isActive, parentKode, page = 1, limit = 20 } = queryDto;

    // Build query using QueryBuilder for complex search
    let query = this.coaRepository.createQueryBuilder('coa');

    // Add search condition if provided (case-insensitive)
    if (search) {
      query = query.andWhere(
        '(LOWER(coa.kodeRekening) LIKE LOWER(:search) OR LOWER(coa.namaRekening) LIKE LOWER(:search) OR LOWER(coa.deskripsi) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    // Add other filters
    if (jenisAkun) {
      query = query.andWhere('coa.jenisAkun = :jenisAkun', { jenisAkun });
    }

    if (level !== undefined) {
      query = query.andWhere('coa.level = :level', { level });
    }

    if (isDetail !== undefined) {
      query = query.andWhere('coa.isHeader = :isHeader', { isHeader: !isDetail });
    }

    if (isActive !== undefined) {
      query = query.andWhere('coa.isActive = :isActive', { isActive });
    }

    if (parentKode) {
      query = query.andWhere('coa.parentKode = :parentKode', { parentKode });
    }

    // Add ordering and pagination
    query = query
      .orderBy('coa.kodeRekening', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    // Execute query and get total count
    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get account hierarchy tree
   */
  async getHierarchy(): Promise<any[]> {
    const allAccounts = await this.coaRepository.find({
      where: { isActive: true },
      order: { kodeRekening: 'ASC' },
    });

    return this.buildHierarchyTree(allAccounts);
  }

  /**
   * Find one account by ID
   */
  async findOne(id: string): Promise<ChartOfAccount> {
    const coa = await this.coaRepository.findOne({ where: { id } });

    if (!coa) {
      throw new NotFoundException(`Chart of Account with ID ${id} not found`);
    }

    return coa;
  }

  /**
   * Find account by code
   */
  async findByCode(kodeRekening: string): Promise<ChartOfAccount> {
    const coa = await this.coaRepository.findOne({ where: { kodeRekening } });

    if (!coa) {
      throw new NotFoundException(`Chart of Account with code ${kodeRekening} not found`);
    }

    return coa;
  }

  /**
   * Update account
   */
  async update(id: string, updateDto: UpdateChartOfAccountDto, userId: string): Promise<ChartOfAccount> {
    const coa = await this.findOne(id);

    // If kodeRekening is being updated, check for conflicts
    if (updateDto.kodeRekening && updateDto.kodeRekening !== coa.kodeRekening) {
      const existing = await this.coaRepository.findOne({
        where: { kodeRekening: updateDto.kodeRekening },
      });

      if (existing) {
        throw new ConflictException(`Account code ${updateDto.kodeRekening} already exists`);
      }
    }

    // Validate parent if being updated
    if (updateDto.parentKode && updateDto.parentKode !== coa.parentKode) {
      const parent = await this.coaRepository.findOne({
        where: { kodeRekening: updateDto.parentKode },
      });

      if (!parent) {
        throw new BadRequestException(`Parent account ${updateDto.parentKode} not found`);
      }
    }

    Object.assign(coa, updateDto);

    const updated = await this.coaRepository.save(coa);
    this.logger.log(`COA updated: ${updated.kodeRekening} by ${userId}`);

    return updated;
  }

  /**
   * Delete account (soft delete by setting isActive = false)
   */
  async remove(id: string): Promise<void> {
    const coa = await this.findOne(id);

    // Check if account has children
    const children = await this.coaRepository.count({
      where: { parentKode: coa.kodeRekening },
    });

    if (children > 0) {
      throw new BadRequestException('Cannot delete account with child accounts');
    }

    // TODO: Check if account has transactions (once transaction modules are implemented)

    coa.isActive = false;
    await this.coaRepository.save(coa);

    this.logger.log(`COA deactivated: ${coa.kodeRekening}`);
  }

  /**
   * Get detail accounts only (for transaction posting)
   */
  async getDetailAccounts(): Promise<ChartOfAccount[]> {
    return this.coaRepository.find({
      where: { isHeader: false, isActive: true },
      order: { kodeRekening: 'ASC' },
    });
  }

  /**
   * Get accounts by type
   */
  async getByType(jenisAkun: AccountType): Promise<ChartOfAccount[]> {
    return this.coaRepository.find({
      where: { jenisAkun, isActive: true },
      order: { kodeRekening: 'ASC' },
    });
  }

  /**
   * Private: Build hierarchy tree recursively
   */
  private buildHierarchyTree(accounts: ChartOfAccount[], parentKode: string | null = null): any[] {
    const children = accounts.filter((acc) => acc.parentKode === parentKode);

    return children.map((child) => ({
      ...child,
      children: this.buildHierarchyTree(accounts, child.kodeRekening),
    }));
  }

  /**
   * Private: Determine normal balance based on account type
   */
  private getNormalBalance(jenisAkun: AccountType): string {
    switch (jenisAkun) {
      case AccountType.ASSET:
      case AccountType.EXPENSE:
        return 'DEBIT';
      case AccountType.LIABILITY:
      case AccountType.EQUITY:
      case AccountType.REVENUE:
        return 'CREDIT';
      default:
        return 'DEBIT';
    }
  }
}
