import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration: CreateBukuPembantuRegister
 * Membuat tabel untuk Buku Pembantu (9 jenis) dan Register (STS, SPJ)
 * Sesuai Per-47/PB/2014
 */
export class CreateBukuPembantuRegister1739502689000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create table: buku_pembantu
    await queryRunner.createTable(
      new Table({
        name: 'buku_pembantu',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'jenisBuku',
            type: 'varchar',
            length: '50',
            comment:
              'KAS_TUNAI, BANK, PAJAK, PANJAR, PENDAPATAN, DEPOSITO, INVESTASI, PIUTANG, PERSEDIAAN',
          },
          {
            name: 'bankId',
            type: 'uuid',
            isNullable: true,
            comment: 'Untuk buku bank',
          },
          {
            name: 'nomorRekening',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Untuk buku bank',
          },
          {
            name: 'jenisPajak',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'PPH21, PPH22, PPH23, PPH4_2, PPN',
          },
          {
            name: 'jenisDepositoID',
            type: 'uuid',
            isNullable: true,
            comment: 'Untuk buku deposito',
          },
          {
            name: 'tanggal',
            type: 'timestamp',
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
            name: 'nomorUrut',
            type: 'int',
          },
          {
            name: 'uraian',
            type: 'text',
          },
          {
            name: 'nomorBukti',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'debet',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'kredit',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'saldo',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'bkuId',
            type: 'uuid',
            isNullable: true,
            comment: 'Link to BKU (optional)',
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

    // Create indexes for buku_pembantu
    await queryRunner.query(
      `CREATE INDEX "IDX_buku_pembantu_jenisBuku_bulan_tahun" ON "buku_pembantu" ("jenisBuku", "bulan", "tahun")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_buku_pembantu_jenisBuku" ON "buku_pembantu" ("jenisBuku")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_buku_pembantu_tanggal" ON "buku_pembantu" ("tanggal")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_buku_pembantu_bankId" ON "buku_pembantu" ("bankId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_buku_pembantu_jenisPajak" ON "buku_pembantu" ("jenisPajak")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_buku_pembantu_bendaharaId" ON "buku_pembantu" ("bendaharaId")`,
    );

    // 2. Create table: register_sts
    await queryRunner.createTable(
      new Table({
        name: 'register_sts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nomorSTS',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'tanggal',
            type: 'timestamp',
          },
          {
            name: 'jenisSetoran',
            type: 'varchar',
            length: '50',
            comment: 'PENDAPATAN, PAJAK, LAINNYA',
          },
          {
            name: 'jumlah',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'keterangan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'transaksiId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'transaksiType',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'PENDAPATAN_BLUD, TAX_TRANSACTION, dll',
          },
          {
            name: 'bankTujuanId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'nomorRekeningTujuan',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'bendaharaId',
            type: 'uuid',
          },
          {
            name: 'bulan',
            type: 'int',
          },
          {
            name: 'tahun',
            type: 'int',
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

    // Create indexes for register_sts
    await queryRunner.query(
      `CREATE INDEX "IDX_register_sts_nomorSTS" ON "register_sts" ("nomorSTS")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_sts_tanggal" ON "register_sts" ("tanggal")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_sts_jenisSetoran" ON "register_sts" ("jenisSetoran")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_sts_bendaharaId" ON "register_sts" ("bendaharaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_sts_bulan_tahun" ON "register_sts" ("bulan", "tahun")`,
    );

    // 3. Create table: register_spj
    await queryRunner.createTable(
      new Table({
        name: 'register_spj',
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
            name: 'tanggalSPJ',
            type: 'timestamp',
          },
          {
            name: 'jenisSPJ',
            type: 'varchar',
            length: '20',
            comment: 'UP, GU, TU, LS',
          },
          {
            name: 'jumlah',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'tanggalPengesahan',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'DRAFT'",
            comment: 'DRAFT, SUBMITTED, VERIFIED, APPROVED, REJECTED',
          },
          {
            name: 'spjId',
            type: 'uuid',
            comment: 'Link to SPJUP/SPJGU/SPJTU/SPJLS',
          },
          {
            name: 'spjType',
            type: 'varchar',
            length: '50',
            comment: 'SPJUP, SPJGU, SPJTU, SPJLS',
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

    // Create indexes for register_spj
    await queryRunner.query(
      `CREATE INDEX "IDX_register_spj_nomorSPJ" ON "register_spj" ("nomorSPJ")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_spj_bulan" ON "register_spj" ("bulan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_spj_tahun" ON "register_spj" ("tahun")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_spj_tanggalSPJ" ON "register_spj" ("tanggalSPJ")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_spj_jenisSPJ" ON "register_spj" ("jenisSPJ")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_spj_status" ON "register_spj" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_spj_spjId" ON "register_spj" ("spjId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_register_spj_bendaharaId" ON "register_spj" ("bendaharaId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('register_spj');
    await queryRunner.dropTable('register_sts');
    await queryRunner.dropTable('buku_pembantu');
  }
}
