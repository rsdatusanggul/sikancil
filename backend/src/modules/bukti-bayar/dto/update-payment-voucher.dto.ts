import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePaymentVoucherDto } from './create-payment-voucher.dto';

/**
 * DTO untuk update Payment Voucher
 * - Semua field bersifat optional (PartialType)
 * - Field immutable dihapus: voucherDate, fiscalYear, unitCode
 * - Hanya bisa update saat status = DRAFT
 */
export class UpdatePaymentVoucherDto extends PartialType(
  OmitType(CreatePaymentVoucherDto, [
    'voucherDate', // Immutable - tidak boleh diubah
    'fiscalYear',  // Immutable - tidak boleh diubah
    'unitCode',    // Immutable - tidak boleh diubah
  ] as const),
) {}
