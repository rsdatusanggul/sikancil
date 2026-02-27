import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HibahBLUD } from '../../database/entities/hibah-blud.entity';
import {
  CreateHibahDto,
  UpdateHibahDto,
  FilterHibahDto,
  PenggunaanHibahDto,
  LaporanPertanggungjawabanDto,
} from './dto';
import {
  JenisHibah,
  StatusHibah,
  TransactionStatus,
} from '../../database/enums';
import { TransactionCreatedEvent, TransactionUpdatedEvent, TransactionDeletedEvent } from '../../common/events/transaction.events';

@Injectable()
export class HibahService {
  constructor(
    @InjectRepository(HibahBLUD)
    private readonly hibahRepository: Repository<HibahBLUD>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create new hibah
   */
  async create(createDto: CreateHibahDto, userId: string): Promise<HibahBLUD> {
    // Check if nomorHibah already exists
    const existing = await this.hibahRepository.findOne({
      where: { nomorHibah: createDto.nomorHibah },
    });

    if (existing) {
      throw new ConflictException(
        `Nomor hibah ${createDto.nomorHibah} sudah digunakan`,
      );
    }

    // Validate nilaiHibah for UANG type
    if (createDto.jenisHibah === JenisHibah.UANG && !createDto.nilaiHibah) {
      throw new BadRequestException(
        'Nilai hibah harus diisi untuk jenis hibah UANG',
      );
    }

    // Validate detailBarangJasa for BARANG/JASA type
    if (
      (createDto.jenisHibah === JenisHibah.BARANG ||
        createDto.jenisHibah === JenisHibah.JASA) &&
      (!createDto.detailBarangJasa || createDto.detailBarangJasa.length === 0)
    ) {
      throw new BadRequestException(
        'Detail barang/jasa harus diisi untuk jenis hibah BARANG atau JASA',
      );
    }

    const hibah = this.hibahRepository.create({
      ...createDto,
      sisaHibah: createDto.nilaiHibah || 0,
      statusPenggunaan: StatusHibah.DITERIMA,
      status: TransactionStatus.DRAFT,
      createdBy: userId,
    });

    const savedHibah = await this.hibahRepository.save(hibah);

    // Emit transaction created event for auto-posting
    // Only emit for UANG type hibah that should be recorded in accounting
    if (savedHibah.jenisHibah === JenisHibah.UANG) {
      this.eventEmitter.emit(
        'transaction.created',
        new TransactionCreatedEvent(
          'HIBAH_UANG',
          savedHibah.id,
          {
            tanggal: savedHibah.tanggalSKHibah,
            uraian: `Hibah dari ${savedHibah.namaPemberiHibah} - ${savedHibah.uraianHibah}`,
            jumlah: savedHibah.nilaiHibah,
            nomorSK: savedHibah.nomorSKHibah,
            namaPemberiHibah: savedHibah.namaPemberiHibah,
            unitKerjaId: savedHibah.unitKerjaId,
          },
        ),
      );
    }

    return savedHibah;
  }

  /**
   * Find all with filters and pagination
   */
  async findAll(filterDto: FilterHibahDto) {
    const {
      tanggalMulai,
      tanggalAkhir,
      jenisHibah,
      statusPenggunaan,
      status,
      unitKerjaId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'tanggalSKHibah',
      sortOrder = 'DESC',
    } = filterDto;

    const where: FindOptionsWhere<HibahBLUD> = {};

    // Date range filter
    if (tanggalMulai && tanggalAkhir) {
      where.tanggalSKHibah = Between(
        new Date(tanggalMulai),
        new Date(tanggalAkhir),
      );
    }

    if (jenisHibah) {
      where.jenisHibah = jenisHibah;
    }

    if (statusPenggunaan) {
      where.statusPenggunaan = statusPenggunaan;
    }

    if (status) {
      where.status = status;
    }

    if (unitKerjaId) {
      where.unitKerjaId = unitKerjaId;
    }

    // Build query
    const queryBuilder = this.hibahRepository
      .createQueryBuilder('hibah')
      .where(where);

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(hibah.nomorHibah LIKE :search OR hibah.namaPemberiHibah LIKE :search OR hibah.uraianHibah LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    queryBuilder.orderBy(`hibah.${sortBy}`, sortOrder);

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
  async findOne(id: string): Promise<HibahBLUD> {
    const hibah = await this.hibahRepository.findOne({
      where: { id },
    });

    if (!hibah) {
      throw new NotFoundException(`Hibah dengan ID ${id} tidak ditemukan`);
    }

    return hibah;
  }

  /**
   * Update hibah
   */
  async update(id: string, updateDto: UpdateHibahDto): Promise<HibahBLUD> {
    const hibah = await this.findOne(id);

    // Cannot update if already posted to journal
    if (hibah.isPosted) {
      throw new BadRequestException(
        'Tidak dapat mengubah hibah yang sudah di-posting ke jurnal',
      );
    }

    // Check nomorHibah uniqueness if changed
    if (updateDto.nomorHibah && updateDto.nomorHibah !== hibah.nomorHibah) {
      const existing = await this.hibahRepository.findOne({
        where: { nomorHibah: updateDto.nomorHibah },
      });

      if (existing) {
        throw new ConflictException(
          `Nomor hibah ${updateDto.nomorHibah} sudah digunakan`,
        );
      }
    }

    // Store old data for event
    const oldData = {
      tanggal: hibah.tanggalSKHibah,
      uraian: `Hibah dari ${hibah.namaPemberiHibah} - ${hibah.uraianHibah}`,
      jumlah: hibah.nilaiHibah,
      nomorSK: hibah.nomorSKHibah,
      namaPemberiHibah: hibah.namaPemberiHibah,
      unitKerjaId: hibah.unitKerjaId,
    };

    // Update sisa hibah if nilaiTerpakai is updated
    if (updateDto.nilaiTerpakai !== undefined) {
      hibah.sisaHibah = hibah.nilaiHibah - updateDto.nilaiTerpakai;
    }

    Object.assign(hibah, updateDto);
    const updatedHibah = await this.hibahRepository.save(hibah);

    // Emit transaction updated event (only for UANG type)
    if (updatedHibah.jenisHibah === JenisHibah.UANG) {
      this.eventEmitter.emit(
        'transaction.updated',
        new TransactionUpdatedEvent(
          'HIBAH_UANG',
          updatedHibah.id,
          oldData,
          {
            tanggal: updatedHibah.tanggalSKHibah,
            uraian: `Hibah dari ${updatedHibah.namaPemberiHibah} - ${updatedHibah.uraianHibah}`,
            jumlah: updatedHibah.nilaiHibah,
            nomorSK: updatedHibah.nomorSKHibah,
            namaPemberiHibah: updatedHibah.namaPemberiHibah,
            unitKerjaId: updatedHibah.unitKerjaId,
          },
        ),
      );
    }

    return updatedHibah;
  }

  /**
   * Delete hibah (soft delete)
   */
  async remove(id: string): Promise<void> {
    const hibah = await this.findOne(id);

    if (hibah.isPosted) {
      throw new BadRequestException(
        'Tidak dapat menghapus hibah yang sudah di-posting ke jurnal',
      );
    }

    if (hibah.nilaiTerpakai > 0) {
      throw new BadRequestException(
        'Tidak dapat menghapus hibah yang sudah digunakan',
      );
    }

    // Store data for event before deletion
    const deletedData = {
      tanggal: hibah.tanggalSKHibah,
      uraian: `Hibah dari ${hibah.namaPemberiHibah} - ${hibah.uraianHibah}`,
      jumlah: hibah.nilaiHibah,
      nomorSK: hibah.nomorSKHibah,
      namaPemberiHibah: hibah.namaPemberiHibah,
      unitKerjaId: hibah.unitKerjaId,
    };

    hibah.status = TransactionStatus.CANCELLED;
    await this.hibahRepository.save(hibah);

    // Emit transaction deleted event (only for UANG type)
    if (hibah.jenisHibah === JenisHibah.UANG) {
      this.eventEmitter.emit(
        'transaction.deleted',
        new TransactionDeletedEvent('HIBAH_UANG', hibah.id, deletedData),
      );
    }
  }

  /**
   * Record penggunaan hibah
   */
  async recordPenggunaan(
    id: string,
    penggunaanDto: PenggunaanHibahDto,
  ): Promise<HibahBLUD> {
    const hibah = await this.findOne(id);

    if (hibah.status !== TransactionStatus.APPROVED) {
      throw new BadRequestException(
        'Hanya hibah yang sudah di-approve yang dapat digunakan',
      );
    }

    if (hibah.jenisHibah !== JenisHibah.UANG) {
      throw new BadRequestException(
        'Pencatatan penggunaan hanya untuk hibah jenis UANG',
      );
    }

    const nilaiDigunakan = penggunaanDto.nilaiDigunakan;
    const newNilaiTerpakai = hibah.nilaiTerpakai + nilaiDigunakan;

    if (newNilaiTerpakai > hibah.nilaiHibah) {
      throw new BadRequestException(
        `Nilai yang digunakan (${nilaiDigunakan}) melebihi sisa hibah (${hibah.sisaHibah})`,
      );
    }

    hibah.nilaiTerpakai = newNilaiTerpakai;
    hibah.sisaHibah = hibah.nilaiHibah - newNilaiTerpakai;

    // Update status
    if (hibah.sisaHibah === 0) {
      hibah.statusPenggunaan = StatusHibah.SUDAH_DIGUNAKAN;
    } else {
      hibah.statusPenggunaan = StatusHibah.SEBAGIAN_DIGUNAKAN;
    }

    return await this.hibahRepository.save(hibah);
  }

  /**
   * Submit laporan pertanggungjawaban
   */
  async submitLaporan(
    id: string,
    laporanDto: LaporanPertanggungjawabanDto,
  ): Promise<HibahBLUD> {
    const hibah = await this.findOne(id);

    if (hibah.statusPenggunaan !== StatusHibah.SUDAH_DIGUNAKAN) {
      throw new BadRequestException(
        'Laporan pertanggungjawaban hanya dapat dibuat untuk hibah yang sudah digunakan',
      );
    }

    hibah.nomorLaporanPertanggungjawaban = laporanDto.nomorLaporan;
    hibah.tanggalLaporan = new Date(laporanDto.tanggalLaporan);
    if (laporanDto.dokumenLaporan) {
      hibah.dokumenLaporan = laporanDto.dokumenLaporan;
    }
    hibah.sudahDilaporkan = true;
    hibah.statusPenggunaan = StatusHibah.DILAPORKAN;

    return await this.hibahRepository.save(hibah);
  }

  /**
   * Approve hibah
   */
  async approve(id: string, userId: string): Promise<HibahBLUD> {
    const hibah = await this.findOne(id);

    if (hibah.status !== TransactionStatus.SUBMITTED) {
      throw new BadRequestException(
        'Hanya hibah dengan status SUBMITTED yang dapat di-approve',
      );
    }

    hibah.status = TransactionStatus.APPROVED;
    hibah.approvedBy = userId;
    hibah.approvedAt = new Date();

    return await this.hibahRepository.save(hibah);
  }

  /**
   * Submit for approval
   */
  async submit(id: string): Promise<HibahBLUD> {
    const hibah = await this.findOne(id);

    if (hibah.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(
        'Hanya hibah dengan status DRAFT yang dapat di-submit',
      );
    }

    hibah.status = TransactionStatus.SUBMITTED;
    return await this.hibahRepository.save(hibah);
  }

  /**
   * Get summary statistik hibah
   */
  async getSummary(tahun?: number) {
    const queryBuilder = this.hibahRepository.createQueryBuilder('hibah');

    if (tahun) {
      queryBuilder.where('YEAR(hibah.tanggalSKHibah) = :tahun', { tahun });
    }

    // Summary by jenis hibah
    const byJenis = await queryBuilder
      .select('hibah.jenisHibah', 'jenisHibah')
      .addSelect('COUNT(hibah.id)', 'jumlah')
      .addSelect('SUM(hibah.nilaiHibah)', 'totalNilai')
      .addSelect('SUM(hibah.nilaiTerpakai)', 'totalTerpakai')
      .addSelect('SUM(hibah.sisaHibah)', 'totalSisa')
      .groupBy('hibah.jenisHibah')
      .getRawMany();

    // Summary by status
    const byStatus = await queryBuilder
      .select('hibah.statusPenggunaan', 'statusPenggunaan')
      .addSelect('COUNT(hibah.id)', 'jumlah')
      .groupBy('hibah.statusPenggunaan')
      .getRawMany();

    // Total overall
    const total = await queryBuilder
      .select('COUNT(hibah.id)', 'totalHibah')
      .addSelect('SUM(hibah.nilaiHibah)', 'totalNilaiHibah')
      .addSelect('SUM(hibah.nilaiTerpakai)', 'totalNilaiTerpakai')
      .addSelect('SUM(hibah.sisaHibah)', 'totalSisaHibah')
      .getRawOne();

    return {
      byJenis,
      byStatus,
      total,
    };
  }

  /**
   * Get tracking detail for a specific hibah
   */
  async getTrackingDetail(id: string) {
    const hibah = await this.findOne(id);

    return {
      nomorHibah: hibah.nomorHibah,
      namaPemberiHibah: hibah.namaPemberiHibah,
      jenisHibah: hibah.jenisHibah,
      nilaiHibah: hibah.nilaiHibah,
      nilaiTerpakai: hibah.nilaiTerpakai,
      sisaHibah: hibah.sisaHibah,
      persentasePenggunaan:
        hibah.nilaiHibah > 0
          ? (hibah.nilaiTerpakai / hibah.nilaiHibah) * 100
          : 0,
      statusPenggunaan: hibah.statusPenggunaan,
      sudahDilaporkan: hibah.sudahDilaporkan,
      nomorLaporan: hibah.nomorLaporanPertanggungjawaban,
      tanggalLaporan: hibah.tanggalLaporan,
    };
  }
}
