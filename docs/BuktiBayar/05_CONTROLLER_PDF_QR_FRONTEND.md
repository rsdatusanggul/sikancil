# 05 - Controller, PDF, QR Code & Frontend
## Modul Bukti Pembayaran | SI-KANCIL

---

## 5.1 REST Controller

**File:** `bukti-bayar.controller.ts`

```typescript
import {
  Controller, Get, Post, Put, Delete, Param, Body,
  Query, UseGuards, ParseUUIDPipe, Res, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard }  from '@/common/guards/jwt-auth.guard';
import { RolesGuard }    from '@/common/guards/roles.guard';
import { Roles }         from '@/common/decorators/roles.decorator';
import { CurrentUser }   from '@/common/decorators/user.decorator';

import { BuktiBayarService }    from './bukti-bayar.service';
import { PdfGeneratorService }  from './services/pdf-generator.service';
import { QrCodeService }        from './services/qr-code.service';

import { CreatePaymentVoucherDto }  from './dto/create-payment-voucher.dto';
import { QueryPaymentVoucherDto }   from './dto/query-payment-voucher.dto';
import {
  ApproveTechnicalDto, ApproveTreasurerDto,
  ApproveFinalDto, RejectPaymentVoucherDto,
} from './dto/approve-payment-voucher.dto';

@ApiTags('Bukti Pembayaran')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/payment-vouchers')
export class BuktiBayarController {
  constructor(
    private readonly svc: BuktiBayarService,
    private readonly pdfSvc: PdfGeneratorService,
    private readonly qrSvc: QrCodeService,
  ) {}

  // ── CRUD ──────────────────────────────────────────────────────

  @Post()
  @Roles('PPTK', 'ADMIN')
  @ApiOperation({ summary: 'Buat Bukti Pembayaran baru' })
  create(@Body() dto: CreatePaymentVoucherDto, @CurrentUser() user: any) {
    return this.svc.create(dto, user);
  }

  @Get()
  @Roles('PPTK', 'TECHNICAL_OFFICER', 'TREASURER', 'DIRECTOR', 'ADMIN')
  @ApiOperation({ summary: 'Daftar Bukti Pembayaran' })
  findAll(@Query() query: QueryPaymentVoucherDto, @CurrentUser() user: any) {
    return this.svc.findAll(query, user);
  }

  @Get(':id')
  @Roles('PPTK', 'TECHNICAL_OFFICER', 'TREASURER', 'DIRECTOR', 'ADMIN')
  @ApiOperation({ summary: 'Detail Bukti Pembayaran' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  @Delete(':id')
  @Roles('PPTK', 'ADMIN')
  @ApiOperation({ summary: 'Hapus Bukti Pembayaran (hanya DRAFT)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.svc.remove(id, user);
  }

  // ── WORKFLOW ──────────────────────────────────────────────────

  @Post(':id/submit')
  @Roles('PPTK')
  @ApiOperation({ summary: 'PPTK submit Bukti Pembayaran untuk approval' })
  submit(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.svc.submit(id, user);
  }

  @Post(':id/approve-technical')
  @Roles('TECHNICAL_OFFICER', 'ADMIN')
  @ApiOperation({ summary: 'Pejabat Teknis setujui Bukti Pembayaran' })
  approveTechnical(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveTechnicalDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.approveTechnical(id, dto, user);
  }

  @Post(':id/approve-treasurer')
  @Roles('TREASURER', 'ADMIN')
  @ApiOperation({ summary: 'Bendahara setujui Bukti Pembayaran' })
  approveTreasurer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveTreasurerDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.approveTreasurer(id, dto, user);
  }

  @Post(':id/approve-final')
  @Roles('DIRECTOR', 'ADMIN')
  @ApiOperation({ summary: 'Direktur setujui final Bukti Pembayaran' })
  approveFinal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveFinalDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.approveFinal(id, dto, user);
  }

  @Post(':id/reject')
  @Roles('TECHNICAL_OFFICER', 'TREASURER', 'DIRECTOR', 'ADMIN')
  @ApiOperation({ summary: 'Tolak Bukti Pembayaran' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectPaymentVoucherDto,
    @CurrentUser() user: any,
  ) {
    return this.svc.reject(id, dto, user);
  }

  @Post(':id/create-spp')
  @Roles('PPTK', 'TREASURER', 'ADMIN')
  @ApiOperation({ summary: 'Buat SPP dari Bukti Pembayaran yang sudah APPROVED' })
  createSpp(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.svc.createSpp(id, user);
  }

  // ── UTILITIES ─────────────────────────────────────────────────

  @Get(':id/print')
  @Roles('PPTK', 'TECHNICAL_OFFICER', 'TREASURER', 'DIRECTOR', 'ADMIN')
  @ApiOperation({ summary: 'Print Bukti Pembayaran sebagai PDF' })
  async print(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const voucher  = await this.svc.findOne(id);
    const qrCode   = await this.qrSvc.generateForVoucher(voucher);
    const pdfBytes = await this.pdfSvc.generate(voucher, qrCode);

    const filename = `BP_${voucher.voucherNumber.replace(/\//g, '-')}.pdf`;

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      pdfBytes.length,
    });
    res.end(pdfBytes);
  }

  @Get('verify/:shortCode')
  @ApiOperation({ summary: 'Verifikasi dokumen via QR code (public)' })
  verify(@Param('shortCode') shortCode: string) {
    return this.qrSvc.verify(shortCode);
  }

  @Get(':id/tax-preview')
  @Roles('PPTK', 'ADMIN')
  @ApiOperation({ summary: 'Preview kalkulasi pajak sebelum membuat BB' })
  taxPreview(
    @Query('accountCode') accountCode: string,
    @Query('grossAmount') grossAmount: number,
    @Query('vendorNpwp')  vendorNpwp?: string,
  ) {
    return this.svc.previewTax(accountCode, grossAmount, vendorNpwp);
  }

  @Get('budget-check')
  @Roles('PPTK', 'ADMIN')
  @ApiOperation({ summary: 'Cek ketersediaan anggaran sebelum membuat BB' })
  budgetCheck(@Query() q: any) {
    return this.svc.checkBudget(q);
  }
}
```

---

## 5.2 PDF Generator

**File:** `services/pdf-generator.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PaymentVoucher } from '../entities/payment-voucher.entity';

