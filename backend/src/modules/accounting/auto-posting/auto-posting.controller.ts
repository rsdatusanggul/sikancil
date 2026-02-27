import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AutoPostingService } from './auto-posting.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * DTO for manual auto-posting
 */
class ManualAutoPostDto {
  sourceType: string;
  sourceId: string;
  transactionData: any;
}

/**
 * Auto-Posting Controller
 * Provides API endpoints for manual auto-posting triggers
 * Mainly for testing and administrative purposes
 */
@Controller('api/v1/accounting/auto-posting')
@UseGuards(JwtAuthGuard)
export class AutoPostingController {
  constructor(private readonly autoPostingService: AutoPostingService) {}

  /**
   * Manual trigger for auto-posting
   * Use this endpoint for testing or re-posting transactions
   *
   * POST /api/v1/accounting/auto-posting/manual
   * Body: {
   *   "sourceType": "PENDAPATAN_JASA_LAYANAN",
   *   "sourceId": "uuid-here",
   *   "transactionData": {
   *     "tanggal": "2024-01-15",
   *     "uraian": "Pendapatan Jasa Layanan Rawat Inap",
   *     "jumlah": 1000000
   *   }
   * }
   */
  @Post('manual')
  async manualAutoPost(@Body() dto: ManualAutoPostDto) {
    return this.autoPostingService.manualAutoPost(
      dto.sourceType,
      dto.sourceId,
      dto.transactionData,
    );
  }
}
