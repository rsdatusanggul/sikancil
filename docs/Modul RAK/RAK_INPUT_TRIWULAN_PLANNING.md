# Perencanaan Fitur Input RAK dengan Pengelompokan Per Triwulan

**Tanggal**: 17 Februari 2026
**Modul**: RAK (Rencana Anggaran Kas)
**Status**: PLANNING - Waiting for Approval
**Tipe**: Feature Enhancement

---

## 📋 Daftar Isi

1. [Business Requirements](#business-requirements)
2. [User Stories](#user-stories)
3. [Functional Requirements](#functional-requirements)
4. [UI/UX Design](#uiux-design)
5. [Technical Design](#technical-design)
6. [Data Flow](#data-flow)
7. [Validation Rules](#validation-rules)
8. [Alternative Solutions](#alternative-solutions)
9. [Implementation Plan](#implementation-plan)
10. [Testing Strategy](#testing-strategy)

---

## 🎯 Business Requirements

### Latar Belakang

User perlu membuat RAK dengan input detail per bulan untuk setiap kode rekening dalam subkegiatan. Namun, input 12 kolom bulan sekaligus terlalu kompleks dan rentan error. Pengelompokan per triwulan akan:

1. **Menyederhanakan Input**: User fokus pada 4 triwulan, bukan 12 bulan sekaligus
2. **Meningkatkan Akurasi**: Drill-down per bulan hanya saat dibutuhkan
3. **Mempercepat Entry**: Quarterly planning lebih cepat dari monthly
4. **Fleksibilitas**: User tetap bisa detail ke per bulan jika perlu

### Requirement Summary

| No | Requirement | Priority |
|----|-------------|----------|
| 1 | User input detail RAK sesuai subkegiatan yang dimiliki | P0 - Must Have |
| 2 | Input dengan pembagian per bulan selama setahun | P0 - Must Have |
| 3 | Total pagu input tidak boleh melebihi pagu subkegiatan | P0 - Must Have |
| 4 | Tampilan default: Pengelompokan per triwulan | P0 - Must Have |
| 5 | Nominal pagu per triwulan auto-sum dari detail per bulan | P0 - Must Have |
| 6 | User bisa drill-down ke per bulan untuk edit detail | P0 - Must Have |
| 7 | Validasi real-time saat input | P1 - Should Have |
| 8 | Auto-save draft | P2 - Nice to Have |

---

## 👤 User Stories

### Story 1: Input RAK dengan View Triwulan

**Sebagai**: Staf Perencanaan Anggaran
**Saya ingin**: Membuat RAK dengan input per triwulan
**Sehingga**: Proses input lebih cepat dan mudah

**Acceptance Criteria**:
- ✅ Form menampilkan 4 kolom triwulan (TW1, TW2, TW3, TW4)
- ✅ User dapat input nilai untuk setiap triwulan
- ✅ Sistem auto-calculate total dari 4 triwulan
- ✅ Total tidak boleh melebihi pagu subkegiatan

### Story 2: Drill-down ke Detail Per Bulan

**Sebagai**: Staf Perencanaan Anggaran
**Saya ingin**: Melihat dan mengedit detail per bulan dalam triwulan
**Sehingga**: Saya bisa mengatur distribusi bulanan dengan presisi

**Acceptance Criteria**:
- ✅ Setiap triwulan bisa di-expand untuk show detail 3 bulan
- ✅ User dapat edit nilai per bulan
- ✅ Perubahan per bulan auto-update total triwulan
- ✅ Collapse/expand state tersimpan selama session

### Story 3: Validasi Pagu Real-time

**Sebagai**: Staf Perencanaan Anggaran
**Saya ingin**: Mendapat notifikasi jika input melebihi pagu
**Sehingga**: Saya bisa koreksi sebelum submit

**Acceptance Criteria**:
- ✅ Warning muncul jika total > pagu subkegiatan
- ✅ Warna merah pada total jika exceed
- ✅ Tooltip menunjukkan selisih
- ✅ Submit button disabled jika exceed

---

## 📐 Functional Requirements

### FR-001: Input RAK dengan Kode Rekening

**Deskripsi**: User dapat menambahkan kode rekening ke RAK dan input nilai per triwulan/bulan.

**Flow**:
1. User klik "Tambah Kode Rekening"
2. Pilih kode rekening dari dropdown (dari chart of accounts)
3. Input jumlah anggaran total untuk kode rekening tersebut
4. Input nilai per triwulan (collapsed view)
5. Atau drill-down dan input per bulan (expanded view)
6. Sistem auto-calculate total dari triwulan/bulan
7. Validasi: Total = sum(TW1 + TW2 + TW3 + TW4)

**Business Rules**:
- BR-RAK-001: Satu kode rekening hanya bisa muncul sekali per RAK
- BR-RAK-002: Sum semua kode rekening tidak boleh > pagu subkegiatan
- BR-RAK-003: Untuk setiap kode rekening: jumlah_anggaran = sum(jan..des)
- BR-RAK-004: Untuk setiap triwulan: nilai TW = sum(3 bulan dalam TW)

### FR-002: Pengelompokan Per Triwulan

**Deskripsi**: Data per bulan dikelompokkan dan ditampilkan per triwulan.

**Definisi Triwulan**:
- **Triwulan 1 (TW1)**: Januari + Februari + Maret
- **Triwulan 2 (TW2)**: April + Mei + Juni
- **Triwulan 3 (TW3)**: Juli + Agustus + September
- **Triwulan 4 (TW4)**: Oktober + November + Desember

**Behavior**:
- Default state: Collapsed (show triwulan only)
- Click pada triwulan → Expand untuk show 3 bulan
- Input di level triwulan → Auto-distribute merata ke 3 bulan
- Input di level bulan → Auto-sum ke triwulan

### FR-003: Drill-down ke Per Bulan

**Deskripsi**: User dapat expand triwulan untuk melihat dan edit detail per bulan.

**Interaction**:
```
┌─────────────────────────────────────────────────────────────┐
│ Kode: 5.1.01  Uraian: Belanja Gaji                         │
├─────────────────────────────────────────────────────────────┤
│ Jumlah Anggaran: Rp 120.000.000                             │
├─────────────────────────────────────────────────────────────┤
│ [▼] Triwulan 1: Rp 30.000.000                               │
│     ├─ Januari  : Rp 10.000.000  [Edit]                     │
│     ├─ Februari : Rp 10.000.000  [Edit]                     │
│     └─ Maret    : Rp 10.000.000  [Edit]                     │
│ [▶] Triwulan 2: Rp 30.000.000                               │
│ [▶] Triwulan 3: Rp 30.000.000                               │
│ [▶] Triwulan 4: Rp 30.000.000                               │
└─────────────────────────────────────────────────────────────┘
```

### FR-004: Validasi Pagu

**Deskripsi**: Sistem validasi bahwa total input tidak melebihi pagu subkegiatan.

**Validation Levels**:
1. **Kode Rekening Level**:
   - jumlah_anggaran = sum(bulan 1..12)
   - Tolerance: ±Rp 1

2. **Triwulan Level**:
   - TW1 = Jan + Feb + Mar
   - TW2 = Apr + May + Jun
   - TW3 = Jul + Aug + Sep
   - TW4 = Oct + Nov + Dec

3. **RAK Level**:
   - sum(semua kode rekening) ≤ pagu subkegiatan
   - Warning jika > 95% pagu
   - Error jika > 100% pagu

**Visual Feedback**:
- 🟢 Green: Total ≤ pagu (OK)
- 🟡 Yellow: Total > 95% pagu (Warning)
- 🔴 Red: Total > 100% pagu (Error - tidak bisa submit)

---

## 🎨 UI/UX Design

### Layout Option 1: Accordion Style (RECOMMENDED)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Buat RAK Baru                                                       │
├──────────────────────────────────────────────────────────────────────┤
│  Subkegiatan: [Dropdown]                                             │
│  Tahun Anggaran: [2026]                                              │
│  Pagu Subkegiatan: Rp 500.000.000                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  📊 Detail RAK Per Kode Rekening                                     │
│                                                                       │
│  [+ Tambah Kode Rekening]                                            │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Kode: 5.1.01.01.01                                    [Hapus] │  │
│  │ Uraian: Belanja Gaji Pokok PNS                                │  │
│  │                                                                │  │
│  │ Jumlah Anggaran: [Rp 120.000.000]                             │  │
│  │                                                                │  │
│  │ Pembagian Per Triwulan:                                       │  │
│  │                                                                │  │
│  │ [▼] Triwulan 1 (Jan-Mar)        [Rp 30.000.000] [Auto ÷]     │  │
│  │     ├─ Januari   [Rp 10.000.000]                              │  │
│  │     ├─ Februari  [Rp 10.000.000]                              │  │
│  │     └─ Maret     [Rp 10.000.000]                              │  │
│  │                                                                │  │
│  │ [▶] Triwulan 2 (Apr-Jun)        [Rp 30.000.000] [Auto ÷]     │  │
│  │                                                                │  │
│  │ [▶] Triwulan 3 (Jul-Sep)        [Rp 30.000.000] [Auto ÷]     │  │
│  │                                                                │  │
│  │ [▶] Triwulan 4 (Oct-Dec)        [Rp 30.000.000] [Auto ÷]     │  │
│  │                                                                │  │
│  │ ✅ Total Triwulan = Jumlah Anggaran                           │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Kode: 5.1.02.01.01                                    [Hapus] │  │
│  │ Uraian: Belanja Tunjangan                                     │  │
│  │ ...                                                            │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 📊 RINGKASAN                                                   │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ Total Input     : Rp 480.000.000                              │  │
│  │ Pagu Subkegiatan: Rp 500.000.000                              │  │
│  │ Sisa Pagu       : Rp  20.000.000 (4%)  🟢                     │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  [Batal]  [Simpan Draft]  [Simpan & Submit]                         │
└──────────────────────────────────────────────────────────────────────┘
```

### Layout Option 2: Table with Expandable Rows

```
┌──────────────────────────────────────────────────────────────────────┐
│  Detail RAK                                                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  [+ Tambah Kode Rekening]  [Toggle: Triwulan ⇄ Bulan]              │
│                                                                       │
│  ┌────┬──────────┬──────────────┬──────────┬─────┬─────┬─────┬─────┐ │
│  │ No │ Kode     │ Uraian       │ Jumlah   │ TW1 │ TW2 │ TW3 │ TW4 │ │
│  ├────┼──────────┼──────────────┼──────────┼─────┼─────┼─────┼─────┤ │
│  │ 1  │ 5.1.01   │ Gaji Pokok   │ 120.000K │ 30K │ 30K │ 30K │ 30K │ │
│  │ [▼]│          │ Expand untuk melihat detail per bulan         │ │
│  │    │ Jan      │              │  10.000K │                        │ │
│  │    │ Feb      │              │  10.000K │                        │ │
│  │    │ Mar      │              │  10.000K │                        │ │
│  ├────┼──────────┼──────────────┼──────────┼─────┼─────┼─────┼─────┤ │
│  │ 2  │ 5.1.02   │ Tunjangan    │  80.000K │ 20K │ 20K │ 20K │ 20K │ │
│  │ [▶]│          │              │          │     │     │     │     │ │
│  └────┴──────────┴──────────────┴──────────┴─────┴─────┴─────┴─────┘ │
│                                                                       │
│  Total: Rp 200.000.000 / Pagu: Rp 500.000.000 (40%) 🟢               │
└──────────────────────────────────────────────────────────────────────┘
```

### Interaction Behaviors

#### 1. Input di Level Triwulan
**User Action**: Input nilai di field Triwulan 1 = Rp 30.000.000

**System Response**:
```javascript
// Auto-distribute merata ke 3 bulan
Januari   = 30.000.000 / 3 = Rp 10.000.000
Februari  = 30.000.000 / 3 = Rp 10.000.000
Maret     = 30.000.000 / 3 = Rp 10.000.000
```

**Note**: Jika ada sisa pembagian (contoh: Rp 100 / 3 = Rp 33,33), sisa dimasukkan ke bulan pertama.

#### 2. Input di Level Bulan
**User Action**:
- Expand Triwulan 1
- Edit Januari = Rp 15.000.000
- Edit Februari = Rp 10.000.000
- Edit Maret = Rp 5.000.000

**System Response**:
```javascript
// Auto-sum ke triwulan
Triwulan 1 = 15.000.000 + 10.000.000 + 5.000.000 = Rp 30.000.000
```

#### 3. Expand/Collapse Behavior
- **Default**: All collapsed (show triwulan only)
- **Click header triwulan**: Toggle expand/collapse
- **Icon**:
  - `▶` = Collapsed
  - `▼` = Expanded
- **State persistence**: Session storage (hilang saat refresh)

#### 4. Auto-calculate Button
**Feature**: Tombol "Auto ÷" di setiap triwulan

**Behavior**: Klik tombol → Nilai triwulan dibagi rata ke 3 bulan

**Use Case**: User input total triwulan secara manual, lalu klik "Auto ÷" untuk distribute otomatis.

---

## 🔧 Technical Design

### Component Architecture

```
RakCreate.tsx (Page)
├─ RakFormHeader (Subkegiatan, Tahun, Pagu)
├─ RakDetailList (Array of Kode Rekening)
│  └─ RakDetailItem (Per Kode Rekening)
│     ├─ KodeRekeningSelector
│     ├─ JumlahAnggaranInput
│     └─ QuarterlyBreakdown ← NEW COMPONENT
│        ├─ QuarterInput (TW1, TW2, TW3, TW4)
│        │  └─ MonthlyDrilldown (Expandable)
│        │     ├─ MonthInput (Jan, Feb, Mar)
│        │     └─ AutoDistributeButton
│        └─ ValidationIndicator
└─ RakSummary (Total, Pagu, Sisa)
```

### Data Structure

```typescript
// New Interface for Quarterly Input
export interface QuarterlyBreakdown {
  triwulan_1: number;  // Jan + Feb + Mar
  triwulan_2: number;  // Apr + May + Jun
  triwulan_3: number;  // Jul + Aug + Sep
  triwulan_4: number;  // Oct + Nov + Dec
}

// Enhanced RAK Detail with Quarterly
export interface RakDetailInput extends MonthlyBreakdown, QuarterlyBreakdown {
  kode_rekening_id: string;
  kode_rekening: KodeRekening;
  jumlah_anggaran: number;

  // UI State
  expanded: {
    tw1: boolean;
    tw2: boolean;
    tw3: boolean;
    tw4: boolean;
  };
}

// Form State
export interface RakFormData {
  subkegiatan_id: string;
  tahun_anggaran: number;
  total_pagu: number;  // From Subkegiatan (read-only)
  details: RakDetailInput[];

  // Computed
  total_input: number;       // Sum of all details
  sisa_pagu: number;         // total_pagu - total_input
  pagu_percentage: number;   // (total_input / total_pagu) * 100
}
```

### Component: QuarterlyBreakdown.tsx

```typescript
interface QuarterlyBreakdownProps {
  detail: RakDetailInput;
  onUpdate: (detail: RakDetailInput) => void;
  readonly?: boolean;
}

export function QuarterlyBreakdown({
  detail,
  onUpdate,
  readonly = false
}: QuarterlyBreakdownProps) {
  const quarters = [
    {
      key: 'tw1',
      label: 'Triwulan 1 (Jan-Mar)',
      months: ['januari', 'februari', 'maret']
    },
    {
      key: 'tw2',
      label: 'Triwulan 2 (Apr-Jun)',
      months: ['april', 'mei', 'juni']
    },
    {
      key: 'tw3',
      label: 'Triwulan 3 (Jul-Sep)',
      months: ['juli', 'agustus', 'september']
    },
    {
      key: 'tw4',
      label: 'Triwulan 4 (Oct-Dec)',
      months: ['oktober', 'november', 'desember']
    },
  ];

  // Handle quarter input (auto-distribute to months)
  const handleQuarterChange = (quarter: string, value: number) => {
    const monthsInQuarter = quarters.find(q => q.key === quarter)?.months || [];
    const perMonth = Math.floor(value / 3);
    const remainder = value - (perMonth * 3);

    const updated = { ...detail };
    monthsInQuarter.forEach((month, idx) => {
      updated[month] = perMonth + (idx === 0 ? remainder : 0);
    });

    // Recalculate quarters
    updated.triwulan_1 = updated.januari + updated.februari + updated.maret;
    updated.triwulan_2 = updated.april + updated.mei + updated.juni;
    updated.triwulan_3 = updated.juli + updated.agustus + updated.september;
    updated.triwulan_4 = updated.oktober + updated.november + updated.desember;

    // Recalculate total
    updated.jumlah_anggaran =
      updated.triwulan_1 +
      updated.triwulan_2 +
      updated.triwulan_3 +
      updated.triwulan_4;

    onUpdate(updated);
  };

  // Handle month input (auto-sum to quarter)
  const handleMonthChange = (month: keyof MonthlyBreakdown, value: number) => {
    const updated = { ...detail };
    updated[month] = value;

    // Recalculate quarters
    updated.triwulan_1 = updated.januari + updated.februari + updated.maret;
    updated.triwulan_2 = updated.april + updated.mei + updated.juni;
    updated.triwulan_3 = updated.juli + updated.agustus + updated.september;
    updated.triwulan_4 = updated.oktober + updated.november + updated.desember;

    // Recalculate total
    updated.jumlah_anggaran =
      updated.triwulan_1 +
      updated.triwulan_2 +
      updated.triwulan_3 +
      updated.triwulan_4;

    onUpdate(updated);
  };

  // Toggle expand/collapse
  const toggleExpand = (quarter: string) => {
    const updated = { ...detail };
    updated.expanded[quarter] = !updated.expanded[quarter];
    onUpdate(updated);
  };

  return (
    <div className="space-y-2">
      {quarters.map((q) => (
        <div key={q.key} className="border rounded p-3">
          {/* Quarter Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleExpand(q.key)}
              className="text-gray-500 hover:text-gray-700"
            >
              {detail.expanded[q.key] ? '▼' : '▶'}
            </button>

            <span className="font-medium flex-1">{q.label}</span>

            <Input
              type="number"
              value={detail[`triwulan_${q.key.slice(-1)}`] || 0}
              onChange={(e) => handleQuarterChange(q.key, parseFloat(e.target.value) || 0)}
              className="w-40 text-right"
              disabled={readonly}
            />

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleQuarterChange(q.key, detail[`triwulan_${q.key.slice(-1)}`])}
              title="Auto-distribute merata ke 3 bulan"
              disabled={readonly}
            >
              Auto ÷
            </Button>
          </div>

          {/* Month Details (Expandable) */}
          {detail.expanded[q.key] && (
            <div className="ml-8 mt-2 space-y-2">
              {q.months.map((month) => (
                <div key={month} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-600 capitalize">
                    {month}
                  </span>
                  <Input
                    type="number"
                    value={detail[month] || 0}
                    onChange={(e) => handleMonthChange(month, parseFloat(e.target.value) || 0)}
                    className="w-40 text-right"
                    disabled={readonly}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Validation */}
      <div className="mt-3 p-2 bg-gray-50 rounded">
        <div className="flex justify-between text-sm">
          <span>Total Triwulan:</span>
          <span className={
            detail.triwulan_1 + detail.triwulan_2 + detail.triwulan_3 + detail.triwulan_4 === detail.jumlah_anggaran
              ? 'text-green-600 font-semibold'
              : 'text-red-600 font-semibold'
          }>
            {formatCurrency(
              detail.triwulan_1 + detail.triwulan_2 + detail.triwulan_3 + detail.triwulan_4
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Jumlah Anggaran:</span>
          <span className="font-semibold">
            {formatCurrency(detail.jumlah_anggaran)}
          </span>
        </div>
        {detail.triwulan_1 + detail.triwulan_2 + detail.triwulan_3 + detail.triwulan_4 === detail.jumlah_anggaran ? (
          <p className="text-xs text-green-600 mt-1">✅ Seimbang</p>
        ) : (
          <p className="text-xs text-red-600 mt-1">
            ⚠️ Selisih: {formatCurrency(
              Math.abs((detail.triwulan_1 + detail.triwulan_2 + detail.triwulan_3 + detail.triwulan_4) - detail.jumlah_anggaran)
            )}
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## 📊 Data Flow

### Create RAK Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Input                                               │
├─────────────────────────────────────────────────────────────┤
│ • Pilih Subkegiatan                                         │
│ • Sistem load pagu subkegiatan                              │
│ • User tambah kode rekening                                 │
│ • User input nilai per triwulan atau per bulan              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend Processing                                      │
├─────────────────────────────────────────────────────────────┤
│ • Auto-calculate:                                           │
│   - Sum bulan → triwulan                                    │
│   - Sum triwulan → jumlah anggaran                          │
│   - Sum semua kode rekening → total input                   │
│ • Validasi:                                                 │
│   - Total input ≤ pagu subkegiatan                          │
│   - Per kode rekening: jumlah = sum(12 bulan)               │
│ • Prepare payload untuk backend                             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API Request                                              │
├─────────────────────────────────────────────────────────────┤
│ POST /api/v1/rak                                            │
│ {                                                           │
│   "subkegiatan_id": "uuid",                                 │
│   "tahun_anggaran": 2026,                                   │
│   "total_pagu": 500000000,                                  │
│   "details": [                                              │
│     {                                                       │
│       "kode_rekening_id": "uuid",                           │
│       "jumlah_anggaran": 120000000,                         │
│       "januari": 10000000,                                  │
│       "februari": 10000000,                                 │
│       ... (12 bulan)                                        │
│     }                                                       │
│   ]                                                         │
│ }                                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Backend Processing                                       │
├─────────────────────────────────────────────────────────────┤
│ • Validasi duplicate (subkegiatan + tahun)                  │
│ • Validasi pagu (total ≤ subkegiatan.totalPagu)             │
│ • Create rak_subkegiatan record                             │
│ • For each detail:                                          │
│   - Validasi kode rekening exists                           │
│   - Validasi balance (jumlah = sum bulan)                   │
│   - Create rak_detail record                                │
│   - Database auto-calc generated columns (semester, TW)     │
│ • Return created RAK with details                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Success Response                                         │
├─────────────────────────────────────────────────────────────┤
│ • Navigate to RAK detail page                               │
│ • Show success message                                      │
│ • Display created RAK with quarterly view                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Validation Rules

### VR-001: Pagu Limit Validation

```typescript
const validatePaguLimit = (details: RakDetailInput[], paguSubkegiatan: number) => {
  const totalInput = details.reduce((sum, d) => sum + d.jumlah_anggaran, 0);

  if (totalInput > paguSubkegiatan) {
    return {
      valid: false,
      message: `Total input (${formatCurrency(totalInput)}) melebihi pagu subkegiatan (${formatCurrency(paguSubkegiatan)})`,
      excess: totalInput - paguSubkegiatan,
    };
  }

  return { valid: true };
};
```

### VR-002: Balance Validation (Per Kode Rekening)

```typescript
const validateBalance = (detail: RakDetailInput) => {
  const sumTriwulan =
    detail.triwulan_1 +
    detail.triwulan_2 +
    detail.triwulan_3 +
    detail.triwulan_4;

  const sumBulan =
    detail.januari + detail.februari + detail.maret +
    detail.april + detail.mei + detail.juni +
    detail.juli + detail.agustus + detail.september +
    detail.oktober + detail.november + detail.desember;

  // Check triwulan vs jumlah_anggaran
  if (Math.abs(sumTriwulan - detail.jumlah_anggaran) > 0.01) {
    return {
      valid: false,
      message: `Sum triwulan (${formatCurrency(sumTriwulan)}) tidak sama dengan jumlah anggaran (${formatCurrency(detail.jumlah_anggaran)})`,
    };
  }

  // Check bulan vs triwulan
  if (Math.abs(sumBulan - sumTriwulan) > 0.01) {
    return {
      valid: false,
      message: `Sum bulan (${formatCurrency(sumBulan)}) tidak sama dengan sum triwulan (${formatCurrency(sumTriwulan)})`,
    };
  }

  return { valid: true };
};
```

### VR-003: Unique Kode Rekening

```typescript
const validateUniqueKodeRekening = (details: RakDetailInput[]) => {
  const kodeRekeningIds = details.map(d => d.kode_rekening_id);
  const uniqueIds = new Set(kodeRekeningIds);

  if (uniqueIds.size !== kodeRekeningIds.length) {
    return {
      valid: false,
      message: 'Terdapat kode rekening yang duplikat',
    };
  }

  return { valid: true };
};
```

---

## 🔀 Alternative Solutions

### Alternative 1: Pure Monthly Input (Current - Discarded)

**Pros**:
- Simple implementation
- Direct mapping to database

**Cons**:
- ❌ 12 kolom terlalu banyak untuk di-input sekaligus
- ❌ User overwhelmed dengan detail
- ❌ Prone to error
- ❌ Slow data entry

**Decision**: ❌ Rejected

---

### Alternative 2: Quarterly Input Only (Simplified)

**Design**: User hanya input 4 triwulan, sistem auto-distribute merata ke 12 bulan.

**Pros**:
- ✅ Sangat simple
- ✅ Fast data entry
- ✅ Cocok untuk budget yang distributed merata

**Cons**:
- ❌ Tidak fleksibel untuk distribusi tidak merata
- ❌ User tidak bisa custom per bulan
- ❌ Tidak sesuai dengan kebutuhan real-world (budget sering tidak merata)

**Decision**: ❌ Rejected (Kurang fleksibel)

---

### Alternative 3: Quarterly with Drill-down (SELECTED) ✅

**Design**: Default view quarterly, bisa drill-down ke monthly jika perlu.

**Pros**:
- ✅ Best of both worlds: Simple + Fleksibel
- ✅ Progressive disclosure (show detail when needed)
- ✅ Support both even and uneven distribution
- ✅ Better UX: Less cognitive load

**Cons**:
- ⚠️ Slightly more complex implementation
- ⚠️ Need state management for expand/collapse

**Decision**: ✅ **SELECTED** - Paling sesuai dengan requirement

---

### Alternative 4: Spreadsheet-like Input (Excel Style)

**Design**: Import dari Excel atau inline spreadsheet editor.

**Pros**:
- ✅ Familiar untuk user yang terbiasa Excel
- ✅ Copy-paste friendly
- ✅ Bulk edit

**Cons**:
- ❌ Complex validation
- ❌ Error handling sulit
- ❌ Accessibility issues
- ❌ Tidak mobile-friendly

**Decision**: ⭕ Future consideration (Export/Import feature terpisah)

---

## 📋 Implementation Plan

### Phase 1: Core Functionality (Week 1)

**Sprint Goal**: User dapat input RAK dengan quarterly view

**Tasks**:
1. **Frontend**:
   - [ ] Create `QuarterlyBreakdown` component
   - [ ] Create `RakDetailItem` component
   - [ ] Update `RakCreate` page dengan detail input
   - [ ] Implement auto-calculate logic
   - [ ] Implement expand/collapse state
   - [ ] Add validation (client-side)

2. **Backend**:
   - [ ] Update `CreateRakDto` untuk accept details array
   - [ ] Update `RakService.create()` untuk support manual details
   - [ ] Add validation untuk pagu limit
   - [ ] Add validation untuk balance check
   - [ ] Update API documentation

3. **Testing**:
   - [ ] Unit test untuk auto-calculate functions
   - [ ] Integration test untuk create RAK with details
   - [ ] E2E test untuk user flow

**Deliverables**:
- ✅ User dapat create RAK dengan input quarterly
- ✅ User dapat drill-down ke monthly
- ✅ Validation bekerja

---

### Phase 2: UX Enhancement (Week 2)

**Sprint Goal**: Improve user experience

**Tasks**:
1. **Frontend**:
   - [ ] Add "Auto ÷" button untuk auto-distribute
   - [ ] Add visual feedback untuk validation
   - [ ] Add real-time pagu monitoring
   - [ ] Add summary panel
   - [ ] Improve error messages
   - [ ] Add loading states

2. **Features**:
   - [ ] Kode rekening selector dengan search
   - [ ] Duplicate kode rekening check
   - [ ] Copy from previous period feature
   - [ ] Save draft functionality

3. **Testing**:
   - [ ] Usability testing
   - [ ] Performance testing (1000+ kode rekening)

**Deliverables**:
- ✅ Better UX dengan visual feedback
- ✅ Faster data entry dengan shortcuts
- ✅ Draft save untuk mencegah data loss

---

### Phase 3: Advanced Features (Week 3)

**Sprint Goal**: Additional features untuk power users

**Tasks**:
1. **Features**:
   - [ ] Bulk import dari Excel
   - [ ] Export template
   - [ ] Copy from previous RAK
   - [ ] Preset distributions (merata, seasonal, dll)

2. **Optimizations**:
   - [ ] Virtual scrolling untuk large dataset
   - [ ] Debounced auto-save
   - [ ] Optimistic UI updates

**Deliverables**:
- ✅ Import/Export functionality
- ✅ Performance optimization

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('QuarterlyBreakdown', () => {
  test('should auto-distribute quarter value to 3 months equally', () => {
    const detail = createMockDetail();
    const updated = handleQuarterChange(detail, 'tw1', 30000000);

    expect(updated.januari).toBe(10000000);
    expect(updated.februari).toBe(10000000);
    expect(updated.maret).toBe(10000000);
    expect(updated.triwulan_1).toBe(30000000);
  });

  test('should handle remainder in first month', () => {
    const detail = createMockDetail();
    const updated = handleQuarterChange(detail, 'tw1', 100);

    expect(updated.januari).toBe(34); // 100/3 = 33.33 → 33 + 1 (remainder)
    expect(updated.februari).toBe(33);
    expect(updated.maret).toBe(33);
    expect(updated.triwulan_1).toBe(100);
  });

  test('should auto-sum months to quarter on month change', () => {
    const detail = createMockDetail();

    detail.januari = 15000000;
    detail.februari = 10000000;
    detail.maret = 5000000;

    const updated = recalculateQuarters(detail);
    expect(updated.triwulan_1).toBe(30000000);
  });
});
```

### Integration Tests

```typescript
describe('Create RAK API', () => {
  test('should create RAK with quarterly breakdown', async () => {
    const payload = {
      subkegiatan_id: 'valid-uuid',
      tahun_anggaran: 2026,
      total_pagu: 500000000,
      details: [
        {
          kode_rekening_id: 'uuid-1',
          jumlah_anggaran: 120000000,
          januari: 10000000,
          februari: 10000000,
          maret: 10000000,
          // ... rest of months
        },
      ],
    };

    const response = await request(app)
      .post('/api/v1/rak')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.details).toHaveLength(1);
    expect(response.body.details[0].triwulan_1).toBe(30000000);
  });

  test('should reject if total exceeds pagu', async () => {
    const payload = {
      subkegiatan_id: 'valid-uuid',
      tahun_anggaran: 2026,
      total_pagu: 100000000,
      details: [
        {
          kode_rekening_id: 'uuid-1',
          jumlah_anggaran: 150000000, // Exceeds pagu
          // ...
        },
      ],
    };

    const response = await request(app)
      .post('/api/v1/rak')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('melebihi pagu');
  });
});
```

### E2E Tests

```typescript
describe('RAK Creation User Flow', () => {
  test('user can create RAK with quarterly input', async () => {
    await page.goto('/rak/create');

    // Select subkegiatan
    await page.selectOption('#subkegiatan_id', 'uuid-subkegiatan');

    // Add kode rekening
    await page.click('button:has-text("Tambah Kode Rekening")');
    await page.selectOption('#kode_rekening_0', 'uuid-kode');

    // Input quarterly
    await page.fill('[data-testid="tw1-input"]', '30000000');

    // Verify auto-distribute
    await page.click('[data-testid="tw1-expand"]');
    expect(await page.inputValue('[data-testid="januari-input"]')).toBe('10000000');

    // Submit
    await page.click('button:has-text("Simpan")');

    // Verify success
    await expect(page).toHaveURL(/\/rak\/[a-f0-9-]+/);
  });
});
```

---

## 📊 Success Metrics

### KPI - Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Data Entry Time** | -50% vs monthly input | Time tracking |
| **Error Rate** | < 5% validation errors | Error logs |
| **User Satisfaction** | > 4/5 rating | User survey |
| **Adoption Rate** | > 80% of RAK created use quarterly | Analytics |
| **Pagu Accuracy** | 100% within pagu limit | Database query |

---

## 🚀 Next Steps

1. **Review & Approval**:
   - [ ] Review dengan Product Owner
   - [ ] Review dengan User/Stakeholder
   - [ ] Finalisasi requirement
   - [ ] Approval untuk implementasi

2. **Design Refinement**:
   - [ ] Create high-fidelity mockup
   - [ ] User testing dengan prototype
   - [ ] Finalize UI/UX design

3. **Implementation**:
   - [ ] Setup development environment
   - [ ] Kickoff meeting dengan tim
   - [ ] Sprint planning
   - [ ] Begin Phase 1 development

---

## 📝 Open Questions & Decisions Needed

### Q1: Auto-generate vs Manual Input

**Question**: Apakah fitur auto-generate dari AnggaranBelanjaRBA masih diperlukan?

**Options**:
- A. Manual input only (quarterly/monthly)
- B. Auto-generate only (from RBA)
- C. Both: User choose method saat create RAK

**Recommendation**: **Option C** - Beri pilihan kepada user
- User bisa pilih "Buat dari RBA" → Auto-generate
- Atau "Buat Manual" → Input quarterly/monthly

---

### Q2: Default Expanded or Collapsed?

**Question**: Saat pertama kali load, triwulan di-expand semua atau collapsed?

**Options**:
- A. All collapsed (show quarterly only)
- B. All expanded (show all months)
- C. First quarter expanded, rest collapsed

**Recommendation**: **Option A** - All collapsed
- Progressive disclosure
- Reduce visual clutter
- Faster initial render

---

### Q3: Save Draft Frequency

**Question**: Seberapa sering auto-save draft?

**Options**:
- A. Every input change (debounced 2 seconds)
- B. Manual save only
- C. Periodic (every 30 seconds)

**Recommendation**: **Option A** - Debounced auto-save
- Prevent data loss
- Better UX (no manual save needed)
- Use debounce to reduce server load

---

### Q4: Validation Timing

**Question**: Kapan validation dijalankan?

**Options**:
- A. On blur (saat user pindah field)
- B. On change (real-time)
- C. On submit only

**Recommendation**: **Option B** - Real-time validation
- Immediate feedback
- Prevent errors early
- Better UX

---

## 📎 Appendix

### A. Glossary

- **RAK**: Rencana Anggaran Kas
- **Triwulan (TW)**: Quarter (3 bulan)
- **Pagu**: Budget ceiling/limit
- **Kode Rekening**: Chart of Account code
- **Drill-down**: Expand untuk lihat detail level lebih rendah

### B. References

- Business Process Document: `BP-RAK-001`
- Database Schema: `docs/database/rak_schema.md`
- API Documentation: `http://localhost:3000/api-docs`

### C. Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-17 | 1.0 | Initial planning document | AI Assistant |

---

**Dokumen dibuat**: 17 Februari 2026
**Status**: DRAFT - Waiting for Review & Approval
**Next Review**: TBD