@Injectable()
export class PdfGeneratorService {
  async generate(voucher: PaymentVoucher, qrCodeBase64: string): Promise<Buffer> {
    const html = this.buildHtml(voucher, qrCodeBase64);

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page    = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
      printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  private formatRupiah(amount: number): string {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }

  private buildHtml(v: PaymentVoucher, qrBase64: string): string {
    // Kumpulkan potongan yang > 0
    const deductions: { label: string; amount: number }[] = [];
    if (v.pph21Amount > 0) deductions.push({ label: 'Potongan PPh 21', amount: v.pph21Amount });
    if (v.pph22Amount > 0) deductions.push({ label: 'Potongan PPh 22', amount: v.pph22Amount });
    if (v.pph23Amount > 0) deductions.push({ label: 'Potongan PPh 23', amount: v.pph23Amount });
    if (v.pph24Amount > 0) deductions.push({ label: 'Potongan PPh 24', amount: v.pph24Amount });
    if (v.ppnAmount   > 0) deductions.push({ label: 'Potongan PPN',    amount: v.ppnAmount });
    if (v.otherDeductions > 0) deductions.push({ label: v.otherDeductionsNote || 'Potongan Lainnya', amount: v.otherDeductions });

    const deductionRows = deductions.map(d => `
      <tr>
        <td></td><td></td><td></td><td class="spacer"></td>
        <td class="label-col">- ${d.label}</td>
        <td class="cur">Rp</td>
        <td class="amt">${d.amount.toLocaleString('id-ID')}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #000; }

  .header { text-align:center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
  .header h1 { font-size: 18pt; letter-spacing: 2px; }

  .meta { display:flex; justify-content:space-between; margin-bottom: 15px; }
  .budget-box { border: 1px solid #000; padding: 8px; margin-bottom: 15px; }
  .budget-row { display:grid; grid-template-columns: 140px 15px 1fr; margin-bottom: 4px; }

  .content-row { display:grid; grid-template-columns: 180px 15px 1fr; margin-bottom: 7px; }
  .terbilang-row { display:grid; grid-template-columns: 180px 15px 1fr; margin: 12px 0; }
  .terbilang-val { font-style:italic; font-weight: bold; }

  .rincian-title { font-weight: bold; margin-bottom: 8px; }
  table.calc { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  table.calc td { padding: 3px 6px; }
  .label-col { width: 220px; }
  .cur { width: 25px; }
  .amt { text-align: right; width: 130px; }
  .spacer { width: 80px; }
  .total-sep td { border-top: 1px solid #000; }

  .jumlah-box {
    border: 2px solid #000; padding: 10px;
    text-align: center; margin: 15px 0;
    font-weight: bold; font-size: 12pt;
  }

  /* Tanda tangan pyramid */
  .ttd-row-top {
    display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px;
  }
  .ttd-row-mid, .ttd-row-bot {
    display: flex; justify-content: center; margin-bottom: 25px;
  }
  .ttd-row-mid .ttd-box, .ttd-row-bot .ttd-box { width: 44%; }
  .ttd-box { text-align: center; }
  .ttd-title { font-weight: bold; font-size: 10pt; }
  .ttd-sub { font-size: 9pt; margin-bottom: 55px; }
  .ttd-name { font-weight: bold; text-decoration: underline; margin-bottom: 2px; }
  .ttd-nip { font-size: 9pt; }

  .footer-qr { display: flex; justify-content: flex-end; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 15px; }
  .qr-img { width: 60px; height: 60px; }
  .qr-scan { font-size: 7pt; text-align: center; color: #999; margin-top: 2px; }
</style>
</head>
<body>

<div class="header">
  <h1>BUKTI PEMBAYARAN</h1>
</div>

<div class="meta">
  <span><strong>Nomor Bukti:</strong> ${v.voucherNumber}</span>
  <span><strong>Tahun Anggaran:</strong> ${v.fiscalYear}</span>
</div>

<div class="budget-box">
  <div class="budget-row">
    <strong>Program</strong><span>:</span>
    <span>${v.programCode} - ${v.programName ?? ''}</span>
  </div>
  <div class="budget-row">
    <strong>Kegiatan</strong><span>:</span>
    <span>${v.kegiatanCode} - ${v.kegiatanName ?? ''}</span>
  </div>
  ${v.subKegiatanCode ? `
  <div class="budget-row">
    <strong>Sub Kegiatan</strong><span>:</span>
    <span>${v.subKegiatanCode} - ${v.subKegiatanName ?? ''}</span>
  </div>` : ''}
  <div class="budget-row">
    <strong>Kode Rekening</strong><span>:</span>
    <span>${v.accountCode} - ${v.accountName}</span>
  </div>
</div>

<div class="content-row">
  <span>Sudah Terima Dari</span><span>:</span>
  <strong>${v.payeeName}</strong>
</div>

<div class="content-row">
  <span>Uang Sejumlah</span><span>:</span>
  <strong>${this.formatRupiah(v.grossAmount)}</strong>
</div>

<div class="terbilang-row">
  <span>Terbilang</span><span>:</span>
  <span class="terbilang-val">${v.grossAmountText}</span>
</div>

<div class="content-row">
  <span>Untuk Pembayaran</span><span>:</span>
  <span>${v.paymentPurpose}</span>
</div>

<p class="rincian-title" style="margin-top:15px;">Dengan Rincian:</p>
<table class="calc">
  <tr>
    <td class="label-col">- Jumlah Tagihan</td>
    <td class="cur">Rp</td>
    <td class="amt">${v.grossAmount.toLocaleString('id-ID')}</td>
    <td class="spacer"></td>
    <td class="label-col"><strong>Potongan:</strong></td>
    <td></td><td></td>
  </tr>
  ${deductionRows}
  <tr class="total-sep">
    <td></td><td></td><td></td><td class="spacer"></td>
    <td class="label-col"><strong>Total Potongan</strong></td>
    <td class="cur">Rp</td>
    <td class="amt"><strong>${v.totalDeductions.toLocaleString('id-ID')}</strong></td>
  </tr>
</table>

<div class="jumlah-box">
  JUMLAH DITERIMA : ${this.formatRupiah(v.netPayment)}
</div>

<!-- Tanda Tangan Pyramid -->
<div class="ttd-row-top">
  <div class="ttd-box">
    <p class="ttd-title">Pejabat Teknis BLUD</p>
    <p class="ttd-sub">&nbsp;</p>
    <p class="ttd-name">${v.technicalOfficerName ?? '...........................'}</p>
    <p class="ttd-nip">${v.technicalOfficerNip ? 'NIP. ' + v.technicalOfficerNip : ''}</p>
  </div>
  <div class="ttd-box">
    <p class="ttd-title">Yang Menerima</p>
    <p class="ttd-sub">Pejabat Pelaksana Teknis Kegiatan</p>
    <p class="ttd-name">${v.receiverName ?? '...........................'}</p>
    <p class="ttd-nip">${v.receiverNip ? 'NIP. ' + v.receiverNip : ''}</p>
  </div>
</div>

<div class="ttd-row-mid">
  <div class="ttd-box">
    <p class="ttd-title">Bendahara Pengeluaran BLUD</p>
    <p class="ttd-sub">Mengetahui/Menyetujui</p>
    <p class="ttd-name">${v.treasurerName ?? '...........................'}</p>
    <p class="ttd-nip">${v.treasurerNip ? 'NIP. ' + v.treasurerNip : ''}</p>
  </div>
</div>

<div class="ttd-row-bot">
  <div class="ttd-box">
    <p class="ttd-title">Direktur RSUD</p>
    <p class="ttd-sub">Menyetujui</p>
    <p class="ttd-name">${v.approverName ?? '...........................'}</p>
    <p class="ttd-nip">${v.approverNip ? 'NIP. ' + v.approverNip : ''}</p>
  </div>
</div>

<!-- Footer QR -->
<div class="footer-qr">
  <div>
    <img class="qr-img" src="${qrBase64}" alt="QR Verifikasi"/>
    <p class="qr-scan">Scan untuk verifikasi</p>
  </div>
</div>

</body>
</html>`;
  }
}
```

---

## 5.3 QR Code Service

**File:** `services/qr-code.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { ShortUrl } from '../entities/short-url.entity';
import { PaymentVoucher } from '../entities/payment-voucher.entity';

@Injectable()
export class QrCodeService {
  private readonly baseUrl = process.env.APP_BASE_URL ?? 'https://sikancil.rsud-ds.go.id';

  constructor(
    @InjectRepository(ShortUrl)
    private shortUrlRepo: Repository<ShortUrl>,
  ) {}

  async generateForVoucher(voucher: PaymentVoucher): Promise<string> {
    const shortCode = await this.getOrCreateShortCode(voucher.id);
    const verifyUrl = `${this.baseUrl}/v/${shortCode}`;

    const qrData = JSON.stringify({
      t: 'BP',                   // type
      n: voucher.voucherNumber,  // nomor
      y: voucher.fiscalYear,     // tahun
      g: voucher.grossAmount,    // gross
      d: voucher.voucherDate,    // tanggal
      u: verifyUrl,              // url verifikasi
    });

    // Generate sebagai base64 data URL (untuk embed di PDF/HTML)
    return QRCode.toDataURL(qrData, {
      width:                60,
      margin:               0,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#FFFFFF' },
    });
  }

  async verify(shortCode: string) {
    const record = await this.shortUrlRepo.findOne({
      where: { hash: shortCode },
    });

    if (!record) {
      throw new NotFoundException('Kode verifikasi tidak ditemukan');
    }

    if (record.expiresAt && new Date() > record.expiresAt) {
      return { isValid: false, message: 'Kode verifikasi sudah kadaluarsa' };
    }

    // Return info dasar untuk tampilan verifikasi
    return {
      isValid:    true,
      targetType: record.targetType,
      targetId:   record.targetId,
      message:    'Dokumen valid dan tercatat di sistem SI-KANCIL',
    };
  }

  private async getOrCreateShortCode(voucherId: string): Promise<string> {
    const existing = await this.shortUrlRepo.findOne({
      where: { targetId: voucherId, targetType: 'PAYMENT_VOUCHER' },
    });

    if (existing) return existing.hash;

    const hash = crypto.createHash('sha256').update(voucherId).digest('hex').substring(0, 8);
    const oneYear = new Date();
    oneYear.setFullYear(oneYear.getFullYear() + 1);

    await this.shortUrlRepo.save(
      this.shortUrlRepo.create({
        hash,
        targetId:   voucherId,
        targetType: 'PAYMENT_VOUCHER',
        expiresAt:  oneYear,
      }),
    );

    return hash;
  }
}
```

---

## 5.4 Frontend — React Components

### Struktur komponen:
```
frontend/src/pages/bukti-bayar/
├── BuktiBayarList.tsx      - Daftar BB dengan filter & paginasi
├── BuktiBayarCreate.tsx    - Form buat BB baru
├── BuktiBayarDetail.tsx    - Detail & workflow actions
└── BuktiBayarVerify.tsx    - Halaman verifikasi QR (public)

frontend/src/components/bukti-bayar/
├── TaxCalculatorWidget.tsx - Preview pajak real-time
├── BudgetIndicator.tsx     - Indikator sisa anggaran
├── DeductionTable.tsx      - Tabel potongan (hanya > 0)
└── StatusBadge.tsx         - Badge status BB
```

### `TaxCalculatorWidget.tsx` — Preview pajak real-time

```tsx
import { useState, useEffect } from 'react';
import { useQuery }            from '@tanstack/react-query';
import { api }                 from '@/lib/api';
import { formatRupiah }        from '@/lib/currency';

interface Props {
  accountCode: string;
  grossAmount: number;
  vendorNpwp?: string;
}

export function TaxCalculatorWidget({ accountCode, grossAmount, vendorNpwp }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['tax-preview', accountCode, grossAmount, vendorNpwp],
    queryFn:  () => api.get('/payment-vouchers/tax-preview', {
      params: { accountCode, grossAmount, vendorNpwp },
    }).then(r => r.data),
    enabled: !!(accountCode && grossAmount > 0),
    staleTime: 60_000,
  });

