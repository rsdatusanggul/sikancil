# Bukti Bayar Update: Status Draft & Final + Kode Rekening Autocomplete

## Overview
Update modul Bukti Bayar dengan perubahan berikut:
1. **Status hanya DRAFT dan FINAL** (sederhana tanpa workflow approval bertahap)
2. **Kode Rekening Autocomplete** - deteksi otomatis dari database seperti pembuatan RAK

## Changes Summary

### Backend Changes

#### 1. Update Status Enum (`backend/src/database/enums/status-bukti-bayar.enum.ts`)
- Removed status: SUBMITTED, TECHNICAL_APPROVED, TREASURER_APPROVED, APPROVED, REJECTED, CANCELLED, SPP_CREATED
- Kept only: DRAFT, FINAL

#### 2. Update Service (`backend/src/modules/bukti-bayar/bukti-bayar.service.ts`)
- Removed methods:
  - `submit()` - previously DRAFT → SUBMITTED
  - `approveTechnical()` - technical approval
  - `approveTreasurer()` - treasurer approval
  - `approveFinal()` - final approval
  - `reject()` - rejection
  - `cancel()` - cancellation

- Added/Updated method:
  - `finalize()` - DRAFT → FINAL transition
  - Only creator (PPTK) can finalize
  - Budget validation before finalization

- Updated methods to use FINAL status instead of APPROVED/SUBMITTED in:
  - `create()` - defaults to DRAFT
  - `update()` - only DRAFT can be updated
  - `delete()` - only DRAFT can be deleted

#### 3. Update Controller (`backend/src/modules/bukti-bayar/bukti-bayar.controller.ts`)
- Removed endpoints:
  - `POST /:id/submit`
  - `POST /:id/approve-technical`
  - `POST /:id/approve-treasurer`
  - `POST /:id/approve-final`
  - `POST /:id/reject`
  - `POST /:id/cancel`

- Added endpoint:
  - `POST /:id/finalize` - Finalize DRAFT → FINAL
  - `GET /search-kode-rekening` - Autocomplete kode rekening

#### 4. Update Budget Validation Service (`backend/src/modules/bukti-bayar/services/budget-validation.service.ts`)
- Added `searchKodeRekening()` method for autocomplete functionality
- Updated `getCommitments()` to use FINAL status instead of SUBMITTED/APPROVED
- Added ChartOfAccount repository injection

### Frontend Changes

#### 1. Update Types (`frontend/src/features/bukti-bayar/types.ts`)
- Updated `BuktiBayarStatus` enum to only DRAFT and FINAL
- Added `KodeRekeningSearchResult` interface for autocomplete
- Updated `CreateBuktiBayarDto` to include optional `accountName`

#### 2. Update Create Form (`frontend/src/features/bukti-bayar/BuktiBayarCreate.tsx`)
- Added Kode Rekening Autocomplete:
  - Search query state management
  - Autocomplete dropdown with suggestions
  - Shows both kode rekening and nama rekening
  - Starts searching after 2 characters
  - Selecting fills both kode and nama

- Features:
  - Real-time tax preview (existing)
  - Real-time budget check (existing)
  - Autocomplete kode rekening (NEW)

#### 3. Update Detail Page (`frontend/src/features/bukti-bayar/BuktiBayarDetail.tsx`)
- Removed all workflow-related code (submit, approve, reject)
- Updated status badges to show only DRAFT and FINAL
- Updated action buttons:
  - DRAFT: "Finalisasi Bukti Bayar" button
  - FINAL: "Cetak PDF" button
- Simplified workflow section

#### 4. Update List Page (`frontend/src/features/bukti-bayar/BuktiBayarList.tsx`)
- Updated status filter dropdown to only show DRAFT and FINAL
- Updated status badge configuration

## API Endpoints

### New/Updated Endpoints

#### Search Kode Rekening
```
GET /payment-vouchers/search-kode-rekening?q={query}
```
- **Params:**
  - `q`: Search query (kode rekening or nama rekening)
