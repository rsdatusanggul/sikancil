import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Supplier } from '../../database/entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto, QuerySupplierDto } from './dto';

@Injectable()
export class SupplierService {
  private readonly logger = new Logger(SupplierService.name);

  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  /**
   * Create a new supplier
   */
  async create(createDto: CreateSupplierDto, userId: string): Promise<Supplier> {
    this.logger.log(`Creating new Supplier: ${createDto.kodeSupplier}`);

    // Check if kodeSupplier already exists
    const existing = await this.supplierRepository.findOne({
      where: { kodeSupplier: createDto.kodeSupplier },
    });

    if (existing) {
      throw new ConflictException(`Supplier code ${createDto.kodeSupplier} already exists`);
    }

    // Check if NPWP already exists (if provided)
    if (createDto.npwp) {
      const existingNpwp = await this.supplierRepository.findOne({
        where: { npwp: createDto.npwp },
      });

      if (existingNpwp) {
        throw new ConflictException(`NPWP ${createDto.npwp} already exists`);
      }
    }

    const supplier = this.supplierRepository.create({
      ...createDto,
      status: createDto.status || 'ACTIVE',
      createdBy: userId,
    });

    const saved = await this.supplierRepository.save(supplier);
    this.logger.log(`Supplier created: ${saved.kodeSupplier}`);

    return saved;
  }

  /**
   * Find all suppliers with filtering and pagination
   */
  async findAll(queryDto: QuerySupplierDto): Promise<{
    data: Supplier[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, status, kota, page = 1, limit = 20 } = queryDto;

    let whereConditions: FindOptionsWhere<Supplier> | FindOptionsWhere<Supplier>[] = {};

    // Build search conditions
    if (search) {
      const searchConditions: FindOptionsWhere<Supplier>[] = [
        { namaSupplier: Like(`%${search}%`) },
        { kodeSupplier: Like(`%${search}%`) },
      ];

      // If search looks like NPWP, add NPWP search
      if (search.length >= 10) {
        searchConditions.push({ npwp: Like(`%${search}%`) });
      }

      // Apply additional filters to each search condition
      if (status !== undefined) {
        searchConditions.forEach(condition => {
          condition.status = status;
        });
      }

      if (kota !== undefined) {
        searchConditions.forEach(condition => {
          condition.kota = kota;
        });
      }

      whereConditions = searchConditions;
    } else {
      // No search, just apply filters
      const condition: FindOptionsWhere<Supplier> = {};

      if (status !== undefined) {
        condition.status = status;
      }

      if (kota !== undefined) {
        condition.kota = kota;
      }

      whereConditions = Object.keys(condition).length > 0 ? condition : {};
    }

    const [data, total] = await this.supplierRepository.findAndCount({
      where: whereConditions,
      order: { kodeSupplier: 'ASC' },
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
   * Find one supplier by ID
   */
  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  /**
   * Find supplier by NPWP
   */
  async findByNPWP(npwp: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { npwp } });

    if (!supplier) {
      throw new NotFoundException(`Supplier with NPWP ${npwp} not found`);
    }

    return supplier;
  }

  /**
   * Get active suppliers
   */
  async getActiveSuppliers(): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: { status: 'ACTIVE' },
      order: { namaSupplier: 'ASC' },
    });
  }

  /**
   * Update supplier
   */
  async update(id: string, updateDto: UpdateSupplierDto, userId: string): Promise<Supplier> {
    const supplier = await this.findOne(id);

    // If kodeSupplier is being updated, check for conflicts
    if (updateDto.kodeSupplier && updateDto.kodeSupplier !== supplier.kodeSupplier) {
      const existing = await this.supplierRepository.findOne({
        where: { kodeSupplier: updateDto.kodeSupplier },
      });

      if (existing) {
        throw new ConflictException(`Supplier code ${updateDto.kodeSupplier} already exists`);
      }
    }

    // If NPWP is being updated, check for conflicts
    if (updateDto.npwp && updateDto.npwp !== supplier.npwp) {
      const existingNpwp = await this.supplierRepository.findOne({
        where: { npwp: updateDto.npwp },
      });

      if (existingNpwp) {
        throw new ConflictException(`NPWP ${updateDto.npwp} already exists`);
      }
    }

    Object.assign(supplier, updateDto);

    const updated = await this.supplierRepository.save(supplier);
    this.logger.log(`Supplier updated: ${updated.kodeSupplier} by ${userId}`);

    return updated;
  }

  /**
   * Delete supplier (soft delete by setting status to INACTIVE)
   */
  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);

    supplier.status = 'INACTIVE';
    await this.supplierRepository.save(supplier);

    this.logger.log(`Supplier deactivated: ${supplier.kodeSupplier}`);
  }

  /**
   * Get suppliers by city
   */
  async getSuppliersByCity(kota: string): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: { kota, status: 'ACTIVE' },
      order: { namaSupplier: 'ASC' },
    });
  }

  /**
   * Get blacklisted suppliers
   */
  async getBlacklistedSuppliers(): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: { status: 'BLACKLIST' },
      order: { namaSupplier: 'ASC' },
    });
  }
}
