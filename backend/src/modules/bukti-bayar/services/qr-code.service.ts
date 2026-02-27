import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { ShortUrl } from '../../../database/entities/short-url.entity';
import { PaymentVoucher } from '../../../database/entities/payment-voucher.entity';
import { ShortUrlTargetType } from '../../../database/enums';

/**
 * Interface hasil verifikasi QR code
 */
export interface VerifyResult {
  isValid: boolean;
  targetType?: ShortUrlTargetType;
  targetId?: string;
  message?: string;
  data?: any;
}

@Injectable()
export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepo: Repository<ShortUrl>,
  ) {
    this.baseUrl = process.env.APP_BASE_URL || 'https://sikancil.rsud-ds.go.id';
  }

  /**
   * Generate QR code untuk payment voucher
   * Returns base64 data URL yang bisa langsung diembed ke HTML
   */
  async generateForVoucher(voucher: PaymentVoucher): Promise<string> {
    try {
      // 1. Get or create short code
      const shortCode = await this.getOrCreateShortCode(
        voucher.id,
        ShortUrlTargetType.PAYMENT_VOUCHER,
      );

      // 2. Build verification URL
      const verifyUrl = `${this.baseUrl}/api/v1/payment-vouchers/verify/${shortCode}`;

      // 3. Build QR data (compact JSON)
      const qrData = JSON.stringify({
        t: 'BP', // Type: Bukti Pembayaran
        n: voucher.voucherNumber,
        y: voucher.fiscalYear,
        g: voucher.grossAmount,
        d: voucher.voucherDate,
        u: verifyUrl,
      });

      // 4. Generate QR code as base64 data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 120, // Size untuk PDF footer
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      this.logger.log(`Generated QR code for voucher ${voucher.voucherNumber}`);

      return qrCodeDataUrl;
    } catch (error) {
      this.logger.error(`Failed to generate QR code: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Verify QR code by short code
   */
  async verify(shortCode: string): Promise<VerifyResult> {
    try {
      const shortUrl = await this.shortUrlRepo.findOne({
        where: { hash: shortCode },
      });

      if (!shortUrl) {
        return {
          isValid: false,
          message: 'Kode QR tidak ditemukan atau tidak valid',
        };
      }

      // Check expiry
      if (shortUrl.expiresAt && new Date() > shortUrl.expiresAt) {
        return {
          isValid: false,
          message: 'Kode QR sudah kadaluarsa',
        };
      }

      return {
        isValid: true,
        targetType: shortUrl.targetType,
        targetId: shortUrl.targetId,
        message: 'Kode QR valid',
        data: {
          createdAt: shortUrl.createdAt,
          expiresAt: shortUrl.expiresAt,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to verify QR code: ${error.message}`, error.stack);
      return {
        isValid: false,
        message: 'Gagal memverifikasi kode QR: ' + error.message,
      };
    }
  }

  /**
   * Get or create short code untuk target
   * Menggunakan SHA256 hash dari targetId (first 8 chars)
   */
  private async getOrCreateShortCode(
    targetId: string,
    targetType: ShortUrlTargetType,
  ): Promise<string> {
    // Check if already exists
    const existing = await this.shortUrlRepo.findOne({
      where: { targetId, targetType },
    });

    if (existing) {
      this.logger.log(`Using existing short code for ${targetId}: ${existing.hash}`);
      return existing.hash;
    }

    // Generate new hash (SHA256 first 8 chars)
    const hash = crypto.createHash('sha256').update(targetId).digest('hex').substring(0, 8);

    // Create short URL entry with 1 year expiry
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const shortUrl = this.shortUrlRepo.create({
      hash,
      targetId,
      targetType,
      expiresAt,
    });

    await this.shortUrlRepo.save(shortUrl);

    this.logger.log(`Created new short code for ${targetId}: ${hash}`);

    return hash;
  }

  /**
   * Generate QR code sebagai buffer (untuk download)
   */
  async generateAsBuffer(data: string): Promise<Buffer> {
    return await QRCode.toBuffer(data, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
    });
  }
}
