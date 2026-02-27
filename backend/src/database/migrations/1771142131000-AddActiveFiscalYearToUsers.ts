import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveFiscalYearToUsers1771142131000 implements MigrationInterface {
  name = 'AddActiveFiscalYearToUsers1771142131000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "activeFiscalYearId" uuid
    `);

    // Add foreign key constraint to fiscal_years table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "fk_users_active_fiscal_year" 
      FOREIGN KEY ("activeFiscalYearId") 
      REFERENCES "fiscal_years"("id") 
      ON DELETE SET NULL
    `);

    // Set default active fiscal year for existing users
    // Use the current active fiscal year or the most recent one
    await queryRunner.query(`
      UPDATE users 
      SET "activeFiscalYearId" = (
        SELECT id 
        FROM fiscal_years 
        WHERE "isCurrent" = true 
        LIMIT 1
      )
      WHERE "activeFiscalYearId" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP CONSTRAINT IF EXISTS "fk_users_active_fiscal_year"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "activeFiscalYearId"
    `);
  }
}