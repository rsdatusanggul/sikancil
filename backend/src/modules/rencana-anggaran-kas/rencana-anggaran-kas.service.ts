import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { RencanaAnggaranKas } from '../../database/entities/rencana-anggaran-kas.entity';
import { ChartOfAccount } from '../../database/entities/chart-of-account.entity';
import { RBA } from '../../database/entities/rba.entity';
import { CreateRencanaAnggaranKasDto, UpdateRencanaAnggaranKasDto, QueryRencanaAnggaranKasDto } from './dto';

@Injectable()
export class RencanaAnggaranKasService {
  private readonly logger = new Logger(RencanaAnggaranKasService.name);

  constructor(
    @InjectRepository(RencanaAnggaranKas)
    private readonly rencanaAnggaranKasRepository: Repository<RencanaAnggaranKas>,
    @InjectRepository(ChartOfAccount)
    private readonly chartOfAccountRepository: Repository<ChartOfAccount>,
    @InjectRepository(RBA)
    private readonly rbaRepository: Repository<RBA>,
  ) {}

  /**
   * Create a new rencana anggaran kas
   * Note: The entity structure uses rbaId and has detailed cash flow fields
   * This service adapts simplified DTO to complex entity structure
   */
  async create(createDto: CreateRencanaAnggaranKasDto): Promise<RencanaAnggaranKas> {
    this.logger.log(`Creating new Rencana Anggaran Kas for tahun ${createDto.tahun}, bulan ${createDto.bulan}`);

    // Validate bulan (1-12)
    if (createDto.bulan < 1 || createDto.bulan > 12) {
      throw new BadRequestException('Bulan harus antara 1-12');
    }

    // For now, we'll create a simple mapping
    // In a real implementation, you'd need to map to specific fields
    // based on jenisAnggaran and kodeRekening

    const rencanaAnggaranKas = this.rencanaAnggaranKasRepository.create({
      tahun: createDto.tahun,
      bulan: createDto.bulan,
      saldoAwal: 0,
      totalPenerimaan: createDto.jenisAnggaran === 'PENERIMAAN' ? createDto.jumlahAnggaran : 0,
      totalPengeluaran: createDto.jenisAnggaran === 'PENGELUARAN' ? createDto.jumlahAnggaran : 0,
      saldoAkhir: 0,
      // Default values for detailed fields
      penerimaanAPBD: 0,
      penerimaanFungsional: 0,
      penerimaanHibah: 0,
      penerimaanLain: 0,
      belanjaPegawai: 0,
      belanjaBarangJasa: 0,
      belanjaModal: 0,
      belanjaLain: 0,
    });

    const saved = await this.rencanaAnggaranKasRepository.save(rencanaAnggaranKas);

    this.logger.log(`Rencana Anggaran Kas created for bulan ${saved.bulan}, tahun ${saved.tahun}`);
    return saved;
  }

