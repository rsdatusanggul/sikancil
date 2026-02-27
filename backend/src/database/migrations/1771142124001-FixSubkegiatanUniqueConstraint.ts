import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration: FixSubkegiatanUniqueConstraint
 * 
 * Problem: The existing unique constraint UQ_123a57f9ad325a567a4a785aa2c on (kodeSubKegiatan, tahun)
 * prevents re-creating SubKegiatan records with the same code after they've been soft-deleted.
 * 
 * Solution: Replace the regular unique constraint with a partial unique index that only applies
 * to active records (isActive = true), matching the same pattern used in KegiatanRBA.
 */
export class FixSubkegiatanUniqueConstraint1771142124001 implements MigrationInterface {
  name = 'FixSubkegiatanUniqueConstraint1771142124001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop the existing unique constraint if it exists
    // Check if constraint exists first (it may not exist if @Unique was never applied)
    const table = await queryRunner.getTable('subkegiatan_rba');
    const existingUnique = table?.uniques.find(
      u => u.name === 'UQ_123a57f9ad325a567a4a785aa2c'
    );
    
    if (existingUnique) {
      await queryRunner.query(
        `ALTER TABLE "subkegiatan_rba" DROP CONSTRAINT "UQ_123a57f9ad325a567a4a785aa2c"`
      );
    }

    // Step 2: Create a partial unique index that only applies to active records
    // This allows soft-deleted records to have the same kodeSubKegiatan + tahun
    // Check if index already exists
    const indexExists = table?.indices.find(
      i => i.name === 'UQ_subkegiatan_rba_kode_tahun_active'
    );
    
    if (!indexExists) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX "UQ_subkegiatan_rba_kode_tahun_active" ` +
        `ON "subkegiatan_rba" ("kodeSubKegiatan", "tahun") ` +
        `WHERE "isActive" = true`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse: Drop the partial unique index
    await queryRunner.query(
      `DROP INDEX "public"."UQ_subkegiatan_rba_kode_tahun_active"`
    );

    // Restore the original unique constraint
    await queryRunner.query(
      `ALTER TABLE "subkegiatan_rba" ` +
      `ADD CONSTRAINT "UQ_123a57f9ad325a567a4a785aa2c" ` +
      `UNIQUE ("kodeSubKegiatan", "tahun")`
    );
  }
}