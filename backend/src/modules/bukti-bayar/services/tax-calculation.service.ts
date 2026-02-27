import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull, Or } from 'typeorm';
import { TaxRule } from '../../../database/entities/tax-rule.entity';

/**
 * Interface untuk input perhitungan pajak
 */
export interface TaxInput {
  accountCode: string;      // Kode rekening belanja
  grossAmount: number;       // Jumlah bruto tagihan
  vendorNpwp?: string;       // NPWP vendor (opsional)
  transactionDate?: Date;    // Tanggal transaksi (default: now)
}

/**
 * Interface untuk hasil perhitungan pajak
 */
export interface TaxResult {
  taxRuleId: string | null;

  // PPh 21 - Gaji/Honorarium
  pph21Rate: number;
  pph21Amount: number;

  // PPh 22 - Pembelian Barang
  pph22Rate: number;
  pph22Amount: number;

  // PPh 23 - Jasa
  pph23Rate: number;
  pph23Amount: number;

  // PPh 4 ayat 2 - Sewa
  pph4a2Rate: number;
  pph4a2Amount: number;

  // PPh Final UMKM
  pphFinalUmkmRate: number;
  pphFinalUmkmAmount: number;

  // PPh 24 - Luar Negeri
  pph24Rate: number;
  pph24Amount: number;

  // PPN
  ppnRate: number;
  ppnAmount: number;

  // Computed
  totalDeductions: number;
  netPayment: number;
  grossAmountText: string;  // Terbilang
}

@Injectable()
export class TaxCalculationService {
  private readonly logger = new Logger(TaxCalculationService.name);

  constructor(
    @InjectRepository(TaxRule)
    private readonly taxRuleRepo: Repository<TaxRule>,
  ) {}

  /**
   * Hitung pajak berdasarkan accountCode dan grossAmount
   */
  async calculate(input: TaxInput): Promise<TaxResult> {
    const date = input.transactionDate ?? new Date();

    // 1. Cari tax rule yang sesuai (paling spesifik)
    const rule = await this.findBestMatchRule(input.accountCode, date);

    // 2. Hitung tiap komponen pajak
    const ppnAmount = this.round(input.grossAmount * ((rule.ppnRate ?? 0) / 100));
    const pph21Amount = this.round(input.grossAmount * ((rule.pph21Rate ?? 0) / 100));
    const pph22Amount = this.round(input.grossAmount * ((rule.pph22Rate ?? 0) / 100));
    const pph4a2Amount = this.round(input.grossAmount * ((rule.pph4a2Rate ?? 0) / 100));
    const pphFinalUmkmAmount = this.round(input.grossAmount * ((rule.pphFinalUmkmRate ?? 0) / 100));
    const pph24Amount = this.round(input.grossAmount * ((rule.pph24Rate ?? 0) / 100));

    // PPh 23: tarif dobel jika vendor tanpa NPWP
    const pph23Rate = (!input.vendorNpwp && (rule.pph23Rate ?? 0) > 0)
      ? (rule.pph23Rate ?? 0) * 2
      : (rule.pph23Rate ?? 0);
    const pph23Amount = this.round(input.grossAmount * (pph23Rate / 100));

    // 3. Total deductions
    const totalDeductions =
      ppnAmount +
      pph21Amount +
      pph22Amount +
      pph23Amount +
      pph4a2Amount +
      pphFinalUmkmAmount +
      pph24Amount;

    const netPayment = input.grossAmount - totalDeductions;

    // 4. Convert ke terbilang
    const grossAmountText = this.toTerbilang(input.grossAmount);

    this.logger.log(
      `Tax calculation for ${input.accountCode}: Gross ${input.grossAmount}, Net ${netPayment}, Tax ${totalDeductions}`,
    );

    return {
      taxRuleId: rule.id ?? null,
      pph21Rate: rule.pph21Rate ?? 0,
      pph21Amount,
      pph22Rate: rule.pph22Rate ?? 0,
      pph22Amount,
      pph23Rate,
      pph23Amount,
      pph4a2Rate: rule.pph4a2Rate ?? 0,
      pph4a2Amount,
      pphFinalUmkmRate: rule.pphFinalUmkmRate ?? 0,
      pphFinalUmkmAmount,
      pph24Rate: rule.pph24Rate ?? 0,
      pph24Amount,
      ppnRate: rule.ppnRate ?? 0,
      ppnAmount,
      totalDeductions,
      netPayment,
      grossAmountText,
    };
  }

