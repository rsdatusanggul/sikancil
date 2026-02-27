import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { KegiatanRBA } from '../../database/entities/kegiatan-rba.entity';
import { ProgramRBA } from '../../database/entities/program-rba.entity';
import { SubKegiatanRBA } from '../../database/entities/subkegiatan-rba.entity';
import { CreateKegiatanRbaDto, UpdateKegiatanRbaDto, QueryKegiatanRbaDto } from './dto';

@Injectable()
export class KegiatanRbaService {
  private readonly logger = new Logger(KegiatanRbaService.name);

  constructor(
    @InjectRepository(KegiatanRBA)
    private readonly kegiatanRbaRepository: Repository<KegiatanRBA>,
    @InjectRepository(ProgramRBA)
    private readonly programRbaRepository: Repository<ProgramRBA>,
    @InjectRepository(SubKegiatanRBA)
    private readonly subKegiatanRbaRepository: Repository<SubKegiatanRBA>,
  ) {}

  /**
   * Create a new kegiatan RBA
   */
  async create(createDto: CreateKegiatanRbaDto): Promise<KegiatanRBA> {
    this.logger.log(`Creating new Kegiatan RBA: ${createDto.kodeKegiatan} for tahun ${createDto.tahun}`);

    // Validate programId exists
    const program = await this.programRbaRepository.findOne({
      where: { id: createDto.programId },
    });

    if (!program) {
      throw new BadRequestException(`Program RBA dengan ID ${createDto.programId} tidak ditemukan`);
    }

    // Validate tahun matches with program tahun
    if (program.tahun !== createDto.tahun) {
      throw new BadRequestException(
        `Tahun kegiatan (${createDto.tahun}) harus sama dengan tahun program (${program.tahun})`
      );
    }

    // Check if kodeKegiatan + tahun already exists (unique constraint for ACTIVE kegiatan only)
    const existing = await this.kegiatanRbaRepository.findOne({
      where: {
        kodeKegiatan: createDto.kodeKegiatan,
        tahun: createDto.tahun,
        isActive: true,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Kegiatan dengan kode ${createDto.kodeKegiatan} untuk tahun ${createDto.tahun} sudah ada`
      );
    }

    // Validate pagu anggaran kegiatan tidak melebihi sisa pagu program
    if (createDto.paguAnggaran && createDto.paguAnggaran > 0) {
      const paguProgram = Number(program.paguAnggaran) || 0;

      if (paguProgram === 0) {
        throw new BadRequestException(
          `Program "${program.namaProgram}" belum memiliki pagu anggaran. Silakan set pagu program terlebih dahulu.`
        );
      }

      // Calculate total pagu from existing ACTIVE kegiatan in this program
      const existingKegiatan = await this.kegiatanRbaRepository.find({
        where: { programId: createDto.programId, isActive: true },
      });

      const totalPaguKegiatanExisting = existingKegiatan.reduce(
        (sum, k) => sum + (Number(k.paguAnggaran) || 0),
        0
      );

      const sisaPaguProgram = paguProgram - totalPaguKegiatanExisting;

      if (createDto.paguAnggaran > sisaPaguProgram) {
        throw new BadRequestException(
          `Pagu anggaran kegiatan (Rp ${createDto.paguAnggaran.toLocaleString('id-ID')}) melebihi sisa pagu program (Rp ${sisaPaguProgram.toLocaleString('id-ID')}). ` +
          `Total pagu program: Rp ${paguProgram.toLocaleString('id-ID')}, ` +
          `sudah dialokasikan: Rp ${totalPaguKegiatanExisting.toLocaleString('id-ID')}.`
        );
      }
    }

    const kegiatanRba = this.kegiatanRbaRepository.create(createDto);
    const saved = await this.kegiatanRbaRepository.save(kegiatanRba);

    this.logger.log(`Kegiatan RBA created: ${saved.kodeKegiatan} (${saved.tahun}) with pagu Rp ${saved.paguAnggaran}`);
    return saved;
  }

  /**
   * Find all kegiatan RBA with filtering and pagination
   */
  async findAll(queryDto: QueryKegiatanRbaDto): Promise<{
    data: KegiatanRBA[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, programId, tahun, isActive, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<KegiatanRBA> = {};

    if (search) {
      where.namaKegiatan = Like(`%${search}%`);
    }

    if (programId !== undefined) {
      where.programId = programId;
    }

    if (tahun !== undefined) {
      where.tahun = tahun;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.kegiatanRbaRepository.findAndCount({
      where,
      order: { tahun: 'DESC', kodeKegiatan: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['program'],
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
   * Get available years with kegiatan data
   */
  async getAvailableYears(): Promise<number[]> {
    this.logger.log('Getting available years with kegiatan data');

    const result = await this.kegiatanRbaRepository
      .createQueryBuilder('kegiatan')
      .select('DISTINCT kegiatan.tahun', 'tahun')
      .orderBy('kegiatan.tahun', 'DESC')
      .getRawMany();

    return result.map(r => r.tahun);
  }

  /**
   * Find kegiatan by program (only active kegiatan)
   */
  async findByProgram(programId: string): Promise<KegiatanRBA[]> {
    this.logger.log(`Finding kegiatan for program ID: ${programId}`);

    // Validate program exists
    const program = await this.programRbaRepository.findOne({
      where: { id: programId },
    });

    if (!program) {
      throw new NotFoundException(`Program RBA dengan ID ${programId} tidak ditemukan`);
    }

    return this.kegiatanRbaRepository.find({
      where: { programId, isActive: true },
      order: { kodeKegiatan: 'ASC' },
      relations: ['subKegiatan'],
    });
  }

  /**
   * Find kegiatan by year
   */
  async findByYear(tahun: number): Promise<KegiatanRBA[]> {
    this.logger.log(`Finding kegiatan for tahun: ${tahun}`);

    return this.kegiatanRbaRepository.find({
      where: { tahun },
      order: { kodeKegiatan: 'ASC' },
      relations: ['program', 'subKegiatan'],
    });
  }

  /**
   * Find one kegiatan RBA by ID
   */
  async findOne(id: string): Promise<KegiatanRBA> {
    const kegiatanRba = await this.kegiatanRbaRepository.findOne({
      where: { id },
      relations: ['program', 'subKegiatan'],
    });

    if (!kegiatanRba) {
      throw new NotFoundException(`Kegiatan RBA dengan ID ${id} tidak ditemukan`);
    }

    return kegiatanRba;
  }

  /**
   * Update kegiatan RBA
   */
  async update(id: string, updateDto: UpdateKegiatanRbaDto): Promise<KegiatanRBA> {
    const kegiatanRba = await this.findOne(id);

    const programId = updateDto.programId || kegiatanRba.programId;
    const program = await this.programRbaRepository.findOne({
      where: { id: programId },
    });

    if (!program) {
      throw new BadRequestException(`Program RBA dengan ID ${programId} tidak ditemukan`);
    }

    // Validate programId if being updated
    if (updateDto.programId && updateDto.programId !== kegiatanRba.programId) {
      // Validate tahun matches with new program tahun
      const tahun = updateDto.tahun || kegiatanRba.tahun;
      if (program.tahun !== tahun) {
        throw new BadRequestException(
          `Tahun kegiatan (${tahun}) harus sama dengan tahun program (${program.tahun})`
        );
      }
    }

    // Validate pagu anggaran if being updated
    if (updateDto.paguAnggaran !== undefined) {
      const newPaguAnggaran = updateDto.paguAnggaran;
      const paguProgram = Number(program.paguAnggaran) || 0;

      if (newPaguAnggaran > 0 && paguProgram === 0) {
        throw new BadRequestException(
          `Program "${program.namaProgram}" belum memiliki pagu anggaran. Silakan set pagu program terlebih dahulu.`
        );
      }

      if (newPaguAnggaran > 0) {
        // Calculate total pagu from OTHER ACTIVE kegiatan in this program (exclude current)
        const existingKegiatan = await this.kegiatanRbaRepository.find({
          where: { programId, isActive: true },
        });

        const totalPaguKegiatanLain = existingKegiatan
          .filter(k => k.id !== id)
          .reduce((sum, k) => sum + (Number(k.paguAnggaran) || 0), 0);

        const sisaPaguProgram = paguProgram - totalPaguKegiatanLain;

        if (newPaguAnggaran > sisaPaguProgram) {
          throw new BadRequestException(
            `Pagu anggaran kegiatan (Rp ${newPaguAnggaran.toLocaleString('id-ID')}) melebihi sisa pagu program (Rp ${sisaPaguProgram.toLocaleString('id-ID')}). ` +
            `Total pagu program: Rp ${paguProgram.toLocaleString('id-ID')}, ` +
            `sudah dialokasikan ke kegiatan lain: Rp ${totalPaguKegiatanLain.toLocaleString('id-ID')}.`
          );
        }
      }
    }

    // If kodeKegiatan or tahun is being updated, check for conflicts (only check ACTIVE kegiatan)
    if (
      (updateDto.kodeKegiatan && updateDto.kodeKegiatan !== kegiatanRba.kodeKegiatan) ||
      (updateDto.tahun && updateDto.tahun !== kegiatanRba.tahun)
    ) {
      const kode = updateDto.kodeKegiatan || kegiatanRba.kodeKegiatan;
      const tahun = updateDto.tahun || kegiatanRba.tahun;

      const existing = await this.kegiatanRbaRepository.findOne({
        where: { kodeKegiatan: kode, tahun, isActive: true },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Kegiatan dengan kode ${kode} untuk tahun ${tahun} sudah ada`
        );
      }
    }

    Object.assign(kegiatanRba, updateDto);
    const updated = await this.kegiatanRbaRepository.save(kegiatanRba);

    this.logger.log(`Kegiatan RBA updated: ${updated.kodeKegiatan} (${updated.tahun})`);
    return updated;
  }

