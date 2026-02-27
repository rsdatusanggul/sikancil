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
import { SubKegiatanRbaService } from './subkegiatan-rba.service';
import { CreateSubKegiatanRbaDto, UpdateSubKegiatanRbaDto, QuerySubKegiatanRbaDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('SubKegiatan RBA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subkegiatan-rba')
export class SubKegiatanRbaController {
  constructor(private readonly subKegiatanRbaService: SubKegiatanRbaService) {}

  @Post()
  @ApiOperation({ summary: 'Create new sub kegiatan RBA' })
  @ApiResponse({ status: 201, description: 'Sub Kegiatan RBA created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or kegiatan/unit not found' })
  @ApiResponse({ status: 409, description: 'Sub kegiatan code + tahun combination already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDto: CreateSubKegiatanRbaDto) {
    return this.subKegiatanRbaService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sub kegiatan RBA with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of sub kegiatan RBA' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QuerySubKegiatanRbaDto) {
    return this.subKegiatanRbaService.findAll(queryDto);
  }

  @Get('years')
  @ApiOperation({ summary: 'Get available years with sub kegiatan data' })
  @ApiResponse({ status: 200, description: 'List of available years' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAvailableYears() {
    return this.subKegiatanRbaService.getAvailableYears();
  }

  @Get('by-kegiatan/:kegiatanId')
  @ApiOperation({ summary: 'Get all sub kegiatan for specific kegiatan' })
  @ApiParam({ name: 'kegiatanId', description: 'Kegiatan RBA UUID' })
  @ApiResponse({ status: 200, description: 'List of sub kegiatan for the kegiatan' })
  @ApiResponse({ status: 404, description: 'Kegiatan not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByKegiatan(@Param('kegiatanId') kegiatanId: string) {
    return this.subKegiatanRbaService.findByKegiatan(kegiatanId);
  }

  @Get('by-unit/:unitKerjaId')
  @ApiOperation({ summary: 'Get all sub kegiatan for specific unit kerja' })
  @ApiParam({ name: 'unitKerjaId', description: 'Unit Kerja UUID' })
  @ApiResponse({ status: 200, description: 'List of sub kegiatan for the unit kerja' })
  @ApiResponse({ status: 404, description: 'Unit kerja not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByUnitKerja(@Param('unitKerjaId') unitKerjaId: string) {
    return this.subKegiatanRbaService.findByUnitKerja(unitKerjaId);
  }

  @Get('by-year/:tahun')
  @ApiOperation({ summary: 'Get all sub kegiatan for specific year' })
  @ApiParam({ name: 'tahun', example: 2024, description: 'Tahun anggaran' })
  @ApiResponse({ status: 200, description: 'List of sub kegiatan for the year' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByYear(@Param('tahun') tahun: string) {
    return this.subKegiatanRbaService.findByYear(parseInt(tahun, 10));
  }

  @Get(':id/calculate-pagu')
  @ApiOperation({ summary: 'Calculate and update total pagu from anggaran belanja' })
  @ApiParam({ name: 'id', description: 'Sub Kegiatan RBA UUID' })
  @ApiResponse({ status: 200, description: 'Total pagu calculated and updated' })
  @ApiResponse({ status: 404, description: 'Sub Kegiatan RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  calculateTotalPagu(@Param('id') id: string) {
    return this.subKegiatanRbaService.calculateTotalPagu(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find sub kegiatan RBA by ID' })
  @ApiParam({ name: 'id', description: 'Sub Kegiatan RBA UUID' })
  @ApiResponse({ status: 200, description: 'Sub Kegiatan RBA found' })
  @ApiResponse({ status: 404, description: 'Sub Kegiatan RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.subKegiatanRbaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sub kegiatan RBA' })
  @ApiParam({ name: 'id', description: 'Sub Kegiatan RBA UUID' })
  @ApiResponse({ status: 200, description: 'Sub Kegiatan RBA updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Sub Kegiatan RBA not found' })
  @ApiResponse({ status: 409, description: 'Sub kegiatan code + tahun combination already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateDto: UpdateSubKegiatanRbaDto) {
    return this.subKegiatanRbaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate sub kegiatan RBA (soft delete)' })
  @ApiParam({ name: 'id', description: 'Sub Kegiatan RBA UUID' })
  @ApiResponse({ status: 204, description: 'Sub Kegiatan RBA deactivated' })
  @ApiResponse({ status: 404, description: 'Sub Kegiatan RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.subKegiatanRbaService.remove(id);
  }
}
