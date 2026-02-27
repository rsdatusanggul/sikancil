import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPaguToProgramAndKegiatan1739638800000 implements MigrationInterface {
  name = 'AddPaguToProgramAndKegiatan1739638800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if paguAnggaran column exists in program_rba
    const programTable = await queryRunner.getTable('program_rba');
    if (programTable && !programTable.findColumnByName('paguAnggaran')) {
      await queryRunner.addColumn(
        'program_rba',
        new TableColumn({
          name: 'paguAnggaran',
          type: 'decimal',
          precision: 15,
          scale: 2,
          isNullable: true,
          default: 0,
          comment: 'Pagu anggaran program dalam Rupiah',
        }),
      );
    }

    // Check if paguAnggaran column exists in kegiatan_rba
    const kegiatanTable = await queryRunner.getTable('kegiatan_rba');
    if (kegiatanTable && !kegiatanTable.findColumnByName('paguAnggaran')) {
      await queryRunner.addColumn(
        'kegiatan_rba',
        new TableColumn({
          name: 'paguAnggaran',
          type: 'decimal',
          precision: 15,
          scale: 2,
          isNullable: true,
          default: 0,
          comment: 'Pagu anggaran kegiatan dalam Rupiah',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove paguAnggaran from kegiatan_rba
    await queryRunner.dropColumn('kegiatan_rba', 'paguAnggaran');

    // Remove paguAnggaran from program_rba
    await queryRunner.dropColumn('program_rba', 'paguAnggaran');
  }
}
