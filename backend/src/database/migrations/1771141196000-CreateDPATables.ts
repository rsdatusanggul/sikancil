import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: CreateDPATables
 * Membuat tabel untuk DPA/DPPA BLUD (Dokumen Pelaksanaan Anggaran)
 *
 * Tables:
 * 1. dpa - Master DPA/DPPA
 * 2. dpa_belanja - Rincian belanja per program-kegiatan-output
 * 3. dpa_pendapatan - Rincian pendapatan
 * 4. dpa_pembiayaan - Rincian pembiayaan
 * 5. dpa_history - Audit trail
 */
export class CreateDPATables1771141196000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create table: dpa
    await queryRunner.createTable(
      new Table({
        name: 'dpa',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nomorDPA',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'jenisDokumen',
            type: 'varchar',
            length: '10',
            comment: 'DPA, DPPA',
          },
          {
            name: 'tahun',
            type: 'int',
            comment: 'Tahun pembuatan dokumen',
          },
          {
            name: 'tahunAnggaran',
            type: 'int',
            comment: 'Tahun anggaran yang dilaksanakan',
          },
          // Status & Workflow
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'DRAFT'",
            comment: 'DRAFT, SUBMITTED, APPROVED, REJECTED, ACTIVE, REVISED',
          },
          {
            name: 'tanggalDokumen',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'tanggalBerlaku',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'tanggalSelesai',
            type: 'timestamp',
            isNullable: true,
          },
          // Relasi
          {
            name: 'revisiRBAId',
            type: 'uuid',
            isNullable: true,
            comment: 'Link ke revisi RBA yang sudah approved',
          },
          {
            name: 'dpaSebelumnyaId',
            type: 'uuid',
            isNullable: true,
            comment: 'Link ke DPA yang diganti (untuk DPPA)',
          },
          {
            name: 'nomorRevisi',
            type: 'int',
            default: 0,
            comment: '0 untuk DPA awal, 1,2,3... untuk DPPA',
          },
          {
            name: 'alasanRevisi',
            type: 'text',
            isNullable: true,
            comment: 'Wajib untuk DPPA',
          },
          // Total Anggaran
          {
            name: 'totalPaguPendapatan',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalPaguBelanja',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalPaguPembiayaan',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalRealisasiPendapatan',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalRealisasiBelanja',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalRealisasiPembiayaan',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Approval Workflow
          {
            name: 'diajukanOleh',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'tanggalPengajuan',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'disetujuiOleh',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'tanggalPersetujuan',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'catatanPersetujuan',
            type: 'text',
            isNullable: true,
          },
          // SK Pengesahan
          {
            name: 'nomorSK',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'tanggalSK',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'fileSK',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          // Dokumen
          {
            name: 'fileDPA',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          // Metadata
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

    // Indexes for dpa
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_nomorDPA" ON "dpa" ("nomorDPA")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_jenisDokumen" ON "dpa" ("jenisDokumen")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_dpa_tahun" ON "dpa" ("tahun")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_tahunAnggaran" ON "dpa" ("tahunAnggaran")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_status" ON "dpa" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_revisiRBAId" ON "dpa" ("revisiRBAId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_dpaSebelumnyaId" ON "dpa" ("dpaSebelumnyaId")`,
    );

    // Unique constraint: hanya 1 DPA ACTIVE per tahun anggaran
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dpa_active_per_tahun" ON "dpa" ("tahunAnggaran") WHERE "status" = 'ACTIVE'`,
    );

    // Self-referencing foreign key untuk DPPA
    await queryRunner.createForeignKey(
      'dpa',
      new TableForeignKey({
        columnNames: ['dpaSebelumnyaId'],
        referencedTableName: 'dpa',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'FK_dpa_dpaSebelumnya',
      }),
    );

    // 2. Create table: dpa_belanja
    await queryRunner.createTable(
      new Table({
        name: 'dpa_belanja',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'dpaId',
            type: 'uuid',
          },
          // Link ke RBA
          {
            name: 'programId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'kegiatanId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'outputId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'subOutputId',
            type: 'uuid',
            isNullable: true,
          },
          // Kode Program-Kegiatan-Output
          {
            name: 'kodeProgram',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'namaProgram',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'kodeKegiatan',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'namaKegiatan',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'kodeOutput',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'namaOutput',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'kodeSubOutput',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'namaSubOutput',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          // Kode Rekening
          {
            name: 'kodeRekening',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'namaRekening',
            type: 'varchar',
            length: '255',
          },
          // Klasifikasi
          {
            name: 'jenisBelanja',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'kategori',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'sumberDana',
            type: 'varchar',
            length: '50',
          },
          // Target
          {
            name: 'volumeTarget',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'satuan',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          // Pagu
          {
            name: 'pagu',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          // Breakdown Bulanan
          {
            name: 'januari',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'februari',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'maret',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'april',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'mei',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'juni',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'juli',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'agustus',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'september',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'oktober',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'november',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'desember',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Realisasi
          {
            name: 'realisasi',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'komitmen',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'sisa',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'persentaseRealisasi',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          // Unit Kerja
          {
            name: 'unitKerjaId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'keterangan',
            type: 'text',
            isNullable: true,
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

    // Indexes for dpa_belanja
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_dpaId" ON "dpa_belanja" ("dpaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_programId" ON "dpa_belanja" ("programId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_kegiatanId" ON "dpa_belanja" ("kegiatanId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_outputId" ON "dpa_belanja" ("outputId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_subOutputId" ON "dpa_belanja" ("subOutputId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_kodeProgram" ON "dpa_belanja" ("kodeProgram")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_kodeKegiatan" ON "dpa_belanja" ("kodeKegiatan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_kodeOutput" ON "dpa_belanja" ("kodeOutput")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_kodeRekening" ON "dpa_belanja" ("kodeRekening")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_sumberDana" ON "dpa_belanja" ("sumberDana")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_belanja_unitKerjaId" ON "dpa_belanja" ("unitKerjaId")`,
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'dpa_belanja',
      new TableForeignKey({
        columnNames: ['dpaId'],
        referencedTableName: 'dpa',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_dpa_belanja_dpa',
      }),
    );

    // 3. Create table: dpa_pendapatan
    await queryRunner.createTable(
      new Table({
        name: 'dpa_pendapatan',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'dpaId',
            type: 'uuid',
          },
          {
            name: 'kodeRekening',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'namaRekening',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'jenisPendapatan',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'kategori',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'sumberPendapatan',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'pagu',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          // Breakdown Bulanan
          {
            name: 'januari',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'februari',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'maret',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'april',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'mei',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'juni',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'juli',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'agustus',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'september',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'oktober',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'november',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'desember',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Realisasi
          {
            name: 'realisasi',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'sisa',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'persentaseRealisasi',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'unitKerjaId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'keterangan',
            type: 'text',
            isNullable: true,
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

    // Indexes for dpa_pendapatan
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_pendapatan_dpaId" ON "dpa_pendapatan" ("dpaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_pendapatan_kodeRekening" ON "dpa_pendapatan" ("kodeRekening")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_pendapatan_jenisPendapatan" ON "dpa_pendapatan" ("jenisPendapatan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_pendapatan_unitKerjaId" ON "dpa_pendapatan" ("unitKerjaId")`,
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'dpa_pendapatan',
      new TableForeignKey({
        columnNames: ['dpaId'],
        referencedTableName: 'dpa',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_dpa_pendapatan_dpa',
      }),
    );

    // 4. Create table: dpa_pembiayaan
    await queryRunner.createTable(
      new Table({
        name: 'dpa_pembiayaan',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'dpaId',
            type: 'uuid',
          },
          {
            name: 'jenis',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'kodeRekening',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'namaRekening',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'kategori',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'sumberTujuan',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'pagu',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          // Breakdown Bulanan
          {
            name: 'januari',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'februari',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'maret',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'april',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'mei',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'juni',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'juli',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'agustus',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'september',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'oktober',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'november',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'desember',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Realisasi
          {
            name: 'realisasi',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'sisa',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'persentaseRealisasi',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'keterangan',
            type: 'text',
            isNullable: true,
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

    // Indexes for dpa_pembiayaan
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_pembiayaan_dpaId" ON "dpa_pembiayaan" ("dpaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_pembiayaan_jenis" ON "dpa_pembiayaan" ("jenis")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_pembiayaan_kodeRekening" ON "dpa_pembiayaan" ("kodeRekening")`,
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'dpa_pembiayaan',
      new TableForeignKey({
        columnNames: ['dpaId'],
        referencedTableName: 'dpa',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_dpa_pembiayaan_dpa',
      }),
    );

    // 5. Create table: dpa_history
    await queryRunner.createTable(
      new Table({
        name: 'dpa_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'dpaId',
            type: 'uuid',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'fieldChanged',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'oldValue',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'newValue',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'userRole',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'userName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Indexes for dpa_history
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_history_dpaId" ON "dpa_history" ("dpaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_history_action" ON "dpa_history" ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dpa_history_userId" ON "dpa_history" ("userId")`,
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'dpa_history',
      new TableForeignKey({
        columnNames: ['dpaId'],
        referencedTableName: 'dpa',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_dpa_history_dpa',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('dpa_history', 'FK_dpa_history_dpa');
    await queryRunner.dropForeignKey('dpa_pembiayaan', 'FK_dpa_pembiayaan_dpa');
    await queryRunner.dropForeignKey('dpa_pendapatan', 'FK_dpa_pendapatan_dpa');
    await queryRunner.dropForeignKey('dpa_belanja', 'FK_dpa_belanja_dpa');
    await queryRunner.dropForeignKey('dpa', 'FK_dpa_dpaSebelumnya');

    // Drop tables in reverse order
    await queryRunner.dropTable('dpa_history');
    await queryRunner.dropTable('dpa_pembiayaan');
    await queryRunner.dropTable('dpa_pendapatan');
    await queryRunner.dropTable('dpa_belanja');
    await queryRunner.dropTable('dpa');
  }
}
