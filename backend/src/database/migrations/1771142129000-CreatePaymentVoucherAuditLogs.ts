import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreatePaymentVoucherAuditLogs
 *
 * Membuat tabel payment_voucher_audit_logs untuk menyimpan
 * audit trail lengkap dari semua aktivitas payment voucher.
 *
 * Mencatat semua action seperti:
 * - CREATED, UPDATED, SUBMITTED
 * - APPROVED_TECHNICAL, APPROVED_TREASURER, APPROVED_FINAL
 * - REJECTED, CANCELLED
 * - SPP_CREATED, PRINTED
 *
 * Dilengkapi metadata JSONB untuk informasi tambahan seperti
 * IP address, browser, device, dll.
 */
export class CreatePaymentVoucherAuditLogs1771142129000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create payment_voucher_audit_logs table
    await queryRunner.query(`
      CREATE TABLE payment_voucher_audit_logs (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        voucher_id  UUID NOT NULL,

        -- Action yang dilakukan
        action      VARCHAR(50) NOT NULL,
        -- CREATED | UPDATED | SUBMITTED |
        -- APPROVED_TECHNICAL | APPROVED_TREASURER | APPROVED_FINAL |
        -- REJECTED | CANCELLED |
        -- SPP_CREATED | PRINTED | DELETED | RESTORED

        -- Status transition
        old_status  VARCHAR(30),
        new_status  VARCHAR(30),

        -- Catatan/notes dari user
        notes       TEXT,

        -- Metadata tambahan (IP, browser, device, changes, dll)
        metadata    JSONB,
        -- Contoh: {"ip": "192.168.1.1", "browser": "Chrome", "changes": {"gross_amount": [1000000, 1500000]}}

        -- Audit
        performed_by  UUID,
        performed_at  TIMESTAMP DEFAULT NOW(),

        -- Foreign key constraint
        CONSTRAINT "FK_pval_voucher"
          FOREIGN KEY ("voucher_id")
          REFERENCES "payment_vouchers"("id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_pval_user"
          FOREIGN KEY ("performed_by")
          REFERENCES "users"("id")
          ON DELETE SET NULL
      );
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX "idx_pval_voucher" ON payment_voucher_audit_logs("voucher_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_pval_performed" ON payment_voucher_audit_logs("performed_at");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_pval_action" ON payment_voucher_audit_logs("action");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_pval_performed_by" ON payment_voucher_audit_logs("performed_by");
    `);

    // Create GIN index for JSONB metadata queries
    await queryRunner.query(`
      CREATE INDEX "idx_pval_metadata" ON payment_voucher_audit_logs USING GIN ("metadata");
    `);

    // Add comment to table
    await queryRunner.query(`
      COMMENT ON TABLE payment_voucher_audit_logs IS
      'Audit trail lengkap untuk semua aktivitas payment voucher - untuk compliance dan tracking';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN payment_voucher_audit_logs.metadata IS
      'Metadata JSONB untuk informasi tambahan seperti IP, browser, device, field changes, dll';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_pval_metadata";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_pval_performed_by";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_pval_action";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_pval_performed";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_pval_voucher";
    `);

    // Drop table (FK will be dropped automatically)
    await queryRunner.query(`
      DROP TABLE IF EXISTS payment_voucher_audit_logs;
    `);
  }
}
