import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration: CreateBLUDRBAModule
 * Creates RBA (Rencana Bisnis dan Anggaran) module tables
 */
export class CreateBLUDRBAModule1708000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // RBA Master
    await queryRunner.createTable(
      new Table({
        name: 'rba',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'kode', type: 'varchar', length: '50', isUnique: true },
          { name: 'tahunAnggaran', type: 'int' },
          { name: 'status', type: 'varchar', length: '50' },
          { name: 'revisiKe', type: 'int', default: 0 },
          { name: 'visi', type: 'text', isNullable: true },
          { name: 'misi', type: 'text', isNullable: true },
          { name: 'tujuan', type: 'text', isNullable: true },
          { name: 'targetOutput', type: 'jsonb', isNullable: true },
          { name: 'iku', type: 'jsonb', isNullable: true },
          { name: 'proyeksiPendapatan', type: 'decimal', precision: 15, scale: 2 },
          { name: 'proyeksiBelanja', type: 'decimal', precision: 15, scale: 2 },
          { name: 'proyeksiPembiayaan', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'tanggalPenyusunan', type: 'timestamp' },
          { name: 'tanggalApproval', type: 'timestamp', isNullable: true },
          { name: 'approvedBy', type: 'varchar', isNullable: true },
          { name: 'createdBy', type: 'varchar' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('rba', new TableIndex({ columnNames: ['kode'] }));
    await queryRunner.createIndex('rba', new TableIndex({ columnNames: ['tahunAnggaran'] }));
    await queryRunner.createIndex('rba', new TableIndex({ columnNames: ['status'] }));

    // RBA Pendapatan
    await queryRunner.createTable(
      new Table({
        name: 'rba_pendapatan',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'rbaId', type: 'uuid' },
          { name: 'kodeRekening', type: 'varchar', length: '20' },
          { name: 'uraian', type: 'varchar', length: '255' },
          { name: 'sumberDana', type: 'varchar', length: '50' },
          { name: 'tw1', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'tw2', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'tw3', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'tw4', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'totalProyeksi', type: 'decimal', precision: 15, scale: 2 },
          { name: 'keterangan', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('rba_pendapatan', new TableIndex({ columnNames: ['rbaId'] }));
    await queryRunner.createIndex('rba_pendapatan', new TableIndex({ columnNames: ['kodeRekening'] }));

    // RBA Belanja
    await queryRunner.createTable(
      new Table({
        name: 'rba_belanja',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'rbaId', type: 'uuid' },
          { name: 'kodeRekening', type: 'varchar', length: '20' },
          { name: 'uraian', type: 'varchar', length: '255' },
          { name: 'jenisBelanja', type: 'varchar', length: '50' },
          { name: 'tw1', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'tw2', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'tw3', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'tw4', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'totalProyeksi', type: 'decimal', precision: 15, scale: 2 },
          { name: 'keterangan', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('rba_belanja', new TableIndex({ columnNames: ['rbaId'] }));
    await queryRunner.createIndex('rba_belanja', new TableIndex({ columnNames: ['kodeRekening'] }));

    // RBA Pembiayaan
    await queryRunner.createTable(
      new Table({
        name: 'rba_pembiayaan',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'rbaId', type: 'uuid' },
          { name: 'jenis', type: 'varchar', length: '50' },
          { name: 'kodeRekening', type: 'varchar', length: '20' },
          { name: 'uraian', type: 'varchar', length: '255' },
          { name: 'nilai', type: 'decimal', precision: 15, scale: 2 },
          { name: 'keterangan', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('rba_pembiayaan', new TableIndex({ columnNames: ['rbaId'] }));

    // Anggaran Kas
    await queryRunner.createTable(
      new Table({
        name: 'anggaran_kas',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'rbaId', type: 'uuid' },
          { name: 'bulan', type: 'int' },
          { name: 'tahun', type: 'int' },
          { name: 'saldoAwal', type: 'decimal', precision: 15, scale: 2 },
          { name: 'penerimaanAPBD', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'penerimaanFungsional', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'penerimaanHibah', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'penerimaanLain', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'totalPenerimaan', type: 'decimal', precision: 15, scale: 2 },
          { name: 'belanjaPegawai', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'belanjaBarangJasa', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'belanjaModal', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'belanjaLain', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'totalPengeluaran', type: 'decimal', precision: 15, scale: 2 },
          { name: 'saldoAkhir', type: 'decimal', precision: 15, scale: 2 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('anggaran_kas', new TableIndex({ columnNames: ['rbaId'] }));
    await queryRunner.createIndex('anggaran_kas', new TableIndex({ columnNames: ['tahun', 'bulan'] }));

    // Revisi RBA
    await queryRunner.createTable(
      new Table({
        name: 'revisi_rba',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'rbaId', type: 'uuid' },
          { name: 'revisiKe', type: 'int' },
          { name: 'tanggalRevisi', type: 'timestamp' },
          { name: 'alasanRevisi', type: 'text' },
          { name: 'perubahanData', type: 'jsonb' },
          { name: 'approvedBy', type: 'varchar', isNullable: true },
          { name: 'approvedAt', type: 'timestamp', isNullable: true },
          { name: 'createdBy', type: 'varchar' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('revisi_rba', new TableIndex({ columnNames: ['rbaId'] }));

    console.log('✅ RBA Module tables created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('revisi_rba');
    await queryRunner.dropTable('anggaran_kas');
    await queryRunner.dropTable('rba_pembiayaan');
    await queryRunner.dropTable('rba_belanja');
    await queryRunner.dropTable('rba_pendapatan');
    await queryRunner.dropTable('rba');
  }
}
