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
import { KegiatanRbaService } from './kegiatan-rba.service';
import { CreateKegiatanRbaDto, UpdateKegiatanRbaDto, QueryKegiatanRbaDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Kegiatan RBA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kegiatan-rba')
export class KegiatanRbaController {
  constructor(private readonly kegiatanRbaService: KegiatanRbaService) {}

  @Post()
  @ApiOperation({ summary: 'Create new kegiatan RBA' })
  @ApiResponse({ status: 201, description: 'Kegiatan RBA created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid program ID or tahun mismatch' })
  @ApiResponse({ status: 409, description: 'Kegiatan code + tahun combination already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDto: CreateKegiatanRbaDto) {
    return this.kegiatanRbaService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all kegiatan RBA with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of kegiatan RBA' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QueryKegiatanRbaDto) {
    return this.kegiatanRbaService.findAll(queryDto);
  }

  @Get('years')
  @ApiOperation({ summary: 'Get available years with kegiatan data' })
  @ApiResponse({ status: 200, description: 'List of available years' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAvailableYears() {
    return this.kegiatanRbaService.getAvailableYears();
  }

  @Get('by-program/:programId')
  @ApiOperation({ summary: 'Get all kegiatan under a specific program' })
  @ApiParam({ name: 'programId', description: 'Program RBA UUID' })
  @ApiResponse({ status: 200, description: 'List of kegiatan for the program' })
  @ApiResponse({ status: 404, description: 'Program not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByProgram(@Param('programId') programId: string) {
    return this.kegiatanRbaService.findByProgram(programId);
  }

  @Get('by-year/:tahun')
  @ApiOperation({ summary: 'Get all kegiatan for specific year' })
  @ApiParam({ name: 'tahun', example: 2024, description: 'Tahun anggaran' })
  @ApiResponse({ status: 200, description: 'List of kegiatan for the year' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByYear(@Param('tahun') tahun: string) {
    return this.kegiatanRbaService.findByYear(parseInt(tahun, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find kegiatan RBA by ID' })
  @ApiParam({ name: 'id', description: 'Kegiatan RBA UUID' })
  @ApiResponse({ status: 200, description: 'Kegiatan RBA found' })
  @ApiResponse({ status: 404, description: 'Kegiatan RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.kegiatanRbaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update kegiatan RBA' })
  @ApiParam({ name: 'id', description: 'Kegiatan RBA UUID' })
  @ApiResponse({ status: 200, description: 'Kegiatan RBA updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid program ID or tahun mismatch' })
  @ApiResponse({ status: 404, description: 'Kegiatan RBA not found' })
  @ApiResponse({ status: 409, description: 'Kegiatan code + tahun combination already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateDto: UpdateKegiatanRbaDto) {
    return this.kegiatanRbaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate kegiatan RBA (soft delete)' })
  @ApiParam({ name: 'id', description: 'Kegiatan RBA UUID' })
  @ApiResponse({ status: 204, description: 'Kegiatan RBA deactivated' })
  @ApiResponse({ status: 404, description: 'Kegiatan RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.kegiatanRbaService.remove(id);
  }

  @Get(':id/pagu-info')
  @ApiOperation({ summary: 'Get pagu info for kegiatan with real-time calculation' })
  @ApiParam({ name: 'id', description: 'Kegiatan RBA UUID' })
  @ApiResponse({ status: 200, description: 'Pagu info retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Kegiatan RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getPaguInfo(@Param('id') id: string) {
    return this.kegiatanRbaService.getPaguInfo(id);
  }
}
