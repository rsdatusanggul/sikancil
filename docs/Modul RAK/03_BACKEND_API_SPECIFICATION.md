# 🔧 Backend API Specification - RAK Module

## 📋 Overview

Dokumentasi lengkap untuk backend implementation RAK Module menggunakan NestJS, termasuk module structure, controllers, services, DTOs, dan business logic.

---

## 🏗️ Module Structure

```
src/modules/rak/
├── controllers/
│   └── rak.controller.ts
├── services/
│   ├── rak.service.ts
│   └── rak-validation.service.ts
├── entities/
│   ├── rak-subkegiatan.entity.ts
│   └── rak-detail.entity.ts
├── dto/
│   ├── create-rak.dto.ts
│   ├── update-rak.dto.ts
│   ├── create-rak-detail.dto.ts
│   ├── update-rak-detail.dto.ts
│   ├── approve-rak.dto.ts
│   └── rak-query.dto.ts
├── interfaces/
│   └── rak.interface.ts
├── guards/
│   └── rak-permission.guard.ts
└── rak.module.ts
```

---

## 📦 Module Definition

### **rak.module.ts**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RakController } from './controllers/rak.controller';
import { RakService } from './services/rak.service';
import { RakValidationService } from './services/rak-validation.service';
import { RakSubkegiatan } from './entities/rak-subkegiatan.entity';
import { RakDetail } from './entities/rak-detail.entity';
import { SubkegiatanModule } from '../subkegiatan/subkegiatan.module';
import { KodeRekeningModule } from '../kode-rekening/kode-rekening.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RakSubkegiatan, RakDetail]),
    SubkegiatanModule,
    KodeRekeningModule,
  ],
  controllers: [RakController],
  providers: [RakService, RakValidationService],
  exports: [RakService],
})
export class RakModule {}
```

---

## 🗂️ Entity Definitions

### **rak-subkegiatan.entity.ts**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Subkegiatan } from '../subkegiatan/entities/subkegiatan.entity';
import { User } from '../users/entities/user.entity';
import { RakDetail } from './rak-detail.entity';

export enum RakStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISED = 'REVISED',
}

@Entity('rak_subkegiatan')
export class RakSubkegiatan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  subkegiatan_id: string;

  @Column('integer')
  tahun_anggaran: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  total_pagu: number;

  @Column({
    type: 'enum',
    enum: RakStatus,
    default: RakStatus.DRAFT,
  })
  status: RakStatus;

  @Column('integer', { default: 1 })
  revision_number: number;

  @Column('uuid', { nullable: true })
  previous_version_id: string;

  // Submission
  @Column('timestamp', { nullable: true })
  submitted_at: Date;

  @Column('uuid', { nullable: true })
  submitted_by: string;

  // Approval
  @Column('timestamp', { nullable: true })
  approved_at: Date;

  @Column('uuid', { nullable: true })
  approved_by: string;

  @Column('text', { nullable: true })
  approval_notes: string;

  // Rejection
  @Column('timestamp', { nullable: true })
  rejected_at: Date;

  @Column('uuid', { nullable: true })
  rejected_by: string;

  @Column('text', { nullable: true })
  rejection_reason: string;

  // Metadata
  @CreateDateColumn()
  created_at: Date;

  @Column('uuid', { nullable: true })
  created_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('uuid', { nullable: true })
  updated_by: string;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column('uuid', { nullable: true })
  deleted_by: string;

  // Relations
  @ManyToOne(() => Subkegiatan, { eager: true })
  @JoinColumn({ name: 'subkegiatan_id' })
  subkegiatan: Subkegiatan;

  @OneToMany(() => RakDetail, (detail) => detail.rak_subkegiatan, {
    cascade: true,
  })
  details: RakDetail[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver: User;
}
```

### **rak-detail.entity.ts**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RakSubkegiatan } from './rak-subkegiatan.entity';
import { KodeRekening } from '../kode-rekening/entities/kode-rekening.entity';
import { User } from '../users/entities/user.entity';

