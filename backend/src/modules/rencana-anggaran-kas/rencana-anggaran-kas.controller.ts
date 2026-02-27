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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RencanaAnggaranKasService } from './rencana-anggaran-kas.service';
import { CreateRencanaAnggaranKasDto, UpdateRencanaAnggaranKasDto, QueryRencanaAnggaranKasDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Rencana Anggaran Kas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rencana-anggaran-kas')
export class RencanaAnggaranKasController {
  constructor(private readonly rencanaAnggaranKasService: RencanaAnggaranKasService) {}

  @Post()
  @ApiOperation({ summary: 'Create new rencana anggaran kas' })
  @ApiResponse({ status: 201, description: 'Rencana anggaran kas created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDto: CreateRencanaAnggaranKasDto) {
    return this.rencanaAnggaranKasService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rencana anggaran kas with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of rencana anggaran kas' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QueryRencanaAnggaranKasDto) {
    return this.rencanaAnggaranKasService.findAll(queryDto);
  }

  @Get('by-year/:tahun')
  @ApiOperation({ summary: 'Get all rencana anggaran kas for specific year (12 months)' })
  @ApiParam({ name: 'tahun', example: 2024, description: 'Tahun anggaran' })
  @ApiResponse({ status: 200, description: 'List of rencana anggaran kas for the year' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByYear(@Param('tahun') tahun: string) {
    return this.rencanaAnggaranKasService.findByYear(parseInt(tahun, 10));
  }

  @Get('by-month/:tahun/:bulan')
  @ApiOperation({ summary: 'Get rencana anggaran kas for specific year and month' })
  @ApiParam({ name: 'tahun', example: 2024, description: 'Tahun anggaran' })
  @ApiParam({ name: 'bulan', example: 1, description: 'Bulan (1-12)' })
  @ApiResponse({ status: 200, description: 'Rencana anggaran kas for the month' })
  @ApiResponse({ status: 400, description: 'Invalid month (must be 1-12)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByMonth(
    @Param('tahun') tahun: string,
    @Param('bulan') bulan: string,
  ) {
    return this.rencanaAnggaranKasService.findByYearMonth(parseInt(tahun, 10), parseInt(bulan, 10));
  }

  @Get('total/:tahun/:bulan/:jenisAnggaran')
  @ApiOperation({ summary: 'Get total by type (PENERIMAAN/PENGELUARAN) for specific month' })
  @ApiParam({ name: 'tahun', example: 2024, description: 'Tahun anggaran' })
  @ApiParam({ name: 'bulan', example: 1, description: 'Bulan (1-12)' })
  @ApiParam({ name: 'jenisAnggaran', example: 'PENERIMAAN', description: 'Jenis anggaran (PENERIMAAN/PENGELUARAN)' })
  @ApiResponse({ status: 200, description: 'Total amount for the type' })
  @ApiResponse({ status: 400, description: 'Invalid month or jenis anggaran' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTotalByType(
    @Param('tahun') tahun: string,
    @Param('bulan') bulan: string,
    @Param('jenisAnggaran') jenisAnggaran: 'PENERIMAAN' | 'PENGELUARAN',
  ) {
    return this.rencanaAnggaranKasService.getTotalByType(parseInt(tahun, 10), parseInt(bulan, 10), jenisAnggaran);
  }

  @Get('cash-flow/:tahun')
  @ApiOperation({ summary: 'Get cash flow projection for the year' })
  @ApiParam({ name: 'tahun', example: 2024, description: 'Tahun anggaran' })
  @ApiResponse({ status: 200, description: 'Cash flow projection for 12 months' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCashFlowProjection(@Param('tahun') tahun: string) {
    return this.rencanaAnggaranKasService.getCashFlowProjection(parseInt(tahun, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find rencana anggaran kas by ID' })
  @ApiParam({ name: 'id', description: 'Rencana Anggaran Kas UUID' })
  @ApiResponse({ status: 200, description: 'Rencana anggaran kas found' })
  @ApiResponse({ status: 404, description: 'Rencana anggaran kas not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.rencanaAnggaranKasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update rencana anggaran kas' })
  @ApiParam({ name: 'id', description: 'Rencana Anggaran Kas UUID' })
  @ApiResponse({ status: 200, description: 'Rencana anggaran kas updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Rencana anggaran kas not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateDto: UpdateRencanaAnggaranKasDto) {
    return this.rencanaAnggaranKasService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete rencana anggaran kas' })
  @ApiParam({ name: 'id', description: 'Rencana Anggaran Kas UUID' })
  @ApiResponse({ status: 204, description: 'Rencana anggaran kas deleted' })
  @ApiResponse({ status: 404, description: 'Rencana anggaran kas not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.rencanaAnggaranKasService.remove(id);
  }
}