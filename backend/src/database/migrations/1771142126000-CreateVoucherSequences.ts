import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateVoucherSequences
 *
 * Membuat tabel voucher_sequences untuk auto-numbering system
 * dan function generate_voucher_number() untuk generate nomor otomatis.
 *
 * Format nomor: 0001/5.2.02.10.01.0003/01/RSUD-DS/2025
 *               ^^^^  ^^^^^^^^^^^^^^^^  ^^  ^^^^^^^  ^^^^
 *               seq   kode_rekening     bl  unit     tahun
 */
export class CreateVoucherSequences1771142126000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create voucher_sequences table
    await queryRunner.query(`
      CREATE TABLE voucher_sequences (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        fiscal_year   INTEGER     NOT NULL,
        voucher_month INTEGER     NOT NULL CHECK (voucher_month BETWEEN 1 AND 12),
        account_code  VARCHAR(60) NOT NULL,
        unit_code     VARCHAR(20) NOT NULL DEFAULT 'RSUD-DS',
        last_sequence INTEGER     DEFAULT 0,

        UNIQUE (fiscal_year, voucher_month, account_code, unit_code)
      );
    `);

    // Create function to generate voucher number
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION generate_voucher_number(
        p_fiscal_year  INTEGER,
        p_month        INTEGER,
        p_account_code VARCHAR,
        p_unit_code    VARCHAR DEFAULT 'RSUD-DS'
      )
      RETURNS TABLE(voucher_number VARCHAR, sequence_number INTEGER)
      LANGUAGE plpgsql AS $$
      DECLARE
        v_seq INTEGER;
        v_num VARCHAR;
      BEGIN
        -- Insert or update sequence number (atomic operation)
        INSERT INTO voucher_sequences (fiscal_year, voucher_month, account_code, unit_code, last_sequence)
        VALUES (p_fiscal_year, p_month, p_account_code, p_unit_code, 1)
        ON CONFLICT (fiscal_year, voucher_month, account_code, unit_code)
        DO UPDATE SET last_sequence = voucher_sequences.last_sequence + 1
        RETURNING last_sequence INTO v_seq;

        -- Format: 0001/5.2.02.10.01.0003/01/RSUD-DS/2025
        v_num := LPAD(v_seq::TEXT, 4, '0')
               || '/' || p_account_code
               || '/' || LPAD(p_month::TEXT, 2, '0')
               || '/' || p_unit_code
               || '/' || p_fiscal_year;

        RETURN QUERY SELECT v_num, v_seq;
      END;
      $$;
    `);

    // Add comment to function
    await queryRunner.query(`
      COMMENT ON FUNCTION generate_voucher_number IS
      'Auto-generate nomor bukti pembayaran dengan format: seq/kode_rek/bulan/unit/tahun';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS generate_voucher_number;
    `);

    // Drop table
    await queryRunner.query(`
      DROP TABLE IF EXISTS voucher_sequences;
    `);
  }
}
