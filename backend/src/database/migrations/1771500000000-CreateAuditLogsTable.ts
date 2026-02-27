import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogsTable1771500000000 implements MigrationInterface {
  name = 'CreateAuditLogsTable1771500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"         VARCHAR(36),
        "user_name"       VARCHAR(255),
        "user_nip"        VARCHAR(50),
        "user_role"       VARCHAR(100),
        "unit_kerja"      VARCHAR(255),
        "action"          VARCHAR(50) NOT NULL,
        "entity_type"     VARCHAR(50),
        "entity_id"       VARCHAR(36),
        "entity_label"    VARCHAR(255),
        "old_value"       JSONB,
        "new_value"       JSONB,
        "changed_fields"  JSONB,
        "reason"          TEXT,
        "status"          VARCHAR(10) DEFAULT 'SUCCESS',
        "error_message"   TEXT,
        "ip_address"      VARCHAR(45),
        "user_agent"      TEXT,
        "browser_name"    VARCHAR(100),
        "os_name"         VARCHAR(100),
        "timestamp"       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        "hash"            TEXT NOT NULL DEFAULT '',
        "prev_hash"       TEXT
      )
    `);

    // Indeks performa
    await queryRunner.query(`
      CREATE INDEX "idx_audit_user_time"   ON "audit_logs"("user_id", "timestamp" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_audit_action_time" ON "audit_logs"("action", "timestamp" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_audit_entity"      ON "audit_logs"("entity_type", "entity_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_audit_timestamp"   ON "audit_logs"("timestamp" DESC)
    `);

    // Trigger immutable — cegah UPDATE/DELETE
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION prevent_audit_modification()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'audit_logs adalah immutable — tidak bisa diubah atau dihapus';
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_prevent_update_audit
        BEFORE UPDATE ON "audit_logs"
        FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification()
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_prevent_delete_audit
        BEFORE DELETE ON "audit_logs"
        FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_prevent_delete_audit ON "audit_logs"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_prevent_update_audit ON "audit_logs"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS prevent_audit_modification()`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
  }
}
