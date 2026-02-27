# Si-Kancil BLUD v2.0 - Implementation Checklist with BLUD Modules

## 📋 Quick Reference

**Project**: Si-Kancil BLUD Financial Information System v2.0
**Database**: PostgreSQL 14+
**ORM**: Prisma 5.x
**Status**: ✅ Updated with BLUD Compliance Modules

---

## 🎯 Major Changes from v1.0 to v2.0

### Database Expansion
- **Tables**: 28 → **48 tables** (+20 BLUD-specific)
- **Enums**: 10 → **17 enums** (+7 BLUD-specific)
- **Relationships**: 50+ → **80+ relationships**

### New BLUD Modules (7)
1. ✅ Modul Perencanaan BLUD (RBA)
2. ✅ Modul Pendapatan BLUD  
3. ✅ Modul Belanja BLUD (SPP-SPM-SP2D)
4. ✅ Modul Penatausahaan Kas (BKU & STS)
5. ✅ Modul Akuntansi BLUD (Enhanced)
6. ✅ Modul Pengadaan & Kontrak
7. ✅ Modul Komitmen

### Additional Development Time
- **Original Estimate**: 24 weeks
- **BLUD Modules**: +12 weeks
- **New Total**: **36 weeks** (~9 months)

---

## ✅ PHASE 1: Core Schema (ORIGINAL) - COMPLETED

### 1.1 Requirements Analysis ✅
- [x] Single-tenant architecture
- [x] Fiscal year = calendar year
- [x] COA 5 levels
- [x] 2-level approval
- [x] Multi-period reporting

### 1.2 Core Tables (28) ✅
- [x] Master Tables (11)
- [x] Transaction Tables (12)
- [x] Supporting Tables (5)

### 1.3 Documentation ✅
- [x] ERD Diagram
- [x] Data Dictionary
- [x] Implementation Guide
- [x] Seed Data (COA + Initial)

---

## ✅ PHASE 2: BLUD Compliance Modules - NEW

### 2.1 Modul Perencanaan BLUD (RBA)

**Target**: Complete RBA system compliant with BLUD regulations

#### Database Schema
- [ ] Table: `rba` (master RBA)
- [ ] Table: `rba_pendapatan` (detail proyeksi pendapatan)
- [ ] Table: `rba_belanja` (detail proyeksi belanja)
- [ ] Table: `rba_pembiayaan` (detail pembiayaan)
- [ ] Table: `anggaran_kas` (proyeksi kas bulanan)
- [ ] Table: `revisi_rba` (tracking revisi)

#### Enums
- [ ] `SumberDanaBLUD` (APBD, PNBP_FUNGSIONAL, HIBAH, dll)
- [ ] `JenisBelanjaBLUD` (PEGAWAI, BARANG_JASA, MODAL, dll)

#### Seed Data
- [ ] Sample RBA untuk tahun 2025
- [ ] Anggaran Kas 12 bulan
- [ ] Sample revisi RBA

#### API Endpoints
- [ ] POST /api/rba - Create RBA
- [ ] GET /api/rba/:tahun - Get RBA by year
- [ ] PUT /api/rba/:id - Update RBA
- [ ] POST /api/rba/:id/revisi - Create revision
- [ ] GET /api/rba/:id/anggaran-kas - Get cash projection
- [ ] POST /api/rba/:id/approve - Approve RBA

#### Frontend Components
- [ ] RBA Form (Penyusunan)
- [ ] RBA Detail View
- [ ] Anggaran Kas Input (12 bulan)
- [ ] Revisi RBA Form
- [ ] RBA Approval Workflow
- [ ] RBA vs Realisasi Report

#### Business Logic
- [ ] Validation: totalProyeksi = sum of details
- [ ] Validation: Anggaran Kas balanced
- [ ] Auto-calculate saldo akhir
- [ ] Revision tracking
- [ ] Approval workflow

**Estimated Time**: 10 days

---

### 2.2 Modul Pendapatan BLUD

**Target**: Enhanced revenue management with BLUD classification

#### Database Schema
- [ ] Table: `pendapatan_blud` (enhanced revenue)

#### Seed Data
- [ ] Sample pendapatan APBD
- [ ] Sample pendapatan Fungsional (SIMRS)
- [ ] Sample pendapatan Hibah

