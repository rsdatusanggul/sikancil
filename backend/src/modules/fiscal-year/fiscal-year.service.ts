import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { FiscalYear } from '../../database/entities/fiscal-year.entity';
import { CreateFiscalYearDto, UpdateFiscalYearDto, QueryFiscalYearDto } from './dto';

@Injectable()
export class FiscalYearService {
  private readonly logger = new Logger(FiscalYearService.name);

  constructor(
    @InjectRepository(FiscalYear)
    private readonly fiscalYearRepository: Repository<FiscalYear>,
  ) {}

  /**
   * Create a new fiscal year
   */
  async create(createDto: CreateFiscalYearDto, userId: string): Promise<FiscalYear> {
    this.logger.log(`Creating new fiscal year: ${createDto.tahun}`);

    // Check if fiscal year already exists
    const existing = await this.fiscalYearRepository.findOne({
      where: { tahun: createDto.tahun },
    });

    if (existing) {
      throw new ConflictException(`Fiscal year ${createDto.tahun} already exists`);
    }

    // Validate date range
    const startDate = new Date(createDto.tanggalMulai);
    const endDate = new Date(createDto.tanggalSelesai);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // If setting as current, unset other current fiscal years
    if (createDto.isCurrent) {
      await this.unsetCurrentFiscalYears();
    }

    const fiscalYear = this.fiscalYearRepository.create({
      ...createDto,
      createdBy: userId,
    });

    const saved = await this.fiscalYearRepository.save(fiscalYear);
    this.logger.log(`Fiscal year created successfully: ${saved.tahun}`);

    return saved;
  }

