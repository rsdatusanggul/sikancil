# DPA/DPPA Module

## Overview

Modul DPA/DPPA (Dokumen Pelaksanaan Anggaran / Dokumen Pelaksanaan Perubahan Anggaran) untuk sistem keuangan BLUD. Modul ini mengelola dokumen resmi pelaksanaan anggaran yang menjadi dasar legal untuk melakukan belanja.

## Features

### ✅ Implemented

1. **DPA Management**
   - Create DPA manually
   - Generate DPA from approved RBA
   - View DPA detail with all rincian
   - Update DPA (only in DRAFT status)
   - Delete DPA (only in DRAFT status)

2. **DPPA (Revision) Support**
   - Create DPPA from existing DPA
   - Track revision history
   - Link to previous DPA

3. **Approval Workflow**
   - Submit DPA for approval
   - Approve DPA (by PPKD)
   - Reject DPA with reason
   - Activate DPA (make it the active budget document)

4. **Monitoring & Reporting**
   - Get DPA summary with totals
   - Recalculate totals from detail tables
   - View audit trail/history

5. **Status Management**
   - DRAFT - DPA baru dibuat, dapat diedit
   - SUBMITTED - DPA diajukan untuk persetujuan
   - APPROVED - DPA disetujui oleh PPKD
   - REJECTED - DPA ditolak
   - ACTIVE - DPA aktif, digunakan untuk budget control
   - REVISED - DPA lama yang sudah diganti dengan DPPA

## Database Schema

### Tables

1. **dpa** - Master DPA/DPPA
   - Stores main DPA information
   - Workflow status tracking
   - Approval information
   - Totals (calculated from detail tables)

2. **dpa_belanja** - Rincian Belanja
   - Detail anggaran belanja per program-kegiatan-output
   - Link to RBA structure (program, kegiatan, output)
   - Kode rekening belanja
   - Breakdown bulanan
   - Realisasi tracking

3. **dpa_pendapatan** - Rincian Pendapatan
   - Detail target pendapatan
   - Kode rekening pendapatan
   - Klasifikasi pendapatan (Operasional, Hibah, Transfer APBD, dll)
   - Breakdown bulanan
   - Realisasi tracking

4. **dpa_pembiayaan** - Rincian Pembiayaan
   - Penerimaan pembiayaan (SiLPA, pinjaman, dll)
   - Pengeluaran pembiayaan (investasi, dll)
   - Breakdown bulanan
   - Realisasi tracking

5. **dpa_history** - Audit Trail
   - Log semua perubahan DPA
   - Track who did what and when
   - Store old and new values

## API Endpoints

### DPA Management

```bash
# List all DPA with filters
GET /dpa?page=1&limit=10&status=ACTIVE&tahunAnggaran=2026

# Get active DPA for specific year
GET /dpa/active/:tahunAnggaran

# Get DPA by ID
GET /dpa/:id

# Create DPA manually
POST /dpa
{
  "nomorDPA": "DPA-001/BLUD/2026",
  "jenisDokumen": "DPA",
  "tahun": 2026,
  "tahunAnggaran": 2026,
  "createdBy": "user-id"
}

# Generate DPA from RBA
POST /dpa/generate-from-rba
{
  "revisiRBAId": "uuid",
  "tahunAnggaran": 2026,
  "nomorDPA": "DPA-001/BLUD/2026",
  "createdBy": "user-id"
}

# Update DPA (DRAFT only)
PUT /dpa/:id
{
  "nomorDPA": "DPA-001-Rev/BLUD/2026",
  "tanggalDokumen": "2026-01-15"
}

# Delete DPA (DRAFT only)
DELETE /dpa/:id
```

### Workflow

```bash
# Submit for approval
POST /dpa/:id/submit

# Approve (PPKD only)
POST /dpa/:id/approve
{
  "catatan": "Disetujui sesuai RBA 2026"
}

# Reject
POST /dpa/:id/reject
{
  "alasan": "Terdapat kesalahan pada rincian belanja program X"
}

# Activate
POST /dpa/:id/activate
```

### Monitoring

```bash
# Get summary with totals
GET /dpa/:id/summary

# Get audit trail
GET /dpa/:id/history

# Recalculate totals
POST /dpa/:id/recalculate
```

## Business Rules

1. **Unique Active DPA**: Hanya boleh ada 1 DPA ACTIVE per tahun anggaran
2. **Edit Restriction**: Hanya DPA dengan status DRAFT yang dapat diedit
3. **Delete Restriction**: Hanya DPA dengan status DRAFT yang dapat dihapus
4. **DPPA Validation**: DPPA harus memiliki DPA sebelumnya dan alasan revisi
5. **Approval Flow**: DRAFT → SUBMITTED → APPROVED → ACTIVE
6. **Workflow Enforcement**:
   - Only DRAFT can be submitted
   - Only SUBMITTED can be approved/rejected
   - Only APPROVED can be activated

## Usage Examples

### 1. Create DPA from Approved RBA

```typescript
// After RBA is approved, generate DPA
const dpa = await dpaService.generateFromRBA({
  revisiRBAId: 'rba-uuid',
  tahunAnggaran: 2026,
  nomorDPA: 'DPA-001/BLUD/2026',
  createdBy: 'user-uuid',
}, userId);

// DPA created in DRAFT status
// Now you can add/edit detail belanja, pendapatan, pembiayaan
```

### 2. Approval Workflow