  /**
   * Delete kegiatan RBA (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<void> {
    const kegiatanRba = await this.findOne(id);

    // Soft delete: set isActive to false
    kegiatanRba.isActive = false;
    await this.kegiatanRbaRepository.save(kegiatanRba);

    this.logger.log(`Kegiatan RBA deactivated: ${kegiatanRba.kodeKegiatan} (${kegiatanRba.tahun})`);
  }

  /**
   * Hard delete kegiatan RBA (use with caution)
   */
  async hardDelete(id: string): Promise<void> {
    const kegiatanRba = await this.findOne(id);

    await this.kegiatanRbaRepository.remove(kegiatanRba);
    this.logger.warn(`Kegiatan RBA hard deleted: ${kegiatanRba.kodeKegiatan} (${kegiatanRba.tahun})`);
  }

  /**
   * Get pagu info for a kegiatan (with real-time calculation of remaining budget)
   */
  async getPaguInfo(id: string): Promise<{
    kegiatanId: string;
    kodeKegiatan: string;
    namaKegiatan: string;
    tahun: number;
    paguAnggaran: number;
    paguTerpakai: number;
    sisaPagu: number;
    jumlahSubKegiatanAktif: number;
    persentasePenggunaan: number;
  }> {
    this.logger.log(`Getting pagu info for kegiatan ID: ${id}`);

    const kegiatan = await this.findOne(id);
    const paguKegiatan = Number(kegiatan.paguAnggaran) || 0;

    // Get all ACTIVE sub kegiatan for this kegiatan
    const activeSubKegiatan = await this.subKegiatanRbaRepository.find({
      where: { kegiatanId: id, isActive: true },
    });

    // Calculate total pagu used by active sub kegiatan
    const paguTerpakai = activeSubKegiatan.reduce(
      (sum, sk) => sum + (Number(sk.totalPagu) || 0),
      0
    );

    const sisaPagu = paguKegiatan - paguTerpakai;
    const persentasePenggunaan = paguKegiatan > 0 ? (paguTerpakai / paguKegiatan) * 100 : 0;

    return {
      kegiatanId: kegiatan.id,
      kodeKegiatan: kegiatan.kodeKegiatan,
      namaKegiatan: kegiatan.namaKegiatan,
      tahun: kegiatan.tahun,
      paguAnggaran: paguKegiatan,
      paguTerpakai,
      sisaPagu,
      jumlahSubKegiatanAktif: activeSubKegiatan.length,
      persentasePenggunaan: Math.round(persentasePenggunaan * 100) / 100,
    };
  }
}
