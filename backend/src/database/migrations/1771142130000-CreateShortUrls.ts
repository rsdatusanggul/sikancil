import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateShortUrls
 *
 * Membuat tabel short_urls untuk QR Code verification system.
 *
 * Setiap payment voucher yang di-print akan mendapatkan QR Code
 * yang berisi short URL (hash) untuk verifikasi keaslian dokumen.
 *
 * Format URL: https://sikancil.rsud-ds.go.id/v/{hash}
 * Contoh: https://sikancil.rsud-ds.go.id/v/a7b3c4d5
 *
 * Ketika di-scan, sistem akan lookup hash ini dan redirect ke
 * halaman detail payment voucher untuk verifikasi.
 */
export class CreateShortUrls1771142130000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create short_urls table
    await queryRunner.query(`
      CREATE TABLE short_urls (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        -- Short hash/code untuk URL
        -- Harus unik, random, dan sulit ditebak
        hash        VARCHAR(16) UNIQUE NOT NULL,

        -- Target yang dituju (polymorphic reference)
        target_id   UUID NOT NULL,
        target_type VARCHAR(50) NOT NULL DEFAULT 'PAYMENT_VOUCHER',
        -- PAYMENT_VOUCHER | SPP | SPM | SP2D | dll

        -- Optional expiry untuk keamanan
        -- NULL = tidak pernah expired
        expires_at  TIMESTAMP,

        -- Audit
        created_at  TIMESTAMP DEFAULT NOW(),

        -- Index untuk fast lookup by hash
        CONSTRAINT "UQ_short_urls_hash" UNIQUE (hash)
      );
    `);

    // Create index for hash lookup (most important!)
    await queryRunner.query(`
      CREATE INDEX "idx_short_urls_hash" ON short_urls("hash");
    `);

    // Create index for target lookup
    await queryRunner.query(`
      CREATE INDEX "idx_short_urls_target" ON short_urls("target_id", "target_type");
    `);

    // Create index for cleanup expired URLs
    await queryRunner.query(`
      CREATE INDEX "idx_short_urls_expires" ON short_urls("expires_at")
        WHERE expires_at IS NOT NULL;
    `);

    // Add comments
    await queryRunner.query(`
      COMMENT ON TABLE short_urls IS
      'Short URL untuk QR Code verification - setiap payment voucher mendapat hash unik untuk verifikasi keaslian';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN short_urls.hash IS
      'Short hash (8-16 karakter) yang di-embed di QR Code untuk verifikasi dokumen';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN short_urls.target_type IS
      'Tipe dokumen: PAYMENT_VOUCHER, SPP, SPM, SP2D, dll - untuk polymorphic reference';
    `);

    // Create function to generate random hash
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION generate_short_hash(p_length INTEGER DEFAULT 8)
      RETURNS VARCHAR
      LANGUAGE plpgsql AS $$
      DECLARE
        v_chars VARCHAR := 'abcdefghijklmnopqrstuvwxyz0123456789';
        v_hash VARCHAR := '';
        v_exists BOOLEAN;
      BEGIN
        -- Loop until we get a unique hash
        LOOP
          -- Generate random hash
          v_hash := '';
          FOR i IN 1..p_length LOOP
            v_hash := v_hash || substr(v_chars, floor(random() * length(v_chars) + 1)::INTEGER, 1);
          END LOOP;

          -- Check if hash already exists
          SELECT EXISTS(SELECT 1 FROM short_urls WHERE hash = v_hash) INTO v_exists;

          -- If unique, exit loop
          EXIT WHEN NOT v_exists;
        END LOOP;

        RETURN v_hash;
      END;
      $$;
    `);

    await queryRunner.query(`
      COMMENT ON FUNCTION generate_short_hash IS
      'Generate random hash unik untuk short URL - loop hingga menemukan hash yang belum dipakai';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS generate_short_hash;
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_short_urls_expires";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_short_urls_target";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_short_urls_hash";
    `);

    // Drop table
    await queryRunner.query(`
      DROP TABLE IF EXISTS short_urls;
    `);
  }
}
