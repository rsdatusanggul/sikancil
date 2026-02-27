import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: RefactorBuktiBayarToPaymentVouchers
 *
 * TAHAP KRUSIAL: Mengubah tabel bukti_bayar menjadi payment_vouchers
 * dengan struktur lengkap untuk mendukung:
 * - 8 Jenis Pajak (PPN, PPh 21/22/23/4(2)/Final UMKM/24, PBJT)
 * - 4 Level Tanda Tangan (Technical Officer, Receiver/PPTK, Treasurer, Approver)
 * - Hierarki Anggaran (Program, Kegiatan, Sub Kegiatan)
 * - UMKM Support (SK Number, Expiry)
 * - Computed Columns (Total Deductions, Net Payment)
 */
export class RefactorBuktiBayarToPaymentVouchers1771142127000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ════════════════════════════════════════════════════════════════
    // STEP 1: Drop existing foreign keys and indexes
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      -- Drop FK from spp table if exists
      ALTER TABLE IF EXISTS "spp" DROP CONSTRAINT IF EXISTS "FK_spp_buktiBayar";
    `);

    await queryRunner.query(`
      -- Drop FK from bukti_bayar
      ALTER TABLE "bukti_bayar" DROP CONSTRAINT IF EXISTS "FK_bukti_bayar_anggaranKas";
    `);

    await queryRunner.query(`
      -- Drop old indexes
      DROP INDEX IF EXISTS "IDX_bukti_bayar_status";
      DROP INDEX IF EXISTS "IDX_bukti_bayar_jenisBelanja";
      DROP INDEX IF EXISTS "IDX_bukti_bayar_anggaranKasId";
      DROP INDEX IF EXISTS "IDX_bukti_bayar_bulan";
      DROP INDEX IF EXISTS "IDX_bukti_bayar_tahunAnggaran";
      DROP INDEX IF EXISTS "IDX_bukti_bayar_tanggalBuktiBayar";
      DROP INDEX IF EXISTS "IDX_bukti_bayar_nomorBuktiBayar";
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 2: Rename table
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "bukti_bayar" RENAME TO "payment_vouchers";
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 3: Rename and modify existing columns
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      -- Rename nomor bukti bayar
      ALTER TABLE "payment_vouchers" RENAME COLUMN "nomorBuktiBayar" TO "voucher_number";
      ALTER TABLE "payment_vouchers" ALTER COLUMN "voucher_number" TYPE VARCHAR(120);

      -- Rename tanggal
      ALTER TABLE "payment_vouchers" RENAME COLUMN "tanggalBuktiBayar" TO "voucher_date";
      ALTER TABLE "payment_vouchers" ALTER COLUMN "voucher_date" TYPE DATE;

      -- Rename tahun & bulan
      ALTER TABLE "payment_vouchers" RENAME COLUMN "tahunAnggaran" TO "fiscal_year";
      ALTER TABLE "payment_vouchers" RENAME COLUMN "bulan" TO "voucher_month";

      -- Rename anggaran kas (will be removed later, kept temporarily)
      ALTER TABLE "payment_vouchers" RENAME COLUMN "anggaranKasId" TO "rak_id_legacy";
      ALTER TABLE "payment_vouchers" ALTER COLUMN "rak_id_legacy" DROP NOT NULL;

      -- Rename nilai pembayaran -> gross amount
      ALTER TABLE "payment_vouchers" RENAME COLUMN "nilaiPembayaran" TO "gross_amount";

      -- Rename uraian -> payment_purpose
      ALTER TABLE "payment_vouchers" RENAME COLUMN "uraian" TO "payment_purpose";

      -- Rename keterangan (will be repurposed)
      ALTER TABLE "payment_vouchers" RENAME COLUMN "keterangan" TO "notes_legacy";
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 4: Add new columns - IDENTITAS DOKUMEN
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        ADD COLUMN "voucher_sequence" INTEGER,
        ADD COLUMN "unit_code" VARCHAR(20) NOT NULL DEFAULT 'RSUD-DS';
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 5: Add new columns - HIERARKI ANGGARAN
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        ADD COLUMN "program_id" UUID,
        ADD COLUMN "program_code" VARCHAR(30),
        ADD COLUMN "program_name" TEXT,
        ADD COLUMN "kegiatan_id" UUID,
        ADD COLUMN "kegiatan_code" VARCHAR(30),
        ADD COLUMN "kegiatan_name" TEXT,
        ADD COLUMN "sub_kegiatan_id" UUID,
        ADD COLUMN "sub_kegiatan_code" VARCHAR(30),
        ADD COLUMN "sub_kegiatan_name" TEXT,
        ADD COLUMN "account_code" VARCHAR(60),
        ADD COLUMN "account_name" TEXT;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 6: Add new columns - CACHE VALIDASI ANGGARAN
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        ADD COLUMN "available_pagu" DECIMAL(15,2),
        ADD COLUMN "rak_monthly_limit" DECIMAL(15,2),
        ADD COLUMN "previous_commitments" DECIMAL(15,2);
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 7: Add new columns - PPTK
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        ADD COLUMN "pptk_id" UUID;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 8: Add new columns - DETAIL PEMBAYARAN (Vendor)
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      -- Rename existing columns
      ALTER TABLE "payment_vouchers" RENAME COLUMN "namaPenerima" TO "payee_name";
      ALTER TABLE "payment_vouchers" RENAME COLUMN "npwpPenerima" TO "vendor_npwp_legacy";
      ALTER TABLE "payment_vouchers" RENAME COLUMN "alamatPenerima" TO "vendor_address_legacy";

      -- Add new vendor columns
      ALTER TABLE "payment_vouchers"
        ADD COLUMN "vendor_name" VARCHAR(255),
        ADD COLUMN "vendor_npwp" VARCHAR(30),
        ADD COLUMN "vendor_address" TEXT,
        ADD COLUMN "invoice_numbers" TEXT[],
        ADD COLUMN "invoice_date" DATE;

      -- Migrate data
      UPDATE "payment_vouchers"
      SET
        vendor_name = "payee_name",
        vendor_npwp = "vendor_npwp_legacy",
        vendor_address = "vendor_address_legacy";
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 9: Add new columns - PERHITUNGAN PAJAK
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        -- Tax rule reference
        ADD COLUMN "tax_rule_id" UUID,

        -- PPh 21 (Gaji/Honorarium)
        ADD COLUMN "pph21_rate" DECIMAL(5,2) DEFAULT 0,
        ADD COLUMN "pph21_amount" DECIMAL(15,2) DEFAULT 0,

        -- PPh 22 (Pembelian Barang)
        ADD COLUMN "pph22_rate" DECIMAL(5,2) DEFAULT 0,
        ADD COLUMN "pph22_amount" DECIMAL(15,2) DEFAULT 0,

        -- PPh 23 (Jasa)
        ADD COLUMN "pph23_rate" DECIMAL(5,2) DEFAULT 0,
        ADD COLUMN "pph23_amount" DECIMAL(15,2) DEFAULT 0,

        -- PPh 4(2) (Sewa)
        ADD COLUMN "pph4a2_rate" DECIMAL(5,2) DEFAULT 0,
        ADD COLUMN "pph4a2_amount" DECIMAL(15,2) DEFAULT 0,

        -- PPh Final UMKM
        ADD COLUMN "pph_final_umkm_rate" DECIMAL(5,2) DEFAULT 0,
        ADD COLUMN "pph_final_umkm_amount" DECIMAL(15,2) DEFAULT 0,

        -- PPh 24 (Luar Negeri)
        ADD COLUMN "pph24_rate" DECIMAL(5,2) DEFAULT 0,
        ADD COLUMN "pph24_amount" DECIMAL(15,2) DEFAULT 0,

        -- PPN
        ADD COLUMN "ppn_rate" DECIMAL(5,2) DEFAULT 0,
        ADD COLUMN "ppn_amount" DECIMAL(15,2) DEFAULT 0,

        -- Other deductions
        ADD COLUMN "other_deductions" DECIMAL(15,2) DEFAULT 0,
        ADD COLUMN "other_deductions_note" TEXT,

        -- PBJT (flag saja, bukan potongan)
        ADD COLUMN "includes_pbjt" BOOLEAN DEFAULT false,
        ADD COLUMN "pbjt_rate" DECIMAL(5,2) DEFAULT 0,
        ADD COLUMN "pbjt_amount" DECIMAL(15,2) DEFAULT 0;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 10: Add new columns - DATA UMKM
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        ADD COLUMN "sk_umkm_number" VARCHAR(50),
        ADD COLUMN "sk_umkm_expiry" DATE;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 11: Add COMPUTED COLUMNS
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        ADD COLUMN "total_deductions" DECIMAL(15,2) GENERATED ALWAYS AS (
          COALESCE(pph21_amount, 0) + COALESCE(pph22_amount, 0) +
          COALESCE(pph23_amount, 0) + COALESCE(pph4a2_amount, 0) +
          COALESCE(pph_final_umkm_amount, 0) + COALESCE(pph24_amount, 0) +
          COALESCE(ppn_amount, 0) + COALESCE(other_deductions, 0)
        ) STORED,
        ADD COLUMN "net_payment" DECIMAL(15,2) GENERATED ALWAYS AS (
          gross_amount - (
            COALESCE(pph21_amount, 0) + COALESCE(pph22_amount, 0) +
            COALESCE(pph23_amount, 0) + COALESCE(pph4a2_amount, 0) +
            COALESCE(pph_final_umkm_amount, 0) + COALESCE(pph24_amount, 0) +
            COALESCE(ppn_amount, 0) + COALESCE(other_deductions, 0)
          )
        ) STORED,
        ADD COLUMN "gross_amount_text" TEXT;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 12: Add new columns - TANDA TANGAN (4 Pihak - Pyramid)
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        -- [1] Pejabat Teknis BLUD (kiri atas)
        ADD COLUMN "technical_officer_id" UUID,
        ADD COLUMN "technical_officer_name" VARCHAR(255),
        ADD COLUMN "technical_officer_nip" VARCHAR(30),
        ADD COLUMN "technical_signed_at" TIMESTAMP,
        ADD COLUMN "technical_notes" TEXT,

        -- [2] Yang Menerima / PPTK (kanan atas)
        ADD COLUMN "receiver_id" UUID,
        ADD COLUMN "receiver_name" VARCHAR(255),
        ADD COLUMN "receiver_nip" VARCHAR(30),
        ADD COLUMN "receiver_signed_at" TIMESTAMP,

        -- [3] Bendahara Pengeluaran (tengah)
        ADD COLUMN "treasurer_id" UUID,
        ADD COLUMN "treasurer_name" VARCHAR(255),
        ADD COLUMN "treasurer_nip" VARCHAR(30),
        ADD COLUMN "treasurer_signed_at" TIMESTAMP,
        ADD COLUMN "treasurer_notes" TEXT,

        -- [4] Direktur / PA (bawah)
        ADD COLUMN "approver_id" UUID,
        ADD COLUMN "approver_name" VARCHAR(255),
        ADD COLUMN "approver_nip" VARCHAR(30),
        ADD COLUMN "approver_signed_at" TIMESTAMP;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 13: Modify STATUS column (add new statuses)
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      -- Drop old enum constraint
      ALTER TABLE "payment_vouchers" ALTER COLUMN "status" DROP DEFAULT;
      ALTER TABLE "payment_vouchers" ALTER COLUMN "status" TYPE VARCHAR(30);

      -- Update old statuses to new statuses
      UPDATE "payment_vouchers"
      SET status = CASE
        WHEN status = 'VERIFIED' THEN 'APPROVED'
        WHEN status = 'USED' THEN 'SPP_CREATED'
        ELSE status
      END;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 14: Update rejection columns
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers" RENAME COLUMN "rejectedBy" TO "rejection_by";
      ALTER TABLE "payment_vouchers" RENAME COLUMN "rejectedAt" TO "rejected_at";
      ALTER TABLE "payment_vouchers" RENAME COLUMN "alasanReject" TO "rejection_reason";
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 15: Add SPP link columns
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        ADD COLUMN "spp_id" UUID,
        ADD COLUMN "spp_created_at" TIMESTAMP;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 16: Update audit columns
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers" RENAME COLUMN "createdBy" TO "created_by";
      ALTER TABLE "payment_vouchers" RENAME COLUMN "createdAt" TO "created_at";
      ALTER TABLE "payment_vouchers" RENAME COLUMN "updatedAt" TO "updated_at";

      ALTER TABLE "payment_vouchers"
        ADD COLUMN "updated_by" UUID,
        ADD COLUMN "deleted_by" UUID,
        ADD COLUMN "deleted_at" TIMESTAMP;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 17: Drop old columns that are no longer needed
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        DROP COLUMN IF EXISTS "jenisBelanja",
        DROP COLUMN IF EXISTS "bankPenerima",
        DROP COLUMN IF EXISTS "rekeningPenerima",
        DROP COLUMN IF EXISTS "atasNamaRekening",
        DROP COLUMN IF EXISTS "submittedBy",
        DROP COLUMN IF EXISTS "submittedAt",
        DROP COLUMN IF EXISTS "verifiedBy",
        DROP COLUMN IF EXISTS "verifiedAt",
        DROP COLUMN IF EXISTS "approvedBy",
        DROP COLUMN IF EXISTS "approvedAt",
        DROP COLUMN IF EXISTS "fileLampiran",
        DROP COLUMN IF EXISTS "fileBuktiBayar",
        DROP COLUMN IF EXISTS "vendor_npwp_legacy",
        DROP COLUMN IF EXISTS "vendor_address_legacy",
        DROP COLUMN IF EXISTS "notes_legacy";
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 18: Add CONSTRAINTS
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      ALTER TABLE "payment_vouchers"
        ADD CONSTRAINT "chk_gross_amount_positive"
          CHECK (gross_amount > 0),
        ADD CONSTRAINT "chk_net_payment_positive"
          CHECK (net_payment >= 0),
        ADD CONSTRAINT "chk_deductions_not_exceed_gross"
          CHECK (total_deductions <= gross_amount),
        ADD CONSTRAINT "chk_spp_only_when_approved"
          CHECK (spp_id IS NULL OR status IN ('APPROVED', 'SPP_CREATED'));
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 19: Create INDEXES
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      CREATE INDEX "idx_pv_voucher_number" ON "payment_vouchers"("voucher_number");
      CREATE INDEX "idx_pv_fiscal_year" ON "payment_vouchers"("fiscal_year");
      CREATE INDEX "idx_pv_year_month" ON "payment_vouchers"("fiscal_year", "voucher_month");
      CREATE INDEX "idx_pv_account_code" ON "payment_vouchers"("account_code");
      CREATE INDEX "idx_pv_kegiatan" ON "payment_vouchers"("kegiatan_id");
      CREATE INDEX "idx_pv_sub_kegiatan" ON "payment_vouchers"("sub_kegiatan_id");
      CREATE INDEX "idx_pv_pptk" ON "payment_vouchers"("pptk_id");
      CREATE INDEX "idx_pv_status" ON "payment_vouchers"("status");
      CREATE INDEX "idx_pv_vendor" ON "payment_vouchers"("vendor_name");
      CREATE INDEX "idx_pv_voucher_date" ON "payment_vouchers"("voucher_date");
      CREATE INDEX "idx_pv_not_deleted" ON "payment_vouchers"("deleted_at") WHERE deleted_at IS NULL;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 20: Create UNIQUE INDEX for sequence
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_pv_sequence_unique"
        ON "payment_vouchers"("voucher_sequence", "account_code", "voucher_month", "fiscal_year", "unit_code")
        WHERE deleted_at IS NULL;
    `);

    // ════════════════════════════════════════════════════════════════
    // STEP 21: Add FOREIGN KEYS
    // ════════════════════════════════════════════════════════════════
    await queryRunner.query(`
      -- FK to tax_rules
      ALTER TABLE "payment_vouchers"
        ADD CONSTRAINT "FK_pv_tax_rule"
        FOREIGN KEY ("tax_rule_id") REFERENCES "tax_rules"("id")
        ON DELETE SET NULL;

      -- FK to spp (reverse)
      ALTER TABLE "payment_vouchers"
        ADD CONSTRAINT "FK_pv_spp"
        FOREIGN KEY ("spp_id") REFERENCES "spp"("id")
        ON DELETE SET NULL;
    `);

    // Update FK in spp table to point to payment_vouchers
    await queryRunner.query(`
      -- Rename column in spp table
      ALTER TABLE "spp" RENAME COLUMN "buktiBayarId" TO "payment_voucher_id";

      -- Re-create FK
      ALTER TABLE "spp"
        ADD CONSTRAINT "FK_spp_payment_voucher"
        FOREIGN KEY ("payment_voucher_id") REFERENCES "payment_vouchers"("id")
        ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback is complex - drop and recreate original table structure
    await queryRunner.query(`
      -- Drop all new constraints and indexes
      DROP INDEX IF EXISTS "idx_pv_sequence_unique";
      DROP INDEX IF EXISTS "idx_pv_not_deleted";
      DROP INDEX IF EXISTS "idx_pv_voucher_date";
      DROP INDEX IF EXISTS "idx_pv_vendor";
      DROP INDEX IF EXISTS "idx_pv_status";
      DROP INDEX IF EXISTS "idx_pv_pptk";
      DROP INDEX IF EXISTS "idx_pv_sub_kegiatan";
      DROP INDEX IF EXISTS "idx_pv_kegiatan";
      DROP INDEX IF EXISTS "idx_pv_account_code";
      DROP INDEX IF EXISTS "idx_pv_year_month";
      DROP INDEX IF EXISTS "idx_pv_fiscal_year";
      DROP INDEX IF EXISTS "idx_pv_voucher_number";

      -- Drop foreign keys
      ALTER TABLE "payment_vouchers" DROP CONSTRAINT IF EXISTS "FK_pv_spp";
      ALTER TABLE "payment_vouchers" DROP CONSTRAINT IF EXISTS "FK_pv_tax_rule";
      ALTER TABLE "spp" DROP CONSTRAINT IF EXISTS "FK_spp_payment_voucher";

      -- Rename back
      ALTER TABLE "payment_vouchers" RENAME TO "bukti_bayar";
      ALTER TABLE "spp" RENAME COLUMN "payment_voucher_id" TO "buktiBayarId";

      -- Note: Full rollback would require restoring all original columns
      -- This is a simplified rollback - in production, backup data first!
    `);
  }
}