#### API Endpoints
- [ ] POST /api/pendapatan-blud - Create revenue
- [ ] GET /api/pendapatan-blud - List revenues
- [ ] PUT /api/pendapatan-blud/:id - Update revenue
- [ ] POST /api/pendapatan-blud/:id/setor - Mark as deposited
- [ ] GET /api/pendapatan-blud/summary - Revenue summary by source

#### Integration Points
- [ ] SIMRS Integration (auto-create from patient transactions)
- [ ] SP2D Integration (APBD receipts)
- [ ] BKU Integration (auto-create BKU entry)
- [ ] STS Integration (auto-generate STS)

#### Frontend Components
- [ ] Pendapatan BLUD Form
- [ ] Pendapatan List with filters
- [ ] SIMRS Integration Dashboard
- [ ] Revenue by Source Report

#### Business Logic
- [ ] SIMRS data parsing
- [ ] Classification by sumber dana
- [ ] Auto-generate STS
- [ ] Auto-posting to BKU
- [ ] Auto-generate journal entry

**Estimated Time**: 5 days

---

### 2.3 Modul Belanja BLUD (SPP-SPM-SP2D)

**Target**: Complete expenditure workflow compliant with BLUD

#### Database Schema
- [ ] Table: `spp` (Surat Permintaan Pembayaran)
- [ ] Table: `spp_rincian` (SPP details)
- [ ] Table: `dokumen_spp` (SPP documents)
- [ ] Table: `spm` (Surat Perintah Membayar)
- [ ] Table: `sp2d` (Surat Perintah Pencairan Dana)

#### Enums
- [ ] `JenisSPP` (UP, GU, TU, LS_GAJI, LS_BARANG_JASA, LS_MODAL)
- [ ] `StatusSPP` (DRAFT, SUBMITTED, VERIFIED, APPROVED, REJECTED, DIBAYAR)

#### Seed Data
- [ ] Sample SPP (all types)
- [ ] Sample SPM
- [ ] Sample SP2D

#### API Endpoints
**SPP:**
- [ ] POST /api/spp - Create SPP
- [ ] GET /api/spp - List SPP
- [ ] PUT /api/spp/:id - Update SPP
- [ ] POST /api/spp/:id/submit - Submit for approval
- [ ] POST /api/spp/:id/verify - Verify SPP
- [ ] POST /api/spp/:id/approve - Approve SPP
- [ ] POST /api/spp/:id/reject - Reject SPP
- [ ] POST /api/spp/:id/dokumen - Upload document

**SPM:**
- [ ] POST /api/spm - Create SPM from SPP(s)
- [ ] GET /api/spm - List SPM
- [ ] POST /api/spm/:id/approve - Approve SPM

**SP2D:**
- [ ] POST /api/sp2d - Create SP2D from SPM
- [ ] GET /api/sp2d - List SP2D
- [ ] POST /api/sp2d/:id/approve - Final approval
- [ ] POST /api/sp2d/:id/cair - Mark as disbursed

#### Frontend Components
**SPP:**
- [ ] SPP Form (per jenis SPP)
- [ ] SPP Rincian Input
- [ ] Document Upload
- [ ] Tax Calculation Display
- [ ] SPP List & Filters
- [ ] SPP Approval Workflow

**SPM:**
- [ ] SPM Form (select SPPs)
- [ ] SPM Detail View
- [ ] SPM Approval Interface

**SP2D:**
- [ ] SP2D Form
- [ ] SP2D Approval Interface
- [ ] Disbursement Status Tracking

#### Business Logic
- [ ] Tax Auto-calculation:
  - [ ] PPh 21 calculation
  - [ ] PPh 22 calculation  
  - [ ] PPh 23 calculation
  - [ ] PPN calculation
- [ ] NPWP validation
- [ ] Budget availability check
- [ ] Kontrak linkage
- [ ] Approval workflow (2-level)
- [ ] Auto-generate SPM from approved SPPs
- [ ] Auto-generate SP2D from approved SPM
- [ ] Auto-posting to BKU
- [ ] Auto-generate journal entry

**Estimated Time**: 15 days

---

### 2.4 Modul Penatausahaan Kas (BKU & STS)

**Target**: Complete cash management & audit trail

#### Database Schema
- [ ] Table: `buku_kas_umum` (BKU)
- [ ] Table: `surat_tanda_setoran` (STS)

#### Seed Data
- [ ] Sample BKU entries
- [ ] Sample STS

