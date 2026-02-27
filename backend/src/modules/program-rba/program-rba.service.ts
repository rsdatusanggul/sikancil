import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { ProgramRBA } from '../../database/entities/program-rba.entity';
import { KegiatanRBA } from '../../database/entities/kegiatan-rba.entity';
import { CreateProgramRbaDto, UpdateProgramRbaDto, QueryProgramRbaDto } from './dto';

@Injectable()
export class ProgramRbaService {
  private readonly logger = new Logger(ProgramRbaService.name);

  constructor(
    @InjectRepository(ProgramRBA)
    private readonly programRbaRepository: Repository<ProgramRBA>,
    @InjectRepository(KegiatanRBA)
    private readonly kegiatanRbaRepository: Repository<KegiatanRBA>,
  ) {}

  /**
   * Create a new program RBA
   */
  async create(createDto: CreateProgramRbaDto): Promise<ProgramRBA> {
    this.logger.log(`Creating new Program RBA: ${createDto.kodeProgram} for tahun ${createDto.tahun}`);

    // Check if kodeProgram + tahun already exists (business rule: unique per tahun)
    const existing = await this.programRbaRepository.findOne({
      where: {
        kodeProgram: createDto.kodeProgram,
        tahun: createDto.tahun
      },
    });

    if (existing) {
      // If exists but inactive (soft deleted), restore and update it
      if (!existing.isActive) {
        this.logger.log(`Restoring soft-deleted program: ${existing.kodeProgram} (${existing.tahun})`);

        // Update with new data and set isActive = true
        Object.assign(existing, createDto);
        existing.isActive = true;

        const restored = await this.programRbaRepository.save(existing);
        this.logger.log(`Program RBA restored: ${restored.kodeProgram} (${restored.tahun})`);
        return restored;
      }

      // If exists and active, throw error
      throw new ConflictException(
        `Program dengan kode ${createDto.kodeProgram} untuk tahun ${createDto.tahun} sudah ada`
      );
    }

    const programRba = this.programRbaRepository.create(createDto);
    const saved = await this.programRbaRepository.save(programRba);

    this.logger.log(`Program RBA created: ${saved.kodeProgram} (${saved.tahun})`);
    return saved;
  }