- **Returns:** Array of `{ id, kodeRekening, namaRekening, level }`
- **Limit:** 20 results max
- **Starts searching:** After 2 characters

#### Finalize Voucher
```
POST /payment-vouchers/:id/finalize
```
- **Auth:** Required
- **Permission:** Only creator (PPTK) can finalize
- **Validation:**
  - Status must be DRAFT
  - Budget must be sufficient
- **Result:** Status changes to FINAL

### Removed Endpoints
- `POST /payment-vouchers/:id/submit`
- `POST /payment-vouchers/:id/approve-technical`
- `POST /payment-vouchers/:id/approve-treasurer`
- `POST /payment-vouchers/:id/approve-final`
- `POST /payment-vouchers/:id/reject`
- `POST /payment-vouchers/:id/cancel`

## Workflow Changes

### Before (Complex Multi-step Approval)
```
DRAFT → SUBMITTED → TECHNICAL_APPROVED → TREASURER_APPROVED → APPROVED
                                    ↓
                                 REJECTED
```

### After (Simple 2-step)
```
DRAFT → FINAL
```

## Kode Rekening Autocomplete Features

1. **Real-time Search**: Searches as user types (debounced via React Query)
2. **Dual Search**: Searches both kode rekening and nama rekening
3. **Auto-fill**: Automatically fills both kode and nama when selected
4. **Visual Feedback**: Shows suggestions in dropdown with:
   - Kode rekening (bold)
   - Nama rekening (smaller text)
5. **Min Characters**: Starts searching after 2 characters
6. **Limited Results**: Returns max 20 results for performance

## Implementation Notes

### Backend
- Uses `Like` operator from TypeORM for pattern matching
- Searches both `kodeRekening` and `namaRekening` fields
- Results ordered by `kodeRekening` ASC
- Repository: ChartOfAccount

### Frontend
- Uses React Query for caching and debouncing
- State management for:
  - `kodeRekeningQuery`: Current search input
  - `showKodeRekeningSuggestions`: Dropdown visibility
  - `selectedKodeRekening`: Currently selected item
- Query enabled only when query length >= 2
- Dropdown closes on blur (with 200ms delay for click handling)

## Testing Checklist

- [ ] Create new Bukti Bayar with DRAFT status
- [ ] Finalize DRAFT to FINAL
- [ ] Verify FINAL cannot be edited
- [ ] Verify FINAL cannot be deleted
- [ ] Test kode rekening autocomplete:
  - [ ] Search by kode (e.g., "5.1")
  - [ ] Search by nama (e.g., "belanja")
  - [ ] Verify min 2 characters required
  - [ ] Verify auto-fill works correctly
  - [ ] Verify dropdown closes properly
- [ ] Test PDF generation for FINAL status
- [ ] Verify budget validation on finalize
- [ ] Verify only creator can finalize

## Migration Notes

### Database Migration
No database migration required as enum values are soft-coded. Existing records with old status values will need manual handling:

```sql
-- Update existing records to new status mapping
UPDATE payment_vouchers SET status = 'FINAL' 
WHERE status IN ('APPROVED', 'TECHNICAL_APPROVED', 'TREASURER_APPROVED');

UPDATE payment_vouchers SET status = 'DRAFT' 
WHERE status IN ('SUBMITTED', 'REJECTED', 'CANCELLED');
```

**Note:** Execute with caution after backing up database!

## Future Enhancements (Optional)

1. **Bulk Finalize**: Allow finalizing multiple DRAFTs at once
2. **Unfinalize**: Allow reverting FINAL back to DRAFT (with proper permissions)
3. **Advanced Search**: Add filters to kode rekening search (level, type, etc.)
4. **Recent History**: Show recently used kode rekening for quick access
5. **Validation**: Warn if kode rekening is inactive or deprecated

## References

- Similar implementation in RAK module: `backend/src/modules/chart-of-accounts/`
- Frontend autocomplete pattern: Similar to existing components
- Budget validation logic: `backend/src/modules/bukti-bayar/services/budget-validation.service.ts`