import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { AnggaranBelanjaRBA } from '../../database/entities/anggaran-belanja-rba.entity';
import { SubKegiatanRBA } from '../../database/entities/subkegiatan-rba.entity';
import { SubOutputRBA } from '../../database/entities/sub-output-rba.entity';
import { ChartOfAccount } from '../../database/entities/chart-of-account.entity';
import { CreateAnggaranBelanjaRbaDto, UpdateAnggaranBelanjaRbaDto, QueryAnggaranBelanjaRbaDto } from './dto';

@Injectable()
export class AnggaranBelanjaRbaService {
  private readonly logger = new Logger(AnggaranBelanjaRbaService.name);

  constructor(
    @InjectRepository(AnggaranBelanjaRBA)
    private readonly anggaranBelanjaRbaRepository: Repository<AnggaranBelanjaRBA>,
    @InjectRepository(SubKegiatanRBA)
    private readonly subKegiatanRbaRepository: Repository<SubKegiatanRBA>,
    @InjectRepository(SubOutputRBA)
    private readonly subOutputRbaRepository: Repository<SubOutputRBA>,
    @InjectRepository(ChartOfAccount)
    private readonly chartOfAccountRepository: Repository<ChartOfAccount>,
  ) {}

  /**
   * Create a new anggaran belanja RBA
   */
  async create(createDto: CreateAnggaranBelanjaRbaDto): Promise<AnggaranBelanjaRBA> {
    this.logger.log(`Creating new Anggaran Belanja RBA for rekening: ${createDto.kodeRekening}`);

    // Validate that at least one of subKegiatanId or subOutputId is provided
    if (!createDto.subKegiatanId && !createDto.subOutputId) {
      throw new BadRequestException('Minimal salah satu dari subKegiatanId atau subOutputId harus diisi');
    }

    // Validate subKegiatanId if provided
    if (createDto.subKegiatanId) {
      const output = await this.subKegiatanRbaRepository.findOne({
        where: { id: createDto.subKegiatanId },
      });

      if (!output) {
        throw new BadRequestException(`Sub Kegiatan RBA dengan ID ${createDto.subKegiatanId} tidak ditemukan`);
      }
    }

    // Validate subOutputId if provided
    if (createDto.subOutputId) {
      const subOutput = await this.subOutputRbaRepository.findOne({
        where: { id: createDto.subOutputId },
      });

      if (!subOutput) {
        throw new BadRequestException(`Sub Sub Kegiatan RBA dengan ID ${createDto.subOutputId} tidak ditemukan`);
      }
    }

    // Validate kodeRekening exists in Chart of Accounts
    const coa = await this.chartOfAccountRepository.findOne({
      where: { kodeRekening: createDto.kodeRekening },
    });

    if (!coa) {
      throw new BadRequestException(`Kode rekening ${createDto.kodeRekening} tidak ditemukan di Chart of Accounts`);
    }

    // Calculate sisa (pagu - realisasi - komitmen)
    const pagu = createDto.pagu || 0;
    const realisasi = createDto.realisasi || 0;
    const komitmen = createDto.komitmen || 0;
    const sisa = pagu - realisasi - komitmen;

    const anggaranBelanja = this.anggaranBelanjaRbaRepository.create({
      ...createDto,
      sisa,
    });

    const saved = await this.anggaranBelanjaRbaRepository.save(anggaranBelanja);

    this.logger.log(`Anggaran Belanja RBA created: ${saved.kodeRekening} (${saved.tahun})`);
    return saved;
  }

