# Aktivitas Input Error Fix Summary

## Problem
When inputting Aktivitas (Sub Output RBA), the following validation errors occurred:
- ❌ `property subKegiatanId should not exist`
- ❌ `outputId should not be empty`
- ❌ `outputId must be a UUID`

## Root Cause
There was a mismatch between the frontend and backend API contracts:

1. **Frontend** (`frontend/src/features/aktivitas-rba/AktivitasRBAForm.tsx`):
   - Was sending `subKegiatanId` in the create/update payload
   - This matches the database column name: `subKegiatanId`

2. **Backend DTO** (`backend/src/modules/sub-output-rba/dto/create-sub-output-rba.dto.ts`):
   - Was expecting `outputId` instead of `subKegiatanId`
   - This caused validation to fail when `subKegiatanId` was present

3. **Database Entity** (`backend/src/database/entities/sub-output-rba.entity.ts`):
   - Correctly uses `subKegiatanId` as the column name
   - Has a ManyToOne relation to `SubKegiatanRBA` entity

## Solution Applied

### 1. Fixed Create DTO
**File**: `backend/src/modules/sub-output-rba/dto/create-sub-output-rba.dto.ts`

Changed the property from `outputId` to `subKegiatanId`:
```typescript
// Before
@ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID Output RBA' })
@IsUUID()
@IsNotEmpty()
outputId: string;

// After
@ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID Sub Kegiatan RBA' })
@IsUUID()
@IsNotEmpty()
subKegiatanId: string;
```

### 2. Fixed Update Method in Service
**File**: `backend/src/modules/sub-output-rba/sub-output-rba.service.ts`

Updated the `create()` method to use `subKegiatanId`:
```typescript
// Validate subKegiatanId exists
const subKegiatan = await this.outputRbaRepository.findOne({
  where: { id: createDto.subKegiatanId },
});

if (!subKegiatan) {
  throw new BadRequestException(`Sub Kegiatan RBA dengan ID ${createDto.subKegiatanId} tidak ditemukan`);
}

// Validate tahun matches with subKegiatan tahun
if (subKegiatan.tahun !== createDto.tahun) {
  throw new BadRequestException(
    `Tahun sub output (${createDto.tahun}) harus sama dengan tahun sub kegiatan (${subKegiatan.tahun})`
  );
}
```

Updated the `update()` method to use `subKegiatanId`:
```typescript
// Validate subKegiatanId if being updated
if (updateDto.subKegiatanId && updateDto.subKegiatanId !== subOutputRba.subKegiatanId) {
  const subKegiatan = await this.outputRbaRepository.findOne({
    where: { id: updateDto.subKegiatanId },
  });

  if (!subKegiatan) {
    throw new BadRequestException(`Sub Kegiatan RBA dengan ID ${updateDto.subKegiatanId} tidak ditemukan`);
  }

  // Validate tahun matches with new subKegiatan tahun
  const tahun = updateDto.tahun || subOutputRba.tahun;
  if (subKegiatan.tahun !== tahun) {
    throw new BadRequestException(
      `Tahun sub output (${tahun}) harus sama dengan tahun sub kegiatan (${subKegiatan.tahun})`
    );
  }
}
```

### 3. Fixed Relation Names
Updated relation names from `output` to `subKegiatan` in query methods:
- `findAll()`: Changed `relations: ['output', 'anggaranBelanja']` to `relations: ['subKegiatan', 'anggaranBelanja']`
- `findByYear()`: Changed `relations: ['output', 'anggaranBelanja']` to `relations: ['subKegiatan', 'anggaranBelanja']`
- `findOne()`: Changed `relations: ['output', 'anggaranBelanja']` to `relations: ['subKegiatan', 'anggaranBelanja']`

## Files Modified
1. `backend/src/modules/sub-output-rba/dto/create-sub-output-rba.dto.ts`
2. `backend/src/modules/sub-output-rba/sub-output-rba.service.ts`

## Testing
The backend has been restarted with `pm2 restart sikancil-backend`.

## Expected Result
Users should now be able to create and update Aktivitas (Sub Output RBA) without validation errors. The form will:
- Accept `subKegiatanId` from the frontend
- Validate that the referenced Sub Kegiatan exists
- Ensure the tahun (fiscal year) matches between Sub Output and Sub Kegiatan
- Properly return related Sub Kegiatan data in responses

## Notes
- The Update DTO automatically inherits from Create DTO, so no changes were needed there
- The Query DTO still uses `outputId` as a filter parameter, which internally maps to `subKegiatanId` in the database query (this is acceptable for backward compatibility)
- All error messages have been updated to use the correct terminology ("Sub Kegiatan" instead of "Output")