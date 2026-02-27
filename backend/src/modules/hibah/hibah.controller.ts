import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HibahService } from './hibah.service';
import {
  CreateHibahDto,
  UpdateHibahDto,
  FilterHibahDto,
  PenggunaanHibahDto,
  LaporanPertanggungjawabanDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/pendapatan/hibah')
@UseGuards(JwtAuthGuard)
export class HibahController {
  constructor(private readonly hibahService: HibahService) {}

  @Post()
  async create(@Body() createDto: CreateHibahDto, @Request() req) {
    return await this.hibahService.create(createDto, req.user.sub);
  }

  @Get()
  async findAll(@Query() filterDto: FilterHibahDto) {
    return await this.hibahService.findAll(filterDto);
  }

  @Get('summary')
  async getSummary(@Query('tahun') tahun?: number) {
    return await this.hibahService.getSummary(tahun ? Number(tahun) : undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.hibahService.findOne(id);
  }

  @Get(':id/tracking')
  async getTracking(@Param('id') id: string) {
    return await this.hibahService.getTrackingDetail(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateHibahDto) {
    return await this.hibahService.update(id, updateDto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  async submit(@Param('id') id: string) {
    return await this.hibahService.submit(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string, @Request() req) {
    return await this.hibahService.approve(id, req.user.sub);
  }

  @Post(':id/penggunaan')
  @HttpCode(HttpStatus.OK)
  async recordPenggunaan(
    @Param('id') id: string,
    @Body() penggunaanDto: PenggunaanHibahDto,
  ) {
    return await this.hibahService.recordPenggunaan(id, penggunaanDto);
  }

  @Post(':id/laporan-pertanggungjawaban')
  @HttpCode(HttpStatus.OK)
  async submitLaporan(
    @Param('id') id: string,
    @Body() laporanDto: LaporanPertanggungjawabanDto,
  ) {
    return await this.hibahService.submitLaporan(id, laporanDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.hibahService.remove(id);
  }
}
