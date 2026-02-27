import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DPAService } from './dpa.service';
import {
  CreateDPADto,
  UpdateDPADto,
  QueryDPADto,
  GenerateDPAFromRBADto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('DPA/DPPA')
@Controller('dpa')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DPAController {
  constructor(private readonly dpaService: DPAService) {}

  @Get()
  @ApiOperation({ summary: 'Get all DPA/DPPA with pagination and filters' })
  @ApiResponse({ status: 200, description: 'List of DPA/DPPA' })
  findAll(@Query() query: QueryDPADto) {
    return this.dpaService.findAll(query);
  }

  @Get('active/:tahunAnggaran')
  @ApiOperation({ summary: 'Get active DPA for a specific tahun anggaran' })
  @ApiResponse({ status: 200, description: 'Active DPA' })
  @ApiResponse({ status: 404, description: 'No active DPA found' })
  getActiveDPA(@Param('tahunAnggaran') tahunAnggaran: number) {
    return this.dpaService.getActiveDPA(tahunAnggaran);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get DPA by ID with all details' })
  @ApiResponse({ status: 200, description: 'DPA detail' })
  @ApiResponse({ status: 404, description: 'DPA not found' })
  findOne(@Param('id') id: string) {
    return this.dpaService.findOne(id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get DPA summary with totals' })
  @ApiResponse({ status: 200, description: 'DPA summary' })
  getSummary(@Param('id') id: string) {
    return this.dpaService.getSummary(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get DPA audit trail history' })
  @ApiResponse({ status: 200, description: 'DPA history' })
  getHistory(@Param('id') id: string) {
    return this.dpaService.getHistory(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new DPA manually' })
  @ApiResponse({ status: 201, description: 'DPA created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'DPA already exists' })
  create(@Body() createDPADto: CreateDPADto, @Request() req) {
    return this.dpaService.create(createDPADto, req.user.sub);
  }

  @Post('generate-from-rba')
  @ApiOperation({ summary: 'Generate DPA from approved RBA' })
  @ApiResponse({ status: 201, description: 'DPA generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  generateFromRBA(@Body() dto: GenerateDPAFromRBADto, @Request() req) {
    return this.dpaService.generateFromRBA(dto, req.user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update DPA (only in DRAFT status)' })
  @ApiResponse({ status: 200, description: 'DPA updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update non-DRAFT DPA' })
  @ApiResponse({ status: 404, description: 'DPA not found' })
  update(
    @Param('id') id: string,
    @Body() updateDPADto: UpdateDPADto,
    @Request() req,
  ) {
    return this.dpaService.update(id, updateDPADto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete DPA (only in DRAFT status)' })
  @ApiResponse({ status: 200, description: 'DPA deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete non-DRAFT DPA' })
  @ApiResponse({ status: 404, description: 'DPA not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.dpaService.remove(id, req.user.sub);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit DPA for approval' })
  @ApiResponse({ status: 200, description: 'DPA submitted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot submit non-DRAFT DPA' })
  submit(@Param('id') id: string, @Request() req) {
    return this.dpaService.submit(id, req.user.sub, req.user.username);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve DPA (PPKD only)' })
  @ApiResponse({ status: 200, description: 'DPA approved successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot approve non-SUBMITTED DPA',
  })
  approve(
    @Param('id') id: string,
    @Body('catatan') catatan: string,
    @Request() req,
  ) {
    return this.dpaService.approve(id, req.user.sub, req.user.username, catatan);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject DPA' })
  @ApiResponse({ status: 200, description: 'DPA rejected successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reject non-SUBMITTED DPA' })
  reject(
    @Param('id') id: string,
    @Body('alasan') alasan: string,
    @Request() req,
  ) {
    return this.dpaService.reject(id, req.user.sub, req.user.username, alasan);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate DPA (make it the active budget)' })
  @ApiResponse({ status: 200, description: 'DPA activated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot activate non-APPROVED DPA' })
  activate(@Param('id') id: string, @Request() req) {
    return this.dpaService.activate(id, req.user.sub, req.user.username);
  }

  @Post(':id/recalculate')
  @ApiOperation({ summary: 'Recalculate DPA totals from detail tables' })
  @ApiResponse({ status: 200, description: 'Totals recalculated successfully' })
  recalculateTotals(@Param('id') id: string) {
    return this.dpaService.recalculateTotals(id);
  }
}