  if (!accountCode || grossAmount <= 0) return null;
  if (isLoading) return <div className="text-gray-400 text-sm">Menghitung pajak...</div>;

  const deductions = [
    { label: 'PPh 21', rate: data.pph21Rate, amount: data.pph21Amount },
    { label: 'PPh 22', rate: data.pph22Rate, amount: data.pph22Amount },
    { label: 'PPh 23', rate: data.pph23Rate, amount: data.pph23Amount },
    { label: 'PPh 24', rate: data.pph24Rate, amount: data.pph24Amount },
    { label: 'PPN',    rate: data.ppnRate,   amount: data.ppnAmount   },
  ].filter(d => d.amount > 0);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
      <h4 className="font-semibold text-blue-800 text-sm">Preview Perhitungan Pajak</h4>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Jumlah Tagihan (Gross)</span>
          <span className="font-medium">{formatRupiah(grossAmount)}</span>
        </div>

        {deductions.map(d => (
          <div key={d.label} className="flex justify-between text-red-600">
            <span>- Potongan {d.label} ({d.rate}%)</span>
            <span>({formatRupiah(d.amount)})</span>
          </div>
        ))}

        <div className="border-t border-blue-300 pt-1 flex justify-between font-semibold text-blue-900">
          <span>Jumlah Diterima (Net)</span>
          <span>{formatRupiah(data.netPayment)}</span>
        </div>
      </div>
    </div>
  );
}
```

### `BudgetIndicator.tsx` — Indikator sisa anggaran

```tsx
import { useQuery } from '@tanstack/react-query';
import { api }      from '@/lib/api';
import { formatRupiah } from '@/lib/currency';

