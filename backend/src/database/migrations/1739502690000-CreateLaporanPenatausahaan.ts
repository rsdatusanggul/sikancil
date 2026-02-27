import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Migration: CreateLaporanPenatausahaan
 * Membuat tabel untuk Laporan Penatausahaan Triwulanan ke PPKD
 * Sesuai PMK 220/2016 dan Permendagri 61/2007
 */
export class CreateLaporanPenatausahaan1739502690000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create table: laporan_pendapatan_blud
    await queryRunner.createTable(
      new Table({
        name: 'laporan_pendapatan_blud',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tahun',
            type: 'int',
          },
          {
            name: 'triwulan',
            type: 'int',
            comment: '1, 2, 3, 4',
          },
          // Jasa Layanan
          {
            name: 'anggaranJasaLayanan',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'realisasiJasaLayanan',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Hibah
          {
            name: 'anggaranHibah',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'realisasiHibah',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Hasil Kerja Sama
          {
            name: 'anggaranKerjaSama',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'realisasiKerjaSama',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Pendapatan Lainnya
          {
            name: 'anggaranLainnya',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'realisasiLainnya',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Total
          {
            name: 'totalAnggaran',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalRealisasi',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'selisih',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Breakdown
          {
            name: 'detailBulanan',
            type: 'jsonb',
            isNullable: true,
            comment: 'Format: [{bulan, jenis, anggaran, realisasi}]',
          },
          // Status & Approval
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'DRAFT'",
            comment: 'DRAFT, SUBMITTED, APPROVED, REJECTED',
          },
          {
            name: 'nomorLaporan',
            type: 'varchar',
            length: '100',
            isNullable: true,
            isUnique: true,
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
            name: 'approvedBy',
            type: 'uuid',
            isNullable: true,
            comment: 'PPKD',
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

    // Indexes for laporan_pendapatan_blud
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_laporan_pendapatan_blud_tahun_triwulan" ON "laporan_pendapatan_blud" ("tahun", "triwulan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_laporan_pendapatan_blud_status" ON "laporan_pendapatan_blud" ("status")`,
    );

    // 2. Create table: laporan_pengeluaran_biaya_blud
    await queryRunner.createTable(
      new Table({
        name: 'laporan_pengeluaran_biaya_blud',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tahun',
            type: 'int',
          },
          {
            name: 'triwulan',
            type: 'int',
            comment: '1, 2, 3, 4',
          },
          {
            name: 'detailBiaya',
            type: 'jsonb',
            comment: 'Format: [{kode, uraian, anggaran, realisasi, selisih}]',
          },
          // Summary
          {
            name: 'totalBiayaOperasional',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalBiayaNonOps',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalAnggaran',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalRealisasi',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'selisih',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // Status & Approval
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'DRAFT'",
          },
          {
            name: 'nomorLaporan',
            type: 'varchar',
            length: '100',
            isNullable: true,
            isUnique: true,
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

    // Indexes for laporan_pengeluaran_biaya_blud
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_laporan_pengeluaran_biaya_blud_tahun_triwulan" ON "laporan_pengeluaran_biaya_blud" ("tahun", "triwulan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_laporan_pengeluaran_biaya_blud_status" ON "laporan_pengeluaran_biaya_blud" ("status")`,
    );

    // 3. Create table: biaya_per_objek (CRITICAL!)
    await queryRunner.createTable(
      new Table({
        name: 'biaya_per_objek',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tahun',
            type: 'int',
          },
          {
            name: 'bulan',
            type: 'int',
            isNullable: true,
            comment: '1-12, null untuk tahunan',
          },
          {
            name: 'triwulan',
            type: 'int',
            isNullable: true,
            comment: '1-4',
          },
          // Kode Rekening (6 level)
          {
            name: 'kodeRekening',
            type: 'varchar',
            length: '20',
            comment: 'Contoh: 5.1.01.01',
          },
          {
            name: 'namaRekening',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'levelRekening',
            type: 'int',
            comment: '1-6',
          },
          {
            name: 'parentKode',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          // Klasifikasi
          {
            name: 'kategori',
            type: 'varchar',
            length: '50',
            comment: 'OPERASIONAL, NON_OPERASIONAL',
          },
          {
            name: 'subKategori',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'PELAYANAN, UMUM_ADM',
          },
          {
            name: 'unitKerjaId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'sumberDana',
            type: 'varchar',
            length: '50',
            comment: 'APBD, FUNGSIONAL, HIBAH',
          },
          // Anggaran & Realisasi
          {
            name: 'pagu',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
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
            name: 'persentase',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            comment: 'Realisasi/Pagu * 100',
          },
          // Link
          {
            name: 'transaksiIds',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of transaction IDs',
          },
          {
            name: 'laporanPengeluaranId',
            type: 'uuid',
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

    // Indexes for biaya_per_objek
    await queryRunner.query(
      `CREATE INDEX "IDX_biaya_per_objek_kodeRekening" ON "biaya_per_objek" ("kodeRekening")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_biaya_per_objek_tahun_bulan" ON "biaya_per_objek" ("tahun", "bulan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_biaya_per_objek_tahun_triwulan" ON "biaya_per_objek" ("tahun", "triwulan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_biaya_per_objek_sumberDana" ON "biaya_per_objek" ("sumberDana")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_biaya_per_objek_unitKerjaId" ON "biaya_per_objek" ("unitKerjaId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_biaya_per_objek_laporanPengeluaranId" ON "biaya_per_objek" ("laporanPengeluaranId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_biaya_per_objek_kategori" ON "biaya_per_objek" ("kategori")`,
    );

    // Foreign key: biaya_per_objek -> laporan_pengeluaran_biaya_blud
    await queryRunner.createForeignKey(
      'biaya_per_objek',
      new TableForeignKey({
        columnNames: ['laporanPengeluaranId'],
        referencedTableName: 'laporan_pengeluaran_biaya_blud',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_biaya_per_objek_laporan_pengeluaran',
      }),
    );

    // 4. Create table: sptj
    await queryRunner.createTable(
      new Table({
        name: 'sptj',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nomorSPTJ',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'tahun',
            type: 'int',
          },
          {
            name: 'triwulan',
            type: 'int',
          },
          {
            name: 'totalPengeluaran',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'totalPengeluaranText',
            type: 'text',
            comment: 'Terbilang',
          },
          {
            name: 'sumberDana',
            type: 'jsonb',
            comment: 'Format: {jasaLayanan, hibah, kerjaSama, lainnya}',
          },
          // Pernyataan
          {
            name: 'pernyataanSPI',
            type: 'boolean',
            default: true,
          },
          {
            name: 'pernyataanDPA',
            type: 'boolean',
            default: true,
          },
          {
            name: 'pernyataanAkuntansi',
            type: 'boolean',
            default: true,
          },
          {
            name: 'pernyataanBukti',
            type: 'boolean',
            default: true,
          },
          // Link
          {
            name: 'laporanPengeluaranId',
            type: 'uuid',
            isNullable: true,
          },
          // Status
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'DRAFT'",
            comment: 'DRAFT, SIGNED, SUBMITTED, APPROVED',
          },
          // Penandatangan
          {
            name: 'pemimpinBLUD',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'nipPemimpin',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'tanggalTandaTangan',
            type: 'timestamp',
          },
          // Submission
          {
            name: 'submittedTo',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Nama PPKD',
          },
          {
            name: 'submittedAt',
            type: 'timestamp',
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

    // Indexes for sptj
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_sptj_tahun_triwulan" ON "sptj" ("tahun", "triwulan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sptj_nomorSPTJ" ON "sptj" ("nomorSPTJ")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sptj_status" ON "sptj" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_sptj_laporanPengeluaranId" ON "sptj" ("laporanPengeluaranId")`,
    );

    // 5. Create table: spj_fungsional
    await queryRunner.createTable(
      new Table({
        name: 'spj_fungsional',
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
            name: 'tahun',
            type: 'int',
          },
          {
            name: 'triwulan',
            type: 'int',
          },
          // Link ke laporan
          {
            name: 'laporanPendapatanId',
            type: 'uuid',
          },
          {
            name: 'laporanPengeluaranId',
            type: 'uuid',
          },
          {
            name: 'sptjId',
            type: 'uuid',
          },
          // SPM Pengesahan
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
            name: 'nilaiSPM',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          // SP2D Pengesahan
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
            name: 'statusPengesahan',
            type: 'varchar',
            length: '50',
            default: "'PENDING'",
            comment: 'PENDING, APPROVED, REJECTED',
          },
          // Dokumen
          {
            name: 'rekeningKoran',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of file paths',
          },
          {
            name: 'buktiTransaksi',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of file paths',
          },
          {
            name: 'dokumenLainnya',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of file paths',
          },
          // Status & Workflow
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'DRAFT'",
            comment: 'DRAFT, SUBMITTED, VERIFIED, APPROVED, REJECTED',
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
            comment: 'PPKD verifikator',
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
            comment: 'PPKD approver',
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

    // Indexes for spj_fungsional
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_spj_fungsional_tahun_triwulan" ON "spj_fungsional" ("tahun", "triwulan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_fungsional_nomorSPJ" ON "spj_fungsional" ("nomorSPJ")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_fungsional_laporanPendapatanId" ON "spj_fungsional" ("laporanPendapatanId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_fungsional_laporanPengeluaranId" ON "spj_fungsional" ("laporanPengeluaranId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_fungsional_sptjId" ON "spj_fungsional" ("sptjId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_fungsional_statusPengesahan" ON "spj_fungsional" ("statusPengesahan")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_spj_fungsional_status" ON "spj_fungsional" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey(
      'biaya_per_objek',
      'FK_biaya_per_objek_laporan_pengeluaran',
    );

    // Drop tables in reverse order
    await queryRunner.dropTable('spj_fungsional');
    await queryRunner.dropTable('sptj');
    await queryRunner.dropTable('biaya_per_objek');
    await queryRunner.dropTable('laporan_pengeluaran_biaya_blud');
    await queryRunner.dropTable('laporan_pendapatan_blud');
  }
}
