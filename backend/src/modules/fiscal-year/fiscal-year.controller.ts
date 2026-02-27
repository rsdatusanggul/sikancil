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
import { FiscalYearService } from './fiscal-year.service';
import { CreateFiscalYearDto, UpdateFiscalYearDto, QueryFiscalYearDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Fiscal Years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fiscal-year')
export class FiscalYearController {
  constructor(private readonly fiscalYearService: FiscalYearService) {}

  /**
   * Public endpoint for getting fiscal years (no authentication required)
   * Used in login page for fiscal year selection
   */
  @Get('public')
  @Public() // ✅ Skip JWT validation
  @ApiOperation({ summary: 'Get all fiscal years (public)' })
  @ApiResponse({ status: 200, description: 'List of fiscal years' })
  getPublicFiscalYears() {
    return this.fiscalYearService.findAll({});
  }

  @Post()
  @ApiOperation({ summary: 'Create new fiscal year' })
  @ApiResponse({ status: 201, description: 'Fiscal year created successfully' })
  @ApiResponse({ status: 409, description: 'Fiscal year already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createDto: CreateFiscalYearDto, @Request() req) {
    return this.fiscalYearService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fiscal years with filtering' })
  @ApiResponse({ status: 200, description: 'List of fiscal years' })
  findAll(@Query() queryDto: QueryFiscalYearDto) {
    return this.fiscalYearService.findAll(queryDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get current active fiscal year' })
  @ApiResponse({ status: 200, description: 'Active fiscal year' })
  @ApiResponse({ status: 404, description: 'No active fiscal year found' })
  getActiveFiscalYear() {
    return this.fiscalYearService.getActiveFiscalYear();
  }

  @Get('open')
  @ApiOperation({ summary: 'Get all open fiscal years' })
  @ApiResponse({ status: 200, description: 'List of open fiscal years' })
  getOpenFiscalYears() {
    return this.fiscalYearService.getOpenFiscalYears();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find fiscal year by ID' })
  @ApiResponse({ status: 200, description: 'Fiscal year found' })
  @ApiResponse({ status: 404, description: 'Fiscal year not found' })
  findOne(@Param('id') id: string) {
    return this.fiscalYearService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update fiscal year' })
  @ApiResponse({ status: 200, description: 'Fiscal year updated successfully' })
  @ApiResponse({ status: 404, description: 'Fiscal year not found' })
  @ApiResponse({ status: 409, description: 'Fiscal year already exists' })
  update(@Param('id') id: string, @Body() updateDto: UpdateFiscalYearDto, @Request() req) {
    return this.fiscalYearService.update(id, updateDto, req.user.sub);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close fiscal year' })
  @ApiResponse({ status: 200, description: 'Fiscal year closed successfully' })
  @ApiResponse({ status: 404, description: 'Fiscal year not found' })
  @ApiResponse({ status: 400, description: 'Cannot close fiscal year' })
  closeFiscalYear(@Param('id') id: string) {
    return this.fiscalYearService.closeFiscalYear(id);
  }

  @Post(':id/reopen')
  @ApiOperation({ summary: 'Reopen fiscal year for adjustments' })
  @ApiResponse({ status: 200, description: 'Fiscal year reopened successfully' })
  @ApiResponse({ status: 404, description: 'Fiscal year not found' })
  @ApiResponse({ status: 400, description: 'Cannot reopen fiscal year' })
  reopenFiscalYear(@Param('id') id: string) {
    return this.fiscalYearService.reopenFiscalYear(id);
  }

  @Post(':id/lock')
  @ApiOperation({ summary: 'Lock fiscal year (prevent modifications)' })
  @ApiResponse({ status: 200, description: 'Fiscal year locked successfully' })
  @ApiResponse({ status: 404, description: 'Fiscal year not found' })
  @ApiResponse({ status: 400, description: 'Cannot lock fiscal year' })
  lockFiscalYear(@Param('id') id: string) {
    return this.fiscalYearService.lockFiscalYear(id);
  }

  @Post(':id/unlock')
  @ApiOperation({ summary: 'Unlock fiscal year' })
  @ApiResponse({ status: 200, description: 'Fiscal year unlocked successfully' })
  @ApiResponse({ status: 404, description: 'Fiscal year not found' })
  @ApiResponse({ status: 400, description: 'Cannot unlock fiscal year' })
  unlockFiscalYear(@Param('id') id: string) {
    return this.fiscalYearService.unlockFiscalYear(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate fiscal year (soft delete)' })
  @ApiResponse({ status: 204, description: 'Fiscal year deactivated' })
  @ApiResponse({ status: 404, description: 'Fiscal year not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete current or locked fiscal year' })
  remove(@Param('id') id: string) {
    return this.fiscalYearService.remove(id);
  }
}