  /**
   * Cari tax rule dengan pattern matching terpanjang (paling spesifik)
   */
  private async findBestMatchRule(
    accountCode: string,
    date: Date,
  ): Promise<Partial<TaxRule>> {
    // Cari semua rule yang aktif dan sesuai tanggal
    const allRules = await this.taxRuleRepo.find({
      where: {
        isActive: true,
        effectiveFrom: LessThanOrEqual(date),
        effectiveTo: Or(IsNull(), MoreThanOrEqual(date)),
      },
      order: {
        accountCodePattern: 'DESC', // Longer pattern = more specific
      },
    });

    // Filter by pattern matching (prefix match)
    const matching = allRules.filter((rule) =>
      accountCode.startsWith(rule.accountCodePattern),
    );

    if (matching.length === 0) {
      this.logger.warn(
        `No tax rule found for account code ${accountCode}, treating as non-taxable`,
      );

      // Default: no tax (non-taxable)
      return {
        accountCodePattern: accountCode,
        ppnRate: 0,
        pph21Rate: 0,
        pph22Rate: 0,
        pph23Rate: 0,
        pph4a2Rate: 0,
        pphFinalUmkmRate: 0,
        pph24Rate: 0,
      };
    }

    // Ambil yang paling panjang (paling spesifik)
    const bestMatch = matching.sort(
      (a, b) => b.accountCodePattern.length - a.accountCodePattern.length,
    )[0];

    this.logger.log(
      `Best match tax rule for ${accountCode}: ${bestMatch.accountCodePattern} (${bestMatch.description})`,
    );

    return bestMatch;
  }

  /**
   * Round ke bilangan bulat terdekat
   */
  private round(value: number): number {
    return Math.round(value);
  }

  /**
   * Convert angka ke terbilang Indonesia
   */
  public toTerbilang(angka: number): string {
    if (angka === 0) return 'Nol Rupiah';

    const bilangan = [
      '',
      'Satu',
      'Dua',
      'Tiga',
      'Empat',
      'Lima',
      'Enam',
      'Tujuh',
      'Delapan',
      'Sembilan',
      'Sepuluh',
      'Sebelas',
    ];

    const terbilang = (n: number): string => {
      if (n < 12) return bilangan[n];
      if (n < 20) return bilangan[n - 10] + ' Belas';
      if (n < 100)
        return (
          bilangan[Math.floor(n / 10)] +
          ' Puluh' +
          (n % 10 !== 0 ? ' ' + bilangan[n % 10] : '')
        );
      if (n < 200) return 'Seratus' + (n % 100 !== 0 ? ' ' + terbilang(n % 100) : '');
      if (n < 1000)
        return (
          bilangan[Math.floor(n / 100)] +
          ' Ratus' +
          (n % 100 !== 0 ? ' ' + terbilang(n % 100) : '')
        );
      if (n < 2000) return 'Seribu' + (n % 1000 !== 0 ? ' ' + terbilang(n % 1000) : '');
      if (n < 1000000)
        return (
          terbilang(Math.floor(n / 1000)) +
          ' Ribu' +
          (n % 1000 !== 0 ? ' ' + terbilang(n % 1000) : '')
        );
      if (n < 1000000000)
        return (
          terbilang(Math.floor(n / 1000000)) +
          ' Juta' +
          (n % 1000000 !== 0 ? ' ' + terbilang(n % 1000000) : '')
        );
      if (n < 1000000000000)
        return (
          terbilang(Math.floor(n / 1000000000)) +
          ' Miliar' +
          (n % 1000000000 !== 0 ? ' ' + terbilang(n % 1000000000) : '')
        );
      return (
        terbilang(Math.floor(n / 1000000000000)) +
        ' Triliun' +
        (n % 1000000000000 !== 0 ? ' ' + terbilang(n % 1000000000000) : '')
      );
    };

    const hasil = terbilang(Math.floor(angka));
    return hasil.trim() + ' Rupiah';
  }
}
