# Si-Kancil - Phase Plan: Auto-Posting to Journal

**Sistem Keuangan Cepat Lincah untuk BLUD**

**Phase:** Auto-Posting to Journal
**Version:** 1.0
**Date:** 14 Februari 2026
**Target Duration:** 3-4 Minggu
**Prerequisites:** Master Data & RBA Module (Completed)

---

## Daftar Isi

1. [Overview](#overview)
2. [Objectives & Scope](#objectives--scope)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [Implementation Plan](#implementation-plan)
6. [Testing Strategy](#testing-strategy)
7. [Success Criteria](#success-criteria)
8. [Appendix](#appendix)

---

## Overview

### **Apa itu Auto-Posting to Journal?**

Auto-posting adalah mekanisme otomatis untuk membuat jurnal akuntansi dari setiap transaksi keuangan yang terjadi di sistem, tanpa perlu input manual dari user. Ini adalah **core feature** yang memastikan:

1. **No Double Entry**: User hanya input transaksi sekali, jurnal ter-generate otomatis
2. **Real-time Accounting**: Buku Besar dan Laporan Keuangan selalu up-to-date
3. **Zero Error**: Eliminasi human error dalam journaling
4. **Audit Trail**: Setiap jurnal ter-link ke transaksi sumbernya
5. **Compliance**: Memenuhi SAP (Standar Akuntansi Pemerintahan)

### **Transaksi yang Akan Auto-Post**

```yaml
Pendapatan:
  ✅ Penerimaan Jasa Layanan (dari SIMRS/manual input)
  ✅ Penerimaan APBD (SP2D masuk)
  ✅ Hibah (Uang/Barang/Jasa)
  ✅ Pendapatan Non-Operasional
  ✅ Bunga Bank

Belanja:
  ✅ SP2D Keluar (setelah SPP-SPM approved)
  ✅ Pembayaran langsung (LS)
  ✅ Uang Persediaan (UP)
  ✅ Ganti Uang (GU)
  ✅ Tambahan Uang (TU)

Kas & Bank:
  ✅ Setoran ke Bank
  ✅ Pengambilan dari Bank
  ✅ Transfer antar Rekening
  ✅ Penyetoran Pajak (STS)

Aset:
  ✅ Pembelian Aset
  ✅ Penyusutan Aset (monthly auto)
  ✅ Penghapusan Aset
  ✅ Revaluasi Aset

Pajak:
  ✅ Pemotongan PPh (21/22/23/4(2))
  ✅ Pemungutan PPN
  ✅ Penyetoran Pajak

Adjustment:
  ✅ Jurnal Penyesuaian (manual)
  ✅ Jurnal Koreksi (manual, with approval)
  ✅ Jurnal Penutup (end of year)
```

### **Business Impact**

```yaml
Before Auto-Posting:
  ❌ Finance team manual entry → 4-6 jam/hari
  ❌ Error rate: ~5%
  ❌ Closing time: 10-15 hari
  ❌ Real-time report: Tidak ada

After Auto-Posting:
  ✅ Zero manual journaling
  ✅ Error rate: <0.1%
  ✅ Closing time: 1-2 hari (hanya review & adjustment)
  ✅ Real-time report: Always available
  ✅ Time saving: ~80 jam/bulan
```

---

## Objectives & Scope

### **2.1. Primary Objectives**

```yaml
1. Automation:
   ✅ Auto-generate jurnal untuk SEMUA transaksi keuangan
   ✅ Zero manual journaling untuk transaksi standar
   ✅ Configurable journal mapping rules

2. Accuracy:
   ✅ 100% akurat sesuai SAP (Standar Akuntansi Pemerintahan)
   ✅ Balancing check (Debet = Kredit) setiap jurnal
   ✅ Link jurnal ke source transaction

3. Real-time:
   ✅ Jurnal posted immediately setelah transaksi
   ✅ Buku Besar updated real-time
   ✅ Dashboard reflects current state

4. Traceability:
   ✅ Setiap jurnal ter-link ke transaksi sumber
   ✅ Drill-down capability (Laporan → Buku Besar → Jurnal → Transaksi)
   ✅ Audit trail lengkap

5. Flexibility:
   ✅ Support manual journal entry (for adjustments)
   ✅ Jurnal koreksi dengan approval
   ✅ Reversal mechanism
```

### **2.2. In Scope**

#### **A. Journal Management**
```yaml
✅ Auto-posting engine dengan event-driven architecture
✅ Journal mapping configuration (transaksi type → CoA)
✅ Manual journal entry interface
✅ Journal approval workflow (for manual entries)
✅ Journal reversal mechanism
✅ Journal search & filtering
✅ Journal report (by period, by type, by CoA)
```

#### **B. General Ledger (Buku Besar)**
```yaml
✅ Real-time update from journals
✅ Per CoA (Chart of Accounts)
✅ Per period (monthly, yearly)
✅ Opening balance management
✅ Drill-down to journal detail
✅ Export to Excel
```

#### **C. Trial Balance (Neraca Saldo)**
```yaml
✅ Auto-generate from General Ledger
✅ Balancing check (Debet = Kredit)
✅ Period comparison
✅ Adjustment column
✅ Print & export
```

#### **D. Auto-Posting Rules**
```yaml
✅ Pendapatan → Journal mapping
✅ Belanja → Journal mapping
✅ Kas & Bank → Journal mapping
✅ Aset → Journal mapping
✅ Pajak → Journal mapping
✅ Configurable via admin panel
```

### **2.3. Out of Scope (Future Phase)**

```yaml
❌ SIMRS Integration (akan di fase terpisah)
❌ Advanced analytics/BI
❌ Multi-currency support
❌ Cost center allocation (advanced)
❌ Budgetary accounting (advanced)
```

---

## Technical Architecture

### **3.1. System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      TRANSACTION LAYER                       │
│  (Pendapatan, Belanja, Kas, Aset, Pajak modules)            │
└────────────────┬────────────────────────────────────────────┘
                 │ emit events
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    EVENT BUS (NestJS)                        │
│  - TransactionCreatedEvent                                   │
│  - TransactionUpdatedEvent                                   │
│  - TransactionDeletedEvent                                   │
└────────────────┬────────────────────────────────────────────┘
                 │ handled by
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              AUTO-POSTING SERVICE (Core)                     │
│  - Listen to transaction events                              │
│  - Fetch mapping rules from config                           │
│  - Generate journal entries                                  │
│  - Validate balancing (Debet = Kredit)                       │
│  - Save to journal table                                     │
│  - Emit JournalCreatedEvent                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    JOURNAL TABLE                             │
│  - id, tanggal, nomorJurnal, type                            │
│  - sourceType, sourceId (link to transaction)                │
│  - items: [{coaId, debet, kredit, uraian}]                   │
│  - status, createdBy, approvedBy                             │
└────────────────┬────────────────────────────────────────────┘
                 │ aggregated to
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  GENERAL LEDGER TABLE                        │
│  - coaId, period, openingBalance                             │
│  - totalDebet, totalKredit, endingBalance                    │
│  - updatedAt                                                 │
└────────────────┬────────────────────────────────────────────┘
                 │ summarized to
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  TRIAL BALANCE TABLE                         │
│  - period, coaId, debet, kredit                              │
│  - balanceType (DEBET/KREDIT)                                │
└─────────────────────────────────────────────────────────────┘
```

### **3.2. Event-Driven Auto-Posting Flow**

```typescript
// Example: Pendapatan Jasa Layanan

// 1. User creates Pendapatan record
POST /api/v1/pendapatan
{
  "jenisPendapatan": "JASA_LAYANAN",
  "tanggal": "2026-02-14",
  "jumlah": 5000000,
  "uraian": "Pembayaran pasien rawat inap",
  "penjamin": "UMUM"
}

// 2. Pendapatan Service emits event
eventEmitter.emit('transaction.created', {
  type: 'PENDAPATAN_JASA_LAYANAN',
  id: 'pend-001',
  data: { ... }
})

// 3. Auto-Posting Service handles event
@OnEvent('transaction.created')
async handleTransactionCreated(event) {
  // Fetch mapping rules
  const rules = await this.getMappingRules(event.type)

  // rules = {
  //   debet: [{ coaCode: '1.1.1.01.01', description: 'Kas di Bendahara Penerimaan' }],
  //   kredit: [{ coaCode: '4.1.1.01.01', description: 'Pendapatan Jasa Layanan Rawat Inap' }]
  // }

  // Generate journal
  const journal = {
    tanggal: event.data.tanggal,
    type: 'AUTO',
    sourceType: 'PENDAPATAN',
    sourceId: event.id,
    items: [
      { coaCode: '1.1.1.01.01', debet: 5000000, kredit: 0 },
      { coaCode: '4.1.1.01.01', debet: 0, kredit: 5000000 }
    ],
    uraian: event.data.uraian
  }

  // Validate balance
  if (!this.isBalanced(journal)) throw new Error('Journal not balanced')

  // Save journal
  await this.journalService.create(journal)

  // Update General Ledger
  await this.generalLedgerService.updateFromJournal(journal)
}
```

### **3.3. Tech Stack**

```yaml
Backend:
  Framework: NestJS
  Database: PostgreSQL (with Prisma ORM)
  Event Bus: NestJS EventEmitter2
  Queue: BullMQ (for async processing jika diperlukan)
  Validation: class-validator, class-transformer

Frontend:
  Framework: React + TypeScript
  UI: Ant Design
  State: Zustand
  Forms: React Hook Form
  Tables: Ant Design Table (with sorting, filtering)

Database:
  Main: PostgreSQL 15
  Indexing: Composite indexes on (coaId, period), (sourceType, sourceId)
  Constraints: CHECK balance (debet = kredit per journal)
```

---

## Database Schema

### **4.1. Core Tables**

#### **A. Journal Table**

```prisma
model Journal {
  id                String          @id @default(uuid())
  nomorJurnal       String          @unique // Auto-generated: JU/2026/02/0001
  tanggalJurnal     DateTime
  periode           String          // 2026-02 (YYYY-MM)
  tahun             Int             // 2026

  // Type classification
  jenisJurnal       JenisJurnal     // AUTO, MANUAL, PENYESUAIAN, PENUTUP, KOREKSI
  sourceType        String?         // PENDAPATAN, BELANJA, KAS_BANK, ASET, PAJAK
  sourceId          String?         // ID dari tabel sumber

  // Journal items (detail)
  items             JournalItem[]

  // Totals (for quick validation)
  totalDebet        Decimal         @db.Decimal(15,2)
  totalKredit       Decimal         @db.Decimal(15,2)
  isBalanced        Boolean         @default(true) // totalDebet == totalKredit

  // Description
  uraian            String          @db.Text
  keterangan        String?         @db.Text

  // Status & Workflow
  status            StatusJurnal    @default(DRAFT)  // DRAFT, POSTED, APPROVED, REVERSED
  isPosted          Boolean         @default(false)
  postedAt          DateTime?
  postedBy          String?

  // Approval (for manual journals)
  isApproved        Boolean         @default(false)
  approvedBy        String?
  approvedAt        DateTime?

  // Reversal
  isReversed        Boolean         @default(false)
  reversedBy        String?
  reversedAt        DateTime?
  reversalJournalId String?         // Link to reversal journal

  // Audit
  createdBy         String
  createdAt         DateTime        @default(now())
  updatedBy         String?
  updatedAt         DateTime        @updatedAt

  // Indexes
  @@index([tanggalJurnal])
  @@index([periode])
  @@index([tahun])
  @@index([jenisJurnal])
  @@index([sourceType, sourceId])
  @@index([status])
}

enum JenisJurnal {
  AUTO              // Auto-posted from transactions
  MANUAL            // Manual entry by user
  PENYESUAIAN       // Adjustment journal
  PENUTUP           // Closing journal (end of year)
  KOREKSI           // Correction journal
}

enum StatusJurnal {
  DRAFT             // Not yet posted
  POSTED            // Posted to GL
  APPROVED          // Approved (for manual)
  REVERSED          // Reversed
}
```

#### **B. Journal Item Table**

```prisma
model JournalItem {
  id                String          @id @default(uuid())
  journalId         String
  journal           Journal         @relation(fields: [journalId], references: [id], onDelete: Cascade)

  // CoA
  coaId             String
  coa               ChartOfAccount  @relation(fields: [coaId], references: [id])
  kodeRekening      String          // Denormalized for performance
  namaRekening      String          // Denormalized for performance

  // Amount
  debet             Decimal         @db.Decimal(15,2) @default(0)
  kredit            Decimal         @db.Decimal(15,2) @default(0)

  // Description
  uraian            String?         @db.Text

  // Unit kerja (optional, for cost center)
  unitKerjaId       String?

  // Indexes
  @@index([journalId])
  @@index([coaId])
  @@index([kodeRekening])
}
```

#### **C. General Ledger Table**

```prisma
model GeneralLedger {
  id                String          @id @default(uuid())
  coaId             String
  coa               ChartOfAccount  @relation(fields: [coaId], references: [id])
  kodeRekening      String          // Denormalized
  namaRekening      String          // Denormalized

  // Period
  periode           String          // 2026-02 (YYYY-MM)
  tahun             Int             // 2026
  bulan             Int             // 2 (Feb)

  // Balances
  saldoAwal         Decimal         @db.Decimal(15,2) @default(0) // From previous month
  totalDebet        Decimal         @db.Decimal(15,2) @default(0) // Sum of current month debets
  totalKredit       Decimal         @db.Decimal(15,2) @default(0) // Sum of current month kredits
  mutasi            Decimal         @db.Decimal(15,2) @default(0) // totalDebet - totalKredit
  saldoAkhir        Decimal         @db.Decimal(15,2) @default(0) // saldoAwal + mutasi

  // Balance type (for classification)
  saldoNormal       SaldoNormal     // DEBET or KREDIT (from CoA)

  // Timestamps
  lastUpdated       DateTime        @updatedAt
  createdAt         DateTime        @default(now())

  // Unique constraint
  @@unique([coaId, periode])
  @@index([periode])
  @@index([tahun])
  @@index([kodeRekening])
}

enum SaldoNormal {
  DEBET
  KREDIT
}
```

#### **D. Trial Balance Table (Materialized View)**

```prisma
model TrialBalance {
  id                String          @id @default(uuid())
  periode           String          // 2026-02
  tahun             Int

  coaId             String
  coa               ChartOfAccount  @relation(fields: [coaId], references: [id])
  kodeRekening      String
  namaRekening      String
  level             Int             // CoA level (1-6)
  parentCode        String?

  // Trial Balance amounts
  debet             Decimal         @db.Decimal(15,2) @default(0)
  kredit            Decimal         @db.Decimal(15,2) @default(0)

  // Adjustment (if any)
  debetAdjustment   Decimal         @db.Decimal(15,2) @default(0)
  kreditAdjustment  Decimal         @db.Decimal(15,2) @default(0)

  // Adjusted balance
  debetAdjusted     Decimal         @db.Decimal(15,2) @default(0)
  kreditAdjusted    Decimal         @db.Decimal(15,2) @default(0)

  // Timestamps
  generatedAt       DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@unique([periode, coaId])
  @@index([periode])
  @@index([tahun])
}
```

#### **E. Journal Mapping Configuration**

```prisma
model JournalMappingRule {
  id                String          @id @default(uuid())

  // Transaction Type
  sourceType        String          @unique // PENDAPATAN_JASA_LAYANAN, BELANJA_LS, etc.
  description       String

  // Mapping rules (JSON array)
  debitRules        Json            // [{ coaCode, percentage?, description }]
  creditRules       Json            // [{ coaCode, percentage?, description }]

  // Additional conditions (optional, for complex rules)
  conditions        Json?           // { field: value } matching

  // Active status
  isActive          Boolean         @default(true)

  // Audit
  createdBy         String
  createdAt         DateTime        @default(now())
  updatedBy         String?
  updatedAt         DateTime        @updatedAt

  @@index([sourceType])
}
```

### **4.2. Sample Mapping Rules**

```json
{
  "sourceType": "PENDAPATAN_JASA_LAYANAN",
  "description": "Penerimaan Jasa Layanan Rumah Sakit",
  "debitRules": [
    {
      "coaCode": "1.1.1.01.01",
      "description": "Kas di Bendahara Penerimaan",
      "percentage": 100
    }
  ],
  "creditRules": [
    {
      "coaCode": "4.1.1.01.01",
      "description": "Pendapatan Jasa Layanan",
      "percentage": 100
    }
  ]
}
```

```json
{
  "sourceType": "BELANJA_LS_WITH_TAX",
  "description": "Belanja LS dengan Pajak PPh 23",
  "debitRules": [
    {
      "coaCode": "5.1.1.01.01",
      "description": "Belanja Barang",
      "percentage": 100
    }
  ],
  "creditRules": [
    {
      "coaCode": "2.1.3.01.01",
      "description": "Utang PPh 23",
      "percentage": 2,
      "note": "PPh 23 rate"
    },
    {
      "coaCode": "1.1.1.03.01",
      "description": "Kas di Bank",
      "percentage": 98,
      "note": "Net payment"
    }
  ]
}
```

---

## Implementation Plan

### **5.1. Timeline Overview**

```yaml
Total Duration: 3-4 Minggu

Week 1: Core Infrastructure
  - Database schema & migrations
  - Journal CRUD module
  - Auto-posting service skeleton
  - Event bus setup

Week 2: Auto-Posting Rules & Engine
  - Mapping rule configuration
  - Auto-posting service implementation
  - Event handlers for each transaction type
  - Testing

Week 3: General Ledger & Trial Balance
  - General Ledger auto-update
  - Trial Balance generation
  - Reports & exports
  - Frontend UI

Week 4: Testing, Bug Fixing & Documentation
  - Integration testing
  - Performance testing
  - Bug fixing
  - Documentation
```

### **5.2. Week 1: Core Infrastructure (5 Days)**

#### **Day 1-2: Database Schema & Migrations**

**Backend Tasks:**
```yaml
✅ Prisma schema untuk Journal, JournalItem, GeneralLedger, TrialBalance
✅ Prisma migration: create tables
✅ Seed data:
   - Sample CoA (Chart of Accounts)
   - Sample JournalMappingRule (2-3 basic rules)
✅ Database indexes untuk performance

Tech:
  - File: prisma/schema.prisma
  - Migration: prisma migrate dev --name add_journal_tables
  - Seed: prisma/seed.ts
```

**Deliverables:**
- `prisma/migrations/xxx_add_journal_tables/migration.sql`
- `prisma/seed.ts` (dengan sample data)
- Database schema documented

#### **Day 3-4: Journal CRUD Module**

**Backend Tasks:**
```yaml
Module: src/modules/accounting/journal/

✅ JournalService:
   - create(dto): Create manual journal
   - findAll(filters): List journals with pagination
   - findOne(id): Get journal detail
   - update(id, dto): Update draft journal
   - delete(id): Delete draft journal
   - post(id): Post journal to GL
   - reverse(id): Reverse posted journal
   - approve(id): Approve manual journal

✅ JournalController:
   - POST   /api/v1/accounting/journals
   - GET    /api/v1/accounting/journals
   - GET    /api/v1/accounting/journals/:id
   - PATCH  /api/v1/accounting/journals/:id
   - DELETE /api/v1/accounting/journals/:id
   - POST   /api/v1/accounting/journals/:id/post
   - POST   /api/v1/accounting/journals/:id/reverse
   - POST   /api/v1/accounting/journals/:id/approve

✅ DTOs:
   - CreateJournalDto
   - UpdateJournalDto
   - JournalFilterDto
   - JournalItemDto

✅ Validation:
   - Balancing check (debet = kredit)
   - CoA validation (exists & active)
   - Period validation (not closed)
   - Permission check (role-based)
```

**Deliverables:**
- `src/modules/accounting/journal/journal.service.ts`
- `src/modules/accounting/journal/journal.controller.ts`
- `src/modules/accounting/journal/dto/*.dto.ts`
- Unit tests: `journal.service.spec.ts`

#### **Day 5: Event Bus Setup**

**Backend Tasks:**
```yaml
Module: src/common/events/

✅ Install: @nestjs/event-emitter
✅ Configure EventEmitterModule in AppModule
✅ Define event classes:
   - TransactionCreatedEvent
   - TransactionUpdatedEvent
   - TransactionDeletedEvent
   - JournalCreatedEvent
   - JournalPostedEvent

✅ Event emitter utility:
   - EventBusService (wrapper around EventEmitter2)
```

**Deliverables:**
- `src/common/events/transaction.events.ts`
- `src/common/events/journal.events.ts`
- `src/common/events/event-bus.service.ts`
- Documentation: Event-driven architecture

---

### **5.3. Week 2: Auto-Posting Rules & Engine (5 Days)**

#### **Day 1-2: Mapping Rule Configuration**

**Backend Tasks:**
```yaml
Module: src/modules/accounting/journal-mapping/

✅ JournalMappingService:
   - create(dto): Create new mapping rule
   - findAll(): List all rules
   - findBySourceType(type): Get rule for transaction type
   - update(id, dto): Update rule
   - delete(id): Delete rule
   - activate(id): Activate rule
   - deactivate(id): Deactivate rule

✅ JournalMappingController:
   - POST   /api/v1/accounting/journal-mappings
   - GET    /api/v1/accounting/journal-mappings
   - GET    /api/v1/accounting/journal-mappings/:sourceType
   - PATCH  /api/v1/accounting/journal-mappings/:id
   - DELETE /api/v1/accounting/journal-mappings/:id

✅ Seed mapping rules for common transaction types:
   - PENDAPATAN_JASA_LAYANAN
   - PENDAPATAN_APBD
   - HIBAH_UANG
   - BELANJA_LS
   - BELANJA_UP
   - BELANJA_GU
   - PENYETORAN_PAJAK
   - PENYUSUTAN_ASET
```

**Frontend Tasks:**
```yaml
Pages: /accounting/journal-mappings

✅ List mapping rules (table)
✅ Create/Edit mapping rule form
✅ Test mapping rule (preview journal)
```

**Deliverables:**
- `src/modules/accounting/journal-mapping/*`
- Frontend: `src/pages/accounting/JournalMappings.tsx`
- Seed data: 8-10 common mapping rules

#### **Day 3-4: Auto-Posting Service Implementation**

**Backend Tasks:**
```yaml
Module: src/modules/accounting/auto-posting/

✅ AutoPostingService:
   - handleTransactionCreated(event):
      1. Fetch mapping rule by sourceType
      2. Validate rule exists
      3. Build journal from rule + transaction data
      4. Calculate amounts (with percentage if applicable)
      5. Validate balancing
      6. Create journal (jenisJurnal: AUTO, status: POSTED)
      7. Emit JournalCreatedEvent

   - handleTransactionUpdated(event):
      1. Find existing auto-posted journal (by sourceId)
      2. Reverse old journal
      3. Create new journal with updated data

   - handleTransactionDeleted(event):
      1. Find existing auto-posted journal
      2. Reverse journal

✅ Event Handlers:
   - @OnEvent('transaction.created')
   - @OnEvent('transaction.updated')
   - @OnEvent('transaction.deleted')

✅ Helper methods:
   - buildJournalFromRule(rule, transaction)
   - validateBalance(journalItems)
   - calculateAmounts(rules, totalAmount)
```

**Example Implementation:**
```typescript
@Injectable()
export class AutoPostingService {
  constructor(
    private journalService: JournalService,
    private mappingService: JournalMappingService,
    private coaService: ChartOfAccountService,
  ) {}

  @OnEvent('transaction.created')
  async handleTransactionCreated(event: TransactionCreatedEvent) {
    const { sourceType, sourceId, data } = event;

    // 1. Fetch mapping rule
    const rule = await this.mappingService.findBySourceType(sourceType);
    if (!rule || !rule.isActive) {
      this.logger.warn(`No active mapping rule for ${sourceType}`);
      return;
    }

    // 2. Build journal
    const journal = await this.buildJournalFromRule(rule, data);
    journal.sourceType = sourceType;
    journal.sourceId = sourceId;
    journal.jenisJurnal = JenisJurnal.AUTO;
    journal.status = StatusJurnal.POSTED;
    journal.isPosted = true;
    journal.postedAt = new Date();
    journal.postedBy = 'SYSTEM';

    // 3. Validate balance
    if (!this.validateBalance(journal.items)) {
      throw new Error('Journal not balanced');
    }

    // 4. Save journal
    const createdJournal = await this.journalService.create(journal);

    // 5. Emit event
    this.eventBus.emit('journal.created', {
      journalId: createdJournal.id,
      sourceType,
      sourceId,
    });
  }

  private async buildJournalFromRule(
    rule: JournalMappingRule,
    transaction: any,
  ): Promise<CreateJournalDto> {
    const items: JournalItemDto[] = [];
    const totalAmount = transaction.jumlah || transaction.nilai;

    // Process debit rules
    for (const debitRule of rule.debitRules) {
      const coa = await this.coaService.findByCode(debitRule.coaCode);
      const amount = (totalAmount * (debitRule.percentage || 100)) / 100;
      items.push({
        coaId: coa.id,
        kodeRekening: coa.kodeRekening,
        namaRekening: coa.namaRekening,
        debet: amount,
        kredit: 0,
        uraian: debitRule.description || transaction.uraian,
      });
    }

    // Process credit rules
    for (const creditRule of rule.creditRules) {
      const coa = await this.coaService.findByCode(creditRule.coaCode);
      const amount = (totalAmount * (creditRule.percentage || 100)) / 100;
      items.push({
        coaId: coa.id,
        kodeRekening: coa.kodeRekening,
        namaRekening: coa.namaRekening,
        debet: 0,
        kredit: amount,
        uraian: creditRule.description || transaction.uraian,
      });
    }

    // Calculate totals
    const totalDebet = items.reduce((sum, item) => sum + item.debet, 0);
    const totalKredit = items.reduce((sum, item) => sum + item.kredit, 0);

    return {
      tanggalJurnal: transaction.tanggal,
      periode: format(transaction.tanggal, 'yyyy-MM'),
      tahun: getYear(transaction.tanggal),
      items,
      totalDebet,
      totalKredit,
      isBalanced: totalDebet === totalKredit,
      uraian: transaction.uraian || `Auto-posted from ${rule.description}`,
      createdBy: transaction.createdBy || 'SYSTEM',
    };
  }

  private validateBalance(items: JournalItemDto[]): boolean {
    const totalDebet = items.reduce((sum, item) => sum + item.debet, 0);
    const totalKredit = items.reduce((sum, item) => sum + item.kredit, 0);
    return Math.abs(totalDebet - totalKredit) < 0.01; // Allow 1 cent rounding error
  }
}
```

**Deliverables:**
- `src/modules/accounting/auto-posting/auto-posting.service.ts`
- Unit tests: `auto-posting.service.spec.ts`
- Integration tests: Test with sample transactions

#### **Day 5: Transaction Module Integration**

**Backend Tasks:**
```yaml
Update existing transaction modules to emit events:

✅ Pendapatan Module:
   - After create: emit('transaction.created', {...})
   - After update: emit('transaction.updated', {...})
   - After delete: emit('transaction.deleted', {...})

✅ Belanja Module (SP2D):
   - After SP2D issued: emit('transaction.created', {...})

✅ Kas & Bank Module:
   - After transfer: emit('transaction.created', {...})

✅ Aset Module:
   - After pembelian: emit('transaction.created', {...})

✅ Pajak Module:
   - After penyetoran: emit('transaction.created', {...})
```

**Testing:**
```yaml
✅ Create sample transactions
✅ Verify journals are auto-created
✅ Check journal balancing
✅ Verify link to source transaction
```

**Deliverables:**
- Updated transaction services with event emission
- Integration tests

---

### **5.4. Week 3: General Ledger & Trial Balance (5 Days)**

#### **Day 1-2: General Ledger Service**

**Backend Tasks:**
```yaml
Module: src/modules/accounting/general-ledger/

✅ GeneralLedgerService:
   - updateFromJournal(journal):
      For each journal item:
        1. Find or create GL record (coaId + periode)
        2. Update totalDebet/totalKredit
        3. Recalculate saldoAkhir

   - findByCoA(coaId, startPeriod, endPeriod):
      Get GL entries for specific CoA

   - findByPeriod(period):
      Get all GL entries for period

   - recalculateBalance(coaId, period):
      Recalculate from journals (for correction)

   - getSaldoAwal(coaId, period):
      Get opening balance (= saldoAkhir of previous period)

✅ Event Handler:
   - @OnEvent('journal.created')
   - @OnEvent('journal.reversed')

✅ GeneralLedgerController:
   - GET /api/v1/accounting/general-ledger?period=2026-02
   - GET /api/v1/accounting/general-ledger/:coaId?startPeriod=2026-01&endPeriod=2026-12
   - POST /api/v1/accounting/general-ledger/:coaId/recalculate
```

**Implementation:**
```typescript
@Injectable()
export class GeneralLedgerService {
  @OnEvent('journal.created')
  async handleJournalCreated(event: JournalCreatedEvent) {
    const journal = await this.journalService.findOne(event.journalId);
    await this.updateFromJournal(journal);
  }

  async updateFromJournal(journal: Journal) {
    for (const item of journal.items) {
      // Find or create GL record
      let gl = await this.prisma.generalLedger.findUnique({
        where: {
          coaId_periode: {
            coaId: item.coaId,
            periode: journal.periode,
          },
        },
      });

      if (!gl) {
        // Create new GL record
        const saldoAwal = await this.getSaldoAwal(item.coaId, journal.periode);
        gl = await this.prisma.generalLedger.create({
          data: {
            coaId: item.coaId,
            kodeRekening: item.kodeRekening,
            namaRekening: item.namaRekening,
            periode: journal.periode,
            tahun: journal.tahun,
            bulan: parseInt(journal.periode.split('-')[1]),
            saldoAwal,
            totalDebet: 0,
            totalKredit: 0,
            mutasi: 0,
            saldoAkhir: saldoAwal,
            saldoNormal: item.coa.saldoNormal,
          },
        });
      }

      // Update totals
      await this.prisma.generalLedger.update({
        where: { id: gl.id },
        data: {
          totalDebet: { increment: item.debet },
          totalKredit: { increment: item.kredit },
          mutasi: { increment: item.debet - item.kredit },
          saldoAkhir: {
            increment: item.coa.saldoNormal === 'DEBET'
              ? item.debet - item.kredit
              : item.kredit - item.debet,
          },
        },
      });
    }
  }

  async getSaldoAwal(coaId: string, periode: string): Promise<number> {
    const [year, month] = periode.split('-').map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevPeriode = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const prevGL = await this.prisma.generalLedger.findUnique({
      where: {
        coaId_periode: {
          coaId,
          periode: prevPeriode,
        },
      },
    });

    return prevGL?.saldoAkhir || 0;
  }
}
```

**Deliverables:**
- `src/modules/accounting/general-ledger/*`
- Unit & integration tests

#### **Day 3: Trial Balance Service**

**Backend Tasks:**
```yaml
Module: src/modules/accounting/trial-balance/

✅ TrialBalanceService:
   - generate(period):
      1. Fetch all GL records for period
      2. Aggregate by CoA hierarchy
      3. Calculate debet/kredit totals
      4. Validate balancing (Σdebet = Σkredit)
      5. Save to TrialBalance table

   - findByPeriod(period):
      Get trial balance for period

   - compare(period1, period2):
      Compare two periods

   - export(period, format):
      Export to Excel/PDF

✅ TrialBalanceController:
   - POST /api/v1/accounting/trial-balance/generate
   - GET  /api/v1/accounting/trial-balance?period=2026-02
   - GET  /api/v1/accounting/trial-balance/compare?period1=2026-01&period2=2026-02
   - GET  /api/v1/accounting/trial-balance/export?period=2026-02&format=excel
```

**Implementation:**
```typescript
@Injectable()
export class TrialBalanceService {
  async generate(period: string) {
    // 1. Delete existing trial balance for period
    await this.prisma.trialBalance.deleteMany({ where: { periode: period } });

    // 2. Fetch all GL records for period
    const glRecords = await this.prisma.generalLedger.findMany({
      where: { periode: period },
      include: { coa: true },
    });

    // 3. Create trial balance entries
    const tbEntries = glRecords.map((gl) => ({
      periode: period,
      tahun: gl.tahun,
      coaId: gl.coaId,
      kodeRekening: gl.kodeRekening,
      namaRekening: gl.namaRekening,
      level: gl.coa.level,
      parentCode: gl.coa.parentCode,
      debet: gl.totalDebet,
      kredit: gl.totalKredit,
      debetAdjusted: gl.totalDebet,
      kreditAdjusted: gl.totalKredit,
    }));

    await this.prisma.trialBalance.createMany({ data: tbEntries });

    // 4. Validate balancing
    const totalDebet = tbEntries.reduce((sum, e) => sum + e.debet, 0);
    const totalKredit = tbEntries.reduce((sum, e) => sum + e.kredit, 0);

    if (Math.abs(totalDebet - totalKredit) > 0.01) {
      throw new Error('Trial balance not balanced!');
    }

    return { totalDebet, totalKredit, balanced: true };
  }

  async findByPeriod(period: string) {
    return this.prisma.trialBalance.findMany({
      where: { periode: period },
      include: { coa: true },
      orderBy: { kodeRekening: 'asc' },
    });
  }
}
```

**Deliverables:**
- `src/modules/accounting/trial-balance/*`
- Tests

#### **Day 4-5: Frontend UI**

**Frontend Tasks:**
```yaml
Pages:
  ✅ /accounting/journals (List journals)
  ✅ /accounting/journals/new (Manual journal entry)
  ✅ /accounting/journals/:id (Journal detail)
  ✅ /accounting/general-ledger (Buku Besar)
  ✅ /accounting/trial-balance (Neraca Saldo)

Components:
  ✅ JournalList (table with filters)
  ✅ JournalForm (manual entry form)
  ✅ JournalDetail (view with drill-down)
  ✅ GeneralLedgerTable (with period selector)
  ✅ TrialBalanceTable (with export buttons)

Features:
  ✅ Pagination, sorting, filtering
  ✅ Search by nomor jurnal, CoA, uraian
  ✅ Date range picker
  ✅ Drill-down (Laporan → GL → Journal → Transaction)
  ✅ Export to Excel/PDF
  ✅ Print preview
```

**Deliverables:**
- Frontend pages & components
- Responsive design
- User guide (documentation)

---

### **5.5. Week 4: Testing, Bug Fixing & Documentation (5 Days)**

#### **Day 1-2: Integration Testing**

```yaml
Test Scenarios:

✅ End-to-End Flow:
   1. Create Pendapatan → Verify journal created → Check GL updated → Verify TB balanced
   2. Create Belanja (SP2D) → Verify journal with tax → Check GL → Verify TB
   3. Manual journal entry → Approve → Check GL → Verify TB
   4. Reverse journal → Check GL reverted → Verify TB

✅ Edge Cases:
   - Unbalanced journal (should throw error)
   - Missing mapping rule (should log warning, no journal)
   - Update transaction (should reverse + create new journal)
   - Delete transaction (should reverse journal)
   - Closed period (should prevent posting)

✅ Performance Testing:
   - Create 1000 transactions → measure auto-posting time
   - Generate trial balance for 500 CoAs → measure time
   - GL query with 10,000 journal items → measure time
   - Target: <3s for most operations
```

#### **Day 3: Bug Fixing**

```yaml
✅ Fix bugs dari integration testing
✅ Code review & refactoring
✅ Security review (access control, SQL injection)
✅ Performance optimization (indexes, query optimization)
```

#### **Day 4-5: Documentation**

```yaml
✅ API Documentation (Swagger/OpenAPI)
✅ User Guide:
   - How to view journals
   - How to create manual journal
   - How to reverse journal
   - How to configure mapping rules
   - How to generate trial balance

✅ Technical Documentation:
   - Auto-posting architecture
   - Event flow diagram
   - Database schema diagram
   - Mapping rule format
   - Troubleshooting guide

✅ Training Materials:
   - Video walkthrough (15-20 min)
   - PDF guide
   - FAQ
```

**Deliverables:**
- Complete documentation
- Training materials
- Handover to QA

---

## Testing Strategy

### **6.1. Unit Testing**

```yaml
Backend (Jest):
  ✅ JournalService:
     - create(), update(), delete(), post(), reverse()
     - Balancing validation

  ✅ AutoPostingService:
     - buildJournalFromRule()
     - validateBalance()
     - Event handlers

  ✅ GeneralLedgerService:
     - updateFromJournal()
     - getSaldoAwal()

  ✅ TrialBalanceService:
     - generate()
     - balancing check

Target Coverage: >80%
```

### **6.2. Integration Testing**

```yaml
✅ Database Integration:
   - Create journal → verify in DB
   - Update GL → verify calculations
   - Generate TB → verify aggregation

✅ Event Flow:
   - Transaction created → journal auto-posted
   - Journal created → GL updated
   - Journal reversed → GL reverted

✅ API Integration:
   - POST /journals → returns 201
   - GET /journals → returns paginated list
   - POST /journals/:id/post → updates status
```

### **6.3. End-to-End Testing**

```yaml
✅ User Flows:
   1. Finance user creates pendapatan
   2. System auto-posts journal
   3. User views journal in list
   4. User drills down to transaction
   5. User generates trial balance
   6. User exports to Excel

✅ Approval Workflow:
   1. User creates manual journal (DRAFT)
   2. Approver reviews journal
   3. Approver approves journal
   4. System posts to GL
   5. User views in trial balance
```

### **6.4. Performance Testing**

```yaml
Load Testing (with k6 or Artillery):
  ✅ 20 concurrent users creating transactions
  ✅ 100 journals/minute auto-posting
  ✅ 1000 GL records queried
  ✅ Trial balance generation with 500 CoAs

Targets:
  - API response time: <500ms (p95)
  - Auto-posting delay: <2s
  - Trial balance generation: <30s
  - No memory leaks after 1000 operations
```

---

## Success Criteria

### **7.1. Functional Requirements**

```yaml
Must Pass:
  ✅ Auto-posting works for ALL transaction types
  ✅ Journals are balanced (debet = kredit) 100% of time
  ✅ General Ledger updates real-time from journals
  ✅ Trial Balance balances (Σdebet = Σkredit)
  ✅ Link from journal to source transaction works
  ✅ Reversal mechanism works correctly
  ✅ Manual journal entry & approval workflow works
  ✅ Mapping rules configurable via UI
  ✅ Export to Excel/PDF works
  ✅ Drill-down capability works (Laporan → GL → Journal → Transaction)
```

### **7.2. Performance Metrics**

```yaml
✅ Auto-posting delay: <2 seconds
✅ API response time: <500ms (p95)
✅ Trial balance generation: <30 seconds (for 500 CoAs)
✅ Support 20 concurrent users
✅ Page load time: <3 seconds
```

### **7.3. Quality Metrics**

```yaml
✅ Unit test coverage: >80%
✅ Zero critical bugs in production
✅ Zero SQL injection vulnerabilities
✅ Zero data loss incidents
✅ Audit trail 100% complete
```

### **7.4. User Acceptance**

```yaml
✅ Finance team can view journals without training
✅ Manual journal entry intuitive (<5 min to learn)
✅ Mapping rule configuration understandable
✅ Reports clear & actionable
✅ User satisfaction score: >4/5
```

---

## Appendix

### **A. Sample Journal Entries**

#### **Penerimaan Jasa Layanan**

```
Tanggal: 14 Feb 2026
Uraian: Pembayaran pasien rawat inap

Dr. Kas di Bendahara Penerimaan (1.1.1.01.01)    5.000.000
    Cr. Pendapatan Jasa Layanan (4.1.1.01.01)                5.000.000
```

#### **Belanja LS dengan PPh 23**

```
Tanggal: 14 Feb 2026
Uraian: Pembayaran jasa konsultan (PPh 23: 2%)

Dr. Belanja Jasa Konsultansi (5.1.2.03.01)       10.000.000
    Cr. Utang PPh 23 (2.1.3.01.01)                              200.000
    Cr. Kas di Bank (1.1.1.03.01)                             9.800.000
```

#### **Penyusutan Aset (Monthly)**

```
Tanggal: 28 Feb 2026
Uraian: Penyusutan aset bulan Februari 2026

Dr. Beban Penyusutan (5.2.1.01.01)               15.000.000
    Cr. Akumulasi Penyusutan (1.3.1.99.01)                   15.000.000
```

### **B. Error Handling**

```yaml
Common Errors & Solutions:

Error: "Journal not balanced"
  Cause: totalDebet ≠ totalKredit
  Solution: Check mapping rule percentages, ensure total = 100%

Error: "CoA not found"
  Cause: Invalid CoA code in mapping rule
  Solution: Verify CoA code exists in chart_of_accounts table

Error: "Period closed"
  Cause: Trying to post journal to closed period
  Solution: Contact admin to reopen period or adjust date

Error: "Mapping rule not found"
  Cause: No active rule for transaction type
  Solution: Create mapping rule in admin panel
```

### **C. Glossary**

```yaml
Auto-Posting: Automated journal creation from transactions
GL: General Ledger (Buku Besar)
TB: Trial Balance (Neraca Saldo)
CoA: Chart of Accounts (Bagan Akun)
Dr: Debet
Cr: Kredit
SAP: Standar Akuntansi Pemerintahan
Reversing Entry: Jurnal pembalik
Adjustment Entry: Jurnal penyesuaian
Closing Entry: Jurnal penutup
```

### **D. Next Phase**

```yaml
After Auto-Posting Phase, next priorities:

Phase 1: SIMRS Integration
  - Real-time billing sync
  - Auto-post pendapatan from SIMRS
  - Reconciliation tool

Phase 2: SPP-SPM-SP2D Workflow
  - Full belanja workflow
  - Tax calculation
  - Approval multi-level

Phase 3: Laporan Keuangan (7 Komponen)
  - LRA, LPSAL, Neraca, LO, LAK, LPE, CaLK
  - Auto-generate from GL
```

---

**END OF PHASE PLAN: AUTO-POSTING TO JOURNAL**

---

*Prepared by: RSDS Development Team*
*Date: 14 Februari 2026*
*Status: Ready for Implementation*
