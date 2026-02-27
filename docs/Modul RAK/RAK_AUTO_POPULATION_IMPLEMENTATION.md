# RAK Auto-Population Implementation Summary

## Overview
Implemented auto-population of RAK (Rencana Anggaran Kas) data from Subkegiatan according to Business Rule BR-001.

## Changes Made

### 1. Backend Service (`backend/src/modules/rak/services/rak.service.ts`)

**Before:** RAK creation required manual input of `total_pagu` and `details` array.

**After:** RAK creation now automatically:
- Fetches Subkegiatan data including `AnggaranBelanjaRBA` records
- Uses `Subkegiatan.totalPagu` as the RAK total budget
- Creates RAK details from each `AnggaranBelanjaRBA` record
- Maps each anggaran to corresponding `ChartOfAccount` by `kodeRekening`

**Key Implementation Details:**

```typescript
async create(createRakDto: CreateRakDto, userId: string) {
  // 1. Validate uniqueness
  const existing = await this.rakRepo.findOne({...});
  
  // 2. Fetch Subkegiatan with AnggaranBelanjaRBA (Business Rule BR-001)
  const subkegiatan = await this.rakRepo.manager.findOne(SubKegiatanRBA, {
    where: { id: createRakDto.subkegiatan_id },
    relations: ['anggaranBelanja'],
  });

  // 3. Validate RBA prerequisite
  if (subkegiatan.totalPagu <= 0) {
    throw new BadRequestException(
      'Subkegiatan tidak memiliki pagu anggaran. Pastikan RBA sudah approved dan memiliki pagu.'
    );
  }

  // 4. Use auto-calculated total_pagu
  const totalPagu = subkegiatan.totalPagu;

  // 5. Create RAK header
  const rak = this.rakRepo.create({
    subkegiatan_id: createRakDto.subkegiatan_id,
    tahun_anggaran: createRakDto.tahun_anggaran,
    total_pagu: totalPagu,  // Auto-calculated
    created_by: userId,
    updated_by: userId,
  });

  const saved = await this.rakRepo.save(rak);

  // 6. Auto-populate details from AnggaranBelanjaRBA
  const anggaranBelanja = subkegiatan.anggaranBelanja || [];
  
  const details = await Promise.all(
    anggaranBelanja.map(async (anggaran) => {
      // Find ChartOfAccount by kodeRekening
      const chartOfAccount = await this.rakRepo.manager.findOne(ChartOfAccount, {
        where: { kodeRekening: anggaran.kodeRekening, isActive: true },
      });

      if (!chartOfAccount) {
        console.warn(`Chart of account ${anggaran.kodeRekening} tidak ditemukan, skipping...`);
        return null;
      }

      // Calculate monthly total
      const monthlyTotal = 
        Number(anggaran.januari) + Number(anggaran.februari) + ...;

      return this.rakDetailRepo.create({
        rak_subkegiatan_id: saved.id,
        kode_rekening_id: chartOfAccount.id,
        jumlah_anggaran: monthlyTotal,
        januari: anggaran.januari,
        februari: anggaran.februari,
        // ... all 12 months
        created_by: userId,
        updated_by: userId,
      });
    })
  );

  await this.rakDetailRepo.save(validDetails);
  return this.findOne(saved.id);
}
```

### 2. DTO Update (`backend/src/modules/rak/dto/create-rak.dto.ts`)

**Before:**
```typescript
export class CreateRakDto {
  subkegiatan_id: string;
  tahun_anggaran: number;
  total_pagu: number;        // Manual input required
  details?: CreateRakDetailDto[];  // Manual input required
}
```

**After:**
```typescript
export class CreateRakDto {
  @ApiProperty({ 
    description: 'UUID Subkegiatan - RAK will auto-populate from Subkegiatan data (Business Rule BR-001)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  subkegiatan_id: string;

  @ApiProperty({ 
    description: 'Tahun Anggaran',
    example: 2025 
  })
  @IsInt()
  tahun_anggaran: number;
}
```

## Business Rules Implemented

### BR-001: Prerequisite RBA
✅ **Implemented**
- RAK can only be created if Subkegiatan has `totalPagu > 0`
- Validates that Subkegiatan exists
- Uses Subkegiatan's pagu as RAK's total_pagu

