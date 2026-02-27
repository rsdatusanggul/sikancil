import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Pegawai } from '../../database/entities/pegawai.entity';
import { UnitKerja } from '../../database/entities/unit-kerja.entity';
import { CreatePegawaiDto, UpdatePegawaiDto, QueryPegawaiDto } from './dto';

@Injectable()
export class PegawaiService {
  private readonly logger = new Logger(PegawaiService.name);

  constructor(
    @InjectRepository(Pegawai)
    private readonly pegawaiRepository: Repository<Pegawai>,
    @InjectRepository(UnitKerja)
    private readonly unitKerjaRepository: Repository<UnitKerja>,
  ) {}

  /**
   * Create a new employee
   */
  async create(createDto: CreatePegawaiDto, userId: string): Promise<Pegawai> {
    this.logger.log(`Creating new Pegawai: ${createDto.nip}`);

    // Check if NIP already exists
    const existing = await this.pegawaiRepository.findOne({
      where: { nip: createDto.nip },
    });

    if (existing) {
      throw new ConflictException(`Employee with NIP ${createDto.nip} already exists`);
    }

    // Validate Unit Kerja exists
    const unitKerja = await this.unitKerjaRepository.findOne({
      where: { id: createDto.unitKerjaId },
    });

    if (!unitKerja) {
      throw new BadRequestException(`Unit Kerja with ID ${createDto.unitKerjaId} not found`);
    }

    const pegawai = this.pegawaiRepository.create({
      ...createDto,
      createdBy: userId,
    });

    const saved = await this.pegawaiRepository.save(pegawai);
    this.logger.log(`Pegawai created: ${saved.nip} - ${saved.namaLengkap}`);

    return saved;
  }

  /**
   * Find all employees with filtering and pagination
   */
  async findAll(queryDto: QueryPegawaiDto): Promise<{
    data: Pegawai[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, unitKerjaId, status, jabatan, golongan, page = 1, limit = 20 } = queryDto;

    const queryBuilder = this.pegawaiRepository.createQueryBuilder('pegawai');

    if (search) {
      queryBuilder.andWhere(
        '(pegawai.namaLengkap LIKE :search OR pegawai.nip LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (unitKerjaId) {
      queryBuilder.andWhere('pegawai.unitKerjaId = :unitKerjaId', { unitKerjaId });
    }

    if (status) {
      queryBuilder.andWhere('pegawai.status = :status', { status });
    }

    if (jabatan) {
      queryBuilder.andWhere('pegawai.jabatan LIKE :jabatan', { jabatan: `%${jabatan}%` });
    }

    if (golongan) {
      queryBuilder.andWhere('pegawai.golongan = :golongan', { golongan });
    }

    queryBuilder
      .orderBy('pegawai.namaLengkap', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one employee by ID
   */
  async findOne(id: string): Promise<Pegawai> {
    const pegawai = await this.pegawaiRepository.findOne({ where: { id } });

    if (!pegawai) {
      throw new NotFoundException(`Pegawai with ID ${id} not found`);
    }

    return pegawai;
  }

  /**
   * Find employee by NIP
   */
  async findByNIP(nip: string): Promise<Pegawai> {
    const pegawai = await this.pegawaiRepository.findOne({ where: { nip } });

    if (!pegawai) {
      throw new NotFoundException(`Pegawai with NIP ${nip} not found`);
    }

    return pegawai;
  }

  /**
   * Find employees by Unit Kerja
   */
  async findByUnitKerja(unitKerjaId: string): Promise<Pegawai[]> {
    // Validate Unit Kerja exists
    const unitKerja = await this.unitKerjaRepository.findOne({
      where: { id: unitKerjaId },
    });

    if (!unitKerja) {
      throw new NotFoundException(`Unit Kerja with ID ${unitKerjaId} not found`);
    }

    return this.pegawaiRepository.find({
      where: { unitKerjaId },
      order: { namaLengkap: 'ASC' },
    });
  }

  /**
   * Get all active employees
   */
  async getActiveEmployees(): Promise<Pegawai[]> {
    return this.pegawaiRepository.find({
      where: { status: 'ACTIVE' },
      order: { namaLengkap: 'ASC' },
    });
  }

  /**
   * Update employee
   */
  async update(id: string, updateDto: UpdatePegawaiDto, userId: string): Promise<Pegawai> {
    const pegawai = await this.findOne(id);

    // If NIP is being updated, check for conflicts
    if (updateDto.nip && updateDto.nip !== pegawai.nip) {
      const existing = await this.pegawaiRepository.findOne({
        where: { nip: updateDto.nip },
      });

      if (existing) {
        throw new ConflictException(`Employee with NIP ${updateDto.nip} already exists`);
      }
    }

    // Validate Unit Kerja if being updated
    if (updateDto.unitKerjaId && updateDto.unitKerjaId !== pegawai.unitKerjaId) {
      const unitKerja = await this.unitKerjaRepository.findOne({
        where: { id: updateDto.unitKerjaId },
      });

      if (!unitKerja) {
        throw new BadRequestException(`Unit Kerja with ID ${updateDto.unitKerjaId} not found`);
      }
    }

    Object.assign(pegawai, updateDto);

    const updated = await this.pegawaiRepository.save(pegawai);
    this.logger.log(`Pegawai updated: ${updated.nip} - ${updated.namaLengkap} by ${userId}`);

    return updated;
  }

  /**
   * Delete employee (soft delete by setting status to INACTIVE)
   */
  async remove(id: string): Promise<void> {
    const pegawai = await this.findOne(id);

    pegawai.status = 'INACTIVE';
    await this.pegawaiRepository.save(pegawai);

    this.logger.log(`Pegawai deactivated: ${pegawai.nip} - ${pegawai.namaLengkap}`);
  }
}
