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
import { PendapatanOperasionalService } from './pendapatan-operasional.service';
import {
  CreatePendapatanOperasionalDto,
  UpdatePendapatanOperasionalDto,
  FilterPendapatanOperasionalDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/pendapatan/operasional')
@UseGuards(JwtAuthGuard)
export class PendapatanOperasionalController {
  constructor(
    private readonly pendapatanOperasionalService: PendapatanOperasionalService,
  ) {}

  @Post()
  async create(
    @Body() createDto: CreatePendapatanOperasionalDto,
    @Request() req,
  ) {
    return await this.pendapatanOperasionalService.create(
      createDto,
      req.user.sub,
    );
  }

  @Get()
  async findAll(@Query() filterDto: FilterPendapatanOperasionalDto) {
    return await this.pendapatanOperasionalService.findAll(filterDto);
  }

  @Get('summary/by-penjamin')
  async getSummaryByPenjamin(
    @Query('tanggalMulai') tanggalMulai: string,
    @Query('tanggalAkhir') tanggalAkhir: string,
  ) {
    return await this.pendapatanOperasionalService.getSummaryByPenjamin(
      tanggalMulai,
      tanggalAkhir,
    );
  }

  @Get('summary/daily')
  async getDailyRevenue(
    @Query('tahun') tahun: number,
    @Query('bulan') bulan: number,
  ) {
    return await this.pendapatanOperasionalService.getDailyRevenue(
      Number(tahun),
      Number(bulan),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.pendapatanOperasionalService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePendapatanOperasionalDto,
  ) {
    return await this.pendapatanOperasionalService.update(id, updateDto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  async submit(@Param('id') id: string) {
    return await this.pendapatanOperasionalService.submit(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string, @Request() req) {
    return await this.pendapatanOperasionalService.approve(id, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.pendapatanOperasionalService.remove(id);
  }
}
