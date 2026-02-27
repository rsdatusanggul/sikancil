import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBuktiBayarModule1771142123000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create bukti_bayar table
    await queryRunner.createTable(
      new Table({
        name: 'bukti_bayar',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nomorBuktiBayar',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'tanggalBuktiBayar',
            type: 'timestamp',
          },
          {
            name: 'tahunAnggaran',
            type: 'int',
          },
          {
            name: 'bulan',
            type: 'int',
          },
          {
            name: 'anggaranKasId',
            type: 'uuid',
          },
          {
            name: 'nilaiPembayaran',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'uraian',
            type: 'text',
          },
          {
            name: 'keterangan',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'jenisBelanja',
            type: 'enum',
            enum: ['PEGAWAI', 'BARANG_JASA', 'MODAL', 'LAIN'],
          },
          {
            name: 'namaPenerima',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'npwpPenerima',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'alamatPenerima',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'bankPenerima',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'rekeningPenerima',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'atasNamaRekening',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['DRAFT', 'SUBMITTED', 'VERIFIED', 'APPROVED', 'REJECTED', 'USED'],
            default: "'DRAFT'",
          },
          {
            name: 'submittedBy',
            type: 'uuid',
            isNullable: true,
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
            name: 'rejectedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'rejectedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'alasanReject',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'fileLampiran',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'fileBuktiBayar',
            type: 'varchar',
            length: '500',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_bukti_bayar_nomorBuktiBayar" ON "bukti_bayar" ("nomorBuktiBayar")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bukti_bayar_tanggalBuktiBayar" ON "bukti_bayar" ("tanggalBuktiBayar")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bukti_bayar_tahunAnggaran" ON "bukti_bayar" ("tahunAnggaran")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bukti_bayar_bulan" ON "bukti_bayar" ("bulan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bukti_bayar_anggaranKasId" ON "bukti_bayar" ("anggaranKasId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bukti_bayar_jenisBelanja" ON "bukti_bayar" ("jenisBelanja")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bukti_bayar_status" ON "bukti_bayar" ("status")`,
    );

    // Create foreign key to anggaran_kas
    await queryRunner.createForeignKey(
      'bukti_bayar',
      new TableForeignKey({
        columnNames: ['anggaranKasId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'anggaran_kas',
        onDelete: 'RESTRICT',
        name: 'FK_bukti_bayar_anggaranKas',
      }),
    );

    // Add buktiBayarId column to spp table (check if exists first)
    const sppTable = await queryRunner.getTable('spp');
    if (sppTable && !sppTable.findColumnByName('buktiBayarId')) {
      await queryRunner.query(`
        ALTER TABLE "spp" ADD COLUMN "buktiBayarId" uuid NULL
      `);

      // Create index for buktiBayarId
      await queryRunner.query(
        `CREATE INDEX "IDX_spp_buktiBayarId" ON "spp" ("buktiBayarId")`,
      );

      // Create foreign key from spp to bukti_bayar
      await queryRunner.createForeignKey(
        'spp',
        new TableForeignKey({
          columnNames: ['buktiBayarId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'bukti_bayar',
          onDelete: 'SET NULL',
          name: 'FK_spp_buktiBayar',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key from spp
    await queryRunner.dropForeignKey('spp', 'FK_spp_buktiBayar');

    // Drop index from spp
    await queryRunner.query(`DROP INDEX "IDX_spp_buktiBayarId"`);

    // Drop column from spp
    await queryRunner.query(`ALTER TABLE "spp" DROP COLUMN "buktiBayarId"`);

    // Drop foreign key from bukti_bayar
    await queryRunner.dropForeignKey('bukti_bayar', 'FK_bukti_bayar_anggaranKas');

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_bukti_bayar_status"`);
    await queryRunner.query(`DROP INDEX "IDX_bukti_bayar_jenisBelanja"`);
    await queryRunner.query(`DROP INDEX "IDX_bukti_bayar_anggaranKasId"`);
    await queryRunner.query(`DROP INDEX "IDX_bukti_bayar_bulan"`);
    await queryRunner.query(`DROP INDEX "IDX_bukti_bayar_tahunAnggaran"`);
    await queryRunner.query(`DROP INDEX "IDX_bukti_bayar_tanggalBuktiBayar"`);
    await queryRunner.query(`DROP INDEX "IDX_bukti_bayar_nomorBuktiBayar"`);

    // Drop table
    await queryRunner.dropTable('bukti_bayar');
  }
}
