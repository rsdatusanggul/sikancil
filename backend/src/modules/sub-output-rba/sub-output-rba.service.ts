import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { SubOutputRBA } from '../../database/entities/sub-output-rba.entity';
import { SubKegiatanRBA } from '../../database/entities/subkegiatan-rba.entity';
import { CreateSubOutputRbaDto, UpdateSubOutputRbaDto, QuerySubOutputRbaDto } from './dto';

// Alias for backward compatibility
type OutputRBA = SubKegiatanRBA;

@Injectable()
export class SubOutputRbaService {
  private readonly logger = new Logger(SubOutputRbaService.name);

  constructor(
    @InjectRepository(SubOutputRBA)
    private readonly subOutputRbaRepository: Repository<SubOutputRBA>,
    @InjectRepository(SubKegiatanRBA)
    private readonly outputRbaRepository: Repository<OutputRBA>,
  ) {}

  /**
   * Create a new sub output RBA
   */
  async create(createDto: CreateSubOutputRbaDto): Promise<SubOutputRBA> {
    this.logger.log(`Creating new Sub Output RBA: ${createDto.kodeSubOutput} for tahun ${createDto.tahun}`);

    // Validate subKegiatanId exists
    const subKegiatan = await this.outputRbaRepository.findOne({
      where: { id: createDto.subKegiatanId },
    });

    if (!subKegiatan) {
      throw new BadRequestException(`Sub Kegiatan RBA dengan ID ${createDto.subKegiatanId} tidak ditemukan`);
    }

    // Validate tahun matches with subKegiatan tahun
    if (subKegiatan.tahun !== createDto.tahun) {
      throw new BadRequestException(
        `Tahun sub output (${createDto.tahun}) harus sama dengan tahun sub kegiatan (${subKegiatan.tahun})`
      );
    }

    // Check if kodeSubOutput + tahun already exists (unique constraint)
    const existing = await this.subOutputRbaRepository.findOne({
      where: {
        kodeSubOutput: createDto.kodeSubOutput,
        tahun: createDto.tahun
      },
    });

    if (existing) {
      throw new ConflictException(
        `Sub Output dengan kode ${createDto.kodeSubOutput} untuk tahun ${createDto.tahun} sudah ada`
      );
    }

    const subOutputRba = this.subOutputRbaRepository.create(createDto);
    const saved = await this.subOutputRbaRepository.save(subOutputRba);

    this.logger.log(`Sub Output RBA created: ${saved.kodeSubOutput} (${saved.tahun})`);
    return saved;
  }

  /**
   * Find all sub output RBA with filtering and pagination
   */
  async findAll(queryDto: QuerySubOutputRbaDto): Promise<{
    data: SubOutputRBA[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, outputId, tahun, isActive, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<SubOutputRBA> = {};

    if (search) {
      where.namaSubOutput = Like(`%${search}%`);
    }

    if (outputId !== undefined) {
      where.subKegiatanId = outputId;
    }

    if (tahun !== undefined) {
      where.tahun = tahun;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.subOutputRbaRepository.findAndCount({
      where,
      order: { tahun: 'DESC', kodeSubOutput: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['subKegiatan', 'anggaranBelanja'],
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
   * Find sub output by output
   */
  async findByOutput(outputId: string): Promise<SubOutputRBA[]> {
    this.logger.log(`Finding sub output for output ID: ${outputId}`);

    // Validate output exists
    const output = await this.outputRbaRepository.findOne({
      where: { id: outputId },
    });

    if (!output) {
      throw new NotFoundException(`Output RBA dengan ID ${outputId} tidak ditemukan`);
    }

    return this.subOutputRbaRepository.find({
      where: { subKegiatanId: outputId },
      order: { kodeSubOutput: 'ASC' },
      relations: ['anggaranBelanja'],
    });
  }

  /**
   * Find sub output by year
   */
  async findByYear(tahun: number): Promise<SubOutputRBA[]> {
    this.logger.log(`Finding sub output for tahun: ${tahun}`);

    return this.subOutputRbaRepository.find({
      where: { tahun },
      order: { kodeSubOutput: 'ASC' },
      relations: ['subKegiatan', 'anggaranBelanja'],
    });
  }

  /**
   * Find one sub output RBA by ID
   */
  async findOne(id: string): Promise<SubOutputRBA> {
    const subOutputRba = await this.subOutputRbaRepository.findOne({
      where: { id },
      relations: ['subKegiatan', 'anggaranBelanja'],
    });

    if (!subOutputRba) {
      throw new NotFoundException(`Sub Output RBA dengan ID ${id} tidak ditemukan`);
    }

    return subOutputRba;
  }

  /**
   * Update sub output RBA
   */
  async update(id: string, updateDto: UpdateSubOutputRbaDto): Promise<SubOutputRBA> {
    const subOutputRba = await this.findOne(id);

    // Validate subKegiatanId if being updated
    if (updateDto.subKegiatanId && updateDto.subKegiatanId !== subOutputRba.subKegiatanId) {
      const subKegiatan = await this.outputRbaRepository.findOne({
        where: { id: updateDto.subKegiatanId },
      });

      if (!subKegiatan) {
        throw new BadRequestException(`Sub Kegiatan RBA dengan ID ${updateDto.subKegiatanId} tidak ditemukan`);
      }

      // Validate tahun matches with new subKegiatan tahun
      const tahun = updateDto.tahun || subOutputRba.tahun;
      if (subKegiatan.tahun !== tahun) {
        throw new BadRequestException(
          `Tahun sub output (${tahun}) harus sama dengan tahun sub kegiatan (${subKegiatan.tahun})`
        );
      }
    }

    // If kodeSubOutput or tahun is being updated, check for conflicts
    if (
      (updateDto.kodeSubOutput && updateDto.kodeSubOutput !== subOutputRba.kodeSubOutput) ||
      (updateDto.tahun && updateDto.tahun !== subOutputRba.tahun)
    ) {
      const kode = updateDto.kodeSubOutput || subOutputRba.kodeSubOutput;
      const tahun = updateDto.tahun || subOutputRba.tahun;

      const existing = await this.subOutputRbaRepository.findOne({
        where: { kodeSubOutput: kode, tahun },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Sub Output dengan kode ${kode} untuk tahun ${tahun} sudah ada`
        );
      }
    }

    Object.assign(subOutputRba, updateDto);
    const updated = await this.subOutputRbaRepository.save(subOutputRba);

    this.logger.log(`Sub Output RBA updated: ${updated.kodeSubOutput} (${updated.tahun})`);
    return updated;
  }

  /**
   * Delete sub output RBA (hard delete - no soft delete for sub output)
   */
  async remove(id: string): Promise<void> {
    const subOutputRba = await this.findOne(id);

    await this.subOutputRbaRepository.remove(subOutputRba);
    this.logger.log(`Sub Output RBA deleted: ${subOutputRba.kodeSubOutput} (${subOutputRba.tahun})`);
  }
}
