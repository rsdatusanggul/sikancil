import { AppDataSource } from '../data-source';
import { UnitKerja } from '../entities/unit-kerja.entity';
import { FiscalYear } from '../entities/fiscal-year.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { SystemSetting } from '../entities/system-setting.entity';

/**
 * Master Data Seeder
 * Seeds initial master data for BLUD
 */
export async function seedMasterData() {
  // Seed Unit Kerja
  const unitKerjaRepo = AppDataSource.getRepository(UnitKerja);
  const units: Partial<UnitKerja>[] = [
    {
      kodeUnit: 'ROOT',
      namaUnit: 'RSUD Si-Kancil',
      level: 1,
      isActive: true,
    },
    {
      kodeUnit: 'DIR',
      namaUnit: 'Direktorat',
      level: 2,
      isActive: true,
    },
    {
      kodeUnit: 'KEU',
      namaUnit: 'Bagian Keuangan',
      level: 2,
      isActive: true,
    },
    {
      kodeUnit: 'MED',
      namaUnit: 'Bagian Pelayanan Medis',
      level: 2,
      isActive: true,
    },
    {
      kodeUnit: 'UMU',
      namaUnit: 'Bagian Umum',
      level: 2,
      isActive: true,
    },
  ];

  console.log('📋 Seeding Unit Kerja...');
  for (const unitData of units) {
    const existing = await unitKerjaRepo.findOne({
      where: { kodeUnit: unitData.kodeUnit },
    });

    if (!existing) {
      const unit = unitKerjaRepo.create(unitData);
      await unitKerjaRepo.save(unit);
      console.log(`   ✅ ${unitData.kodeUnit} - ${unitData.namaUnit}`);
    }
  }

  // Seed Fiscal Years
  const fiscalYearRepo = AppDataSource.getRepository(FiscalYear);
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  console.log('📋 Seeding Fiscal Years...');
  for (const year of years) {
    const existing = await fiscalYearRepo.findOne({ where: { tahun: year } });

    if (!existing) {
      const fiscalYear = fiscalYearRepo.create({
        tahun: year,
        tanggalMulai: new Date(`${year}-01-01`),
        tanggalSelesai: new Date(`${year}-12-31`),
        status: year === currentYear ? 'OPEN' : year < currentYear ? 'CLOSED' : 'OPEN',
        isCurrent: year === currentYear,
        keterangan: `Tahun Anggaran ${year}`,
      });
      await fiscalYearRepo.save(fiscalYear);
      console.log(`   ✅ Fiscal Year ${year}`);
    }
  }

  // Seed Bank Accounts
  const bankAccountRepo = AppDataSource.getRepository(BankAccount);
  const banks: Partial<BankAccount>[] = [
    {
      kodeBank: 'BNI-001',
      namaBank: 'Bank Negara Indonesia',
      nomorRekening: '0123456789',
      namaPemilik: 'RSUD Si-Kancil',
      cabang: 'Cabang Utama',
      saldoAwal: 0,
      saldoBerjalan: 0,
      currency: 'IDR',
      isPrimary: true,
      status: 'ACTIVE',
    },
    {
      kodeBank: 'BRI-001',
      namaBank: 'Bank Rakyat Indonesia',
      nomorRekening: '9876543210',
      namaPemilik: 'RSUD Si-Kancil',
      cabang: 'Cabang Kota',
      saldoAwal: 0,
      saldoBerjalan: 0,
      currency: 'IDR',
      isPrimary: false,
      status: 'ACTIVE',
    },
  ];

  console.log('📋 Seeding Bank Accounts...');
  for (const bankData of banks) {
    const existing = await bankAccountRepo.findOne({
      where: { kodeBank: bankData.kodeBank },
    });

    if (!existing) {
      const bank = bankAccountRepo.create(bankData);
      await bankAccountRepo.save(bank);
      console.log(`   ✅ ${bankData.kodeBank} - ${bankData.namaBank}`);
    }
  }

  // Seed System Settings
  const settingRepo = AppDataSource.getRepository(SystemSetting);
  const settings: Partial<SystemSetting>[] = [
    {
      settingKey: 'ORGANIZATION_NAME',
      settingValue: 'RSUD Si-Kancil',
      settingGroup: 'GENERAL',
      deskripsi: 'Nama organisasi/rumah sakit',
      isActive: true,
    },
    {
      settingKey: 'ORGANIZATION_ADDRESS',
      settingValue: 'Jl. Kesehatan No. 123, Kota Sehat',
      settingGroup: 'GENERAL',
      deskripsi: 'Alamat organisasi',
      isActive: true,
    },
    {
      settingKey: 'CURRENT_FISCAL_YEAR',
      settingValue: currentYear.toString(),
      settingGroup: 'BLUD',
      deskripsi: 'Tahun anggaran aktif',
      isActive: true,
    },
    {
      settingKey: 'AUTO_POSTING_ENABLED',
      settingValue: 'true',
      settingGroup: 'ACCOUNTING',
      deskripsi: 'Aktifkan posting jurnal otomatis',
      isActive: true,
    },
    {
      settingKey: 'BKU_AUTO_NUMBER',
      settingValue: 'true',
      settingGroup: 'BLUD',
      deskripsi: 'Aktifkan penomoran BKU otomatis',
      isActive: true,
    },
  ];

  console.log('📋 Seeding System Settings...');
  for (const settingData of settings) {
    const existing = await settingRepo.findOne({
      where: { settingKey: settingData.settingKey },
    });

    if (!existing) {
      const setting = settingRepo.create(settingData);
      await settingRepo.save(setting);
      console.log(`   ✅ ${settingData.settingKey}`);
    }
  }

  console.log('✅ Master data seeded successfully');
}
