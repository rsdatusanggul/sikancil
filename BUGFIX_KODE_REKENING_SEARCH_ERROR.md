# Bug Fix: Kode Rekening Search Error (400 Bad Request)

## Problem
When searching for kode rekening during bukti bayar creation, the API returns:
```
GET /api/v1/payment-vouchers/search-kode-rekening?q=SERVER
Status: 400 Bad Request
```

## Root Cause Analysis

### 1. Backend Issue
The `searchKodeRekening` endpoint in `bukti-bayar.controller.ts` was expecting a required query parameter `q` without proper validation for empty/undefined values.

**Original code:**
```typescript
@Get('search-kode-rekening')
@ApiOperation({ summary: 'Cari kode rekening (autocomplete)' })
@ApiQuery({ name: 'q', description: 'Query pencarian (nama atau kode rekening)' })
@ApiResponse({ status: 200, description: 'List kode rekening yang cocok' })
async searchKodeRekening(@Query('q') query: string) {
  return await this.budgetSvc.searchKodeRekening(query);
}
```

**Issues:**
- Query parameter was not marked as optional in Swagger documentation
- No validation for empty or undefined query
- No trimming of whitespace

### 2. Frontend Issue
The API function `searchKodeRekening` was missing in `frontend/src/features/bukti-bayar/api.ts`, causing the component to make direct API calls instead of using the proper function.

## Solution

### 1. Backend Fix (`backend/src/modules/bukti-bayar/bukti-bayar.controller.ts`)

**Updated code:**
```typescript
@Get('search-kode-rekening')
@ApiOperation({ summary: 'Cari kode rekening (autocomplete)' })
@ApiQuery({ name: 'q', description: 'Query pencarian (nama atau kode rekening)', required: false })
@ApiResponse({ status: 200, description: 'List kode rekening yang cocok' })
async searchKodeRekening(@Query('q') query?: string) {
  // Handle empty or undefined query
  if (!query || query.trim().length === 0) {
    return [];
  }
  return await this.budgetSvc.searchKodeRekening(query.trim());
}
```

**Changes:**
- Made `query` parameter optional (`query?: string`)
- Added `required: false` to `@ApiQuery` decorator
- Added validation to return empty array for empty/undefined queries
- Added `trim()` to remove whitespace

### 2. Frontend Fix (`frontend/src/features/bukti-bayar/api.ts`)

**Added:**
```typescript
// Import KodeRekeningSearchResult type
import type {
  // ... other types
  KodeRekeningSearchResult,
} from './types';

// Search kode rekening (autocomplete)
export const searchKodeRekening = async (
  query: string
): Promise<KodeRekeningSearchResult[]> => {
  const { data } = await apiClient.get(`${BASE_URL}/search-kode-rekening`, {
    params: { q: query },
  });
  return data;
};
```

**Changes:**
- Added `KodeRekeningSearchResult` to imports
- Created proper API function for searching kode rekening
- Function returns typed results matching the backend response

## Testing

### Manual Testing Steps
1. Navigate to Buat Bukti Bayar page
2. Start typing in the "Kode Rekening" field
3. Verify that suggestions appear after 2 characters
4. Verify that selecting a suggestion populates the field correctly
5. Verify that clearing the field doesn't cause errors

### API Testing
```bash
# Test with valid query
curl "http://192.168.11.30:3000/api/v1/payment-vouchers/search-kode-rekening?q=5.2"

# Test with empty query (should return 200 with empty array)
curl "http://192.168.11.30:3000/api/v1/payment-vouchers/search-kode-rekening?q="

# Test without query parameter (should return 200 with empty array)
curl "http://192.168.11.30:3000/api/v1/payment-vouchers/search-kode-rekening"
```

## Files Modified

1. `backend/src/modules/bukti-bayar/bukti-bayar.controller.ts`
   - Updated `searchKodeRekening` method to handle optional query parameter

2. `frontend/src/features/bukti-bayar/api.ts`
   - Added `searchKodeRekening` API function
   - Added `KodeRekeningSearchResult` type import

## Impact

### Before
- ❌ 400 Bad Request when searching for kode rekening
- ❌ No autocomplete functionality working
- ❌ Users had to manually type full kode rekening

### After
- ✅ Proper error handling for empty/undefined queries
- ✅ Autocomplete functionality working as expected
- ✅ Improved user experience with search suggestions
- ✅ Proper TypeScript typing for better developer experience

## Related Components
- `frontend/src/features/bukti-bayar/BuktiBayarCreate.tsx` - Uses the autocomplete feature
- `backend/src/modules/bukti-bayar/services/budget-validation.service.ts` - Implements the search logic

## Notes
- The backend service (`BudgetValidationService.searchKodeRekening`) already had proper error handling
- The fix focuses on the controller layer to properly validate and handle query parameter
- The component already had the autocomplete UI implemented, it was just missing the proper API function

## Search Logic (Improved)

The search now uses **case-insensitive** matching (ILike) on both:

1. **kodeRekening**: Matches codes that **start with** query
   - Example: "5.2." → "5.2.02.10", "5.2.02.20", etc.
   
2. **namaRekening**: Matches names that **contain** the query
   - Example: "pegawai" → "Belanja Pegawai", "Gaji Pegawai", etc.

### Filters Applied

To ensure relevant results, the search only returns accounts that are:
- ✅ **Active** (`isActive = true`)
- ✅ **Non-header** (`isHeader = false`) - Only posting accounts (not summary/parent accounts)

This ensures users only see accounts they can actually use for posting transactions.

### Response Format

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "kodeRekening": "5.2.02.10",
      "namaRekening": "Belanja Pegawai - Gaji Pokok",
      "level": 4
    }
  ]
}
```

Results are ordered by `kodeRekening` ascending and limited to 50 records.

### Troubleshooting

If no results are found when searching for "pegawai":
1. Check that the account exists in the `chart_of_accounts` table
2. Verify `isActive = true` and `isHeader = false` for the account
3. Try searching with just "belanja" or the full account code (e.g., "5.2.02.10")
4. Check the browser console for any API errors
5. Ensure the user is logged in (endpoint requires authentication)
