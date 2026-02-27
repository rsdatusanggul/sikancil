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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PegawaiService } from './pegawai.service';
import { CreatePegawaiDto, UpdatePegawaiDto, QueryPegawaiDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Pegawai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pegawai')
export class PegawaiController {
  constructor(private readonly pegawaiService: PegawaiService) {}

  @Post()
  @ApiOperation({ summary: 'Create new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 409, description: 'NIP already exists' })
  @ApiResponse({ status: 400, description: 'Unit Kerja not found' })
  create(@Body() createDto: CreatePegawaiDto, @Request() req) {
    return this.pegawaiService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees with filtering' })
  @ApiResponse({ status: 200, description: 'List of employees' })
  findAll(@Query() queryDto: QueryPegawaiDto) {
    return this.pegawaiService.findAll(queryDto);
  }

  @Get('by-nip/:nip')
  @ApiOperation({ summary: 'Find employee by NIP' })
  @ApiResponse({ status: 200, description: 'Employee found' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findByNIP(@Param('nip') nip: string) {
    return this.pegawaiService.findByNIP(nip);
  }

  @Get('by-unit/:unitKerjaId')
  @ApiOperation({ summary: 'Find employees by Unit Kerja' })
  @ApiResponse({ status: 200, description: 'List of employees in the unit' })
  @ApiResponse({ status: 404, description: 'Unit Kerja not found' })
  findByUnitKerja(@Param('unitKerjaId') unitKerjaId: string) {
    return this.pegawaiService.findByUnitKerja(unitKerjaId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active employees' })
  @ApiResponse({ status: 200, description: 'List of active employees' })
  getActiveEmployees() {
    return this.pegawaiService.getActiveEmployees();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee found' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id') id: string) {
    return this.pegawaiService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'NIP already exists' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePegawaiDto, @Request() req) {
    return this.pegawaiService.update(id, updateDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate employee (soft delete)' })
  @ApiResponse({ status: 204, description: 'Employee deactivated' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  remove(@Param('id') id: string) {
    return this.pegawaiService.remove(id);
  }
}
