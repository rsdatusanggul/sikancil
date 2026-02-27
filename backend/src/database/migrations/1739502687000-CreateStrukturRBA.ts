import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: CreateStrukturRBA
 * Membuat struktur hierarki Program-Kegiatan-Output-SubOutput untuk RBA BLUD
 * Sesuai Permendagri 61/2007
 */
export class CreateStrukturRBA1739502687000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create table: program_rba
    await queryRunner.createTable(
      new Table({
        name: 'program_rba',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'kodeProgram',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'namaProgram',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'deskripsi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'indikatorProgram',
            type: 'jsonb',
            isNullable: true,
            comment: 'Format: [{nama, satuan, target}]',
          },
          {
            name: 'tahun',
            type: 'int',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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

    // Create indexes for program_rba
    await queryRunner.query(
      `CREATE INDEX "IDX_program_rba_kodeProgram" ON "program_rba" ("kodeProgram")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_program_rba_tahun" ON "program_rba" ("tahun")`,
    );

    // 2. Create table: kegiatan_rba
    await queryRunner.createTable(
      new Table({
        name: 'kegiatan_rba',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
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
            name: 'deskripsi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'programId',
            type: 'uuid',
          },
          {
            name: 'indikatorKegiatan',
            type: 'jsonb',
            isNullable: true,
            comment: 'Format: [{nama, satuan, target}]',
          },
          {
            name: 'tahun',
            type: 'int',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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

    // Create indexes and constraints for kegiatan_rba
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_kegiatan_rba_kodeKegiatan_tahun" ON "kegiatan_rba" ("kodeKegiatan", "tahun")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_kegiatan_rba_programId" ON "kegiatan_rba" ("programId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_kegiatan_rba_tahun" ON "kegiatan_rba" ("tahun")`,
    );

    // Foreign key: kegiatan_rba -> program_rba
    await queryRunner.createForeignKey(
      'kegiatan_rba',
      new TableForeignKey({
        columnNames: ['programId'],
        referencedTableName: 'program_rba',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_kegiatan_rba_program',
      }),
    );

    // 3. Create table: output_rba
    await queryRunner.createTable(
      new Table({
        name: 'output_rba',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
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
            name: 'deskripsi',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'kegiatanId',
            type: 'uuid',
          },
          {
            name: 'volumeTarget',
            type: 'int',
            comment: 'Jumlah target (pasien, kunjungan, dll)',
          },
          {
            name: 'satuan',
            type: 'varchar',
            length: '50',
            comment: 'Orang, Kunjungan, Kegiatan, dll',
          },
          {
            name: 'lokasi',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'bulanMulai',
            type: 'int',
            isNullable: true,
            comment: '1-12',
          },
          {
            name: 'bulanSelesai',
            type: 'int',
            isNullable: true,
            comment: '1-12',
          },
          {
            name: 'unitKerjaId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'totalPagu',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
            comment: 'Calculated from anggaran_belanja_rba',
          },
          {
            name: 'tahun',
            type: 'int',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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

    // Create indexes for output_rba
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_output_rba_kodeOutput_tahun" ON "output_rba" ("kodeOutput", "tahun")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_output_rba_kegiatanId" ON "output_rba" ("kegiatanId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_output_rba_unitKerjaId" ON "output_rba" ("unitKerjaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_output_rba_tahun" ON "output_rba" ("tahun")`,
    );

    // Foreign key: output_rba -> kegiatan_rba
    await queryRunner.createForeignKey(
      'output_rba',
      new TableForeignKey({
        columnNames: ['kegiatanId'],
        referencedTableName: 'kegiatan_rba',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_output_rba_kegiatan',
      }),
    );

    // 4. Create table: sub_output_rba
    await queryRunner.createTable(
      new Table({
        name: 'sub_output_rba',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'kodeSubOutput',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'namaSubOutput',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'outputId',
            type: 'uuid',
          },
          {
            name: 'volumeTarget',
            type: 'int',
          },
          {
            name: 'satuan',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'totalPagu',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'tahun',
            type: 'int',
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

    // Create indexes for sub_output_rba
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_sub_output_rba_kodeSubOutput_tahun" ON "sub_output_rba" ("kodeSubOutput", "tahun")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_output_rba_outputId" ON "sub_output_rba" ("outputId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sub_output_rba_tahun" ON "sub_output_rba" ("tahun")`,
    );

    // Foreign key: sub_output_rba -> output_rba
    await queryRunner.createForeignKey(
      'sub_output_rba',
      new TableForeignKey({
        columnNames: ['outputId'],
        referencedTableName: 'output_rba',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_sub_output_rba_output',
      }),
    );

    // 5. Create table: anggaran_belanja_rba
    await queryRunner.createTable(
      new Table({
        name: 'anggaran_belanja_rba',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
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
            name: 'jenisBelanja',
            type: 'varchar',
            length: '50',
            comment: 'OPERASIONAL, MODAL, TAK_TERDUGA',
          },
          {
            name: 'kategori',
            type: 'varchar',
            length: '50',
            comment: 'PEGAWAI, BARANG_JASA, MODAL',
          },
          {
            name: 'sumberDana',
            type: 'varchar',
            length: '50',
            comment: 'APBD, FUNGSIONAL, HIBAH',
          },
          {
            name: 'pagu',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
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
            comment: 'Dari kontrak yang sudah ditandatangani',
          },
          {
            name: 'sisa',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
            comment: 'Pagu - (Realisasi + Komitmen)',
          },
          // Breakdown bulanan
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
          {
            name: 'unitKerjaId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'tahun',
            type: 'int',
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

    // Create indexes for anggaran_belanja_rba
    await queryRunner.query(
      `CREATE INDEX "IDX_anggaran_belanja_rba_kodeRekening" ON "anggaran_belanja_rba" ("kodeRekening")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_anggaran_belanja_rba_outputId" ON "anggaran_belanja_rba" ("outputId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_anggaran_belanja_rba_subOutputId" ON "anggaran_belanja_rba" ("subOutputId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_anggaran_belanja_rba_sumberDana" ON "anggaran_belanja_rba" ("sumberDana")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_anggaran_belanja_rba_unitKerjaId" ON "anggaran_belanja_rba" ("unitKerjaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_anggaran_belanja_rba_tahun" ON "anggaran_belanja_rba" ("tahun")`,
    );

    // Foreign keys for anggaran_belanja_rba
    await queryRunner.createForeignKey(
      'anggaran_belanja_rba',
      new TableForeignKey({
        columnNames: ['outputId'],
        referencedTableName: 'output_rba',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_anggaran_belanja_rba_output',
      }),
    );

    await queryRunner.createForeignKey(
      'anggaran_belanja_rba',
      new TableForeignKey({
        columnNames: ['subOutputId'],
        referencedTableName: 'sub_output_rba',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_anggaran_belanja_rba_subOutput',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey(
      'anggaran_belanja_rba',
      'FK_anggaran_belanja_rba_subOutput',
    );
    await queryRunner.dropForeignKey(
      'anggaran_belanja_rba',
      'FK_anggaran_belanja_rba_output',
    );
    await queryRunner.dropForeignKey(
      'sub_output_rba',
      'FK_sub_output_rba_output',
    );
    await queryRunner.dropForeignKey('output_rba', 'FK_output_rba_kegiatan');
    await queryRunner.dropForeignKey(
      'kegiatan_rba',
      'FK_kegiatan_rba_program',
    );

    // Drop tables in reverse order
    await queryRunner.dropTable('anggaran_belanja_rba');
    await queryRunner.dropTable('sub_output_rba');
    await queryRunner.dropTable('output_rba');
    await queryRunner.dropTable('kegiatan_rba');
    await queryRunner.dropTable('program_rba');
  }
}
