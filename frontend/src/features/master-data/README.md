# Master Data Module

Central hub for all master data management in Si-Kancil.

## 📋 Overview

This module serves as the main entry point for managing all master data used throughout the system. It provides a dashboard view of all master data categories with real-time statistics and quick access to each module.

## 🎯 Features

- **Unified Dashboard**: Single page to access all master data modules
- **Real-time Statistics**: Live count of records in each master data category
- **Quick Navigation**: Direct links to each master data management page
- **API Integration**: Connects to 6 backend master data modules

## 📁 File Structure

```
master-data/
├── MasterData.tsx          # Main hub component
├── api.ts                  # API clients for all master data
├── types.ts                # TypeScript interfaces
├── index.ts                # Module exports
└── README.md               # This file
```

## 🗂️ Master Data Modules

### 1. **Chart of Accounts (COA)** 📊
- **Path**: `/master-data/chart-of-accounts`
- **Backend**: `/chart-of-accounts`
- **Description**: Struktur akun keuangan 5 level
- **Features**:
  - 5-level account hierarchy
  - Account type classification (Asset, Liability, Equity, Revenue, Expense)
  - Normal balance tracking
  - Budget control flags

### 2. **Unit Kerja** 🏢
- **Path**: `/master-data/unit-kerja`
- **Backend**: `/unit-kerja`
- **Description**: Struktur organisasi BLUD
- **Features**:
  - Multi-level organizational structure
  - Unit head assignment
  - Active/inactive status

### 3. **Pegawai** 👥
- **Path**: `/master-data/pegawai`
- **Backend**: `/pegawai`
- **Description**: Master data pegawai & karyawan
- **Features**:
  - Employee personal data
  - Position & unit assignment
  - Bank account for payroll
  - NPWP for tax purposes

### 4. **Supplier/Vendor** 🚚
- **Path**: `/master-data/supplier`
- **Backend**: `/supplier`
- **Description**: Data pemasok barang/jasa
- **Features**:
  - Supplier contact information
  - Category classification
  - Bank account details
  - NPWP for tax reporting

### 5. **Bank Account** 🏦
- **Path**: `/master-data/bank-account`
- **Backend**: `/bank-account`
- **Description**: Rekening bank BLUD
- **Features**:
  - Multiple bank accounts
  - Account type (Operational, Investment, Reserve)
  - Current balance tracking
  - Opening balance

### 6. **Fiscal Year** 📅
- **Path**: `/master-data/fiscal-year`
- **Backend**: `/fiscal-year`
- **Description**: Periode tahun anggaran
- **Features**:
  - Fiscal year periods
  - Active/closed status
  - Date range validation

## 🔌 Backend APIs

All master data modules connect to existing backend endpoints:

```
GET    /chart-of-accounts      # Chart of accounts
GET    /unit-kerja             # Organizational units
GET    /pegawai                # Employees
GET    /supplier               # Suppliers/vendors
GET    /bank-account           # Bank accounts
GET    /fiscal-year            # Fiscal years
```

Each endpoint supports standard CRUD operations:
- `GET /` - List all records
- `GET /:id` - Get single record
- `POST /` - Create new record
- `PATCH /:id` - Update record
- `DELETE /:id` - Delete record

## 📊 Data Types

### Chart of Account
```typescript
interface ChartOfAccount {
  id: string;
  kodeRekening: string;        // Account code (e.g., "1.1.01.01")
  namaRekening: string;        // Account name
  jenisAkun: AccountType;      // asset|liability|equity|revenue|expense
  level: number;               // 1-5
  parentKode?: string;         // Parent account code
  isActive: boolean;
  isHeader: boolean;           // Header account (no posting)
  normalBalance: string;       // 'DEBIT' | 'CREDIT'
  isBudgetControl: boolean;
}
```

### Unit Kerja
```typescript
interface UnitKerja {
  id: string;
  kodeUnit: string;
  namaUnit: string;
  level: number;
  parentKode?: string;
  kepalaUnit?: string;
  isActive: boolean;
}
```

### Pegawai
```typescript
interface Pegawai {
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
}
```

## 📖 Usage

### In Routes
```tsx
import MasterData from '@/features/master-data';

{
  path: 'master-data',
  element: <MasterData />
}
```

### API Usage
```tsx
import {
  chartOfAccountsApi,
  unitKerjaApi,
  pegawaiApi,
  masterDataStatsApi
} from '@/features/master-data';

// Get all chart of accounts
const accounts = await chartOfAccountsApi.getAll();

// Get all statistics
const stats = await masterDataStatsApi.getAllStats();
// Returns: { chartOfAccounts: 150, unitKerja: 25, ... }
```

## 🎨 UI Features

### Dashboard View
- **Statistics Cards**: Total records, active modules, categories
- **Module Grid**: 6 cards with:
  - Module title & description
  - Record count
  - Color-coded design
  - Click to navigate
  - Backend endpoint indicator

### Color Scheme
- Chart of Accounts: Blue
- Unit Kerja: Purple
- Pegawai: Green
- Supplier: Orange
- Bank Account: Teal
- Fiscal Year: Red

## ✅ Implementation Status

**Hub Module**: ✅ Complete
- [x] Main dashboard component
- [x] Statistics overview
- [x] Module navigation grid
- [x] API integration
- [x] Real-time data fetching
- [x] Error handling
- [x] Loading states
- [x] Route added

**Sub-modules**: ⏳ Pending Implementation
- [ ] Chart of Accounts CRUD
- [ ] Unit Kerja CRUD
- [ ] Pegawai CRUD
- [ ] Supplier CRUD
- [ ] Bank Account CRUD
- [ ] Fiscal Year CRUD

## 🚀 Next Steps

1. **Implement Chart of Accounts Module**
   - Tree view with 5 levels
   - CRUD operations
   - Account type filtering
   - Search & filter

2. **Implement Unit Kerja Module**
   - Organizational tree structure
   - Unit hierarchy management
   - Head assignment

3. **Implement Pegawai Module**
   - Employee list with search
   - Employee form
   - Unit assignment
   - Payroll integration

4. **Implement Supplier Module**
   - Supplier directory
   - Category management
   - Contact tracking

5. **Implement Bank Account Module**
   - Account list
   - Balance tracking
   - Transaction history link

6. **Implement Fiscal Year Module**
   - Year management
   - Period validation
   - Close year functionality

## 🔗 Dependencies

- All master data modules depend on backend APIs
- Some modules may be referenced by transaction modules:
  - COA → used in journal entries
  - Pegawai → used in payroll
  - Supplier → used in purchases
  - Bank Account → used in cash management
  - Fiscal Year → used throughout all financial modules

## 📝 Notes

- Master data hub is read-only (view statistics)
- Actual CRUD operations will be in sub-modules
- Backend APIs are fully implemented and tested
- Each sub-module will have its own forms and tables

---

**Last Updated**: 2026-02-15
**Status**: ✅ Hub Complete | ⏳ Sub-modules Pending
**Backend**: ✅ All APIs Available
