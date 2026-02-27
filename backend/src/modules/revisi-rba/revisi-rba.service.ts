import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, IsNull } from 'typeorm';
import { RevisiRBA } from '../../database/entities/revisi-rba.entity';
import { RBA } from '../../database/entities/rba.entity';
import { CreateRevisiRbaDto, UpdateRevisiRbaDto, QueryRevisiRbaDto, ApproveRevisiDto } from './dto';

@Injectable()
export class RevisiRbaService {
  private readonly logger = new Logger(RevisiRbaService.name);

  constructor(
    @InjectRepository(RevisiRBA)
    private readonly revisiRbaRepository: Repository<RevisiRBA>,
    @InjectRepository(RBA)
    private readonly rbaRepository: Repository<RBA>,
  ) {}

  /**
   * Create new revisi RBA
   */
  async create(createDto: CreateRevisiRbaDto, userId: string): Promise<RevisiRBA> {
    this.logger.log(`Creating new Revisi RBA for RBA ID: ${createDto.rbaId}`);

    // Validate RBA exists
    const rba = await this.rbaRepository.findOne({ where: { id: createDto.rbaId } });
    if (!rba) {
      throw new BadRequestException(`RBA with ID ${createDto.rbaId} not found`);
    }

    // Get next revision number
    const lastRevisi = await this.revisiRbaRepository.findOne({
      where: { rbaId: createDto.rbaId },
      order: { revisiKe: 'DESC' },
    });

    const revisiKe = lastRevisi ? lastRevisi.revisiKe + 1 : 1;

    const revisi = this.revisiRbaRepository.create({
      ...createDto,
      revisiKe,
      tanggalRevisi: new Date(createDto.tanggalRevisi),
      createdBy: userId,
    });

    const saved = await this.revisiRbaRepository.save(revisi);
    this.logger.log(`Revisi RBA created: Revisi ke-${saved.revisiKe} for RBA ${saved.rbaId}`);

    return saved;
  }

  /**
   * Find all revisi with filtering and pagination
   */
  async findAll(queryDto: QueryRevisiRbaDto): Promise<{
    data: RevisiRBA[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { rbaId, search, approvedBy, page = 1, limit = 20 } = queryDto;

    const where: FindOptionsWhere<RevisiRBA> = {};

    if (rbaId) {
      where.rbaId = rbaId;
    }

    if (search) {
      where.alasanRevisi = Like(`%${search}%`);
    }

    if (approvedBy) {
      where.approvedBy = approvedBy;
    }

    const [data, total] = await this.revisiRbaRepository.findAndCount({
      where,
      relations: ['rba'],
      order: { tanggalRevisi: 'DESC', revisiKe: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
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
   * Find one revisi by ID
   */
  async findOne(id: string): Promise<RevisiRBA> {
    const revisi = await this.revisiRbaRepository.findOne({
      where: { id },
      relations: ['rba'],
    });

    if (!revisi) {
      throw new NotFoundException(`Revisi RBA with ID ${id} not found`);
    }

    return revisi;
  }

  /**
   * Find revisi by RBA ID
   */
  async findByRBA(rbaId: string): Promise<RevisiRBA[]> {
    return this.revisiRbaRepository.find({
      where: { rbaId },
      relations: ['rba'],
      order: { revisiKe: 'DESC' },
    });
  }

  /**
   * Find pending revisi (not approved yet)
   */
  async findPendingRevisi(): Promise<RevisiRBA[]> {
    return this.revisiRbaRepository.find({
      where: { approvedBy: IsNull() },
      relations: ['rba'],
      order: { tanggalRevisi: 'ASC' },
    });
  }

  /**
   * Update revisi (only if not approved yet)
   */
  async update(id: string, updateDto: UpdateRevisiRbaDto, userId: string): Promise<RevisiRBA> {
    const revisi = await this.findOne(id);

    // Prevent update if already approved
    if (revisi.approvedBy) {
      throw new BadRequestException('Cannot update revisi that has been approved');
    }

    // Validate RBA if being updated
    if (updateDto.rbaId && updateDto.rbaId !== revisi.rbaId) {
      const rba = await this.rbaRepository.findOne({ where: { id: updateDto.rbaId } });
      if (!rba) {
        throw new BadRequestException(`RBA with ID ${updateDto.rbaId} not found`);
      }
    }

    Object.assign(revisi, updateDto);

    if (updateDto.tanggalRevisi) {
      revisi.tanggalRevisi = new Date(updateDto.tanggalRevisi);
    }

    const updated = await this.revisiRbaRepository.save(revisi);
    this.logger.log(`Revisi RBA updated: Revisi ke-${updated.revisiKe}`);

    return updated;
  }

  /**
   * Approve revisi
   */
  async approveRevisi(id: string, userId: string, approveDto: ApproveRevisiDto): Promise<RevisiRBA> {
    const revisi = await this.findOne(id);

    if (revisi.approvedBy) {
      throw new BadRequestException('Revisi already approved');
    }

    revisi.approvedBy = userId;
    revisi.approvedAt = new Date();

    // Add approval note to perubahanData if provided
    if (approveDto.catatan) {
      revisi.perubahanData = {
        ...revisi.perubahanData,
        catatanPersetujuan: approveDto.catatan,
      };
    }

    const updated = await this.revisiRbaRepository.save(revisi);
    this.logger.log(`Revisi RBA approved: Revisi ke-${updated.revisiKe} by ${userId}`);

    return updated;
  }

  /**
   * Delete revisi (only if not approved)
   */
  async remove(id: string): Promise<void> {
    const revisi = await this.findOne(id);

    if (revisi.approvedBy) {
      throw new BadRequestException('Cannot delete approved revisi');
    }

    await this.revisiRbaRepository.remove(revisi);
    this.logger.log(`Revisi RBA deleted: Revisi ke-${revisi.revisiKe}`);
  }
}
