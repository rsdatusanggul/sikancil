import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { SubKegiatanRBA } from '../../database/entities/subkegiatan-rba.entity';
import { KegiatanRBA } from '../../database/entities/kegiatan-rba.entity';
import { UnitKerja } from '../../database/entities/unit-kerja.entity';
import { CreateSubKegiatanRbaDto, UpdateSubKegiatanRbaDto, QuerySubKegiatanRbaDto } from './dto';

@Injectable()
export class SubKegiatanRbaService {
  private readonly logger = new Logger(SubKegiatanRbaService.name);

  constructor(
    @InjectRepository(SubKegiatanRBA)
    private readonly subKegiatanRbaRepository: Repository<SubKegiatanRBA>,
    @InjectRepository(KegiatanRBA)
    private readonly kegiatanRbaRepository: Repository<KegiatanRBA>,
    @InjectRepository(UnitKerja)
    private readonly unitKerjaRepository: Repository<UnitKerja>,
  ) {}

  /**
   * Create a new sub kegiatan RBA
   */
  async create(createDto: CreateSubKegiatanRbaDto): Promise<SubKegiatanRBA> {
    this.logger.log(`Creating new Sub Kegiatan RBA: ${createDto.kodeSubKegiatan} for tahun ${createDto.tahun}`);

    // Validate kegiatanId exists
    const kegiatan = await this.kegiatanRbaRepository.findOne({
      where: { id: createDto.kegiatanId },
    });

    if (!kegiatan) {
      throw new BadRequestException(`Kegiatan RBA dengan ID ${createDto.kegiatanId} tidak ditemukan`);
    }

    // Validate tahun matches with kegiatan tahun
    if (kegiatan.tahun !== createDto.tahun) {
      throw new BadRequestException(
        `Tahun output (${createDto.tahun}) harus sama dengan tahun kegiatan (${kegiatan.tahun})`
      );
    }

    // Validate unitKerjaId if provided
    if (createDto.unitKerjaId) {
      const unitKerja = await this.unitKerjaRepository.findOne({
        where: { id: createDto.unitKerjaId },
      });

      if (!unitKerja) {
        throw new BadRequestException(`Unit Kerja dengan ID ${createDto.unitKerjaId} tidak ditemukan`);
      }
    }

    // Check if kodeSubKegiatan + tahun already exists (unique constraint)
    // Only check active records to allow recreation of soft-deleted records
    const existing = await this.subKegiatanRbaRepository.findOne({
      where: {
        kodeSubKegiatan: createDto.kodeSubKegiatan,
        tahun: createDto.tahun,
        isActive: true
      },
    });

    if (existing) {
      throw new ConflictException(
        `Sub Kegiatan dengan kode ${createDto.kodeSubKegiatan} untuk tahun ${createDto.tahun} sudah ada`
      );
    }

    const subKegiatanRba = this.subKegiatanRbaRepository.create(createDto);
    const saved = await this.subKegiatanRbaRepository.save(subKegiatanRba);

    this.logger.log(`Sub Kegiatan RBA created: ${saved.kodeSubKegiatan} (${saved.tahun})`);
    return saved;
  }

