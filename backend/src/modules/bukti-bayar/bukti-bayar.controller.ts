import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BuktiBayarService } from './bukti-bayar.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { QrCodeService } from './services/qr-code.service';
import { TaxCalculationService } from './services/tax-calculation.service';
import { BudgetValidationService } from './services/budget-validation.service';

import {
  CreatePaymentVoucherDto,
  UpdatePaymentVoucherDto,
  QueryPaymentVoucherDto,
  ApproveTechnicalDto,
  ApproveTreasurerDto,
  ApproveFinalDto,
  RejectPaymentVoucherDto,
} from './dto';

@ApiTags('Payment Vouchers / Bukti Pembayaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payment-vouchers')
export class BuktiBayarController {
  constructor(
    private readonly service: BuktiBayarService,
    private readonly pdfSvc: PdfGeneratorService,
    private readonly qrSvc: QrCodeService,
    private readonly taxSvc: TaxCalculationService,
    private readonly budgetSvc: BudgetValidationService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════

  @Post()
  @ApiOperation({ summary: 'Buat bukti pembayaran baru' })
  @ApiResponse({ status: 201, description: 'Bukti pembayaran berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Data tidak valid atau pagu tidak mencukupi' })
  async create(@Body() dto: CreatePaymentVoucherDto, @Req() req: Request) {
    return await this.service.create(dto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar bukti pembayaran dengan filter dan pagination' })
  @ApiResponse({ status: 200, description: 'Daftar bukti pembayaran berhasil diambil' })
  async findAll(@Query() query: QueryPaymentVoucherDto, @Req() req: Request) {
    return await this.service.findAll(query, req.user);
  }

  // ═══════════════════════════════════════════════════════════
  // HELPER ENDPOINTS (must be before :id routes)
  // ═══════════════════════════════════════════════════════════

  @Get('tax-preview')
  @ApiOperation({ summary: 'Preview perhitungan pajak (helper endpoint)' })
  @ApiQuery({ name: 'accountCode', description: 'Kode rekening', example: '5.2.02.10' })
  @ApiQuery({ name: 'grossAmount', description: 'Jumlah bruto', example: 10000000 })
  @ApiQuery({ name: 'vendorNpwp', description: 'NPWP vendor (opsional)', required: false })
  @ApiResponse({ status: 200, description: 'Hasil perhitungan pajak' })
  async taxPreview(
    @Query('accountCode') accountCode: string,
    @Query('grossAmount') grossAmount: number,
    @Query('vendorNpwp') vendorNpwp?: string,
  ) {
    return await this.taxSvc.calculate({
      accountCode,
      grossAmount: Number(grossAmount),
      vendorNpwp,
    });
  }

  @Get('budget-check')
  @ApiOperation({ summary: 'Check ketersediaan anggaran (helper endpoint)' })
  @ApiQuery({ name: 'kegiatanId', description: 'ID Kegiatan' })
  @ApiQuery({ name: 'accountCode', description: 'Kode rekening' })
  @ApiQuery({ name: 'fiscalYear', description: 'Tahun anggaran', example: 2025 })
  @ApiQuery({ name: 'voucherMonth', description: 'Bulan', example: 1 })
  @ApiQuery({ name: 'grossAmount', description: 'Jumlah yang diminta', example: 5000000 })
  @ApiQuery({ name: 'subKegiatanId', description: 'ID Sub Kegiatan (opsional)', required: false })
  @ApiResponse({ status: 200, description: 'Hasil validasi anggaran' })
  async budgetCheck(
    @Query('kegiatanId') kegiatanId: string,
    @Query('accountCode') accountCode: string,
    @Query('fiscalYear') fiscalYear: number,
    @Query('voucherMonth') voucherMonth: number,
    @Query('grossAmount') grossAmount: number,
    @Query('subKegiatanId') subKegiatanId?: string,
  ) {
    return await this.budgetSvc.validate({
      kegiatanId,
      subKegiatanId,
      accountCode,
      fiscalYear: Number(fiscalYear),
      voucherMonth: Number(voucherMonth),
      grossAmount: Number(grossAmount),
    });
  }

  @Get('search-kode-rekening')
  @ApiOperation({ summary: 'Cari kode rekening (autocomplete)' })
  @ApiQuery({ name: 'q', description: 'Query pencarian (nama atau kode rekening)' })
  @ApiResponse({ status: 200, description: 'List kode rekening yang cocok' })
  async searchKodeRekening(@Query('q') query?: string) {
    // Handle empty or undefined query
    if (!query || query.trim().length === 0) {
      return [];
    }
    return await this.budgetSvc.searchKodeRekening(query.trim());
  }

  @Get('subkegiatan')
  @ApiOperation({ summary: 'Get all subkegiatan with program and kegiatan info for dropdown' })
  @ApiQuery({ name: 'tahun', description: 'Tahun anggaran', required: false })
  @ApiQuery({ name: 'search', description: 'Search by kode or nama subkegiatan', required: false })
  @ApiResponse({ status: 200, description: 'List subkegiatan dengan informasi lengkap' })
  async getSubkegiatanDropdown(
    @Query('tahun') tahun?: number,
    @Query('search') search?: string,
  ) {
    return await this.budgetSvc.getSubkegiatanDropdown(tahun, search);
  }

  // ═══════════════════════════════════════════════════════════
  // DETAIL & UPDATE OPERATIONS
  // ═══════════════════════════════════════════════════════════

  @Get(':id')
  @ApiOperation({ summary: 'Detail bukti pembayaran berdasarkan ID' })
  @ApiParam({ name: 'id', description: 'ID bukti pembayaran (UUID)' })
  @ApiResponse({ status: 200, description: 'Detail bukti pembayaran berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Bukti pembayaran tidak ditemukan' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bukti pembayaran (hanya saat status DRAFT)' })
  @ApiParam({ name: 'id', description: 'ID bukti pembayaran (UUID)' })
  @ApiResponse({ status: 200, description: 'Bukti pembayaran berhasil diupdate' })
  @ApiResponse({ status: 400, description: 'Bukti pembayaran tidak bisa diubah (status bukan DRAFT)' })
  @ApiResponse({ status: 404, description: 'Bukti pembayaran tidak ditemukan' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentVoucherDto,
    @Req() req: Request,
  ) {
    return await this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus bukti pembayaran (soft delete, hanya saat DRAFT)' })
  @ApiParam({ name: 'id', description: 'ID bukti pembayaran (UUID)' })
  @ApiResponse({ status: 204, description: 'Bukti pembayaran berhasil dihapus' })
  @ApiResponse({ status: 400, description: 'Bukti pembayaran tidak bisa dihapus (status bukan DRAFT)' })
  @ApiResponse({ status: 404, description: 'Bukti pembayaran tidak ditemukan' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    await this.service.delete(id, req.user);
  }

  // ═══════════════════════════════════════════════════════════
  // WORKFLOW ACTIONS
  // ═══════════════════════════════════════════════════════════

  @Post(':id/finalize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalisasi bukti pembayaran (DRAFT → FINAL)' })
  @ApiParam({ name: 'id', description: 'ID bukti pembayaran (UUID)' })
  @ApiResponse({ status: 200, description: 'Bukti pembayaran berhasil difinalisasi' })
  @ApiResponse({ status: 400, description: 'Bukti pembayaran tidak bisa difinalisasi' })
  async finalize(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return await this.service.finalize(id, req.user);
  }

  // ═══════════════════════════════════════════════════════════
  // PDF & QR CODE
  // ═══════════════════════════════════════════════════════════

  @Get(':id/print')
  @ApiOperation({ summary: 'Generate dan download PDF bukti pembayaran' })
  @ApiParam({ name: 'id', description: 'ID bukti pembayaran (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'PDF berhasil digenerate',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({ status: 404, description: 'Bukti pembayaran tidak ditemukan' })
  async print(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    // Get voucher with relations
    const voucher = await this.service.findOne(id);

    // Generate QR code
    const qrCode = await this.qrSvc.generateForVoucher(voucher);

    // Generate PDF
    const pdfBytes = await this.pdfSvc.generate(voucher, qrCode);

    // Set response headers
    const filename = `BP_${voucher.voucherNumber.replace(/\//g, '-')}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBytes.length,
    });

    res.end(pdfBytes);
  }
}

/**
 * PUBLIC CONTROLLER untuk QR verification (tanpa auth)
 */
@ApiTags('Public - QR Verification')
@Controller('payment-vouchers')
export class BuktiBayarPublicController {
  constructor(private readonly qrSvc: QrCodeService) {}

  @Get('verify/:shortCode')
  @ApiOperation({ summary: 'Verifikasi QR code bukti pembayaran (PUBLIC - no auth)' })
  @ApiParam({ name: 'shortCode', description: 'Short code dari QR (8 karakter hex)' })
  @ApiResponse({ status: 200, description: 'Hasil verifikasi QR code' })
  async verify(@Param('shortCode') shortCode: string) {
    return await this.qrSvc.verify(shortCode);
  }
}