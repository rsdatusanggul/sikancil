// Master Data Module Types
// Central hub for all master data management

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  REVENUE = 'revenue',
  EXPENSE = 'expense',
}

// Chart of Accounts
export interface ChartOfAccount {
  id: string;
  kodeRekening: string;
  namaRekening: string;
  jenisAkun: AccountType;
  level: number;
  parentKode?: string;
  isActive: boolean;
  isHeader: boolean;
  deskripsi?: string;
  normalBalance: string; // 'DEBIT' | 'CREDIT'
  isBudgetControl: boolean;
  createdBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Unit Kerja
export interface UnitKerja {
  id: string;
  kodeUnit: string;
  namaUnit: string;
  level: number;
  parentKode?: string;
  kepalaUnit?: string;
  isActive: boolean;
  deskripsi?: string;
  createdBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Pegawai
export interface Pegawai {
  id: string;
  nip: string;
  nama: string;
  jabatan?: string;
  unitKerja?: string;
  email?: string;
  phone?: string;
  rekening?: string;
  npwp?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Supplier/Vendor
export interface Supplier {
  id: string;
  kodeSupplier: string;
  namaSupplier: string;
  kategori?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  phone?: string;
  email?: string;
  npwp?: string;
  rekening?: string;
  namaBank?: string;
  contactPerson?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Bank Account
export interface BankAccount {
  id: string;
  namaBank: string;
  nomorRekening: string;
  namaRekening: string;
  jenisRekening?: string; // 'Operasional' | 'Investasi' | 'Dana Cadangan'
  cabang?: string;
  saldoAwal: number;
  saldoSaatIni?: number;
  isActive: boolean;
  deskripsi?: string;
  createdBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Fiscal Year
export interface FiscalYear {
  id: string;
  tahun: number;
  namaTA: string;
  tanggalMulai: string | Date;
  tanggalSelesai: string | Date;
  isActive: boolean;
  isClosed: boolean;
  createdBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Master Data Module Info
export interface MasterDataModule {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  count?: number;
  backendModule: string;
  color: string;
}

// Helper to get all master data modules
export const MASTER_DATA_MODULES: MasterDataModule[] = [
  {
    id: 'chart-of-accounts',
    name: 'Chart of Accounts',
    title: 'Bagan Akun (COA)',
    description: 'Struktur akun keuangan 5 level',
    icon: 'list-tree',
    path: '/master-data/chart-of-accounts',
    backendModule: 'chart-of-accounts',
    color: 'blue',
  },
  {
    id: 'unit-kerja',
    name: 'Unit Kerja',
    title: 'Unit Kerja',
    description: 'Struktur organisasi BLUD',
    icon: 'building',
    path: '/master-data/unit-kerja',
    backendModule: 'unit-kerja',
    color: 'purple',
  },
  {
    id: 'pegawai',
    name: 'Pegawai',
    title: 'Data Pegawai',
    description: 'Master data pegawai & karyawan',
    icon: 'users',
    path: '/master-data/pegawai',
    backendModule: 'pegawai',
    color: 'green',
  },
  {
    id: 'supplier',
    name: 'Supplier',
    title: 'Data Supplier/Vendor',
    description: 'Master data pemasok barang/jasa',
    icon: 'truck',
    path: '/master-data/supplier',
    backendModule: 'supplier',
    color: 'orange',
  },
  {
    id: 'bank-account',
    name: 'Bank Account',
    title: 'Rekening Bank',
    description: 'Daftar rekening bank BLUD',
    icon: 'landmark',
    path: '/master-data/bank-account',
    backendModule: 'bank-account',
    color: 'teal',
  },
  {
    id: 'fiscal-year',
    name: 'Fiscal Year',
    title: 'Tahun Anggaran',
    description: 'Periode tahun anggaran',
    icon: 'calendar',
    path: '/master-data/fiscal-year',
    backendModule: 'fiscal-year',
    color: 'red',
  },
];

// Helper function to get account type label
export function getAccountTypeLabel(type: AccountType): string {
  const labels: Record<AccountType, string> = {
    [AccountType.ASSET]: 'Aset',
    [AccountType.LIABILITY]: 'Kewajiban',
    [AccountType.EQUITY]: 'Ekuitas',
    [AccountType.REVENUE]: 'Pendapatan',
    [AccountType.EXPENSE]: 'Beban',
  };
  return labels[type] || type;
}

// Helper function to get account type color
export function getAccountTypeColor(type: AccountType): string {
  const colors: Record<AccountType, string> = {
    [AccountType.ASSET]: 'blue',
    [AccountType.LIABILITY]: 'red',
    [AccountType.EQUITY]: 'purple',
    [AccountType.REVENUE]: 'green',
    [AccountType.EXPENSE]: 'orange',
  };
  return colors[type] || 'gray';
}