  /**
   * Find all fiscal years with filtering and pagination
   */
  async findAll(queryDto: QueryFiscalYearDto): Promise<{
    data: FiscalYear[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { status, isCurrent, tahun, yearFrom, yearTo, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<FiscalYear> = {};

    if (status) {
      where.status = status;
    }

    if (isCurrent !== undefined) {
      where.isCurrent = isCurrent;
    }

    if (tahun) {
      where.tahun = tahun;
    } else if (yearFrom && yearTo) {
      where.tahun = Between(yearFrom, yearTo);
    } else if (yearFrom) {
      where.tahun = MoreThanOrEqual(yearFrom);
    } else if (yearTo) {
      where.tahun = LessThanOrEqual(yearTo);
    }

    const [data, total] = await this.fiscalYearRepository.findAndCount({
      where,
      order: { tahun: 'DESC' },
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
   * Find one fiscal year by ID
   */
  async findOne(id: string): Promise<FiscalYear> {
    const fiscalYear = await this.fiscalYearRepository.findOne({ where: { id } });

    if (!fiscalYear) {
      throw new NotFoundException(`Fiscal year with ID ${id} not found`);
    }

    return fiscalYear;
  }

  /**
   * Get the currently active fiscal year
   */
  async getActiveFiscalYear(): Promise<FiscalYear> {
    const activeFiscalYear = await this.fiscalYearRepository.findOne({
      where: { isCurrent: true },
    });

    if (!activeFiscalYear) {
      throw new NotFoundException('No active fiscal year found. Please set a fiscal year as current.');
    }

    return activeFiscalYear;
  }

  /**
   * Update fiscal year
   */
  async update(id: string, updateDto: UpdateFiscalYearDto, userId: string): Promise<FiscalYear> {
    const fiscalYear = await this.findOne(id);

    // If tahun is being updated, check for conflicts
    if (updateDto.tahun && updateDto.tahun !== fiscalYear.tahun) {
      const existing = await this.fiscalYearRepository.findOne({
        where: { tahun: updateDto.tahun },
      });

      if (existing) {
        throw new ConflictException(`Fiscal year ${updateDto.tahun} already exists`);
      }
    }

    // Validate date range if dates are being updated
    if (updateDto.tanggalMulai || updateDto.tanggalSelesai) {
      const startDate = new Date(updateDto.tanggalMulai || fiscalYear.tanggalMulai);
      const endDate = new Date(updateDto.tanggalSelesai || fiscalYear.tanggalSelesai);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // If setting as current, unset other current fiscal years
    if (updateDto.isCurrent && !fiscalYear.isCurrent) {
      await this.unsetCurrentFiscalYears();
    }

    Object.assign(fiscalYear, updateDto);

    const updated = await this.fiscalYearRepository.save(fiscalYear);
    this.logger.log(`Fiscal year updated: ${updated.tahun} by ${userId}`);

    return updated;
  }

  /**
   * Close fiscal year (set status to CLOSED)
   */
  async closeFiscalYear(id: string): Promise<FiscalYear> {
    const fiscalYear = await this.findOne(id);

    if (fiscalYear.status === 'CLOSED') {
      throw new BadRequestException('Fiscal year is already closed');
    }

    if (fiscalYear.status === 'LOCKED') {
      throw new BadRequestException('Cannot close a locked fiscal year');
    }

    fiscalYear.status = 'CLOSED';
    const updated = await this.fiscalYearRepository.save(fiscalYear);

    this.logger.log(`Fiscal year closed: ${fiscalYear.tahun}`);

    return updated;
  }

  /**
   * Reopen fiscal year for adjustments (set status back to OPEN)
   */
  async reopenFiscalYear(id: string): Promise<FiscalYear> {
    const fiscalYear = await this.findOne(id);

    if (fiscalYear.status === 'LOCKED') {
      throw new BadRequestException('Cannot reopen a locked fiscal year. Unlock it first.');
    }

    if (fiscalYear.status === 'OPEN') {
      throw new BadRequestException('Fiscal year is already open');
    }

    fiscalYear.status = 'OPEN';
    const updated = await this.fiscalYearRepository.save(fiscalYear);

    this.logger.log(`Fiscal year reopened: ${fiscalYear.tahun}`);

    return updated;
  }

  /**
   * Lock fiscal year (prevent any modifications)
   */
  async lockFiscalYear(id: string): Promise<FiscalYear> {
    const fiscalYear = await this.findOne(id);

    if (fiscalYear.status === 'LOCKED') {
      throw new BadRequestException('Fiscal year is already locked');
    }

    fiscalYear.status = 'LOCKED';
    const updated = await this.fiscalYearRepository.save(fiscalYear);

    this.logger.log(`Fiscal year locked: ${fiscalYear.tahun}`);

    return updated;
  }

  /**
   * Unlock fiscal year
   */
  async unlockFiscalYear(id: string): Promise<FiscalYear> {
    const fiscalYear = await this.findOne(id);

    if (fiscalYear.status !== 'LOCKED') {
      throw new BadRequestException('Fiscal year is not locked');
    }

    fiscalYear.status = 'OPEN';
    const updated = await this.fiscalYearRepository.save(fiscalYear);

    this.logger.log(`Fiscal year unlocked: ${fiscalYear.tahun}`);

    return updated;
  }

  /**
   * Delete fiscal year (soft delete by setting isCurrent to false and status to CLOSED)
   */
  async remove(id: string): Promise<void> {
    const fiscalYear = await this.findOne(id);

    // TODO: Check if fiscal year has transactions (once transaction modules are implemented)
    this.logger.warn('Transaction check not yet implemented - skipping validation');

    // Prevent deletion of current fiscal year
    if (fiscalYear.isCurrent) {
      throw new BadRequestException('Cannot delete the current fiscal year. Set another fiscal year as current first.');
    }

    // Prevent deletion of locked fiscal year
    if (fiscalYear.status === 'LOCKED') {
      throw new BadRequestException('Cannot delete a locked fiscal year. Unlock it first.');
    }

    // Instead of hard delete, we'll close it
    fiscalYear.status = 'CLOSED';
    await this.fiscalYearRepository.save(fiscalYear);

    this.logger.log(`Fiscal year deactivated: ${fiscalYear.tahun}`);
  }

  /**
   * Get open fiscal years
   */
  async getOpenFiscalYears(): Promise<FiscalYear[]> {
    return this.fiscalYearRepository.find({
      where: { status: 'OPEN' },
      order: { tahun: 'DESC' },
    });
  }

  /**
   * Private: Unset all current fiscal years
   */
  private async unsetCurrentFiscalYears(): Promise<void> {
    await this.fiscalYearRepository.update(
      { isCurrent: true },
      { isCurrent: false }
    );
  }
}