  /**
   * Find all program RBA with filtering and pagination
   */
  async findAll(queryDto: QueryProgramRbaDto): Promise<{
    data: ProgramRBA[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, tahun, isActive = true, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<ProgramRBA> = {};

    if (search) {
      where.namaProgram = Like(`%${search}%`);
    }

    if (tahun !== undefined) {
      where.tahun = tahun;
    }

    // Default to only active programs
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.programRbaRepository.findAndCount({
      where,
      order: { tahun: 'DESC', kodeProgram: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['kegiatan'],
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
   * Find programs by year (only active programs)
   */
  async findByYear(tahun: number): Promise<ProgramRBA[]> {
    this.logger.log(`Finding programs for tahun: ${tahun}`);

    return this.programRbaRepository.find({
      where: { tahun, isActive: true },
      order: { kodeProgram: 'ASC' },
      relations: ['kegiatan'],
    });
  }

  /**
   * Get active programs for a specific year
   */
  async getActivePrograms(tahun: number): Promise<ProgramRBA[]> {
    this.logger.log(`Finding active programs for tahun: ${tahun}`);

    return this.programRbaRepository.find({
      where: { tahun, isActive: true },
      order: { kodeProgram: 'ASC' },
      relations: ['kegiatan'],
    });
  }

  /**
   * Find one program RBA by ID
   */
  async findOne(id: string): Promise<ProgramRBA> {
    const programRba = await this.programRbaRepository.findOne({
      where: { id },
      relations: ['kegiatan'],
    });

    if (!programRba) {
      throw new NotFoundException(`Program RBA dengan ID ${id} tidak ditemukan`);
    }

    return programRba;
  }

  /**
   * Update program RBA
   */
  async update(id: string, updateDto: UpdateProgramRbaDto): Promise<ProgramRBA> {
    const programRba = await this.findOne(id);

    // If kodeProgram or tahun is being updated, check for conflicts
    if (
      (updateDto.kodeProgram && updateDto.kodeProgram !== programRba.kodeProgram) ||
      (updateDto.tahun && updateDto.tahun !== programRba.tahun)
    ) {
      const kode = updateDto.kodeProgram || programRba.kodeProgram;
      const tahun = updateDto.tahun || programRba.tahun;

      const existing = await this.programRbaRepository.findOne({
        where: { kodeProgram: kode, tahun },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Program dengan kode ${kode} untuk tahun ${tahun} sudah ada`
        );
      }
    }

    Object.assign(programRba, updateDto);
    const updated = await this.programRbaRepository.save(programRba);

    this.logger.log(`Program RBA updated: ${updated.kodeProgram} (${updated.tahun})`);
    return updated;
  }

  /**
   * Delete program RBA (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<void> {
    const programRba = await this.findOne(id);

    // Check if program has kegiatan - cannot delete if it has kegiatan
    if (programRba.kegiatan && programRba.kegiatan.length > 0) {
      throw new ConflictException(
        `Program "${programRba.namaProgram}" tidak dapat dihapus karena masih memiliki ${programRba.kegiatan.length} kegiatan. Hapus kegiatan terlebih dahulu.`
      );
    }

    // Soft delete: set isActive to false
    programRba.isActive = false;
    await this.programRbaRepository.save(programRba);

    this.logger.log(`Program RBA deactivated: ${programRba.kodeProgram} (${programRba.tahun})`);
  }

  /**
   * Hard delete program RBA (use with caution)
   */
  async hardDelete(id: string): Promise<void> {
    const programRba = await this.findOne(id);

    await this.programRbaRepository.remove(programRba);
    this.logger.warn(`Program RBA hard deleted: ${programRba.kodeProgram} (${programRba.tahun})`);
  }

  /**
   * Get available years with program data
   */
  async getAvailableYears(): Promise<number[]> {
    this.logger.log('Getting available years with program data');

    const result = await this.programRbaRepository
      .createQueryBuilder('program')
      .select('DISTINCT program.tahun', 'tahun')
      .orderBy('program.tahun', 'DESC')
      .getRawMany();

    return result.map(r => r.tahun);
  }

  /**
   * Get pagu info for a program (with real-time calculation of remaining budget)
   */
  async getPaguInfo(id: string): Promise<{
    programId: string;
    kodeProgram: string;
    namaProgram: string;
    tahun: number;
    paguAnggaran: number;
    paguTerpakai: number;
    sisaPagu: number;
    jumlahKegiatanAktif: number;
    persentasePenggunaan: number;
  }> {
    this.logger.log(`Getting pagu info for program ID: ${id}`);

    const program = await this.findOne(id);
    const paguProgram = Number(program.paguAnggaran) || 0;

    // Get all ACTIVE kegiatan for this program
    const activeKegiatan = await this.kegiatanRbaRepository.find({
      where: { programId: id, isActive: true },
    });

    // Calculate total pagu used by active kegiatan
    const paguTerpakai = activeKegiatan.reduce(
      (sum, k) => sum + (Number(k.paguAnggaran) || 0),
      0
    );

    const sisaPagu = paguProgram - paguTerpakai;
    const persentasePenggunaan = paguProgram > 0 ? (paguTerpakai / paguProgram) * 100 : 0;

    return {
      programId: program.id,
      kodeProgram: program.kodeProgram,
      namaProgram: program.namaProgram,
      tahun: program.tahun,
      paguAnggaran: paguProgram,
      paguTerpakai,
      sisaPagu,
      jumlahKegiatanAktif: activeKegiatan.length,
      persentasePenggunaan: Math.round(persentasePenggunaan * 100) / 100, // round to 2 decimal places
    };
  }
}
