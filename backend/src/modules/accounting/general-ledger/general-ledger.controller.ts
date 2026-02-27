import { Controller, Get, Post, Query, Param, UseGuards, Body } from '@nestjs/common';
import { GeneralLedgerService } from './general-ledger.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * General Ledger Controller
 * REST API for general ledger (buku besar) operations
 */
@Controller('api/v1/accounting/general-ledger')
@UseGuards(JwtAuthGuard)
export class GeneralLedgerController {
  constructor(private readonly glService: GeneralLedgerService) {}

  /**
   * Get GL entries for a specific CoA
   * GET /api/v1/accounting/general-ledger/coa/:coaId?periodeMulai=2024-01&periodeAkhir=2024-12
   */
  @Get('coa/:coaId')
  async getGLByCoA(
    @Param('coaId') coaId: string,
    @Query('periodeMulai') periodeMulai?: string,
    @Query('periodeAkhir') periodeAkhir?: string,
  ) {
    return this.glService.getGLByCoA(coaId, periodeMulai, periodeAkhir);
  }

  /**
   * Get GL entries for a specific period (all CoAs)
   * GET /api/v1/accounting/general-ledger/period/2024-01
   */
  @Get('period/:periode')
  async getGLByPeriod(@Param('periode') periode: string) {
    return this.glService.getGLByPeriod(periode);
  }

  /**
   * Get GL summary with transaction details
   * GET /api/v1/accounting/general-ledger/coa/:coaId/period/:periode/details
   */
  @Get('coa/:coaId/period/:periode/details')
  async getGLSummaryWithDetails(
    @Param('coaId') coaId: string,
    @Param('periode') periode: string,
  ) {
    return this.glService.getGLSummaryWithDetails(coaId, periode);
  }

  /**
   * Get GL report for a period range
   * GET /api/v1/accounting/general-ledger/report?periodeMulai=2024-01&periodeAkhir=2024-12&coaIds=uuid1,uuid2
   */
  @Get('report')
  async getGLReport(
    @Query('periodeMulai') periodeMulai: string,
    @Query('periodeAkhir') periodeAkhir: string,
    @Query('coaIds') coaIds?: string,
  ) {
    const coaIdArray = coaIds ? coaIds.split(',') : undefined;
    return this.glService.getGLReport(periodeMulai, periodeAkhir, coaIdArray);
  }

  /**
   * Rebuild GL for a specific period
   * POST /api/v1/accounting/general-ledger/rebuild
   * Body: { "periode": "2024-01" }
   */
  @Post('rebuild')
  async rebuildGLForPeriod(@Body('periode') periode: string) {
    await this.glService.rebuildGLForPeriod(periode);
    return { message: `GL rebuilt successfully for period ${periode}` };
  }

  /**
   * Initialize new period
   * POST /api/v1/accounting/general-ledger/initialize
   * Body: { "periode": "2024-02" }
   */
  @Post('initialize')
  async initializeNewPeriod(@Body('periode') periode: string) {
    await this.glService.initializeNewPeriod(periode);
    return { message: `GL initialized successfully for period ${periode}` };
  }

  /**
   * Get account balance for a specific date
   * GET /api/v1/accounting/general-ledger/balance/:coaId?tanggal=2024-01-15
   */
  @Get('balance/:coaId')
  async getAccountBalance(
    @Param('coaId') coaId: string,
    @Query('tanggal') tanggal: string,
  ) {
    const date = tanggal ? new Date(tanggal) : new Date();
    const balance = await this.glService.getAccountBalance(coaId, date);
    return { coaId, tanggal: date, balance };
  }
}
