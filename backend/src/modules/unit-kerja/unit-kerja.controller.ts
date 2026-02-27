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
import { UnitKerjaService } from './unit-kerja.service';
import { CreateUnitKerjaDto, UpdateUnitKerjaDto, QueryUnitKerjaDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Unit Kerja')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('unit-kerja')
export class UnitKerjaController {
  constructor(private readonly unitKerjaService: UnitKerjaService) {}

  @Post()
  @ApiOperation({ summary: 'Create new unit kerja' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  @ApiResponse({ status: 409, description: 'Unit code already exists' })
  create(@Body() createDto: CreateUnitKerjaDto, @Request() req) {
    return this.unitKerjaService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all unit kerja with filtering' })
  @ApiResponse({ status: 200, description: 'List of units' })
  findAll(@Query() queryDto: QueryUnitKerjaDto) {
    return this.unitKerjaService.findAll(queryDto);
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get organizational hierarchy' })
  @ApiResponse({ status: 200, description: 'Hierarchical structure' })
  getHierarchy() {
    return this.unitKerjaService.getHierarchy();
  }

  @Get('top-level')
  @ApiOperation({ summary: 'Get top-level units' })
  @ApiResponse({ status: 200, description: 'List of top-level units' })
  getTopLevelUnits() {
    return this.unitKerjaService.getTopLevelUnits();
  }

  @Get('by-code/:kodeUnit')
  @ApiOperation({ summary: 'Find unit by code' })
  @ApiResponse({ status: 200, description: 'Unit found' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  findByCode(@Param('kodeUnit') kodeUnit: string) {
    return this.unitKerjaService.findByCode(kodeUnit);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get children of a unit' })
  @ApiResponse({ status: 200, description: 'List of child units' })
  getChildren(@Param('id') id: string) {
    return this.unitKerjaService.getChildren(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find unit by ID' })
  @ApiResponse({ status: 200, description: 'Unit found' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  findOne(@Param('id') id: string) {
    return this.unitKerjaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update unit' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateUnitKerjaDto, @Request() req) {
    return this.unitKerjaService.update(id, updateDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate unit (soft delete)' })
  @ApiResponse({ status: 204, description: 'Unit deactivated' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  remove(@Param('id') id: string) {
    return this.unitKerjaService.remove(id);
  }
}
