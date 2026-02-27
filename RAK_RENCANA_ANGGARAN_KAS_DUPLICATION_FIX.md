# RAK & Rencana Anggaran Kas Duplication Fix

## 📋 Problem Summary

There was a duplication of menus and modules for "Anggaran Kas" functionality:

1. **New RAK Module**: `frontend/src/features/rak/` and `backend/src/modules/rak/` - Complete, modern implementation with enhanced features
2. **Old Rencana Anggaran Kas Module**: `frontend/src/features/rencana-anggaran-kas/` and `backend/src/modules/rencana-anggaran-kas/` - Legacy implementation

According to the documentation (`docs/Modul RAK/01_RAK_MODULE_UPGRADE_OVERVIEW.md`), the RAK module was specifically upgraded to replace the old Rencana Anggaran Kas module with enhanced features.

## ✅ Completed Changes (Phase 1 - Frontend)

### 1. Removed Duplicate Menu from Sidebar
**File**: `frontend/src/components/layout/Sidebar.tsx`

**Change**: Removed "Rencana Anggaran Kas" menu item from the sidebar under "Perencanaan & RBA" section.

**Before**:
```typescript
{ title: 'RAK (Anggaran Kas)', href: '/rak', icon: Wallet },
{ title: 'Rencana Anggaran Kas', href: '/rencana-anggaran-kas', icon: Wallet },
{ title: 'Revisi RBA', href: '/revisi-rba', icon: FileText },
```

**After**:
```typescript
{ title: 'RAK (Anggaran Kas)', href: '/rak', icon: Wallet },
{ title: 'Revisi RBA', href: '/revisi-rba', icon: FileText },
```

### 2. Redirected Old Route to New RAK
**File**: `frontend/src/routes/index.tsx`

**Change**: 
- Removed import of old `RencanaAnggaranKas` component
- Changed `/rencana-anggaran-kas` route to redirect to `/rak`

**Before**:
```typescript
const RencanaAnggaranKas = React.lazy(() => import('@/features/rencana-anggaran-kas'));
// ...
{
  path: 'rencana-anggaran-kas',
  element: (
    <React.Suspense fallback={<div>Loading...</div>}>
      <RencanaAnggaranKas />
    </React.Suspense>
  ),
},
```

**After**:
```typescript
// Import removed
// ...
{
  path: 'rencana-anggaran-kas',
  element: <Navigate to="/rak" replace />,
},
```

## ⚠️ Pending Changes (Phase 2 - Backend)

### Important: Backend Module Cannot Be Removed Yet

The old `RencanaAnggaranKasModule` is **still in use** by the `BuktiBayarModule`:

**Dependency Chain**:
```
BuktiBayarService
  └── Uses RencanaAnggaranKas entity (old)
      └── For budget validation when creating Bukti Bayar
```

**Evidence**:
- `backend/src/modules/bukti-bayar/bukti-bayar.service.ts` imports `RencanaAnggaranKas`
- `backend/src/modules/bukti-bayar/bukti-bayar.module.ts` imports `RencanaAnggaranKas` entity
- `backend/src/database/entities/bukti-bayar.entity.ts` has relation to `RencanaAnggaranKas`

### Required Backend Migration (Future Task)

To fully remove the old `RencanaAnggaranKasModule`, the following steps are needed:

1. **Analyze New RAK Structure**:
   - Review `backend/src/modules/rak/entities/` (rak-detail.entity.ts, rak-subkegiatan.entity.ts)
   - Understand the new entity relationships

2. **Migrate BuktiBayar Dependencies**:
   - Update `bukti-bayar.entity.ts` to reference new RAK entities
   - Update `bukti-bayar.service.ts` validation logic to use new RAK entities
   - Update DTOs if needed

3. **Data Migration** (if any):
   - Migrate existing `rencana_anggaran_kas` table data to new RAK tables
   - Update foreign key references in `bukti_bayar` table

4. **Remove Old Module**:
   - Remove `backend/src/modules/rencana-anggaran-kas/` directory
   - Remove `RencanaAnggaranKasModule` from `app.module.ts`
   - Remove `RencanaAnggaranKas` entity from `backend/src/database/entities/index.ts`
   - Remove old entity file

5. **Remove Old Frontend Feature**:
   - Remove `frontend/src/features/rencana-anggaran-kas/` directory
   - Clean up any remaining imports

## 📊 Impact Assessment

### User Impact
- ✅ **Minimal**: Users will only see "RAK (Anggaran Kas)" menu
- ✅ **Backward Compatible**: Old URL `/rencana-anggaran-kas` automatically redirects to `/rak`
- ✅ **No Data Loss**: No changes to database

### Developer Impact
- ✅ **Clearer Codebase**: Removed frontend duplication
- ⚠️ **Pending**: Backend still has old module (needed by BuktiBayar)
- 📝 **Documentation**: Future developers need to know about pending migration

## 🎯 Testing Recommendations

### Frontend Testing
1. ✅ Navigate to "Perencanaan & RBA" in sidebar
2. ✅ Verify only "RAK (Anggaran Kas)" appears (not "Rencana Anggaran Kas")
3. ✅ Test old URL: `http://localhost:5173/rencana-anggaran-kas` should redirect to `/rak`
4. ✅ Test new URL: `http://localhost:5173/rak` should work normally
5. ✅ Verify RAK functionality still works

### Backend Testing (for Phase 2)
1. Test Bukti Bayar creation with budget validation
2. Verify budget balance checking still works
3. Test all Bukti Bayar CRUD operations
4. Run integration tests

## 📚 References

- **RAK Module Overview**: `docs/Modul RAK/01_RAK_MODULE_UPGRADE_OVERVIEW.md`
- **Backend API Spec**: `docs/Modul RAK/03_BACKEND_API_SPECIFICATION.md`
- **Frontend UI Guide**: `docs/Modul RAK/04_FRONTEND_UI_GUIDE.md`

## 🔄 Timeline for Phase 2

**Estimated Effort**: 1-2 days

**Prerequisites**:
- Complete analysis of new RAK entity structure
- Create migration plan for BuktiBayar dependencies
- Test thoroughly in development environment

**Risk Level**: Medium (BuktiBayar is a critical module)

---

**Last Updated**: 2026-02-17  
**Status**: Phase 1 Complete ✅ | Phase 2 Pending ⚠️  
**Next Step**: Schedule and execute backend migration when ready