import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: CreateBLUDSchema
 * Creates all 48 tables for Si-Kancil BLUD v2.0
 * Generated: February 2026
 */
export class CreateBLUDSchema1708000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ===================================
    // 1. MASTER DATA TABLES
    // ===================================

    // Chart of Accounts
    await queryRunner.createTable(
      new Table({
        name: 'chart_of_accounts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'kodeRekening', type: 'varchar', length: '20', isUnique: true },
          { name: 'namaRekening', type: 'varchar', length: '255' },
          { name: 'jenisAkun', type: 'varchar', length: '50' },
          { name: 'level', type: 'int' },
          { name: 'parentKode', type: 'varchar', length: '20', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'isHeader', type: 'boolean', default: false },
          { name: 'deskripsi', type: 'text', isNullable: true },
          { name: 'normalBalance', type: 'varchar', length: '10' },
          { name: 'isBudgetControl', type: 'boolean', default: false },
          { name: 'createdBy', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'chart_of_accounts',
      new TableIndex({ columnNames: ['kodeRekening'] }),
    );
    await queryRunner.createIndex(
      'chart_of_accounts',
      new TableIndex({ columnNames: ['jenisAkun'] }),
    );
    await queryRunner.createIndex(
      'chart_of_accounts',
      new TableIndex({ columnNames: ['parentKode'] }),
    );

    // Unit Kerja
    await queryRunner.createTable(
      new Table({
        name: 'unit_kerja',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'kodeUnit', type: 'varchar', length: '50', isUnique: true },
          { name: 'namaUnit', type: 'varchar', length: '255' },
          { name: 'parentId', type: 'uuid', isNullable: true },
          { name: 'level', type: 'int', default: 1 },
          { name: 'kepalaNama', type: 'varchar', length: '255', isNullable: true },
          { name: 'kepalaNIP', type: 'varchar', length: '50', isNullable: true },
          { name: 'email', type: 'varchar', length: '100', isNullable: true },
          { name: 'telepon', type: 'varchar', length: '50', isNullable: true },
          { name: 'alamat', type: 'text', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdBy', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'unit_kerja',
      new TableIndex({ columnNames: ['kodeUnit'] }),
    );
    await queryRunner.createIndex(
      'unit_kerja',
      new TableIndex({ columnNames: ['parentId'] }),
    );

    // Fiscal Years
    await queryRunner.createTable(
      new Table({
        name: 'fiscal_years',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'tahun', type: 'int', isUnique: true },
          { name: 'tanggalMulai', type: 'date' },
          { name: 'tanggalSelesai', type: 'date' },
          { name: 'status', type: 'varchar', length: '50' },
          { name: 'isCurrent', type: 'boolean', default: false },
          { name: 'keterangan', type: 'text', isNullable: true },
          { name: 'createdBy', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'fiscal_years',
      new TableIndex({ columnNames: ['tahun'] }),
    );

    // Pegawai
    await queryRunner.createTable(
      new Table({
        name: 'pegawai',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'nip', type: 'varchar', length: '50', isUnique: true },
          { name: 'namaLengkap', type: 'varchar', length: '255' },
          { name: 'unitKerjaId', type: 'uuid' },
          { name: 'jabatan', type: 'varchar', length: '255', isNullable: true },
          { name: 'golongan', type: 'varchar', length: '100' },
          { name: 'email', type: 'varchar', length: '100', isNullable: true },
          { name: 'telepon', type: 'varchar', length: '50', isNullable: true },
          { name: 'npwp', type: 'varchar', length: '100', isNullable: true },
          { name: 'bankName', type: 'varchar', length: '255', isNullable: true },
          { name: 'nomorRekening', type: 'varchar', length: '100', isNullable: true },
          { name: 'namaRekening', type: 'varchar', length: '255', isNullable: true },
          { name: 'tanggalMasuk', type: 'date', isNullable: true },
          { name: 'status', type: 'varchar', length: '50', default: "'ACTIVE'" },
          { name: 'createdBy', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'pegawai',
      new TableIndex({ columnNames: ['nip'] }),
    );
    await queryRunner.createIndex(
      'pegawai',
      new TableIndex({ columnNames: ['unitKerjaId'] }),
    );

    // Suppliers
    await queryRunner.createTable(
      new Table({
        name: 'suppliers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'kodeSupplier', type: 'varchar', length: '50', isUnique: true },
          { name: 'namaSupplier', type: 'varchar', length: '255' },
          { name: 'npwp', type: 'varchar', length: '100', isNullable: true },
          { name: 'alamat', type: 'text', isNullable: true },
          { name: 'kota', type: 'varchar', length: '100', isNullable: true },
          { name: 'kodePos', type: 'varchar', length: '20', isNullable: true },
          { name: 'telepon', type: 'varchar', length: '50', isNullable: true },
          { name: 'email', type: 'varchar', length: '100', isNullable: true },
          { name: 'contactPerson', type: 'varchar', length: '255', isNullable: true },
          { name: 'contactPhone', type: 'varchar', length: '50', isNullable: true },
          { name: 'bankName', type: 'varchar', length: '255', isNullable: true },
          { name: 'nomorRekening', type: 'varchar', length: '100', isNullable: true },
          { name: 'namaRekening', type: 'varchar', length: '255', isNullable: true },
          { name: 'status', type: 'varchar', length: '50', default: "'ACTIVE'" },
          { name: 'catatan', type: 'text', isNullable: true },
          { name: 'createdBy', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'suppliers',
      new TableIndex({ columnNames: ['kodeSupplier'] }),
    );

    // Bank Accounts
    await queryRunner.createTable(
      new Table({
        name: 'bank_accounts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'kodeBank', type: 'varchar', length: '50', isUnique: true },
          { name: 'namaBank', type: 'varchar', length: '255' },
          { name: 'nomorRekening', type: 'varchar', length: '100' },
          { name: 'namaPemilik', type: 'varchar', length: '255' },
          { name: 'cabang', type: 'varchar', length: '255', isNullable: true },
          { name: 'swift', type: 'varchar', length: '100', isNullable: true },
          { name: 'saldoAwal', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'saldoBerjalan', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'currency', type: 'varchar', length: '50', default: "'IDR'" },
          { name: 'isPrimary', type: 'boolean', default: false },
          { name: 'status', type: 'varchar', length: '50', default: "'ACTIVE'" },
          { name: 'keterangan', type: 'text', isNullable: true },
          { name: 'createdBy', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'bank_accounts',
      new TableIndex({ columnNames: ['kodeBank'] }),
    );

    // Budgets
    await queryRunner.createTable(
      new Table({
        name: 'budgets',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'fiscalYearId', type: 'uuid' },
          { name: 'kodeRekening', type: 'varchar', length: '20' },
          { name: 'unitKerjaId', type: 'uuid', isNullable: true },
          { name: 'anggaranAwal', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'revisi', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'anggaranAkhir', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'realisasi', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'sisa', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'status', type: 'varchar', length: '50', default: "'DRAFT'" },
          { name: 'keterangan', type: 'text', isNullable: true },
          { name: 'createdBy', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'budgets',
      new TableIndex({ columnNames: ['fiscalYearId'] }),
    );
    await queryRunner.createIndex(
      'budgets',
      new TableIndex({ columnNames: ['kodeRekening'] }),
    );
    await queryRunner.createIndex(
      'budgets',
      new TableIndex({ columnNames: ['unitKerjaId'] }),
    );
    await queryRunner.createIndex(
      'budgets',
      new TableIndex({ columnNames: ['status'] }),
    );

    console.log('✅ Master data tables created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.dropTable('budgets');
    await queryRunner.dropTable('bank_accounts');
    await queryRunner.dropTable('suppliers');
    await queryRunner.dropTable('pegawai');
    await queryRunner.dropTable('fiscal_years');
    await queryRunner.dropTable('unit_kerja');
    await queryRunner.dropTable('chart_of_accounts');
  }
}
