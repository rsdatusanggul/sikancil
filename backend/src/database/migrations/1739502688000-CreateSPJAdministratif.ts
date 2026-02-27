import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration: CreateSPJAdministratif
 * Membuat tabel untuk SPJ Administratif (UP/GU/TU)
 * Sesuai Permendagri 13/2006 dan Per-47/PB/2014
 */
export class CreateSPJAdministratif1739502688000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create table: spj_up
    await queryRunner.createTable(
      new Table({
        name: 'spj_up',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nomorSPJ',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'bulan',
            type: 'int',
            comment: '1-12',
          },
          {
            name: 'tahun',
            type: 'int',
          },
          {
            name: 'nilaiUP',
            type: 'decimal',
            precision: 15,
            scale: 2,
            comment: 'Nilai UP dari SK',
          },
          {
            name: 'saldoAwalUP',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'detailPengeluaran',
            type: 'jsonb',
            comment:
              'Format: [{tanggal, noBukti, uraian, kodeRekening, jumlah, keterangan}]',
          },
          {
            name: 'totalPengeluaran',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'sisaUP',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'buktiPengeluaran',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of file paths',
          },
          {
            name: 'buktiSetorPajak',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of file paths',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'DRAFT'",
            comment: 'DRAFT, SUBMITTED, VERIFIED, APPROVED, REJECTED',
          },
          {
            name: 'bendaharaId',
            type: 'uuid',
          },
          {
            name: 'submittedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'verifiedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'verifiedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'approvedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'approvedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'catatanVerifikasi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'alasanReject',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isUsedForGU',
            type: 'boolean',
            default: false,
          },
          {
            name: 'spjGUId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for spj_up
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_spj_up_bulan_tahun_bendaharaId" ON "spj_up" ("bulan", "tahun", "bendaharaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_up_nomorSPJ" ON "spj_up" ("nomorSPJ")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_up_bulan" ON "spj_up" ("bulan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_up_tahun" ON "spj_up" ("tahun")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_up_status" ON "spj_up" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_up_bendaharaId" ON "spj_up" ("bendaharaId")`,
    );

    // 2. Create table: spj_gu
    await queryRunner.createTable(
      new Table({
        name: 'spj_gu',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nomorSPJ',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'periodeAwal',
            type: 'timestamp',
          },
          {
            name: 'periodeAkhir',
            type: 'timestamp',
          },
          {
            name: 'spjUPIds',
            type: 'jsonb',
            comment: 'Array of SPJ UP IDs',
          },
          {
            name: 'totalGU',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'rekapPerRekening',
            type: 'jsonb',
            comment: 'Format: [{kodeRekening, uraian, jumlah}]',
          },
          {
            name: 'nomorSPP',
            type: 'varchar',
            length: '100',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'tanggalSPP',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'nomorSPM',
            type: 'varchar',
            length: '100',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'tanggalSPM',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'nomorSP2D',
            type: 'varchar',
            length: '100',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'tanggalSP2D',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'nilaiSP2D',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'DRAFT'",
            comment: 'DRAFT, SPJ_APPROVED, SPP_CREATED, SPM_ISSUED, SP2D_ISSUED',
          },
          {
            name: 'bendaharaId',
            type: 'uuid',
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for spj_gu
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_gu_nomorSPJ" ON "spj_gu" ("nomorSPJ")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_gu_status" ON "spj_gu" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_gu_bendaharaId" ON "spj_gu" ("bendaharaId")`,
    );

    // 3. Create table: spj_tu
    await queryRunner.createTable(
      new Table({
        name: 'spj_tu',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nomorSPJ',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'tanggal',
            type: 'timestamp',
          },
          {
            name: 'alasanTU',
            type: 'text',
            comment: 'Mengapa perlu TU, kebutuhan mendesak apa',
          },
          {
            name: 'sisaUPSaatIni',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'persentaseSisaUP',
            type: 'decimal',
            precision: 5,
            scale: 2,
            comment: 'Persentase sisa UP (%)',
          },
          {
            name: 'kebutuhanMendesak',
            type: 'text',
          },
          {
            name: 'nilaiTU',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'detailPengeluaran',
            type: 'jsonb',
            comment: 'Format: [{tanggal, noBukti, uraian, kodeRekening, jumlah}]',
          },
          {
            name: 'totalPengeluaran',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'sisaTU',
            type: 'decimal',
            precision: 15,
            scale: 2,
            comment: 'Harus disetorkan',
          },
          {
            name: 'buktiSetor',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'tanggalSetor',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'nomorSPP',
            type: 'varchar',
            length: '100',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'nomorSPM',
            type: 'varchar',
            length: '100',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'nomorSP2D',
            type: 'varchar',
            length: '100',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'tanggalSP2D',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'DRAFT'",
            comment: 'DRAFT, APPROVED, USED, SETTLED, REJECTED',
          },
          {
            name: 'batasPertanggungjawaban',
            type: 'timestamp',
            comment: 'Max 1 bulan dari SP2D',
          },
          {
            name: 'isPertanggungjawab',
            type: 'boolean',
            default: false,
          },
          {
            name: 'alasanReject',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'bendaharaId',
            type: 'uuid',
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for spj_tu
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_tu_nomorSPJ" ON "spj_tu" ("nomorSPJ")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_tu_tanggal" ON "spj_tu" ("tanggal")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_tu_status" ON "spj_tu" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_tu_bendaharaId" ON "spj_tu" ("bendaharaId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('spj_tu');
    await queryRunner.dropTable('spj_gu');
    await queryRunner.dropTable('spj_up');
  }
}