```typescript
// 1. Submit for approval
await dpaService.submit(dpaId, userId, userName);

// 2. PPKD approves
await dpaService.approve(dpaId, ppkdId, ppkdName, 'Approved');

// 3. Activate DPA
await dpaService.activate(dpaId, userId, userName);

// Now DPA is ACTIVE and used for budget control
```

### 3. Create DPPA (Revision)

```typescript
// When RBA is revised and approved, create DPPA
const dppa = await dpaService.create({
  nomorDPA: 'DPPA-001/BLUD/2026',
  jenisDokumen: 'DPPA',
  tahunAnggaran: 2026,
  dpaSebelumnyaId: 'old-dpa-uuid',
  nomorRevisi: 1,
  alasanRevisi: 'Perubahan pagu belanja sesuai Perda No. X',
  createdBy: 'user-uuid',
}, userId);

// Old DPA status automatically changed to REVISED
```

## Integration Points

### Incoming (Dependencies)

- **RBA Module**: Source data untuk generate DPA
- **Chart of Accounts**: Validasi kode rekening
- **Unit Kerja**: Link unit pelaksana
- **Auth Module**: User authentication & authorization

### Outgoing (Used by)

- **SPP/SPM/SP2D Module**: Budget availability check
- **Realisasi Belanja**: Update realisasi values
- **Monitoring Dashboard**: Display budget vs realization
- **Laporan Keuangan (LRA)**: Budget baseline

## TODO / Future Enhancements

### Phase 2 (Next Steps)

1. **RBA Integration**
   - Complete generateFromRBA implementation
   - Auto-copy anggaran belanja from RBA
   - Auto-copy pendapatan targets
   - Map all program-kegiatan-output structure

2. **DPA Belanja Service**
   - CRUD operations for belanja items
   - Bulk import from Excel
   - Validation against Chart of Accounts
   - Calculate breakdown bulanan

3. **DPA Pendapatan Service**
   - CRUD operations for pendapatan items
   - Link with SIMRS revenue targets
   - Breakdown bulanan based on historical data

4. **DPA Pembiayaan Service**
   - CRUD operations for pembiayaan items
   - Calculate SiLPA automatically

### Phase 3 (Budget Control)

5. **Budget Check Integration**
   - Real-time budget availability check for SPP
   - Prevent overspending (realisasi + komitmen > pagu)
   - Alert when approaching budget limit (90% utilized)

6. **Realisasi Auto-Update**
   - Listen to SP2D events
   - Auto-update realisasi belanja
   - Recalculate sisa anggaran
   - Update persentase realisasi

7. **Komitmen Tracking**
   - Link with Kontrak module
   - Auto-update komitmen when contract signed
   - Release komitmen when contract completed

### Phase 4 (Reporting)

8. **PDF Generation**
   - Generate official DPA document in PDF format
   - Include header, footer, signature block
   - Format sesuai standar Permendagri

9. **Excel Export**
   - Export DPA to Excel for analysis
   - Include all rincian belanja, pendapatan, pembiayaan
   - Formatted and printable

10. **Monitoring Reports**
    - Pagu vs Realisasi per Program
    - Pagu vs Realisasi per Unit Kerja
    - Pagu vs Realisasi per Sumber Dana
    - Monthly/Quarterly progress tracking

### Phase 5 (Advanced Features)

11. **Notification System**
    - Notify when DPA submitted
    - Notify when DPA approved/rejected
    - Notify when approaching budget limit
    - Email/In-app notifications

12. **Role-Based Permissions**
    - PPKD can approve/reject
    - Bendahara can view only
    - Pemimpin BLUD can submit
    - Fine-grained permission control

13. **Multi-Year Comparison**
    - Compare DPA across years
    - Trend analysis
    - Growth rate calculation

## Testing

### Unit Tests
```bash
# Run DPA service tests
npm run test -- dpa.service.spec.ts

# Run DPA controller tests
npm run test -- dpa.controller.spec.ts
```

### E2E Tests
```bash
# Run DPA E2E tests
npm run test:e2e -- dpa.e2e-spec.ts
```

### Manual Testing

1. Create DPA via API
2. Test workflow (submit → approve → activate)
3. Test validation rules
4. Test audit trail
5. Verify database constraints

## Performance Considerations

1. **Indexes**: All critical fields indexed (status, tahunAnggaran, kodeRekening, etc.)
2. **Pagination**: All list endpoints support pagination
3. **Relations**: Use `relations` parameter wisely to avoid N+1 queries
4. **Caching**: Consider caching active DPA (Redis)
5. **Bulk Operations**: Use transactions for bulk insert/update

## Security

1. **Authentication**: All endpoints protected with JWT
2. **Authorization**: Role-based access control (TODO)
3. **Audit Trail**: Complete history of all changes
4. **Validation**: Input validation using class-validator
5. **SQL Injection**: Protected by TypeORM parameterized queries

## Maintenance

### Database Migrations

```bash
# Create new migration
npm run migration:create -- src/database/migrations/UpdateDPA

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Backup & Recovery

```bash
# Backup DPA tables
pg_dump -t dpa -t dpa_belanja -t dpa_pendapatan -t dpa_pembiayaan -t dpa_history > dpa_backup.sql

# Restore
psql < dpa_backup.sql
```

## Support & Contact

For issues or questions:
- Create issue in GitHub
- Contact: dev team
- Slack: #sikancil-dev

## License

Internal use only - BLUD Si-Kancil Project

---

**Last Updated**: 2026-02-15
**Version**: 1.0.0
**Status**: ✅ Phase 1 Complete