#### API Endpoints
**BKU:**
- [ ] GET /api/bku - List BKU (with pagination)
- [ ] GET /api/bku/saldo - Get current balance
- [ ] GET /api/bku/periode - Get by period
- [ ] GET /api/bku/export - Export to Excel/PDF

**STS:**
- [ ] POST /api/sts - Create STS
- [ ] GET /api/sts - List STS
- [ ] POST /api/sts/:id/setor - Mark as deposited
- [ ] GET /api/sts/:id/print - Print STS

#### Frontend Components
**BKU:**
- [ ] BKU List (tabular view)
- [ ] BKU Filter (date range, jenis)
- [ ] BKU Export options
- [ ] Running balance display

**STS:**
- [ ] STS Form
- [ ] STS List
- [ ] STS Print Template
- [ ] Deposit confirmation

#### Business Logic
- [ ] Auto-create BKU from:
  - [ ] SP2D (pengeluaran)
  - [ ] STS (penerimaan)
  - [ ] Cash transactions
  - [ ] Bank transactions
- [ ] Running balance calculation
- [ ] Sequential numbering
- [ ] Auto-generate STS from pendapatan
- [ ] Deposit tracking

**Estimated Time**: 7 days

---

### 2.5 Modul Pengadaan & Kontrak

**Target**: Contract & procurement management

#### Database Schema
- [ ] Table: `kontrak_pengadaan`
- [ ] Table: `term_pembayaran`
- [ ] Table: `addendum`

#### Enums
- [ ] `JenisPengadaan` (BARANG, JASA, KONSTRUKSI)
- [ ] `MetodePengadaan` (TENDER, PENUNJUKAN_LANGSUNG, E_PURCHASING)

#### Seed Data
- [ ] Sample kontrak
- [ ] Sample term pembayaran
- [ ] Sample addendum

#### API Endpoints
**Kontrak:**
- [ ] POST /api/kontrak - Create contract
- [ ] GET /api/kontrak - List contracts
- [ ] PUT /api/kontrak/:id - Update contract
- [ ] GET /api/kontrak/:id/progress - Get progress
- [ ] POST /api/kontrak/:id/addendum - Create addendum

**Term Pembayaran:**
- [ ] GET /api/kontrak/:id/term - List terms
- [ ] POST /api/kontrak/:id/term/:termId/bayar - Mark as paid

#### Frontend Components
- [ ] Kontrak Form
- [ ] Kontrak List & Filters
- [ ] Term Pembayaran Management
- [ ] Progress Tracking
- [ ] Addendum Form
- [ ] Kontrak vs SPP Matching

#### Business Logic
- [ ] Budget allocation check
- [ ] Term validation (sum = 100%)
- [ ] Progress tracking
- [ ] Payment scheduling
- [ ] SPP linkage
- [ ] Addendum approval

**Estimated Time**: 10 days

---

## 📊 Updated Database Statistics

### Before BLUD Modules (v1.0)
- Total Tables: **28**
- Master Tables: 11
- Transaction Tables: 12
- Supporting Tables: 5
- Enums: 10

### After BLUD Modules (v2.0)
- Total Tables: **48** (+20)
- Master Tables: 11
- Transaction Tables: **22** (+10)
- Supporting Tables: **15** (+10)
- Enums: **17** (+7)

### New Tables Summary (20)
1. rba
2. rba_pendapatan
3. rba_belanja
4. rba_pembiayaan
5. anggaran_kas
6. revisi_rba
7. pendapatan_blud
8. spp
9. spp_rincian
10. dokumen_spp
11. spm
12. sp2d
13. buku_kas_umum
14. surat_tanda_setoran
15. kontrak_pengadaan
16. term_pembayaran
17. addendum

---

## 🚀 Implementation Timeline v2.0

### Phase 1: Core Setup (Week 1-2) ✅ COMPLETED
- Environment setup
- Project initialization
- Base authentication

### Phase 2: Master Data (Week 3-5) ✅ COMPLETED
- COA, Unit Kerja, Pegawai
- Suppliers, Bank Accounts
- Fiscal Years, Settings

### Phase 3: BLUD Modules (Week 6-17) 🆕 NEW
**Week 6-7: RBA Module**
- [ ] Database schema
- [ ] API endpoints
- [ ] Frontend components
- [ ] Business logic
- [ ] Testing

