import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Interface hasil generate nomor voucher
 */
export interface NumberingResult {
  voucherNumber: string;    // Format: 0001/5.2.02.10/01/RSUD-DS/2025
  sequenceNumber: number;   // Nomor urut (1, 2, 3, ...)
}

@Injectable()
export class VoucherNumberingService {
  private readonly logger = new Logger(VoucherNumberingService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate nomor bukti bayar dengan memanggil PostgreSQL function
   * Function generate_voucher_number() sudah ada di database (dari migration)
   *
   * @param fiscalYear - Tahun anggaran (2025, 2026, dst)
   * @param month - Bulan (1-12)
   * @param accountCode - Kode rekening (5.2.02.10.01.0003)
   * @param unitCode - Kode unit (default: RSUD-DS)
   * @returns NumberingResult dengan voucher_number dan sequence_number
   */
  async generate(
    fiscalYear: number,
    month: number,
    accountCode: string,
    unitCode: string = 'RSUD-DS',
  ): Promise<NumberingResult> {
    try {
      // Panggil PostgreSQL function generate_voucher_number
      // Function ini atomic (menggunakan row-level locking)
      const result = await this.dataSource.query(
        'SELECT * FROM generate_voucher_number($1, $2, $3, $4)',
        [fiscalYear, month, accountCode, unitCode],
      );

      if (!result || result.length === 0) {
        throw new InternalServerErrorException(
          'Gagal generate nomor voucher dari database',
        );
      }

      const voucherNumber = result[0].voucher_number;
      const sequenceNumber = result[0].sequence_number;

      this.logger.log(
        `Generated voucher number: ${voucherNumber} (seq: ${sequenceNumber})`,
      );

      return {
        voucherNumber,
        sequenceNumber,
      };
    } catch (error) {
      this.logger.error(
        `Error generating voucher number: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Gagal generate nomor voucher: ' + error.message,
      );
    }
  }

  /**
   * Preview format nomor voucher tanpa menyimpan ke database
   * Berguna untuk testing dan preview
   */
  preview(
    sequence: number,
    accountCode: string,
    month: number,
    fiscalYear: number,
    unitCode: string = 'RSUD-DS',
  ): string {
    const seqPadded = sequence.toString().padStart(4, '0');
    const monthPadded = month.toString().padStart(2, '0');

    return `${seqPadded}/${accountCode}/${monthPadded}/${unitCode}/${fiscalYear}`;
  }
}