### Auto-Population Logic
✅ **Implemented**
- Fetches `AnggaranBelanjaRBA` records from Subkegiatan
- Creates RAK details for each anggaran belanja
- Maps `AnggaranBelanjaRBA.kodeRekening` to `ChartOfAccount.kodeRekening`
- Preserves monthly breakdown data (Januari - Desember)
- Calculates `jumlah_anggaran` as sum of 12 months

## Error Handling

1. **Subkegiatan Not Found**
   - Returns 404 with message: "Subkegiatan tidak ditemukan"

2. **No Pagu Anggaran**
   - Returns 400 with message: "Subkegiatan tidak memiliki pagu anggaran. Pastikan RBA sudah approved dan memiliki pagu."

3. **No Anggaran Belanja**
   - Returns 400 with message: "Subkegiatan tidak memiliki data anggaran belanja. Tidak dapat membuat RAK."

4. **Chart of Account Not Found**
   - Logs warning and skips the record (doesn't fail the entire operation)
   - Example: `Chart of account 5.1.1.01 tidak ditemukan, skipping...`

5. **Duplicate RAK**
   - Returns 409 with message: "RAK untuk subkegiatan dan tahun ini sudah ada"

## Data Flow

```
1. User calls POST /rak
   Body: { subkegiatan_id: "xxx", tahun_anggaran: 2025 }

2. Backend fetches Subkegiatan with anggaranBelanja relation

3. Backend validates:
   - Subkegiatan exists
   - totalPagu > 0
   - anggaranBelanja.length > 0

4. Backend creates RAK header:
   - total_pagu = Subkegiatan.totalPagu
   - Auto-calculated

5. Backend creates RAK details:
   For each AnggaranBelanjaRBA:
     - Find ChartOfAccount by kodeRekening
     - Create RakDetail with monthly breakdown
     - Calculate jumlah_anggaran

6. Return created RAK with all details
```

## Testing Recommendations

### 1. Happy Path Tests
```bash
# Create RAK for Subkegiatan with valid data
curl -X POST http://localhost:3000/rak \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "subkegiatan_id": "valid-uuid",
    "tahun_anggaran": 2025
  }'
```

Expected:
- RAK created with auto-populated total_pagu
- RAK details created from AnggaranBelanjaRBA
- All 12 months populated

### 2. Error Cases to Test
- Subkegiatan with totalPagu = 0
- Subkegiatan with no anggaranBelanja
- ChartOfAccount not matching kodeRekening
- Duplicate RAK creation

### 3. Validation Tests
- Verify total_pagu matches Subkegiatan.totalPagu
- Verify all 12 months are populated
- Verify jumlah_anggaran = sum of 12 months
- Verify ChartOfAccount mapping is correct

## Frontend Updates Needed

### Before:
```typescript
const createRAK = async (data: {
  subkegiatan_id: string;
  tahun_anggaran: number;
  total_pagu: number;  // Manual input
  details: Array<Detail>;  // Manual input
}) => {
  await api.post('/rak', data);
};
```

### After:
```typescript
const createRAK = async (data: {
  subkegiatan_id: string;
  tahun_anggaran: number;
  // total_pagu and details auto-populated
}) => {
  await api.post('/rak', data);
};
```

UI should:
1. Remove total_pagu input field
2. Remove details input form
3. Only require subkegiatan_id and tahun_anggaran
4. Show loading state while auto-populating
5. Display auto-populated data after creation

## Benefits

1. **Data Consistency**: RAK always matches Subkegiatan data
2. **User Efficiency**: No manual data entry required
3. **Error Reduction**: Eliminates manual input errors
4. **Business Compliance**: Follows Business Rule BR-001
5. **Simplified API**: Fewer required fields

## Migration Notes

### Existing RAK Data
- Already created RAKs remain unchanged
- Only new RAK creations use auto-population
- No database migration needed

### API Versioning
- API endpoint `/rak` remains same
- Request body is simpler (fewer fields)
- Response format unchanged (full RAK with details)

## Related Files Modified

1. `backend/src/modules/rak/services/rak.service.ts` - Main logic update
2. `backend/src/modules/rak/dto/create-rak.dto.ts` - Simplified DTO

## Next Steps

1. ✅ Backend implementation completed
2. ⏳ Update frontend components
3. ⏳ Update API documentation
4. ⏳ Write integration tests
5. ⏳ User acceptance testing

---

**Implementation Date:** 2025-02-17  
**Status:** ✅ Backend Completed  
**Frontend Status:** ⏳ Pending Update  
**Test Status:** ⏳ Pending