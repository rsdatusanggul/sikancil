import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Migration: CreateLaporanPenutupanKas
 * Membuat tabel untuk Laporan Penutupan Kas (Monthly Cash Reconciliation)
 */
export class CreateLaporanPenutupanKas1739502691000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'laporan_penutupan_kas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
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
          // Kas Tunai
          {
            name: 'saldoBKUTunai',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
            comment: 'Saldo menurut BKU',
          },
          {
            name: 'kasAktualTunai',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
            comment: 'Kas hasil perhitungan fisik',
          },
          {
            name: 'selisihTunai',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
            comment: 'Selisih (lebih/kurang)',
          },
          // Kas Bank
          {
            name: 'detailBank',
            type: 'jsonb',
            comment:
              'Format: [{bankId, namaBank, nomorRekening, saldoBKU, saldoBank, selisih}]',
          },
          {
            name: 'totalSaldoBKUBank',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalSaldoAktualBank',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalSelisihBank',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Total
          {
            name: 'totalKas',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
            comment: 'Kas Tunai + Kas Bank',
          },
          {
            name: 'penjelasanSelisih',
            type: 'text',
            isNullable: true,
            comment: 'Penjelasan jika ada selisih',
          },
          // Status & Approval
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'DRAFT'",
            comment: 'DRAFT, APPROVED, REJECTED',
          },
          {
            name: 'bendaharaId',
            type: 'uuid',
          },
          {
            name: 'approvedBy',
            type: 'uuid',
            isNullable: true,
            comment: 'Pemimpin BLUD',
          },
          {
            name: 'approvedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'catatanApproval',
            type: 'text',
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

    // Create indexes
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_laporan_penutupan_kas_bulan_tahun_bendaharaId" ON "laporan_penutupan_kas" ("bulan", "tahun", "bendaharaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_laporan_penutupan_kas_bulan" ON "laporan_penutupan_kas" ("bulan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_laporan_penutupan_kas_tahun" ON "laporan_penutupan_kas" ("tahun")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_laporan_penutupan_kas_status" ON "laporan_penutupan_kas" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_laporan_penutupan_kas_bendaharaId" ON "laporan_penutupan_kas" ("bendaharaId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('laporan_penutupan_kas');
  }
}
