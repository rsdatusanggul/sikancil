import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PendapatanBLUD } from '../../database/entities/pendapatan-blud.entity';
import {
  CreatePendapatanOperasionalDto,
  UpdatePendapatanOperasionalDto,
  FilterPendapatanOperasionalDto,
} from './dto';
import {
  KategoriPendapatanBLUD,
  TransactionStatus,
} from '../../database/enums';
import { TransactionCreatedEvent, TransactionUpdatedEvent, TransactionDeletedEvent } from '../../common/events/transaction.events';

@Injectable()
export class PendapatanOperasionalService {
  constructor(
    @InjectRepository(PendapatanBLUD)
    private readonly pendapatanRepository: Repository<PendapatanBLUD>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create new pendapatan operasional
   */
  async create(
    createDto: CreatePendapatanOperasionalDto,
    userId: string,
  ): Promise<PendapatanBLUD> {
    // Check if nomorBukti already exists
    const existing = await this.pendapatanRepository.findOne({
      where: { nomorBukti: createDto.nomorBukti },
    });

    if (existing) {
      throw new ConflictException(
        `Nomor bukti ${createDto.nomorBukti} sudah digunakan`,
      );
    }

    // Determine kategoriPendapatan based on context
    // For operasional, we use OPERASIONAL_JASA_LAYANAN as default
    const kategoriPendapatan =
      KategoriPendapatanBLUD.OPERASIONAL_JASA_LAYANAN;

    const pendapatan = this.pendapatanRepository.create({
      ...createDto,
      kategoriPendapatan,
      status: TransactionStatus.DRAFT,
      createdBy: userId,
    });

    const savedPendapatan = await this.pendapatanRepository.save(pendapatan);

    // Emit transaction created event for auto-posting
    this.eventEmitter.emit(
      'transaction.created',
      new TransactionCreatedEvent(
        'PENDAPATAN_JASA_LAYANAN',
        savedPendapatan.id,
        {
          tanggal: savedPendapatan.tanggal,
          uraian: savedPendapatan.uraian,
          jumlah: savedPendapatan.jumlah,
          sumberDana: savedPendapatan.sumberDana,
          jenisPenjamin: savedPendapatan.jenisPenjamin,
          unitKerjaId: savedPendapatan.unitKerjaId,
        },
      ),
    );

    return savedPendapatan;
  }

  /**
   * Find all with filters and pagination
   */
  async findAll(filterDto: FilterPendapatanOperasionalDto) {
    const {
      tanggalMulai,
      tanggalAkhir,
      sumberDana,
      jenisPenjamin,
      status,
      unitKerjaId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'tanggal',
      sortOrder = 'DESC',
    } = filterDto;

    const where: FindOptionsWhere<PendapatanBLUD> = {
      kategoriPendapatan: KategoriPendapatanBLUD.OPERASIONAL_JASA_LAYANAN,
    };

    // Date range filter
    if (tanggalMulai && tanggalAkhir) {
      where.tanggal = Between(new Date(tanggalMulai), new Date(tanggalAkhir));
    } else if (tanggalMulai) {
      where.tanggal = Between(
        new Date(tanggalMulai),
        new Date('2099-12-31'),
      );
    } else if (tanggalAkhir) {
      where.tanggal = Between(new Date('1900-01-01'), new Date(tanggalAkhir));
    }

    if (sumberDana) {
      where.sumberDana = sumberDana;
    }

    if (jenisPenjamin) {
      where.jenisPenjamin = jenisPenjamin;
    }

    if (status) {
      where.status = status;
    }

    if (unitKerjaId) {
      where.unitKerjaId = unitKerjaId;
    }

    // Build query
    const queryBuilder = this.pendapatanRepository
      .createQueryBuilder('pendapatan')
      .where(where);

    // Search filter (nomorBukti or uraian)
    if (search) {
      queryBuilder.andWhere(
        '(pendapatan.nomorBukti LIKE :search OR pendapatan.uraian LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    queryBuilder.orderBy(`pendapatan.${sortBy}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one by ID
   */
  async findOne(id: string): Promise<PendapatanBLUD> {
    const pendapatan = await this.pendapatanRepository.findOne({
      where: {
        id,
        kategoriPendapatan: KategoriPendapatanBLUD.OPERASIONAL_JASA_LAYANAN,
      },
      relations: ['simrsBilling'],
    });

    if (!pendapatan) {
      throw new NotFoundException(
        `Pendapatan operasional dengan ID ${id} tidak ditemukan`,
      );
    }

    return pendapatan;
  }

  /**
   * Update pendapatan operasional
   */
  async update(
    id: string,
    updateDto: UpdatePendapatanOperasionalDto,
  ): Promise<PendapatanBLUD> {
    const pendapatan = await this.findOne(id);

    // Cannot update if already posted
    if (pendapatan.isPosted) {
      throw new BadRequestException(
        'Tidak dapat mengubah pendapatan yang sudah di-posting ke jurnal',
      );
    }

    // Check nomorBukti uniqueness if changed
    if (updateDto.nomorBukti && updateDto.nomorBukti !== pendapatan.nomorBukti) {
      const existing = await this.pendapatanRepository.findOne({
        where: { nomorBukti: updateDto.nomorBukti },
      });

      if (existing) {
        throw new ConflictException(
          `Nomor bukti ${updateDto.nomorBukti} sudah digunakan`,
        );
      }
    }

    // Store old data for event
    const oldData = {
      tanggal: pendapatan.tanggal,
      uraian: pendapatan.uraian,
      jumlah: pendapatan.jumlah,
      sumberDana: pendapatan.sumberDana,
      jenisPenjamin: pendapatan.jenisPenjamin,
      unitKerjaId: pendapatan.unitKerjaId,
    };

    Object.assign(pendapatan, updateDto);
    const updatedPendapatan = await this.pendapatanRepository.save(pendapatan);

    // Emit transaction updated event
    this.eventEmitter.emit(
      'transaction.updated',
      new TransactionUpdatedEvent(
        'PENDAPATAN_JASA_LAYANAN',
        updatedPendapatan.id,
        oldData,
        {
          tanggal: updatedPendapatan.tanggal,
          uraian: updatedPendapatan.uraian,
          jumlah: updatedPendapatan.jumlah,
          sumberDana: updatedPendapatan.sumberDana,
          jenisPenjamin: updatedPendapatan.jenisPenjamin,
          unitKerjaId: updatedPendapatan.unitKerjaId,
        },
      ),
    );

    return updatedPendapatan;
  }

  /**
   * Soft delete (set status to CANCELLED)
   */
  async remove(id: string): Promise<void> {
    const pendapatan = await this.findOne(id);

    if (pendapatan.isPosted) {
      throw new BadRequestException(
        'Tidak dapat menghapus pendapatan yang sudah di-posting ke jurnal',
      );
    }

    // Store data for event before deletion
    const deletedData = {
      tanggal: pendapatan.tanggal,
      uraian: pendapatan.uraian,
      jumlah: pendapatan.jumlah,
      sumberDana: pendapatan.sumberDana,
      jenisPenjamin: pendapatan.jenisPenjamin,
      unitKerjaId: pendapatan.unitKerjaId,
    };

    pendapatan.status = TransactionStatus.CANCELLED;
    await this.pendapatanRepository.save(pendapatan);

    // Emit transaction deleted event
    this.eventEmitter.emit(
      'transaction.deleted',
      new TransactionDeletedEvent(
        'PENDAPATAN_JASA_LAYANAN',
        pendapatan.id,
        deletedData,
      ),
    );
  }

  /**
   * Approve pendapatan (change status to APPROVED)
   */
  async approve(id: string, userId: string): Promise<PendapatanBLUD> {
    const pendapatan = await this.findOne(id);

    if (pendapatan.status !== TransactionStatus.SUBMITTED) {
      throw new BadRequestException(
        'Hanya pendapatan dengan status SUBMITTED yang dapat di-approve',
      );
    }

    pendapatan.status = TransactionStatus.APPROVED;
    return await this.pendapatanRepository.save(pendapatan);
  }

  /**
   * Submit for approval
   */
  async submit(id: string): Promise<PendapatanBLUD> {
    const pendapatan = await this.findOne(id);

    if (pendapatan.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(
        'Hanya pendapatan dengan status DRAFT yang dapat di-submit',
      );
    }

    pendapatan.status = TransactionStatus.SUBMITTED;
    return await this.pendapatanRepository.save(pendapatan);
  }

  /**
   * Get summary by penjamin for a date range
   */
  async getSummaryByPenjamin(tanggalMulai: string, tanggalAkhir: string) {
    const query = this.pendapatanRepository
      .createQueryBuilder('pendapatan')
      .select('pendapatan.jenisPenjamin', 'jenisPenjamin')
      .addSelect('COUNT(pendapatan.id)', 'jumlahTransaksi')
      .addSelect('SUM(pendapatan.jumlah)', 'totalPendapatan')
      .where({
        kategoriPendapatan: KategoriPendapatanBLUD.OPERASIONAL_JASA_LAYANAN,
        tanggal: Between(new Date(tanggalMulai), new Date(tanggalAkhir)),
        status: TransactionStatus.APPROVED,
      })
      .groupBy('pendapatan.jenisPenjamin');

    return await query.getRawMany();
  }

  /**
   * Get daily revenue for a month
   */
  async getDailyRevenue(tahun: number, bulan: number) {
    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 0);

    const query = this.pendapatanRepository
      .createQueryBuilder('pendapatan')
      .select("DATE(pendapatan.tanggal)", 'tanggal')
      .addSelect('SUM(pendapatan.jumlah)', 'totalPendapatan')
      .addSelect('COUNT(pendapatan.id)', 'jumlahTransaksi')
      .where({
        kategoriPendapatan: KategoriPendapatanBLUD.OPERASIONAL_JASA_LAYANAN,
        tanggal: Between(startDate, endDate),
        status: TransactionStatus.APPROVED,
      })
      .groupBy('DATE(pendapatan.tanggal)')
      .orderBy('tanggal', 'ASC');

    return await query.getRawMany();
  }
}
