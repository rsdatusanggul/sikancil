import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RakSubkegiatan } from '../entities/rak-subkegiatan.entity';
import { RakDetail } from '../entities/rak-detail.entity';
import { SubKegiatanRBA } from '../../../database/entities/subkegiatan-rba.entity';

@Injectable()
export class RakValidationService {
  constructor(
    @InjectRepository(RakSubkegiatan)
    private rakRepo: Repository<RakSubkegiatan>,
    @InjectRepository(RakDetail)
    private rakDetailRepo: Repository<RakDetail>,
    @InjectRepository(SubKegiatanRBA)
    private subkegiatanRepo: Repository<SubKegiatanRBA>,
  ) {}

  async validatePaguVsSubkegiatan(
    subkegiatanId: string,
    totalPagu: number,
  ): Promise<void> {
    const subkegiatan = await this.subkegiatanRepo.findOne({
      where: { id: subkegiatanId },
    });

    if (!subkegiatan) {
      throw new BadRequestException('Subkegiatan tidak ditemukan');
    }

    if (totalPagu > subkegiatan.totalPagu) {
      throw new BadRequestException(
        `Total pagu RAK (${totalPagu}) melebihi pagu subkegiatan (${subkegiatan.totalPagu})`,
      );
    }
  }

  async validateTotalDetail(rakId: string): Promise<void> {
    const rak = await this.rakRepo.findOne({ where: { id: rakId } });

    if (!rak) {
      throw new BadRequestException('RAK tidak ditemukan');
    }

    const { totalDetail } = await this.rakDetailRepo
      .createQueryBuilder('rd')
      .select('SUM(rd.jumlah_anggaran)', 'totalDetail')
      .where('rd.rak_subkegiatan_id = :rakId', { rakId })
      .getRawOne();

    const total = parseFloat(totalDetail || '0');

    if (Math.abs(total - parseFloat(rak.total_pagu.toString())) > 0.01) {
      throw new BadRequestException(
        `Total detail (${total}) tidak sama dengan total pagu (${rak.total_pagu})`,
      );
    }
  }

  async validateMonthlyTotal(detail: {
    jumlah_anggaran: number;
    januari?: number;
    februari?: number;
    maret?: number;
    april?: number;
    mei?: number;
    juni?: number;
    juli?: number;
    agustus?: number;
    september?: number;
    oktober?: number;
    november?: number;
    desember?: number;
  }): Promise<void> {
    const monthlyTotal =
      (detail.januari || 0) +
      (detail.februari || 0) +
      (detail.maret || 0) +
      (detail.april || 0) +
      (detail.mei || 0) +
      (detail.juni || 0) +
      (detail.juli || 0) +
      (detail.agustus || 0) +
      (detail.september || 0) +
      (detail.oktober || 0) +
      (detail.november || 0) +
      (detail.desember || 0);

    if (Math.abs(monthlyTotal - detail.jumlah_anggaran) > 0.01) {
      throw new BadRequestException(
        `Total bulanan (${monthlyTotal}) tidak sama dengan jumlah anggaran (${detail.jumlah_anggaran})`,
      );
    }
  }

  async validateRakExists(rakId: string): Promise<RakSubkegiatan> {
    const rak = await this.rakRepo.findOne({
      where: { id: rakId },
      withDeleted: false,
    });

    if (!rak) {
      throw new NotFoundException('RAK tidak ditemukan');
    }

    return rak;
  }
}