  /**
   * Find all anggaran belanja RBA with filtering and pagination
   */
  async findAll(queryDto: QueryAnggaranBelanjaRbaDto): Promise<{
    data: AnggaranBelanjaRBA[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { search, subKegiatanId, subOutputId, kodeRekening, sumberDana, tahun, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<AnggaranBelanjaRBA> = {};

    if (search) {
      where.namaRekening = Like(`%${search}%`);
    }

    if (subKegiatanId !== undefined) {
      where.subKegiatanId = subKegiatanId;
    }

    if (subOutputId !== undefined) {
      where.subOutputId = subOutputId;
    }

    if (kodeRekening !== undefined) {
      where.kodeRekening = kodeRekening;
    }

    if (sumberDana !== undefined) {
      where.sumberDana = sumberDana;
    }

    if (tahun !== undefined) {
      where.tahun = tahun;
    }

    const [data, total] = await this.anggaranBelanjaRbaRepository.findAndCount({
      where,
      order: { tahun: 'DESC', kodeRekening: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['output', 'subOutput'],
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
   * Find anggaran belanja by output
   */
  async findByOutput(subKegiatanId: string): Promise<AnggaranBelanjaRBA[]> {
    this.logger.log(`Finding anggaran belanja for output ID: ${subKegiatanId}`);

    // Validate output exists
    const output = await this.subKegiatanRbaRepository.findOne({
      where: { id: subKegiatanId },
    });

    if (!output) {
      throw new NotFoundException(`Sub Kegiatan RBA dengan ID ${subKegiatanId} tidak ditemukan`);
    }

    return this.anggaranBelanjaRbaRepository.find({
      where: { subKegiatanId },
      order: { kodeRekening: 'ASC' },
      relations: ['output'],
    });
  }

  /**
   * Find anggaran belanja by sub output
   */
  async findBySubOutput(subOutputId: string): Promise<AnggaranBelanjaRBA[]> {
    this.logger.log(`Finding anggaran belanja for sub output ID: ${subOutputId}`);

    // Validate sub output exists
    const subOutput = await this.subOutputRbaRepository.findOne({
      where: { id: subOutputId },
    });

    if (!subOutput) {
      throw new NotFoundException(`Sub Sub Kegiatan RBA dengan ID ${subOutputId} tidak ditemukan`);
    }

    return this.anggaranBelanjaRbaRepository.find({
      where: { subOutputId },
      order: { kodeRekening: 'ASC' },
      relations: ['subOutput'],
    });
  }

  /**
   * Find anggaran belanja by rekening and year
   */
  async findByRekening(kodeRekening: string, tahun: number): Promise<AnggaranBelanjaRBA[]> {
    this.logger.log(`Finding anggaran belanja for rekening: ${kodeRekening}, tahun: ${tahun}`);

    return this.anggaranBelanjaRbaRepository.find({
      where: { kodeRekening, tahun },
      order: { createdAt: 'DESC' },
      relations: ['output', 'subOutput'],
    });
  }

  /**
   * Get total pagu by output
   */
  async getTotalPaguByOutput(subKegiatanId: string): Promise<number> {
    this.logger.log(`Calculating total pagu for output ID: ${subKegiatanId}`);

    // Validate output exists
    const output = await this.subKegiatanRbaRepository.findOne({
      where: { id: subKegiatanId },
    });

    if (!output) {
      throw new NotFoundException(`Sub Kegiatan RBA dengan ID ${subKegiatanId} tidak ditemukan`);
    }

    const anggaran = await this.anggaranBelanjaRbaRepository.find({
      where: { subKegiatanId },
    });

    const totalPagu = anggaran.reduce((sum, item) => sum + Number(item.pagu || 0), 0);

    this.logger.log(`Total pagu for output ${subKegiatanId}: ${totalPagu}`);
    return totalPagu;
  }

  /**
   * Get total pagu by sub output
   */
  async getTotalPaguBySubOutput(subOutputId: string): Promise<number> {
    this.logger.log(`Calculating total pagu for sub output ID: ${subOutputId}`);

    // Validate sub output exists
    const subOutput = await this.subOutputRbaRepository.findOne({
      where: { id: subOutputId },
    });

    if (!subOutput) {
      throw new NotFoundException(`Sub Sub Kegiatan RBA dengan ID ${subOutputId} tidak ditemukan`);
    }

    const anggaran = await this.anggaranBelanjaRbaRepository.find({
      where: { subOutputId },
    });

    const totalPagu = anggaran.reduce((sum, item) => sum + Number(item.pagu || 0), 0);

    this.logger.log(`Total pagu for sub output ${subOutputId}: ${totalPagu}`);
    return totalPagu;
  }

  /**
   * Calculate total pagu from monthly breakdown
   */
  calculateTotalPaguFromMonthly(anggaran: Partial<AnggaranBelanjaRBA>): number {
    const months = [
      'januari', 'februari', 'maret', 'april', 'mei', 'juni',
      'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
    ];

    return months.reduce((sum, month) => {
      return sum + Number(anggaran[month] || 0);
    }, 0);
  }

  /**
   * Find one anggaran belanja RBA by ID
   */
  async findOne(id: string): Promise<AnggaranBelanjaRBA> {
    const anggaranBelanja = await this.anggaranBelanjaRbaRepository.findOne({
      where: { id },
      relations: ['output', 'subOutput'],
    });

    if (!anggaranBelanja) {
      throw new NotFoundException(`Anggaran Belanja RBA dengan ID ${id} tidak ditemukan`);
    }

    return anggaranBelanja;
  }

  /**
   * Update anggaran belanja RBA
   */
  async update(id: string, updateDto: UpdateAnggaranBelanjaRbaDto): Promise<AnggaranBelanjaRBA> {
    const anggaranBelanja = await this.findOne(id);

    // Validate subKegiatanId if being updated
    if (updateDto.subKegiatanId && updateDto.subKegiatanId !== anggaranBelanja.subKegiatanId) {
      const output = await this.subKegiatanRbaRepository.findOne({
        where: { id: updateDto.subKegiatanId },
      });

      if (!output) {
        throw new BadRequestException(`Sub Kegiatan RBA dengan ID ${updateDto.subKegiatanId} tidak ditemukan`);
      }
    }

    // Validate subOutputId if being updated
    if (updateDto.subOutputId && updateDto.subOutputId !== anggaranBelanja.subOutputId) {
      const subOutput = await this.subOutputRbaRepository.findOne({
        where: { id: updateDto.subOutputId },
      });

      if (!subOutput) {
        throw new BadRequestException(`Sub Sub Kegiatan RBA dengan ID ${updateDto.subOutputId} tidak ditemukan`);
      }
    }

    // Validate kodeRekening if being updated
    if (updateDto.kodeRekening && updateDto.kodeRekening !== anggaranBelanja.kodeRekening) {
      const coa = await this.chartOfAccountRepository.findOne({
        where: { kodeRekening: updateDto.kodeRekening },
      });

      if (!coa) {
        throw new BadRequestException(`Kode rekening ${updateDto.kodeRekening} tidak ditemukan di Chart of Accounts`);
      }
    }

    // Recalculate sisa if pagu, realisasi, or komitmen changes
    const pagu = updateDto.pagu !== undefined ? updateDto.pagu : anggaranBelanja.pagu;
    const realisasi = updateDto.realisasi !== undefined ? updateDto.realisasi : anggaranBelanja.realisasi;
    const komitmen = updateDto.komitmen !== undefined ? updateDto.komitmen : anggaranBelanja.komitmen;
    const sisa = pagu - realisasi - komitmen;

    Object.assign(anggaranBelanja, updateDto, { sisa });
    const updated = await this.anggaranBelanjaRbaRepository.save(anggaranBelanja);

    this.logger.log(`Anggaran Belanja RBA updated: ${updated.kodeRekening} (${updated.tahun})`);
    return updated;
  }

  /**
   * Delete anggaran belanja RBA
   */
  async remove(id: string): Promise<void> {
    const anggaranBelanja = await this.findOne(id);

    await this.anggaranBelanjaRbaRepository.remove(anggaranBelanja);
    this.logger.log(`Anggaran Belanja RBA deleted: ${anggaranBelanja.kodeRekening} (${anggaranBelanja.tahun})`);
  }
}