interface Props {
  kegiatanId: string;
  accountCode: string;
  fiscalYear: number;
  month: number;
  requestedAmount: number;
}

export function BudgetIndicator({ kegiatanId, accountCode, fiscalYear, month, requestedAmount }: Props) {
  const { data } = useQuery({
    queryKey: ['budget-check', kegiatanId, accountCode, fiscalYear, month],
    queryFn:  () => api.get('/payment-vouchers/budget-check', {
      params: { kegiatanId, accountCode, fiscalYear, month },
    }).then(r => r.data),
    enabled: !!(kegiatanId && accountCode),
  });

  if (!data) return null;

  const paguPct  = data.availablePagu  > 0 ? (requestedAmount / data.availablePagu)  * 100 : 100;
  const rakPct   = data.rakMonthlyLimit > 0 ? (requestedAmount / data.remainingRak) * 100 : 100;
  const overPagu = requestedAmount > data.availablePagu;
  const overRak  = requestedAmount > data.remainingRak;

  return (
    <div className="space-y-3">
      {/* Pagu */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">Sisa Pagu</span>
          <span className={overPagu ? 'text-red-600 font-bold' : 'text-green-600'}>
            {formatRupiah(data.availablePagu)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${overPagu ? 'bg-red-500' : paguPct > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(paguPct, 100)}%` }}
          />
        </div>
        {overPagu && (
          <p className="text-red-500 text-xs mt-1">❌ Melebihi sisa pagu!</p>
        )}
      </div>

      {/* RAK */}
      {data.rakMonthlyLimit > 0 && (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Sisa RAK Bulan Ini</span>
            <span className={overRak ? 'text-red-600 font-bold' : 'text-green-600'}>
              {formatRupiah(data.remainingRak)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${overRak ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(rakPct, 100)}%` }}
            />
          </div>
          {overRak && (
            <p className="text-red-500 text-xs mt-1">❌ Melebihi limit RAK bulan ini!</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 5.5 Seed Data Tax Rules

**File:** `database/seeds/tax-rules.seed.ts`

```typescript
export const TAX_RULES_SEED = [
  // ── Belanja Farmasi & BMHP ─────────────────────────────────
  { accountCodePattern: '4.1.6.1.02.01.01', ppnRate: 11, pph22Rate: 1.5, description: 'Belanja Obat-obatan' },
  { accountCodePattern: '5.2.02.10.01',      ppnRate: 11, pph22Rate: 1.5, description: 'Belanja BMHP' },
  { accountCodePattern: '5.2.02.10.02',      ppnRate: 11, pph22Rate: 1.5, description: 'Belanja Alkes Habis Pakai' },

  // ── Belanja Jasa ───────────────────────────────────────────
  { accountCodePattern: '5.2.02.02', ppnRate: 11, pph23Rate: 2, description: 'Belanja Jasa' },
  { accountCodePattern: '5.2.02.03', ppnRate: 11, pph23Rate: 2, description: 'Belanja Jasa Konsultansi' },

  // ── Belanja Barang ─────────────────────────────────────────
  { accountCodePattern: '5.2.02.01', ppnRate: 11, pph22Rate: 1.5, description: 'Belanja Bahan/Material' },
  { accountCodePattern: '5.2.02.05', ppnRate: 11, pph22Rate: 1.5, description: 'Belanja Cetak dan Penggandaan' },

  // ── Belanja Modal ──────────────────────────────────────────
  { accountCodePattern: '5.2.03',    ppnRate: 11, pph22Rate: 1.5, description: 'Belanja Modal Peralatan' },

  // ── Belanja Pegawai (Non-taxable untuk PPN/PPh 22/23) ─────
  { accountCodePattern: '5.1.01', ppnRate: 0, description: 'Belanja Gaji Pegawai' },
  { accountCodePattern: '5.1.02', ppnRate: 0, description: 'Belanja Tambahan Penghasilan' },
];
```

---

## 5.6 Packages yang Diperlukan

```bash
# Backend
pnpm add puppeteer qrcode
pnpm add @types/qrcode --save-dev

# Frontend
pnpm add @tanstack/react-query axios
pnpm add react-hook-form @hookform/resolvers zod
pnpm add lucide-react
```
