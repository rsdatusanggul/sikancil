import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreatePaymentVoucherAttachments
 *
 * Membuat tabel payment_voucher_attachments untuk menyimpan lampiran dokumen
 * pendukung dari payment voucher seperti:
 * - Invoice/Faktur
 * - Kontrak Pengadaan
 * - Berita Acara (BA)
 * - Berita Acara Serah Terima (BAST)
 * - Foto Dokumentasi
 * - Dokumen Pendukung Lainnya
 */
export class CreatePaymentVoucherAttachments1771142128000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create payment_voucher_attachments table
    await queryRunner.query(`
      CREATE TABLE payment_voucher_attachments (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        voucher_id  UUID NOT NULL,

        -- File information
        file_name   VARCHAR(255) NOT NULL,
        file_type   VARCHAR(50),    -- pdf, jpg, png, xlsx, docx
        file_size   INTEGER,        -- bytes
        file_path   TEXT NOT NULL,  -- path di storage (S3/local)

        -- Tipe lampiran
        attachment_type VARCHAR(30) NOT NULL DEFAULT 'OTHER',
        -- INVOICE | CONTRACT | BA | BAST | PHOTO | OTHER

        description TEXT,

        -- Audit
        uploaded_by UUID,
        uploaded_at TIMESTAMP DEFAULT NOW(),

        -- Foreign key constraint
        CONSTRAINT "FK_pva_voucher"
          FOREIGN KEY ("voucher_id")
          REFERENCES "payment_vouchers"("id")
          ON DELETE CASCADE
      );
    `);

    // Create index
    await queryRunner.query(`
      CREATE INDEX "idx_pva_voucher" ON payment_voucher_attachments("voucher_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_pva_type" ON payment_voucher_attachments("attachment_type");
    `);

    // Add comment to table
    await queryRunner.query(`
      COMMENT ON TABLE payment_voucher_attachments IS
      'Tabel lampiran dokumen pendukung untuk payment voucher (invoice, kontrak, BA, BAST, foto, dll)';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_pva_type";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_pva_voucher";
    `);

    // Drop table (FK will be dropped automatically)
    await queryRunner.query(`
      DROP TABLE IF EXISTS payment_voucher_attachments;
    `);
  }
}
