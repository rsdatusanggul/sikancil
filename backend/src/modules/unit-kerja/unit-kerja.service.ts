import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { UnitKerja } from '../../database/entities/unit-kerja.entity';
import { CreateUnitKerjaDto, UpdateUnitKerjaDto, QueryUnitKerjaDto } from './dto';

@Injectable()
export class UnitKerjaService {
  private readonly logger = new Logger(UnitKerjaService.name);

  constructor(
    @InjectRepository(UnitKerja)
    private readonly unitKerjaRepository: Repository<UnitKerja>,
  ) {}

  /**
   * Create a new unit kerja
   */
  async create(createDto: CreateUnitKerjaDto, userId: string): Promise<UnitKerja> {
    this.logger.log(`Creating new Unit Kerja: ${createDto.kodeUnit}`);

    // Check if kodeUnit already exists
    const existing = await this.unitKerjaRepository.findOne({
      where: { kodeUnit: createDto.kodeUnit },
    });

    if (existing) {
      throw new ConflictException(`Unit code ${createDto.kodeUnit} already exists`);
    }

    // Validate parent if provided
    if (createDto.parentId) {
      const parent = await this.unitKerjaRepository.findOne({
        where: { id: createDto.parentId },
      });

      if (!parent) {
        throw new BadRequestException(`Parent unit with ID ${createDto.parentId} not found`);
      }

      // Auto-set level based on parent
      if (!createDto.level) {
        createDto.level = parent.level + 1;
      }
    }

    const unitKerja = this.unitKerjaRepository.create({
      ...createDto,
      createdBy: userId,
    });

    const saved = await this.unitKerjaRepository.save(unitKerja);
    this.logger.log(`Unit Kerja created: ${saved.kodeUnit}`);

    return saved;
  }

  /**
   * Find all unit kerja with filtering and pagination
   */
  async findAll(queryDto: QueryUnitKerjaDto): Promise<{
    data: UnitKerja[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, level, parentId, isActive, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<UnitKerja> = {};

    if (search) {
      where.namaUnit = Like(`%${search}%`);
    }

    if (level !== undefined) {
      where.level = level;
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.unitKerjaRepository.findAndCount({
      where,
      order: { kodeUnit: 'ASC' },
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
   * Get organizational hierarchy
   */
  async getHierarchy(): Promise<any[]> {
    const allUnits = await this.unitKerjaRepository.find({
      where: { isActive: true },
      order: { kodeUnit: 'ASC' },
    });

    return this.buildHierarchyTree(allUnits);
  }

  /**
   * Find one unit kerja by ID
   */
  async findOne(id: string): Promise<UnitKerja> {
    const unitKerja = await this.unitKerjaRepository.findOne({ where: { id } });

    if (!unitKerja) {
      throw new NotFoundException(`Unit Kerja with ID ${id} not found`);
    }

    return unitKerja;
  }

  /**
   * Find unit kerja by code
   */
  async findByCode(kodeUnit: string): Promise<UnitKerja> {
    const unitKerja = await this.unitKerjaRepository.findOne({ where: { kodeUnit } });

    if (!unitKerja) {
      throw new NotFoundException(`Unit Kerja with code ${kodeUnit} not found`);
    }

    return unitKerja;
  }

  /**
   * Update unit kerja
   */
  async update(id: string, updateDto: UpdateUnitKerjaDto, userId: string): Promise<UnitKerja> {
    const unitKerja = await this.findOne(id);

    // If kodeUnit is being updated, check for conflicts
    if (updateDto.kodeUnit && updateDto.kodeUnit !== unitKerja.kodeUnit) {
      const existing = await this.unitKerjaRepository.findOne({
        where: { kodeUnit: updateDto.kodeUnit },
      });

      if (existing) {
        throw new ConflictException(`Unit code ${updateDto.kodeUnit} already exists`);
      }
    }

    // Validate parent if being updated
    if (updateDto.parentId && updateDto.parentId !== unitKerja.parentId) {
      // Cannot set self as parent
      if (updateDto.parentId === id) {
        throw new BadRequestException('Cannot set unit as its own parent');
      }

      const parent = await this.unitKerjaRepository.findOne({
        where: { id: updateDto.parentId },
      });

      if (!parent) {
        throw new BadRequestException(`Parent unit with ID ${updateDto.parentId} not found`);
      }
    }

    Object.assign(unitKerja, updateDto);

    const updated = await this.unitKerjaRepository.save(unitKerja);
    this.logger.log(`Unit Kerja updated: ${updated.kodeUnit} by ${userId}`);

    return updated;
  }

  /**
   * Delete unit kerja (soft delete)
   */
  async remove(id: string): Promise<void> {
    const unitKerja = await this.findOne(id);

    // Check if unit has children
    const children = await this.unitKerjaRepository.count({
      where: { parentId: id },
    });

    if (children > 0) {
      throw new BadRequestException('Cannot delete unit with child units');
    }

    unitKerja.isActive = false;
    await this.unitKerjaRepository.save(unitKerja);

    this.logger.log(`Unit Kerja deactivated: ${unitKerja.kodeUnit}`);
  }

  /**
   * Get top-level units (no parent)
   */
  async getTopLevelUnits(): Promise<UnitKerja[]> {
    return this.unitKerjaRepository.find({
      where: { parentId: null as any, isActive: true },
      order: { kodeUnit: 'ASC' },
    });
  }

  /**
   * Get children of a unit
   */
  async getChildren(parentId: string): Promise<UnitKerja[]> {
    return this.unitKerjaRepository.find({
      where: { parentId, isActive: true },
      order: { kodeUnit: 'ASC' },
    });
  }

  /**
   * Private: Build hierarchy tree recursively
   */
  private buildHierarchyTree(units: UnitKerja[], parentId: string | null = null): any[] {
    const children = units.filter((unit) => unit.parentId === parentId);

    return children.map((child) => ({
      ...child,
      children: this.buildHierarchyTree(units, child.id),
    }));
  }
}
