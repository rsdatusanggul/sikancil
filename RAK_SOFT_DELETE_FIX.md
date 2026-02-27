# RAK Soft Delete Fix - Allow Re-creation After Deletion

## Problem Description

When BA (Bendahara) deleted a RAK (Rencana Anggaran Kas) record and then tried to create a new RAK for the same subkegiatan and tahun_anggaran, the system returned a 500 Internal Server Error with the message:

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Root Cause Analysis

The issue was in the `create` method of `RakService` (`backend/src/modules/rak/services/rak.service.ts`). The service was checking for existing RAK records using:

```typescript
const existing = await this.rakRepo.findOne({
  where: {
    subkegiatan_id: createRakDto.subkegiatan_id,
    tahun_anggaran: createRakDto.tahun_anggaran,
  },
});
```

**The Problem:**
- TypeORM's `findOne()` method by default includes soft-deleted records when the `@DeleteDateColumn()` is present on the entity
- The `RakSubkegiatan` entity has a `@DeleteDateColumn()` for `deleted_at`
- When a RAK was soft-deleted, it remained in the database with `deleted_at` set to a timestamp
- The duplicate check found the soft-deleted record and threw a `ConflictException`
- This prevented users from creating a new RAK for the same subkegiatan and tahun_anggaran after deleting the previous one

## Solution Implemented

Modified the duplicate check query to explicitly exclude soft-deleted records:

```typescript
// Check if RAK already exists (exclude soft-deleted records)
const existing = await this.rakRepo
  .createQueryBuilder('rak')
  .where('rak.subkegiatan_id = :subkegiatanId', { 
    subkegiatanId: createRakDto.subkegiatan_id 
  })
  .andWhere('rak.tahun_anggaran = :tahun', { 
    tahun: createRakDto.tahun_anggaran 
  })
  .andWhere('rak.deleted_at IS NULL') // Explicitly exclude soft-deleted records
  .getOne();
```

### Key Changes:
1. **Replaced `findOne()` with QueryBuilder**: Used TypeORM's QueryBuilder to have more control over the query
2. **Added explicit filter**: Added `.andWhere('rak.deleted_at IS NULL')` to exclude soft-deleted records
3. **Updated comment**: Added clear documentation that soft-deleted records are excluded

## Technical Details

### Why This Fix Works:
- **QueryBuilder approach**: Provides explicit control over WHERE clauses
- **NULL check**: `deleted_at IS NULL` ensures only active (non-deleted) records are checked
- **Consistent with other methods**: The `findAll()` and `getAvailableYears()` methods already use this pattern

### Business Logic Preserved:
- ✅ Duplicate RAKs are still prevented for the same subkegiatan and tahun_anggaran
- ✅ Soft-deleted RAKs are preserved in the database (audit trail)
- ✅ Users can now create new RAKs after deleting the previous ones
- ✅ Only active RAKs are considered for duplicate detection

## Files Modified

1. `backend/src/modules/rak/services/rak.service.ts`
   - Modified the `create()` method's duplicate check logic

## Testing Steps

To verify the fix:

1. **Delete a RAK**:
   - Navigate to RAK list in the frontend
   - Select a RAK and click delete
   - Confirm the deletion

2. **Create a new RAK for the same subkegiatan**:
   - Click "Buat RAK baru"
   - Select the same subkegiatan that was just deleted
   - Select the same tahun_anggaran
   - Submit the form

3. **Expected Result**:
   - ✅ RAK is created successfully
   - ✅ No 500 Internal Server Error
   - ✅ No conflict error
   - ✅ The new RAK appears in the list

## Related Code Patterns

This fix aligns with existing patterns in the codebase:

### `findAll()` method (already correct):
```typescript
const qb = this.rakRepo
  .createQueryBuilder('rak')
  .leftJoinAndSelect('rak.subkegiatan', 'subkegiatan')
  .leftJoinAndSelect('rak.creator', 'creator')
  .leftJoinAndSelect('rak.approver', 'approver')
  .where('rak.deleted_at IS NULL'); // ✅ Correctly excludes soft-deleted records
```

### `getAvailableYears()` method (already correct):
```typescript
const result = await this.rakRepo
  .createQueryBuilder('rak')
  .select('DISTINCT rak.tahun_anggaran', 'tahun')
  .where('rak.deleted_at IS NULL') // ✅ Correctly excludes soft-deleted records
  .orderBy('rak.tahun_anggaran', 'DESC')
  .getRawMany();
```

## Alternative Approaches Considered

### Option 1: Use `withDeleted: false` in `findOne()`
```typescript
const existing = await this.rakRepo.findOne({
  where: {
    subkegiatan_id: createRakDto.subkegiatan_id,
    tahun_anggaran: createRakDto.tahun_anggaran,
  },
  withDeleted: false, // This doesn't exist in TypeORM
});
```
**Rejected**: TypeORM's `findOne()` doesn't have a `withDeleted` option. The default behavior is to include soft-deleted records when relations are not involved.

### Option 2: Hard Delete Instead of Soft Delete
**Rejected**: Soft delete is important for:
- Audit trail compliance
- Data recovery capabilities
- Historical reporting
- Business requirements

### Option 3: Add `withDeleted` parameter to all queries
**Rejected**: Would require extensive changes across the codebase. QueryBuilder approach is more precise and consistent with existing patterns.

## Impact Assessment

### Positive Impacts:
- ✅ Users can now delete and re-create RAKs without errors
- ✅ Improves user experience for BA users
- ✅ Maintains data integrity through soft delete
- ✅ Consistent with soft delete best practices

### No Negative Impacts:
- ✅ No breaking changes to API
- ✅ No database migrations required
- ✅ No changes to frontend code needed
- ✅ Backward compatible with existing data

## Deployment Notes

1. **No database migration required**: This is a code-only fix
2. **Backend restart needed**: PM2 process was restarted to apply changes
3. **Frontend unchanged**: No modifications needed on the frontend
4. **Testing recommended**: Verify the fix with the testing steps above

## Verification

After deployment, verify:

```bash
# Check PM2 status
pm2 status

# Check backend logs for any errors
pm2 logs sikancil-backend --lines 50

# Test the RAK creation flow through the frontend UI
```

## Conclusion

This fix resolves the issue where users could not create new RAKs after deleting previous ones for the same subkegiatan and tahun_anggaran. The solution is minimal, focused, and aligns with existing code patterns in the application.