import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { PaymentVoucher } from '../../../database/entities/payment-voucher.entity';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  /**
   * Generate PDF dari payment voucher
   * @param voucher - Payment voucher entity (with relations loaded)
   * @param qrCodeBase64 - QR code sebagai base64 data URL
   * @returns PDF sebagai Buffer
   */
  async generate(voucher: PaymentVoucher, qrCodeBase64: string): Promise<Buffer> {
    let browser: puppeteer.Browser | null = null;

    try {
      // 1. Build HTML
      const html = this.buildHtml(voucher, qrCodeBase64);

      // 2. Launch puppeteer
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });

      const page = await browser.newPage();

      // 3. Set HTML content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // 4. Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '15mm',
          bottom: '15mm',
          left: '15mm',
          right: '15mm',
        },
        printBackground: true,
      });

      this.logger.log(`Generated PDF for voucher ${voucher.voucherNumber}`);

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`Failed to generate PDF: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Gagal generate PDF: ' + error.message);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Build HTML template untuk PDF
   */
  private buildHtml(voucher: PaymentVoucher, qrCodeBase64: string): string {
    const grossRp = this.formatRupiah(voucher.grossAmount);
    const netRp = this.formatRupiah(voucher.netPayment);

    // Build active deductions (hanya yang > 0)
    const deductions: Array<{ name: string; amount: number }> = [];
    if (voucher.pph21Amount > 0) {
      deductions.push({ name: `PPh 21 (${voucher.pph21Rate}%)`, amount: voucher.pph21Amount });
    }
    if (voucher.pph22Amount > 0) {
      deductions.push({ name: `PPh 22 (${voucher.pph22Rate}%)`, amount: voucher.pph22Amount });
    }
    if (voucher.pph23Amount > 0) {
      deductions.push({ name: `PPh 23 (${voucher.pph23Rate}%)`, amount: voucher.pph23Amount });
    }
    if (voucher.pph4a2Amount > 0) {
      deductions.push({ name: `PPh 4 ayat 2 (${voucher.pph4a2Rate}%)`, amount: voucher.pph4a2Amount });
    }
    if (voucher.pphFinalUmkmAmount > 0) {
      deductions.push({ name: `PPh Final UMKM (${voucher.pphFinalUmkmRate}%)`, amount: voucher.pphFinalUmkmAmount });
    }
    if (voucher.pph24Amount > 0) {
      deductions.push({ name: `PPh 24 (${voucher.pph24Rate}%)`, amount: voucher.pph24Amount });
    }
    if (voucher.ppnAmount > 0) {
      deductions.push({ name: `PPN (${voucher.ppnRate}%)`, amount: voucher.ppnAmount });
    }
    if (voucher.otherDeductions > 0) {
      deductions.push({ name: voucher.otherDeductionsNote || 'Potongan Lain', amount: voucher.otherDeductions });
    }

    const deductionsHtml = deductions
      .map((d) => `<tr><td style="padding-left: 20px;">${d.name}</td><td style="text-align: right;">${this.formatRupiah(d.amount)}</td></tr>`)
      .join('');

    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Bukti Pembayaran - ${voucher.voucherNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }

    .header h1 {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
      font-size: 10pt;
    }

    .budget-box {
      border: 1px solid #000;
      padding: 10px;
      margin-bottom: 15px;
      font-size: 10pt;
    }

    .budget-box table {
      width: 100%;
    }

    .budget-box td {
      padding: 2px 0;
    }

    .content-row {
      display: flex;
      margin-bottom: 8px;
    }

    .content-label {
      width: 180px;
      font-weight: bold;
    }

    .content-value {
      flex: 1;
    }

    .terbilang {
      font-style: italic;
      margin-left: 180px;
      margin-bottom: 12px;
    }

    .calc-table {
      width: 100%;
      margin: 15px 0;
      border-collapse: collapse;
    }

    .calc-table td {
      padding: 4px 0;
    }

    .calc-table .separator {
      border-top: 1px solid #000;
      padding-top: 8px;
    }

    .jumlah-box {
      background: #f0f0f0;
      border: 2px solid #000;
      padding: 10px;
      margin: 15px 0;
      text-align: center;
      font-size: 12pt;
      font-weight: bold;
    }

    .signatures {
      margin-top: 30px;
    }

    .signature-row {
      display: flex;
      justify-content: space-around;
      margin-bottom: 25px;
    }

    .signature-row.center {
      justify-content: center;
    }

    .signature-box {
      text-align: center;
      width: 200px;
    }

    .signature-title {
      font-weight: bold;
      margin-bottom: 2px;
    }

    .signature-subtitle {
      font-size: 9pt;
      margin-bottom: 60px;
    }

    .signature-name {
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .signature-nip {
      font-size: 9pt;
    }

    .qr-footer {
      text-align: right;
      margin-top: 20px;
    }

    .qr-footer img {
      width: 80px;
      height: 80px;
    }

    .qr-caption {
      font-size: 8pt;
      font-style: italic;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>BUKTI PEMBAYARAN</h1>
  </div>

  <div class="meta">
    <div><strong>Nomor:</strong> ${voucher.voucherNumber}</div>
    <div><strong>Tahun Anggaran:</strong> ${voucher.fiscalYear}</div>
  </div>

  <div class="budget-box">
    <table>
      <tr>
        <td style="width: 120px;"><strong>Program</strong></td>
        <td>: ${voucher.programCode || '-'} ${voucher.programName || ''}</td>
      </tr>
      <tr>
        <td><strong>Kegiatan</strong></td>
        <td>: ${voucher.kegiatanCode || '-'} ${voucher.kegiatanName || ''}</td>
      </tr>
      ${
        voucher.subKegiatanCode
          ? `<tr><td><strong>Sub Kegiatan</strong></td><td>: ${voucher.subKegiatanCode} ${voucher.subKegiatanName || ''}</td></tr>`
          : ''
      }
      <tr>
        <td><strong>Rekening</strong></td>
        <td>: ${voucher.accountCode || '-'} ${voucher.accountName || ''}</td>
      </tr>
    </table>
  </div>

  <div class="content-row">
    <div class="content-label">Sudah Terima Dari</div>
    <div class="content-value">: ${voucher.payeeName || '-'}</div>
  </div>

  <div class="content-row">
    <div class="content-label">Uang Sejumlah</div>
    <div class="content-value">: <strong>${grossRp}</strong></div>
  </div>

  <div class="terbilang">
    ( ${voucher.grossAmountText || this.toTerbilang(voucher.grossAmount)} )
  </div>

  <div class="content-row">
    <div class="content-label">Untuk Pembayaran</div>
    <div class="content-value">: ${voucher.paymentPurpose || '-'}</div>
  </div>

  <table class="calc-table">
    <tr>
      <td><strong>Jumlah Tagihan</strong></td>
      <td style="text-align: right;"><strong>${grossRp}</strong></td>
    </tr>
    ${deductionsHtml}
    <tr class="separator">
      <td><strong>JUMLAH DITERIMA</strong></td>
      <td style="text-align: right;"><strong>${netRp}</strong></td>
    </tr>
  </table>

  <div class="signatures">
    <!-- Row 1: Technical Officer + Receiver -->
    <div class="signature-row">
      <div class="signature-box">
        <div class="signature-title">Pejabat Teknis BLUD</div>
        <div class="signature-subtitle">&nbsp;</div>
        <div class="signature-name">${voucher.technicalOfficerName || '(.....................)'}</div>
        <div class="signature-nip">NIP. ${voucher.technicalOfficerNip || '-'}</div>
      </div>

      <div class="signature-box">
        <div class="signature-title">Yang Menerima</div>
        <div class="signature-subtitle">PPTK</div>
        <div class="signature-name">${voucher.receiverName || '(.....................)'}</div>
        <div class="signature-nip">NIP. ${voucher.receiverNip || '-'}</div>
      </div>
    </div>

    <!-- Row 2: Treasurer (centered) -->
    <div class="signature-row center">
      <div class="signature-box">
        <div class="signature-title">Bendahara Pengeluaran BLUD</div>
        <div class="signature-subtitle">&nbsp;</div>
        <div class="signature-name">${voucher.treasurerName || '(.....................)'}</div>
        <div class="signature-nip">NIP. ${voucher.treasurerNip || '-'}</div>
      </div>
    </div>

    <!-- Row 3: Director (centered) -->
    <div class="signature-row center">
      <div class="signature-box">
        <div class="signature-title">Direktur RSUD</div>
        <div class="signature-subtitle">Pengguna Anggaran</div>
        <div class="signature-name">${voucher.approverName || '(.....................)'}</div>
        <div class="signature-nip">NIP. ${voucher.approverNip || '-'}</div>
      </div>
    </div>
  </div>

  <div class="qr-footer">
    <img src="${qrCodeBase64}" alt="QR Code" />
    <div class="qr-caption">Scan untuk verifikasi</div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Format angka ke Rupiah
   */
  private formatRupiah(amount: number): string {
    return (
      'Rp ' +
      amount.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  }

  /**
   * Simple terbilang (fallback jika tidak ada di voucher)
   */
  private toTerbilang(amount: number): string {
    // This is a simplified version - real implementation in TaxCalculationService
    return `${this.formatRupiah(amount)} (terbilang otomatis)`;
  }
}
