import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RakService } from '../services/rak.service';
import { CreateRakDto } from '../dto/create-rak.dto';
import { UpdateRakDto } from '../dto/update-rak.dto';
import { ApproveRakDto, RejectRakDto } from '../dto/approve-rak.dto';
import { RakQueryDto } from '../dto/rak-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('RAK (Rencana Anggaran Kas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rak')
export class RakController {
  constructor(private readonly rakService: RakService) {}

  // ============================================
  // CREATE
  // ============================================

  @Post()
  @ApiOperation({ summary: 'Create new RAK' })
  @ApiResponse({
    status: 201,
    description: 'RAK created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'RAK already exists' })
  async create(@Body() createRakDto: CreateRakDto, @Req() req) {
    return this.rakService.create(createRakDto, req.user.id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create new RAK (alias)' })
  @ApiResponse({
    status: 201,
    description: 'RAK created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'RAK already exists' })
  async createAlias(@Body() createRakDto: CreateRakDto, @Req() req) {
    return this.rakService.create(createRakDto, req.user.id);
  }

  // ============================================
  // READ
  // ============================================

  @Get()
  @ApiOperation({ summary: 'Get all RAK with filters' })
  @ApiResponse({ status: 200, description: 'List of RAK' })
  async findAll(@Query() query: RakQueryDto) {
    return this.rakService.findAll(query);
  }

  @Get('years')
  @ApiOperation({ summary: 'Get available years with RAK data' })
  @ApiResponse({ status: 200, description: 'List of available years' })
  async getAvailableYears() {
    return this.rakService.getAvailableYears();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RAK by ID' })
  @ApiResponse({ status: 200, description: 'RAK found' })
  @ApiResponse({ status: 404, description: 'RAK not found' })
  async findOne(@Param('id') id: string) {
    return this.rakService.findOne(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get RAK details with kode rekening' })
  @ApiResponse({ status: 200, description: 'RAK details' })
  async getDetails(@Param('id') id: string) {
    return this.rakService.getDetails(id);
  }

  @Get('subkegiatan/:subkegiatanId/tahun/:tahun')
  @ApiOperation({ summary: 'Get RAK by Subkegiatan and Tahun' })
  @ApiResponse({ status: 200, description: 'RAK found' })
  @ApiResponse({ status: 404, description: 'RAK not found' })
  async findBySubkegiatanAndTahun(
    @Param('subkegiatanId') subkegiatanId: string,
    @Param('tahun') tahun: string,
  ) {
    return this.rakService.findBySubkegiatanAndTahun(subkegiatanId, parseInt(tahun, 10));
  }

  // ============================================
  // UPDATE
  // ============================================

  @Patch(':id')
  @ApiOperation({ summary: 'Update RAK (only DRAFT status)' })
  @ApiResponse({ status: 200, description: 'RAK updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update non-DRAFT RAK' })
  @ApiResponse({ status: 404, description: 'RAK not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRakDto: UpdateRakDto,
    @Req() req,
  ) {
    return this.rakService.update(id, updateRakDto, req.user.id);
  }

  // ============================================
  // WORKFLOW ACTIONS
  // ============================================

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit RAK for approval' })
  @ApiResponse({ status: 200, description: 'RAK submitted successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async submit(@Param('id') id: string, @Req() req) {
    return this.rakService.submit(id, req.user.id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve RAK' })
  @ApiResponse({ status: 200, description: 'RAK approved successfully' })
  @ApiResponse({ status: 400, description: 'Cannot approve' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveRakDto,
    @Req() req,
  ) {
    return this.rakService.approve(id, req.user.id, approveDto.approval_notes);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject RAK' })
  @ApiResponse({ status: 200, description: 'RAK rejected successfully' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectRakDto,
    @Req() req,
  ) {
    return this.rakService.reject(id, req.user.id, rejectDto.rejection_reason);
  }

  @Post(':id/revise')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create RAK revision' })
  @ApiResponse({ status: 200, description: 'Revision created' })
  async revise(@Param('id') id: string, @Req() req) {
    return this.rakService.createRevision(id, req.user.id);
  }

  // ============================================
  // EXPORT
  // ============================================

  @Get(':id/export/pdf')
  @ApiOperation({ summary: 'Export RAK to PDF (SIPD format)' })
  @ApiResponse({
    status: 200,
    description: 'PDF generated',
    content: { 'application/pdf': {} },
  })
  async exportPdf(@Param('id') id: string) {
    return this.rakService.exportPdf(id);
  }

  @Get(':id/export/excel')
  @ApiOperation({ summary: 'Export RAK to Excel' })
  @ApiResponse({
    status: 200,
    description: 'Excel generated',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
    },
  })
  async exportExcel(@Param('id') id: string) {
    return this.rakService.exportExcel(id);
  }

  @Get('tahun/:tahun/export/consolidation')
  @ApiOperation({ summary: 'Export consolidated RAK for all subkegiatan' })
  @ApiResponse({ status: 200, description: 'Consolidation exported' })
  async exportConsolidation(@Param('tahun') tahun: string) {
    return this.rakService.exportConsolidation(parseInt(tahun, 10));
  }

  // ============================================
  // DELETE (Soft Delete)
  // ============================================

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete RAK (soft delete)' })
  @ApiResponse({ status: 204, description: 'RAK deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete approved RAK' })
  async remove(@Param('id') id: string, @Req() req) {
    return this.rakService.softDelete(id, req.user.id);
  }
}