  /**
   * Find all sub kegiatan RBA with filtering and pagination
   */
  async findAll(queryDto: QuerySubKegiatanRbaDto): Promise<{
    data: SubKegiatanRBA[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, kegiatanId, tahun, unitKerjaId, isActive, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<SubKegiatanRBA> = {};

    if (search) {
      where.namaSubKegiatan = Like(`%${search}%`);
    }

    if (kegiatanId !== undefined) {
      where.kegiatanId = kegiatanId;
    }

    if (tahun !== undefined) {
      where.tahun = tahun;
    }

    if (unitKerjaId !== undefined) {
      where.unitKerjaId = unitKerjaId;
    }

    // Only set filter isActive if explicitly provided
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.subKegiatanRbaRepository.findAndCount({
      where,
      order: { tahun: 'DESC', kodeSubKegiatan: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['kegiatan', 'subOutput', 'anggaranBelanja'],
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
   * Get available years with sub kegiatan data
   */
  async getAvailableYears(): Promise<number[]> {
    this.logger.log('Getting available years with sub kegiatan data');

    const result = await this.subKegiatanRbaRepository
      .createQueryBuilder('subkegiatan')
      .select('DISTINCT subkegiatan.tahun', 'tahun')
      .orderBy('subkegiatan.tahun', 'DESC')
      .getRawMany();

    return result.map(r => r.tahun);
  }

  /**
   * Find sub kegiatan by kegiatan
   */
  async findByKegiatan(kegiatanId: string): Promise<SubKegiatanRBA[]> {
    this.logger.log(`Finding sub kegiatan for kegiatan ID: ${kegiatanId}`);

    // Validate kegiatan exists
    const kegiatan = await this.kegiatanRbaRepository.findOne({
      where: { id: kegiatanId },
    });

    if (!kegiatan) {
      throw new NotFoundException(`Kegiatan RBA dengan ID ${kegiatanId} tidak ditemukan`);
    }

    return this.subKegiatanRbaRepository.find({
      where: { kegiatanId },
      order: { kodeSubKegiatan: 'ASC' },
      relations: ['subOutput', 'anggaranBelanja'],
    });
  }

  /**
   * Find output by unit kerja
   */
  async findByUnitKerja(unitKerjaId: string): Promise<SubKegiatanRBA[]> {
    this.logger.log(`Finding output for unit kerja ID: ${unitKerjaId}`);

    // Validate unit kerja exists
    const unitKerja = await this.unitKerjaRepository.findOne({
      where: { id: unitKerjaId },
    });

    if (!unitKerja) {
      throw new NotFoundException(`Unit Kerja dengan ID ${unitKerjaId} tidak ditemukan`);
    }

    return this.subKegiatanRbaRepository.find({
      where: { unitKerjaId },
      order: { tahun: 'DESC', kodeSubKegiatan: 'ASC' },
      relations: ['kegiatan', 'subOutput', 'anggaranBelanja'],
    });
  }

  /**
   * Find output by year
   */
  async findByYear(tahun: number): Promise<SubKegiatanRBA[]> {
    this.logger.log(`Finding output for tahun: ${tahun}`);

    return this.subKegiatanRbaRepository.find({
      where: { tahun },
      order: { kodeSubKegiatan: 'ASC' },
      relations: ['kegiatan', 'subOutput', 'anggaranBelanja'],
    });
  }

  /**
   * Calculate total pagu from AnggaranBelanjaRBA
   */
  async calculateTotalPagu(outputId: string): Promise<number> {
    this.logger.log(`Calculating total pagu for output ID: ${outputId}`);

    const output = await this.subKegiatanRbaRepository.findOne({
      where: { id: outputId },
      relations: ['anggaranBelanja'],
    });

    if (!output) {
      throw new NotFoundException(`Sub Kegiatan RBA dengan ID ${outputId} tidak ditemukan`);
    }

    // Sum all anggaran belanja for this output
    const totalPagu = output.anggaranBelanja?.reduce((sum, anggaran) => {
      return sum + Number(anggaran.pagu || 0);
    }, 0) || 0;

    // Update the totalPagu field
    output.totalPagu = totalPagu;
    await this.subKegiatanRbaRepository.save(output);

    this.logger.log(`Total pagu calculated for output ${outputId}: ${totalPagu}`);
    return totalPagu;
  }

  /**
   * Find one output RBA by ID
   */
  async findOne(id: string): Promise<SubKegiatanRBA> {
    const outputRba = await this.subKegiatanRbaRepository.findOne({
      where: { id },
      relations: ['kegiatan', 'subOutput', 'anggaranBelanja'],
    });

    if (!outputRba) {
      throw new NotFoundException(`Sub Kegiatan RBA dengan ID ${id} tidak ditemukan`);
    }

    return outputRba;
  }

  /**
   * Update output RBA
   */
  async update(id: string, updateDto: UpdateSubKegiatanRbaDto): Promise<SubKegiatanRBA> {
    const outputRba = await this.findOne(id);

    // Validate kegiatanId if being updated
    if (updateDto.kegiatanId && updateDto.kegiatanId !== outputRba.kegiatanId) {
      const kegiatan = await this.kegiatanRbaRepository.findOne({
        where: { id: updateDto.kegiatanId },
      });

      if (!kegiatan) {
        throw new BadRequestException(`Kegiatan RBA dengan ID ${updateDto.kegiatanId} tidak ditemukan`);
      }

      // Validate tahun matches with new kegiatan tahun
      const tahun = updateDto.tahun || outputRba.tahun;
      if (kegiatan.tahun !== tahun) {
        throw new BadRequestException(
          `Tahun output (${tahun}) harus sama dengan tahun kegiatan (${kegiatan.tahun})`
        );
      }
    }

    // Validate unitKerjaId if being updated
    if (updateDto.unitKerjaId && updateDto.unitKerjaId !== outputRba.unitKerjaId) {
      const unitKerja = await this.unitKerjaRepository.findOne({
        where: { id: updateDto.unitKerjaId },
      });

      if (!unitKerja) {
        throw new BadRequestException(`Unit Kerja dengan ID ${updateDto.unitKerjaId} tidak ditemukan`);
      }
    }

    // If kodeSubKegiatan or tahun is being updated, check for conflicts
    // Only check active records to allow using codes from soft-deleted records
    if (
      (updateDto.kodeSubKegiatan && updateDto.kodeSubKegiatan !== outputRba.kodeSubKegiatan) ||
      (updateDto.tahun && updateDto.tahun !== outputRba.tahun)
    ) {
      const kode = updateDto.kodeSubKegiatan || outputRba.kodeSubKegiatan;
      const tahun = updateDto.tahun || outputRba.tahun;

      const existing = await this.subKegiatanRbaRepository.findOne({
        where: { kodeSubKegiatan: kode, tahun, isActive: true },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Output dengan kode ${kode} untuk tahun ${tahun} sudah ada`
        );
      }
    }

    Object.assign(outputRba, updateDto);
    const updated = await this.subKegiatanRbaRepository.save(outputRba);

    this.logger.log(`Sub Kegiatan RBA updated: ${updated.kodeSubKegiatan} (${updated.tahun})`);
    return updated;
  }

  /**
   * Delete output RBA (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<void> {
    const outputRba = await this.findOne(id);

    // Soft delete: set isActive to false
    outputRba.isActive = false;
    await this.subKegiatanRbaRepository.save(outputRba);

    this.logger.log(`Sub Kegiatan RBA deactivated: ${outputRba.kodeSubKegiatan} (${outputRba.tahun})`);
  }

  /**
   * Hard delete output RBA (use with caution)
   */
  async hardDelete(id: string): Promise<void> {
    const outputRba = await this.findOne(id);

    await this.subKegiatanRbaRepository.remove(outputRba);
    this.logger.warn(`Sub Kegiatan RBA hard deleted: ${outputRba.kodeSubKegiatan} (${outputRba.tahun})`);
  }
}
