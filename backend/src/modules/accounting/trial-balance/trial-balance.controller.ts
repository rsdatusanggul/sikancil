import { Controller, Get, Post, Query, Param, UseGuards, Body } from '@nestjs/common';
import { TrialBalanceService } from './trial-balance.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * Trial Balance Controller
 * REST API for trial balance (neraca saldo) operations
 */
@Controller('api/v1/accounting/trial-balance')
@UseGuards(JwtAuthGuard)
export class TrialBalanceController {
  constructor(private readonly tbService: TrialBalanceService) {}

  /**
   * Get trial balance for a specific period
   * GET /api/v1/accounting/trial-balance/2024-01
   */
  @Get(':periode')
  async getTrialBalance(@Param('periode') periode: string) {
    return this.tbService.getTrialBalance(periode);
  }

  /**
   * Get trial balance grouped by account type
   * GET /api/v1/accounting/trial-balance/2024-01/grouped
   */
  @Get(':periode/grouped')
  async getTrialBalanceGrouped(@Param('periode') periode: string) {
    return this.tbService.getTrialBalanceGrouped(periode);
  }

  /**
   * Generate trial balance for a period
   * POST /api/v1/accounting/trial-balance/generate
   * Body: { "periode": "2024-01" }
   */
  @Post('generate')
  async generateTrialBalance(@Body('periode') periode: string) {
    const result = await this.tbService.generateTrialBalance(periode);
    return {
      message: `Trial balance generated successfully for period ${periode}`,
      entries: result.length,
    };
  }

  /**
   * Compare trial balance between two periods
   * GET /api/v1/accounting/trial-balance/compare?periode1=2024-01&periode2=2024-02
   */
  @Get('compare')
  async compareTrialBalance(
    @Query('periode1') periode1: string,
    @Query('periode2') periode2: string,
  ) {
    return this.tbService.compareTrialBalance(periode1, periode2);
  }

  /**
   * Get trial balance trend for multiple periods
   * GET /api/v1/accounting/trial-balance/trend?periodeMulai=2024-01&periodeAkhir=2024-12&coaIds=uuid1,uuid2
   */
  @Get('trend')
  async getTrialBalanceTrend(
    @Query('periodeMulai') periodeMulai: string,
    @Query('periodeAkhir') periodeAkhir: string,
    @Query('coaIds') coaIds?: string,
  ) {
    const coaIdArray = coaIds ? coaIds.split(',') : undefined;
    return this.tbService.getTrialBalanceTrend(periodeMulai, periodeAkhir, coaIdArray);
  }

  /**
   * Record adjustment for trial balance
   * POST /api/v1/accounting/trial-balance/adjustment
   * Body: { "periode": "2024-01", "coaId": "uuid", "adjustmentDebet": 1000, "adjustmentKredit": 0 }
   */
  @Post('adjustment')
  async recordAdjustment(
    @Body('periode') periode: string,
    @Body('coaId') coaId: string,
    @Body('adjustmentDebet') adjustmentDebet: number,
    @Body('adjustmentKredit') adjustmentKredit: number,
  ) {
    const result = await this.tbService.recordAdjustment(
      periode,
      coaId,
      adjustmentDebet,
      adjustmentKredit,
    );
    return {
      message: 'Adjustment recorded successfully',
      entry: result,
    };
  }

  /**
   * Export trial balance
   * GET /api/v1/accounting/trial-balance/2024-01/export?grouped=true
   */
  @Get(':periode/export')
  async exportTrialBalance(
    @Param('periode') periode: string,
    @Query('grouped') grouped?: string,
  ) {
    const isGrouped = grouped === 'true';
    return this.tbService.exportTrialBalance(periode, isGrouped);
  }
}