  /**
   * Find all rencana anggaran kas with filtering and pagination
   */
  async findAll(queryDto: QueryRencanaAnggaranKasDto): Promise<{
    data: RencanaAnggaranKas[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { tahun, bulan, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<RencanaAnggaranKas> = {};

    if (tahun !== undefined) {
      where.tahun = tahun;
    }

    if (bulan !== undefined) {
      where.bulan = bulan;
    }

    const [data, total] = await this.rencanaAnggaranKasRepository.findAndCount({
      where,
      order: { tahun: 'DESC', bulan: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['rba'],
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
   * Find rencana anggaran kas by year and month
   */
  async findByYearMonth(tahun: number, bulan: number): Promise<RencanaAnggaranKas[]> {
    this.logger.log(`Finding rencana anggaran kas for tahun: ${tahun}, bulan: ${bulan}`);

    if (bulan < 1 || bulan > 12) {
      throw new BadRequestException('Bulan harus antara 1-12');
    }

    return this.rencanaAnggaranKasRepository.find({
      where: { tahun, bulan },
      order: { createdAt: 'ASC' },
      relations: ['rba'],
    });
  }

  /**
   * Find rencana anggaran kas by year (all 12 months)
   */
  async findByYear(tahun: number): Promise<RencanaAnggaranKas[]> {
    this.logger.log(`Finding rencana anggaran kas for tahun: ${tahun}`);

    return this.rencanaAnggaranKasRepository.find({
      where: { tahun },
      order: { bulan: 'ASC' },
      relations: ['rba'],
    });
  }

  /**
   * Get total by type (penerimaan or pengeluaran) for a specific month
   */
  async getTotalByType(tahun: number, bulan: number, jenisAnggaran: 'PENERIMAAN' | 'PENGELUARAN'): Promise<number> {
    this.logger.log(`Calculating total ${jenisAnggaran} for tahun ${tahun}, bulan ${bulan}`);

    if (bulan < 1 || bulan > 12) {
      throw new BadRequestException('Bulan harus antara 1-12');
    }

    const anggaran = await this.rencanaAnggaranKasRepository.find({
      where: { tahun, bulan },
    });

    const total = anggaran.reduce((sum, item) => {
      if (jenisAnggaran === 'PENERIMAAN') {
        return sum + Number(item.totalPenerimaan || 0);
      } else {
        return sum + Number(item.totalPengeluaran || 0);
      }
    }, 0);

    this.logger.log(`Total ${jenisAnggaran} for bulan ${bulan}: ${total}`);
    return total;
  }

  /**
   * Get cash flow projection for year (all 12 months)
   */
  async getCashFlowProjection(tahun: number): Promise<{
    bulan: number;
    saldoAwal: number;
    penerimaan: number;
    pengeluaran: number;
    saldoAkhir: number;
  }[]> {
    this.logger.log(`Calculating cash flow projection for tahun: ${tahun}`);

    const rencanaAnggaranKas = await this.rencanaAnggaranKasRepository.find({
      where: { tahun },
      order: { bulan: 'ASC' },
    });

    // Group by month and sum
    const monthlyData: { [key: number]: { penerimaan: number; pengeluaran: number } } = {};

    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = { penerimaan: 0, pengeluaran: 0 };
    }

    rencanaAnggaranKas.forEach(item => {
      if (!monthlyData[item.bulan]) {
        monthlyData[item.bulan] = { penerimaan: 0, pengeluaran: 0 };
      }
      monthlyData[item.bulan].penerimaan += Number(item.totalPenerimaan || 0);
      monthlyData[item.bulan].pengeluaran += Number(item.totalPengeluaran || 0);
    });

    // Calculate cumulative cash flow
    const result: {
      bulan: number;
      saldoAwal: number;
      penerimaan: number;
      pengeluaran: number;
      saldoAkhir: number;
    }[] = [];
    let saldoAwal = 0;

    for (let bulan = 1; bulan <= 12; bulan++) {
      const penerimaan = monthlyData[bulan].penerimaan;
      const pengeluaran = monthlyData[bulan].pengeluaran;
      const saldoAkhir = saldoAwal + penerimaan - pengeluaran;

      result.push({
        bulan,
        saldoAwal,
        penerimaan,
        pengeluaran,
        saldoAkhir,
      });

      saldoAwal = saldoAkhir;
    }

    return result;
  }

  /**
   * Find one rencana anggaran kas by ID
   */
  async findOne(id: string): Promise<RencanaAnggaranKas> {
    const rencanaAnggaranKas = await this.rencanaAnggaranKasRepository.findOne({
      where: { id },
      relations: ['rba'],
    });

    if (!rencanaAnggaranKas) {
      throw new NotFoundException(`Rencana Anggaran Kas dengan ID ${id} tidak ditemukan`);
    }

    return rencanaAnggaranKas;
  }

  /**
   * Update rencana anggaran kas
   */
  async update(id: string, updateDto: UpdateRencanaAnggaranKasDto): Promise<RencanaAnggaranKas> {
    const rencanaAnggaranKas = await this.findOne(id);

    // Validate bulan if being updated
    if (updateDto.bulan !== undefined && (updateDto.bulan < 1 || updateDto.bulan > 12)) {
      throw new BadRequestException('Bulan harus antara 1-12');
    }

    // Update totals based on jenisAnggaran if provided
    if (updateDto.jenisAnggaran && updateDto.jumlahAnggaran !== undefined) {
      if (updateDto.jenisAnggaran === 'PENERIMAAN') {
        rencanaAnggaranKas.totalPenerimaan = updateDto.jumlahAnggaran;
      } else {
        rencanaAnggaranKas.totalPengeluaran = updateDto.jumlahAnggaran;
      }
    }

    // Recalculate saldo akhir
    const saldoAkhir = rencanaAnggaranKas.saldoAwal + rencanaAnggaranKas.totalPenerimaan - rencanaAnggaranKas.totalPengeluaran;

    Object.assign(rencanaAnggaranKas, { ...updateDto, saldoAkhir });
    const updated = await this.rencanaAnggaranKasRepository.save(rencanaAnggaranKas);

    this.logger.log(`Rencana Anggaran Kas updated: bulan ${updated.bulan}, tahun ${updated.tahun}`);
    return updated;
  }

  /**
   * Delete rencana anggaran kas
   */
  async remove(id: string): Promise<void> {
    const rencanaAnggaranKas = await this.findOne(id);

    await this.rencanaAnggaranKasRepository.remove(rencanaAnggaranKas);
    this.logger.log(`Rencana Anggaran Kas deleted: bulan ${rencanaAnggaranKas.bulan}, tahun ${rencanaAnggaranKas.tahun}`);
  }
}