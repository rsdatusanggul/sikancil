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
import { ProgramRbaService } from './program-rba.service';
import { CreateProgramRbaDto, UpdateProgramRbaDto, QueryProgramRbaDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Program RBA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('program-rba')
export class ProgramRbaController {
  constructor(private readonly programRbaService: ProgramRbaService) {}

  @Post()
  @ApiOperation({ summary: 'Create new program RBA' })
  @ApiResponse({ status: 201, description: 'Program RBA created successfully' })
  @ApiResponse({ status: 409, description: 'Program code + tahun combination already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createDto: CreateProgramRbaDto) {
    return this.programRbaService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all program RBA with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of program RBA' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QueryProgramRbaDto) {
    return this.programRbaService.findAll(queryDto);
  }

  @Get('years')
  @ApiOperation({ summary: 'Get available years with program data' })
  @ApiResponse({ status: 200, description: 'List of available years' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAvailableYears() {
    return this.programRbaService.getAvailableYears();
  }

  @Get('by-year/:tahun')
  @ApiOperation({ summary: 'Get all programs for specific year' })
  @ApiParam({ name: 'tahun', example: 2024, description: 'Tahun anggaran' })
  @ApiResponse({ status: 200, description: 'List of programs for the year' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByYear(@Param('tahun') tahun: string) {
    return this.programRbaService.findByYear(parseInt(tahun, 10));
  }

  @Get('active/:tahun')
  @ApiOperation({ summary: 'Get active programs for specific year' })
  @ApiParam({ name: 'tahun', example: 2024, description: 'Tahun anggaran' })
  @ApiResponse({ status: 200, description: 'List of active programs for the year' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getActivePrograms(@Param('tahun') tahun: string) {
    return this.programRbaService.getActivePrograms(parseInt(tahun, 10));
  }

  @Get(':id/pagu-info')
  @ApiOperation({ summary: 'Get real-time pagu info for program (pagu anggaran, pagu terpakai, sisa pagu)' })
  @ApiParam({ name: 'id', description: 'Program RBA UUID' })
  @ApiResponse({ status: 200, description: 'Pagu info retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Program RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getPaguInfo(@Param('id') id: string) {
    return this.programRbaService.getPaguInfo(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find program RBA by ID' })
  @ApiParam({ name: 'id', description: 'Program RBA UUID' })
  @ApiResponse({ status: 200, description: 'Program RBA found' })
  @ApiResponse({ status: 404, description: 'Program RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.programRbaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update program RBA' })
  @ApiParam({ name: 'id', description: 'Program RBA UUID' })
  @ApiResponse({ status: 200, description: 'Program RBA updated successfully' })
  @ApiResponse({ status: 404, description: 'Program RBA not found' })
  @ApiResponse({ status: 409, description: 'Program code + tahun combination already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateDto: UpdateProgramRbaDto) {
    return this.programRbaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate program RBA (soft delete)' })
  @ApiParam({ name: 'id', description: 'Program RBA UUID' })
  @ApiResponse({ status: 204, description: 'Program RBA deactivated' })
  @ApiResponse({ status: 404, description: 'Program RBA not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.programRbaService.remove(id);
  }
}
