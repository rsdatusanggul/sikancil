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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto, QuerySupplierDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Supplier')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @ApiOperation({ summary: 'Create new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  @ApiResponse({ status: 409, description: 'Supplier code or NPWP already exists' })
  create(@Body() createDto: CreateSupplierDto, @Request() req) {
    return this.supplierService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers with filtering' })
  @ApiResponse({ status: 200, description: 'List of suppliers' })
  findAll(@Query() queryDto: QuerySupplierDto) {
    return this.supplierService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active suppliers' })
  @ApiResponse({ status: 200, description: 'List of active suppliers' })
  getActiveSuppliers() {
    return this.supplierService.getActiveSuppliers();
  }

  @Get('blacklist')
  @ApiOperation({ summary: 'Get blacklisted suppliers' })
  @ApiResponse({ status: 200, description: 'List of blacklisted suppliers' })
  getBlacklistedSuppliers() {
    return this.supplierService.getBlacklistedSuppliers();
  }

  @Get('by-npwp/:npwp')
  @ApiOperation({ summary: 'Find supplier by NPWP' })
  @ApiResponse({ status: 200, description: 'Supplier found' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  findByNPWP(@Param('npwp') npwp: string) {
    return this.supplierService.findByNPWP(npwp);
  }

  @Get('by-city/:kota')
  @ApiOperation({ summary: 'Get suppliers by city' })
  @ApiResponse({ status: 200, description: 'List of suppliers in the city' })
  getSuppliersByCity(@Param('kota') kota: string) {
    return this.supplierService.getSuppliersByCity(kota);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier found' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 409, description: 'Supplier code or NPWP already exists' })
  update(@Param('id') id: string, @Body() updateDto: UpdateSupplierDto, @Request() req) {
    return this.supplierService.update(id, updateDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate supplier (soft delete)' })
  @ApiResponse({ status: 204, description: 'Supplier deactivated' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }
}