**Week 8-9: Pendapatan BLUD + BKU/STS**
- [ ] Pendapatan BLUD implementation
- [ ] BKU implementation
- [ ] STS implementation
- [ ] SIMRS integration prep
- [ ] Testing

**Week 10-14: SPP-SPM-SP2D Workflow**
- [ ] SPP module (all types)
- [ ] Tax calculation
- [ ] Document management
- [ ] SPM module
- [ ] SP2D module
- [ ] Workflow testing
- [ ] Integration testing

**Week 15-17: Pengadaan & Kontrak**
- [ ] Kontrak module
- [ ] Term pembayaran
- [ ] Addendum
- [ ] SPP linkage
- [ ] Testing

### Phase 4: Core Transactions (Week 18-20)
- [ ] Cash & Bank (enhanced with BKU)
- [ ] AP/AR (linked to SPP)
- [ ] Journal (auto-posting)

### Phase 5: Payroll & Assets (Week 21-23)
- [ ] Payroll module
- [ ] Asset management
- [ ] Depreciation

### Phase 6: Reports & Compliance (Week 24-28)
**BLUD Specific Reports:**
- [ ] RBA vs Realisasi
- [ ] LPSAL (Laporan Posisi Saldo Awal Akhir)
- [ ] CaLK (Catatan atas Laporan Keuangan)
- [ ] BKU Report
- [ ] Kontrak Report

**Standard Financial Reports:**
- [ ] Neraca (Balance Sheet)
- [ ] LRA (Laporan Realisasi Anggaran)
- [ ] LO (Laporan Operasional)
- [ ] LAK (Laporan Arus Kas)
- [ ] LPE (Laporan Perubahan Ekuitas)

### Phase 7: Integration & Testing (Week 29-32)
- [ ] SIMRS Integration (full)
- [ ] Tax calculation validation
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing
- [ ] User Acceptance Testing (UAT)

### Phase 8: Deployment & Training (Week 33-36)
- [ ] Production deployment
- [ ] Data migration
- [ ] User training
- [ ] Documentation finalization
- [ ] Go-live support

**Total Timeline**: 36 weeks (~9 months)

---

## 🎯 Critical Success Factors

### Must Have ✅ (BLUD Compliance)
- [x] Double-entry accounting
- [x] 2-level approval
- [x] Complete audit trail
- [ ] RBA system
- [ ] SPP-SPM-SP2D workflow
- [ ] BKU (mandatory)
- [ ] STS (mandatory)
- [ ] Tax auto-calculation
- [ ] LPSAL report
- [ ] CaLK report

### Should Have ✅ (Operational Excellence)
- [ ] SIMRS integration
- [ ] Kontrak management
- [ ] Budget control real-time
- [ ] Digital signatures
- [ ] Dashboard analytics

### Nice to Have ⚪ (Enhancement)
- Full procurement module
- Mobile app
- AI-powered analytics
- Automated reconciliation

---

## 📝 Updated Deliverables

### Documentation
1. [x] DATABASE_SCHEMA_ADDENDUM_BLUD.md
2. [x] Updated schema-blud-complete.prisma
3. [ ] SPP_SPM_SP2D_WORKFLOW_GUIDE.md
4. [ ] BKU_STS_GUIDELINES.md
5. [ ] BLUD_COMPLIANCE_CHECKLIST.md
6. [ ] TAX_CALCULATION_GUIDE.md
7. [ ] SIMRS_INTEGRATION_SPEC.md

### Database Files
- [x] schema-blud-complete.prisma
- [ ] seed-rba.ts
- [ ] seed-spp-sample.ts
- [ ] seed-kontrak.ts

### API Documentation
- [ ] Swagger/OpenAPI spec (updated)
- [ ] API Testing collection (Postman)

---

## ✅ Verification Checklist

### Database Verification
- [ ] All 48 tables created
- [ ] All 17 enums defined
- [ ] All foreign keys working
- [ ] All indexes created
- [ ] Migration successful
- [ ] Seed data loaded

### Functional Verification
**RBA Module:**
- [ ] Create RBA
- [ ] Revise RBA
- [ ] Approve RBA
- [ ] Anggaran Kas calculation

**Pendapatan BLUD:**
- [ ] Record revenue (all sources)
- [ ] SIMRS integration works
- [ ] STS auto-generated
- [ ] BKU auto-created
- [ ] Journal auto-posted