@Entity('rak_detail')
export class RakDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  rak_subkegiatan_id: string;

  @Column('uuid')
  kode_rekening_id: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  jumlah_anggaran: number;

  // Monthly breakdown
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  januari: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  februari: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  maret: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  april: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  mei: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  juni: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  juli: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  agustus: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  september: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  oktober: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  november: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  desember: number;

  // Generated columns (calculated by DB)
  @Column('decimal', { precision: 15, scale: 2, select: false })
  semester_1: number;

  @Column('decimal', { precision: 15, scale: 2, select: false })
  semester_2: number;

  @Column('decimal', { precision: 15, scale: 2, select: false })
  triwulan_1: number;

  @Column('decimal', { precision: 15, scale: 2, select: false })
  triwulan_2: number;

  @Column('decimal', { precision: 15, scale: 2, select: false })
  triwulan_3: number;

  @Column('decimal', { precision: 15, scale: 2, select: false })
  triwulan_4: number;

  // Metadata
  @CreateDateColumn()
  created_at: Date;

  @Column('uuid', { nullable: true })
  created_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('uuid', { nullable: true })
  updated_by: string;

  // Relations
  @ManyToOne(() => RakSubkegiatan, (rak) => rak.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rak_subkegiatan_id' })
  rak_subkegiatan: RakSubkegiatan;

  @ManyToOne(() => KodeRekening, { eager: true })
  @JoinColumn({ name: 'kode_rekening_id' })
  kode_rekening: KodeRekening;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
```

---

## 📝 DTOs (Data Transfer Objects)

### **create-rak.dto.ts**

```typescript
import {
  IsUUID,
  IsInt,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateRakDetailDto } from './create-rak-detail.dto';

export class CreateRakDto {
  @ApiProperty({ description: 'UUID Subkegiatan' })
  @IsUUID()
  subkegiatan_id: string;

  @ApiProperty({ description: 'Tahun Anggaran', example: 2025 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  tahun_anggaran: number;

  @ApiProperty({ description: 'Total Pagu Anggaran', example: 48000000 })
  @IsNumber()
  @Min(0)
  total_pagu: number;

  @ApiPropertyOptional({
    description: 'Array of RAK Details',
    type: [CreateRakDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRakDetailDto)
  @IsOptional()
  details?: CreateRakDetailDto[];
}
```

### **create-rak-detail.dto.ts**

```typescript
import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRakDetailDto {
  @ApiProperty({ description: 'UUID Kode Rekening' })
  @IsUUID()
  kode_rekening_id: string;

  @ApiProperty({ description: 'Jumlah Anggaran Tahunan', example: 30000000 })
  @IsNumber()
  @Min(0)
  jumlah_anggaran: number;

  @ApiPropertyOptional({ description: 'Rencana Januari', example: 2500000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  januari?: number;

  @ApiPropertyOptional({ description: 'Rencana Februari' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  februari?: number;

  @ApiPropertyOptional({ description: 'Rencana Maret' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maret?: number;

  @ApiPropertyOptional({ description: 'Rencana April' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  april?: number;

  @ApiPropertyOptional({ description: 'Rencana Mei' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  mei?: number;

  @ApiPropertyOptional({ description: 'Rencana Juni' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  juni?: number;

  @ApiPropertyOptional({ description: 'Rencana Juli' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  juli?: number;

  @ApiPropertyOptional({ description: 'Rencana Agustus' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  agustus?: number;

  @ApiPropertyOptional({ description: 'Rencana September' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  september?: number;

  @ApiPropertyOptional({ description: 'Rencana Oktober' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  oktober?: number;

  @ApiPropertyOptional({ description: 'Rencana November' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  november?: number;

  @ApiPropertyOptional({ description: 'Rencana Desember' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  desember?: number;
}
```

### **approve-rak.dto.ts**

```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveRakDto {
  @ApiPropertyOptional({
    description: 'Catatan persetujuan',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  approval_notes?: string;
}

export class RejectRakDto {
  @ApiPropertyOptional({
    description: 'Alasan penolakan',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  rejection_reason: string;
}
```

### **rak-query.dto.ts**

```typescript
import {
  IsOptional,
  IsInt,
  IsEnum,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RakStatus } from '../entities/rak-subkegiatan.entity';

export class RakQueryDto {
  @ApiPropertyOptional({ description: 'Tahun Anggaran', example: 2025 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  @IsOptional()
  tahun_anggaran?: number;

  @ApiPropertyOptional({
    description: 'UUID Subkegiatan',
  })
  @IsUUID()
  @IsOptional()
  subkegiatan_id?: string;

  @ApiPropertyOptional({
    enum: RakStatus,
    description: 'Status RAK',
  })
  @IsEnum(RakStatus)
  @IsOptional()
  status?: RakStatus;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
```

---

## 🎮 Controller

### **rak.controller.ts**

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RakService } from '../services/rak.service';
import { CreateRakDto } from '../dto/create-rak.dto';
import { UpdateRakDto } from '../dto/update-rak.dto';
import { ApproveRakDto, RejectRakDto } from '../dto/approve-rak.dto';
import { RakQueryDto } from '../dto/rak-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RakPermissionGuard } from '../guards/rak-permission.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('RAK (Rencana Anggaran Kas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/rak')
export class RakController {
  constructor(private readonly rakService: RakService) {}

  // ============================================
  // CREATE
  // ============================================

  @Post()
  @Roles(UserRole.PPTK, UserRole.ADMIN_KEUANGAN)
  @ApiOperation({ summary: 'Create new RAK' })
  @ApiResponse({
    status: 201,
    description: 'RAK created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'RAK already exists' })
  async create(@Body() createRakDto: CreateRakDto, @Req() req) {
    return this.rakService.create(createRakDto, req.user.id);
  }

  // ============================================
  // READ
  // ============================================

  @Get()
  @ApiOperation({ summary: 'Get all RAK with filters' })
  @ApiResponse({ status: 200, description: 'List of RAK' })
  async findAll(@Query() query: RakQueryDto) {
    return this.rakService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RAK by ID' })
  @ApiResponse({ status: 200, description: 'RAK found' })
  @ApiResponse({ status: 404, description: 'RAK not found' })
  async findOne(@Param('id') id: string) {
    return this.rakService.findOne(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get RAK details with kode rekening' })
  @ApiResponse({ status: 200, description: 'RAK details' })
  async getDetails(@Param('id') id: string) {
    return this.rakService.getDetails(id);
  }

  @Get('subkegiatan/:subkegiatanId/tahun/:tahun')
  @ApiOperation({ summary: 'Get RAK by Subkegiatan and Tahun' })
  @ApiResponse({ status: 200, description: 'RAK found' })
  @ApiResponse({ status: 404, description: 'RAK not found' })
  async findBySubkegiatanAndTahun(
    @Param('subkegiatanId') subkegiatanId: string,
    @Param('tahun') tahun: number,
  ) {
    return this.rakService.findBySubkegiatanAndTahun(subkegiatanId, tahun);
  }

  // ============================================
  // UPDATE
  // ============================================

  @Patch(':id')
  @Roles(UserRole.PPTK, UserRole.ADMIN_KEUANGAN)
  @UseGuards(RakPermissionGuard)
  @ApiOperation({ summary: 'Update RAK (only DRAFT status)' })
  @ApiResponse({ status: 200, description: 'RAK updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update non-DRAFT RAK' })
  @ApiResponse({ status: 404, description: 'RAK not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRakDto: UpdateRakDto,
    @Req() req,
  ) {
    return this.rakService.update(id, updateRakDto, req.user.id);
  }

  // ============================================
  // WORKFLOW ACTIONS
  // ============================================

  @Post(':id/submit')
  @Roles(UserRole.PPTK)
  @UseGuards(RakPermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit RAK for approval' })
  @ApiResponse({ status: 200, description: 'RAK submitted successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async submit(@Param('id') id: string, @Req() req) {
    return this.rakService.submit(id, req.user.id);
  }

  @Post(':id/approve')
  @Roles(UserRole.VERIFIKATOR, UserRole.ADMIN_KEUANGAN, UserRole.PPKD)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve RAK' })
  @ApiResponse({ status: 200, description: 'RAK approved successfully' })
  @ApiResponse({ status: 400, description: 'Cannot approve' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveRakDto,
    @Req() req,
  ) {
    return this.rakService.approve(id, req.user.id, approveDto.approval_notes);
  }

  @Post(':id/reject')
  @Roles(UserRole.VERIFIKATOR, UserRole.ADMIN_KEUANGAN, UserRole.PPKD)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject RAK' })
  @ApiResponse({ status: 200, description: 'RAK rejected successfully' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectRakDto,
    @Req() req,
  ) {
    return this.rakService.reject(
      id,
      req.user.id,
      rejectDto.rejection_reason,
    );
  }

  @Post(':id/revise')
  @Roles(UserRole.PPTK)
  @UseGuards(RakPermissionGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create RAK revision' })
  @ApiResponse({ status: 200, description: 'Revision created' })
  async revise(@Param('id') id: string, @Req() req) {
    return this.rakService.createRevision(id, req.user.id);
  }

  // ============================================
  // EXPORT
  // ============================================

  @Get(':id/export/pdf')
  @ApiOperation({ summary: 'Export RAK to PDF (SIPD format)' })
  @ApiResponse({
    status: 200,
    description: 'PDF generated',
    content: { 'application/pdf': {} },
  })
  async exportPdf(@Param('id') id: string) {
    return this.rakService.exportPdf(id);
  }

  @Get(':id/export/excel')
  @ApiOperation({ summary: 'Export RAK to Excel' })
  @ApiResponse({
    status: 200,
    description: 'Excel generated',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
    },
  })
  async exportExcel(@Param('id') id: string) {
    return this.rakService.exportExcel(id);
  }

  @Get('tahun/:tahun/export/consolidation')
  @ApiOperation({ summary: 'Export consolidated RAK for all subkegiatan' })
  @ApiResponse({ status: 200, description: 'Consolidation exported' })
  async exportConsolidation(@Param('tahun') tahun: number) {
    return this.rakService.exportConsolidation(tahun);
  }

  // ============================================
  // DELETE (Soft Delete)
  // ============================================

  @Delete(':id')
  @Roles(UserRole.ADMIN_KEUANGAN)
  @UseGuards(RakPermissionGuard)
  @ApiOperation({ summary: 'Delete RAK (soft delete)' })
  @ApiResponse({ status: 200, description: 'RAK deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete approved RAK' })
  async remove(@Param('id') id: string, @Req() req) {
    return this.rakService.softDelete(id, req.user.id);
  }
}
```

---

## 🔧 Service

### **rak.service.ts** (Core Methods)

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RakSubkegiatan, RakStatus } from '../entities/rak-subkegiatan.entity';
import { RakDetail } from '../entities/rak-detail.entity';
import { CreateRakDto } from '../dto/create-rak.dto';
import { UpdateRakDto } from '../dto/update-rak.dto';
import { RakQueryDto } from '../dto/rak-query.dto';
import { RakValidationService } from './rak-validation.service';

@Injectable()
export class RakService {
  constructor(
    @InjectRepository(RakSubkegiatan)
    private rakRepo: Repository<RakSubkegiatan>,
    @InjectRepository(RakDetail)
    private rakDetailRepo: Repository<RakDetail>,
    private validationService: RakValidationService,
  ) {}

  // ============================================
  // CREATE
  // ============================================

  async create(createRakDto: CreateRakDto, userId: string) {
    // Check if RAK already exists
    const existing = await this.rakRepo.findOne({
      where: {
        subkegiatan_id: createRakDto.subkegiatan_id,
        tahun_anggaran: createRakDto.tahun_anggaran,
      },
    });

    if (existing) {
      throw new ConflictException(
        'RAK untuk subkegiatan dan tahun ini sudah ada',
      );
    }

    // Validate total_pagu vs subkegiatan.pagu
    await this.validationService.validatePaguVsSubkegiatan(
      createRakDto.subkegiatan_id,
      createRakDto.total_pagu,
    );

    // Create RAK header
    const rak = this.rakRepo.create({
      ...createRakDto,
      created_by: userId,
      updated_by: userId,
    });

    const saved = await this.rakRepo.save(rak);

    // Create details if provided
    if (createRakDto.details && createRakDto.details.length > 0) {
      const details = createRakDto.details.map((d) =>
        this.rakDetailRepo.create({
          ...d,
          rak_subkegiatan_id: saved.id,
          created_by: userId,
          updated_by: userId,
        }),
      );

      await this.rakDetailRepo.save(details);
    }

    return this.findOne(saved.id);
  }

  // ============================================
  // READ
  // ============================================

  async findAll(query: RakQueryDto) {
    const { tahun_anggaran, subkegiatan_id, status, page, limit } = query;

    const qb = this.rakRepo
      .createQueryBuilder('rak')
      .leftJoinAndSelect('rak.subkegiatan', 'subkegiatan')
      .leftJoinAndSelect('rak.creator', 'creator')
      .leftJoinAndSelect('rak.approver', 'approver')
      .where('rak.deleted_at IS NULL');

    if (tahun_anggaran) {
      qb.andWhere('rak.tahun_anggaran = :tahun', { tahun: tahun_anggaran });
    }

    if (subkegiatan_id) {
      qb.andWhere('rak.subkegiatan_id = :subkegiatanId', { subkegiatan_id });
    }

    if (status) {
      qb.andWhere('rak.status = :status', { status });
    }

    const [data, total] = await qb
      .orderBy('rak.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

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

  async findOne(id: string) {
    const rak = await this.rakRepo.findOne({
      where: { id, deleted_at: null },
      relations: ['subkegiatan', 'details', 'details.kode_rekening'],
    });

    if (!rak) {
      throw new NotFoundException('RAK tidak ditemukan');
    }

    return rak;
  }

  async getDetails(id: string) {
    const rak = await this.findOne(id);

    return {
      id: rak.id,
      subkegiatan: rak.subkegiatan,
      tahun_anggaran: rak.tahun_anggaran,
      total_pagu: rak.total_pagu,
      status: rak.status,
      details: rak.details.map((d) => ({
        id: d.id,
        kode_rekening: d.kode_rekening,
        jumlah_anggaran: d.jumlah_anggaran,
        monthly: {
          januari: d.januari,
          februari: d.februari,
          maret: d.maret,
          april: d.april,
          mei: d.mei,
          juni: d.juni,
          juli: d.juli,
          agustus: d.agustus,
          september: d.september,
          oktober: d.oktober,
          november: d.november,
          desember: d.desember,
        },
      })),
    };
  }

  // ============================================
  // UPDATE
  // ============================================

  async update(id: string, updateRakDto: UpdateRakDto, userId: string) {
    const rak = await this.findOne(id);

    if (rak.status !== RakStatus.DRAFT) {
      throw new BadRequestException('Hanya RAK berstatus DRAFT yang bisa diubah');
    }

    Object.assign(rak, updateRakDto);
    rak.updated_by = userId;

    return this.rakRepo.save(rak);
  }

  // ============================================
  // WORKFLOW
  // ============================================

  async submit(id: string, userId: string) {
    const rak = await this.findOne(id);

    if (rak.status !== RakStatus.DRAFT) {
      throw new BadRequestException('Hanya RAK DRAFT yang bisa disubmit');
    }

    // Validate total detail = total pagu
    await this.validationService.validateTotalDetail(id);

    rak.status = RakStatus.SUBMITTED;
    rak.submitted_at = new Date();
    rak.submitted_by = userId;
    rak.updated_by = userId;

    return this.rakRepo.save(rak);
  }

  async approve(id: string, userId: string, notes?: string) {
    const rak = await this.findOne(id);

    if (rak.status !== RakStatus.SUBMITTED) {
      throw new BadRequestException('Hanya RAK SUBMITTED yang bisa diapprove');
    }

    rak.status = RakStatus.APPROVED;
    rak.approved_at = new Date();
    rak.approved_by = userId;
    rak.approval_notes = notes;
    rak.updated_by = userId;

    return this.rakRepo.save(rak);
  }

  async reject(id: string, userId: string, reason: string) {
    const rak = await this.findOne(id);

    if (rak.status !== RakStatus.SUBMITTED) {
      throw new BadRequestException('Hanya RAK SUBMITTED yang bisa direject');
    }

    rak.status = RakStatus.REJECTED;
    rak.rejected_at = new Date();
    rak.rejected_by = userId;
    rak.rejection_reason = reason;
    rak.updated_by = userId;

    return this.rakRepo.save(rak);
  }

  // ... other methods (export, soft delete, etc.)
}
```

---

## ✅ Validation Service

### **rak-validation.service.ts**

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RakSubkegiatan } from '../entities/rak-subkegiatan.entity';
import { RakDetail } from '../entities/rak-detail.entity';
import { Subkegiatan } from '../../subkegiatan/entities/subkegiatan.entity';

@Injectable()
export class RakValidationService {
  constructor(
    @InjectRepository(RakSubkegiatan)
    private rakRepo: Repository<RakSubkegiatan>,
    @InjectRepository(RakDetail)
    private rakDetailRepo: Repository<RakDetail>,
    @InjectRepository(Subkegiatan)
    private subkegiatanRepo: Repository<Subkegiatan>,
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

    if (totalPagu > subkegiatan.pagu) {
      throw new BadRequestException(
        `Total pagu RAK (${totalPagu}) melebihi pagu subkegiatan (${subkegiatan.pagu})`,
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
    januari: number;
    februari: number;
    maret: number;
    april: number;
    mei: number;
    juni: number;
    juli: number;
    agustus: number;
    september: number;
    oktober: number;
    november: number;
    desember: number;
  }): Promise<void> {
    const monthlyTotal =
      detail.januari +
      detail.februari +
      detail.maret +
      detail.april +
      detail.mei +
      detail.juni +
      detail.juli +
      detail.agustus +
      detail.september +
      detail.oktober +
      detail.november +
      detail.desember;

    if (Math.abs(monthlyTotal - detail.jumlah_anggaran) > 0.01) {
      throw new BadRequestException(
        `Total bulanan (${monthlyTotal}) tidak sama dengan jumlah anggaran (${detail.jumlah_anggaran})`,
      );
    }
  }
}
```

---

## 📊 API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/rak` | Create RAK | PPTK, Admin |
| GET | `/api/rak` | Get all RAK | All |
| GET | `/api/rak/:id` | Get RAK by ID | All |
| GET | `/api/rak/:id/details` | Get RAK details | All |
| GET | `/api/rak/subkegiatan/:id/tahun/:tahun` | Get by Subkegiatan | All |
| PATCH | `/api/rak/:id` | Update RAK | PPTK, Admin |
| POST | `/api/rak/:id/submit` | Submit for approval | PPTK |
| POST | `/api/rak/:id/approve` | Approve RAK | Verifikator, PPKD |
| POST | `/api/rak/:id/reject` | Reject RAK | Verifikator, PPKD |
| POST | `/api/rak/:id/revise` | Create revision | PPTK |
| GET | `/api/rak/:id/export/pdf` | Export to PDF | All |
| GET | `/api/rak/:id/export/excel` | Export to Excel | All |
| GET | `/api/rak/tahun/:tahun/export/consolidation` | Consolidated export | All |
| DELETE | `/api/rak/:id` | Soft delete | Admin |

---

**Backend Owner:** Backend Team  
**Review Date:** 2025-02-17  
**Status:** ✅ Ready for Implementation