**SPP-SPM-SP2D:**
- [ ] Create SPP (all types)
- [ ] Tax auto-calculated
- [ ] Approval workflow works
- [ ] SPM generated
- [ ] SP2D disbursement
- [ ] BKU entry created
- [ ] Journal posted

**BKU & STS:**
- [ ] BKU sequential numbering
- [ ] Running balance correct
- [ ] STS generation
- [ ] Deposit tracking

**Kontrak:**
- [ ] Create kontrak
- [ ] Term pembayaran
- [ ] SPP linkage
- [ ] Progress tracking
- [ ] Addendum management

### Compliance Verification
- [ ] BLUD regulations met
- [ ] Audit trail complete
- [ ] BPK audit-ready
- [ ] Tax calculations correct
- [ ] Reports format correct

---

## 🎓 Team Requirements

### Development Team (Enhanced)
- **1 Senior Backend Developer** (Lead) - Full-time
- **2 Backend Developers** - Full-time
- **2 Frontend Developers** - Full-time  
- **1 Database Administrator** - Full-time
- **1 QA Lead** - Full-time
- **2 QA Testers** - Full-time

### Domain Experts
- **1 BLUD Finance Expert** - Part-time consultant
- **1 Tax Specialist** - Part-time consultant
- **1 SIMRS Integration Specialist** - Part-time

### Total Team: 10-11 people

---

## 💰 Effort Estimation

### Development Effort

| Phase | Weeks | Man-days | Notes |
|-------|-------|----------|-------|
| Core Setup | 2 | 10 | ✅ Done |
| Master Data | 3 | 15 | ✅ Done |
| BLUD Modules | 12 | 60 | 🆕 New |
| Core Transactions | 3 | 15 | Enhanced |
| Payroll & Assets | 3 | 15 | Standard |
| Reports | 5 | 25 | BLUD + Standard |
| Integration & Testing | 4 | 20 | Comprehensive |
| Deployment | 4 | 20 | Production |
| **TOTAL** | **36** | **180** | ~9 months |

### Budget Impact
- Original estimate (v1.0): ~24 weeks
- BLUD modules addition: +12 weeks (+50%)
- New total: 36 weeks

---

## 🔍 Risk Management

### High Risk Items
1. **SIMRS Integration Complexity**
   - Mitigation: Early integration testing
   - Fallback: Manual entry option

2. **Tax Calculation Accuracy**
   - Mitigation: Tax specialist review
   - Testing: Extensive test cases

3. **User Adoption (Complex Workflow)**
   - Mitigation: Comprehensive training
   - Support: Dedicated help desk

4. **Data Migration**
   - Mitigation: Gradual migration
   - Testing: Parallel run period

---

## 📞 Support Structure

### Level 1 Support (Users)
- Help desk
- User manual
- Video tutorials
- FAQ

### Level 2 Support (Technical)
- Dev team on-call
- Bug fix SLA: 24 hours
- Enhancement requests

### Level 3 Support (Expert)
- BLUD consultant
- Tax specialist
- Database expert

---

## 🎉 Go-Live Criteria

### Technical Readiness
- [ ] All modules tested
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Backup/restore tested
- [ ] Disaster recovery plan ready

### User Readiness
- [ ] Training completed
- [ ] UAT passed
- [ ] User manual ready
- [ ] Support team trained

### Data Readiness
- [ ] Master data migrated
- [ ] Opening balances loaded
- [ ] Historical data (if needed)
- [ ] Verification complete

### Compliance Readiness
- [ ] BLUD expert sign-off
- [ ] Audit requirements met
- [ ] Tax calculations verified
- [ ] Reports validated

---

## 📅 Go-Live Plan

### Pre Go-Live (Week 33-34)
- Final UAT
- Data migration
- Training completion
- System hardening

### Go-Live (Week 35)
- Production deployment
- Cut-over weekend
- Parallel run start
- Intensive support

### Post Go-Live (Week 36+)
- Parallel run (1 month)
- Issue resolution
- Performance tuning
- User support

---

**Last Updated**: February 2025  
**Version**: 2.0.0  
**Status**: ✅ Ready for BLUD Implementation  
**Next Review**: After RBA module completion

---

<div align="center">

**Si-Kancil BLUD v2.0 - Complete & Compliance Ready**

[Documentation](./docs) • [Database Schema](./schema-blud-complete.prisma) • [Addendum](./DATABASE_SCHEMA_ADDENDUM_BLUD.md)

</div>
