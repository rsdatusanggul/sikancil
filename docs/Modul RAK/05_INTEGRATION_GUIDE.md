# 🔗 Integration Guide - RAK Module

## 📋 Overview

Dokumen ini menjelaskan bagaimana RAK Module terintegrasi dengan modules lain di Si-Kancil, termasuk data flow, business rules, dan testing strategy.

---

## 🔄 Module Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                    RAK MODULE                           │
│         (Rencana Anggaran Kas & Cash Flow)              │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
    ┌────────┐ ┌──────┐ ┌────────────┐
    │  RBA   │ │ Sub  │ │    Kode    │
    │ Mgmt   │ │ Keg  │ │  Rekening  │
    └────────┘ └──────┘ └────────────┘
         │         │         │
         │         │         │
         ▼         ▼         ▼
    ┌──────────────────────────────┐
    │   Realisasi Belanja          │
    └──────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │   Laporan Keuangan (LRA)     │
    └──────────────────────────────┘
```

---

## 🔗 Integration Points

### **1. RBA Management (Upstream)**

RAK dibuat **SETELAH** RBA approved dan DPA diterbitkan.

**Data Flow:**
```
RBA → Program → Kegiatan → Subkegiatan → RAK
```

**Business Rules:**
- ✅ RAK hanya bisa dibuat untuk Subkegiatan yang sudah punya pagu di RBA
- ✅ `rak.total_pagu` <= `subkegiatan.pagu`
- ✅ Sum of all RAK per tahun <= Total RBA tahun tersebut
- ✅ Perubahan RBA (revisi) memerlukan update RAK

**Integration Code:**

```typescript
// Service: RakService
async validateAgainstRBA(subkegiatanId: string, tahun: number, totalPagu: number) {
  // 1. Get subkegiatan with RBA
  const subkegiatan = await this.subkegiatanService.findOne(subkegiatanId);
  
  // 2. Validate pagu
  if (totalPagu > subkegiatan.pagu) {
    throw new BadRequestException(
      `Total pagu RAK (${totalPagu}) melebihi pagu subkegiatan (${subkegiatan.pagu})`
    );
  }
  
  // 3. Check RBA status
  const rba = await this.rbaService.findByTahun(tahun);
  if (rba.status !== 'APPROVED') {
    throw new BadRequestException('RBA belum approved');
  }
  
  return true;
}
```

---

### **2. Subkegiatan (Core Dependency)**

RAK adalah turunan **langsung** dari Subkegiatan.

**Relationship:**
```sql
-- One-to-Many: One Subkegiatan has many RAK (per tahun, per revision)
subkegiatan (1) ─── (N) rak_subkegiatan
```

**Business Rules:**
- ✅ Satu Subkegiatan bisa punya multiple RAK (beda tahun)
- ✅ Per tahun, hanya 1 RAK aktif (bisa multiple revisions)
- ✅ Delete Subkegiatan → CASCADE check (prevent if has approved RAK)

**Integration Code:**

```typescript
// Hook when creating RAK
async beforeCreate(createRakDto: CreateRakDto) {
  // Validate subkegiatan exists
  const subkegiatan = await this.subkegiatanService.findOne(
    createRakDto.subkegiatan_id
  );
  
  if (!subkegiatan) {
    throw new NotFoundException('Subkegiatan tidak ditemukan');
  }
  
  // Check if RAK already exists for this tahun
  const existing = await this.rakRepo.findOne({
    where: {
      subkegiatan_id: createRakDto.subkegiatan_id,
      tahun_anggaran: createRakDto.tahun_anggaran,
      status: Not(In(['REJECTED'])) // Ignore rejected
    }
  });
  
  if (existing) {
    throw new ConflictException('RAK sudah ada untuk tahun ini');
  }
}
```

---

### **3. Kode Rekening (Detail Dependency)**

RAK Detail merinci anggaran **per Kode Rekening**.

**Relationship:**
```sql
-- Many-to-One: Many RAK Details reference one Kode Rekening
rak_detail (N) ─── (1) kode_rekening
```

**Business Rules:**
- ✅ Hanya kode rekening level 6 (detail) yang bisa digunakan
- ✅ Kode rekening harus aktif (not deleted)
- ✅ Kode rekening harus tipe "Belanja" (5.x.x.x)

**Integration Code:**

```typescript
// Validation before adding RAK detail
async validateKodeRekening(kodeRekeningId: string) {
  const kodeRekening = await this.kodeRekeningService.findOne(kodeRekeningId);
  
  // Check level
  if (kodeRekening.level !== 6) {
    throw new BadRequestException('Hanya kode rekening level 6 yang bisa digunakan');
  }
  
  // Check tipe (must be Belanja)
  if (!kodeRekening.kode.startsWith('5.')) {
    throw new BadRequestException('Kode rekening harus tipe Belanja (5.x.x.x)');
  }
  
  // Check active
  if (kodeRekening.deleted_at) {
    throw new BadRequestException('Kode rekening tidak aktif');
  }
  
  return true;
}
```

---

### **4. Realisasi Belanja (Downstream)**

RAK digunakan untuk **monitoring** realisasi vs rencana.

**Data Flow:**
```
RAK (Rencana) ←→ Realisasi Belanja (Actual)
```

**Business Rules:**
- ✅ Realisasi tidak boleh > RAK (dengan toleransi)
- ✅ Alert jika realisasi > 90% RAK per bulan
- ✅ Dashboard menampilkan variance RAK vs Realisasi

**Integration Code:**

```typescript
// View: Compare RAK vs Realisasi
CREATE OR REPLACE VIEW v_rak_vs_realisasi AS
SELECT 
  rd.id,
  rd.rak_subkegiatan_id,
  rs.tahun_anggaran,
  rs.subkegiatan_id,
  rd.kode_rekening_id,
  kr.kode,
  kr.uraian,
  
  -- RAK (Planned)
  rd.januari AS rak_jan,
  rd.februari AS rak_feb,
  -- ... other months
  
  -- Realisasi (Actual) - JOIN with realisasi_belanja
  COALESCE(rb.januari, 0) AS real_jan,
  COALESCE(rb.februari, 0) AS real_feb,
  -- ... other months
  
  -- Variance
  (COALESCE(rb.januari, 0) - rd.januari) AS var_jan,
  -- ... other months
  
  -- Percentage
  CASE 
    WHEN rd.januari > 0 THEN (COALESCE(rb.januari, 0) / rd.januari * 100)
    ELSE 0 
  END AS pct_jan
  -- ... other months
  
FROM rak_detail rd
JOIN rak_subkegiatan rs ON rd.rak_subkegiatan_id = rs.id
JOIN kode_rekening kr ON rd.kode_rekening_id = kr.id
LEFT JOIN realisasi_belanja rb ON 
  rb.subkegiatan_id = rs.subkegiatan_id 
  AND rb.kode_rekening_id = rd.kode_rekening_id
  AND rb.tahun = rs.tahun_anggaran
WHERE rs.status = 'APPROVED';
```

**Service Method:**

```typescript
// Get RAK vs Realisasi comparison
async getComparison(rakId: string, bulan?: number) {
  const query = `
    SELECT * FROM v_rak_vs_realisasi 
    WHERE rak_subkegiatan_id = $1
  `;
  
  const result = await this.db.query(query, [rakId]);
  
  // Add alerts
  return result.map(row => ({
    ...row,
    alerts: this.generateAlerts(row, bulan),
  }));
}

private generateAlerts(row: any, bulan?: number) {
  const alerts = [];
  
  const months = ['jan', 'feb', 'mar', ...]; // 12 months
  
  months.forEach((m, idx) => {
    if (bulan && idx + 1 !== bulan) return;
    
    const pctKey = `pct_${m}`;
    const percentage = row[pctKey];
    
    if (percentage > 100) {
      alerts.push({
        month: m,
        level: 'error',
        message: `Realisasi ${m} melebihi RAK (${percentage.toFixed(2)}%)`,
      });
    } else if (percentage > 90) {
      alerts.push({
        month: m,
        level: 'warning',
        message: `Realisasi ${m} hampir mencapai RAK (${percentage.toFixed(2)}%)`,
      });
    }
  });
  
  return alerts;
}
```

---

### **5. Cash Flow Projection (Internal)**

RAK Detail **auto-aggregate** ke Cash Flow Summary.

**Data Flow:**
```
RAK Detail (Micro) → Aggregate → Cash Flow (Macro)
```

**Integration Code:**

```typescript
// Service: CashFlowService
async getCashFlowProjection(tahun: number) {
  // Aggregate from approved RAK
  const result = await this.db.query(`
    SELECT 
      tahun_anggaran,
      SUM(total_januari) as total_jan,
      SUM(total_februari) as total_feb,
      -- ... other months
      SUM(total_januari + total_februari + ... + total_desember) as total_year
    FROM v_cash_flow_monthly
    WHERE tahun_anggaran = $1
    GROUP BY tahun_anggaran
  `, [tahun]);
  
  // Calculate monthly balance
  const projection = this.calculateMonthlyBalance(result[0]);
  
  // Add alerts for negative cash flow
  return {
    ...projection,
    alerts: this.detectDeficit(projection),
  };
}

private calculateMonthlyBalance(data: any) {
  const months = ['jan', 'feb', 'mar', ...];
  let runningBalance = 0; // Assume starting balance from previous year
  
  const balances = months.map(month => {
    const pengeluaran = data[`total_${month}`];
    const penerimaan = 0; // TODO: Get from pendapatan projection
    
    runningBalance = runningBalance + penerimaan - pengeluaran;
    
    return {
      month,
      penerimaan,
      pengeluaran,
      balance: runningBalance,
    };
  });
  
  return balances;
}
```

---

### **6. Laporan Keuangan (Downstream)**

RAK data digunakan dalam **LRA (Laporan Realisasi Anggaran)**.

**Business Rules:**
- ✅ LRA menampilkan kolom: Anggaran (RAK) vs Realisasi
- ✅ RAK yang approved menjadi baseline untuk variance analysis

**Integration Code:**

```typescript
// LRA Report Service
async generateLRA(tahun: number, periode: number) {
  const data = await this.db.query(`
    SELECT 
      kr.kode,
      kr.uraian,
      
      -- Anggaran from RAK
      COALESCE(SUM(rd.jumlah_anggaran), 0) as anggaran,
      
      -- Realisasi from transaksi
      COALESCE(SUM(rb.total), 0) as realisasi,
      
      -- Variance
      (COALESCE(SUM(rb.total), 0) - COALESCE(SUM(rd.jumlah_anggaran), 0)) as selisih,
      
      -- Percentage
      CASE 
        WHEN COALESCE(SUM(rd.jumlah_anggaran), 0) > 0 
        THEN (COALESCE(SUM(rb.total), 0) / COALESCE(SUM(rd.jumlah_anggaran), 0) * 100)
        ELSE 0
      END as persentase
      
    FROM kode_rekening kr
    LEFT JOIN rak_detail rd ON kr.id = rd.kode_rekening_id
    LEFT JOIN rak_subkegiatan rs ON rd.rak_subkegiatan_id = rs.id AND rs.tahun_anggaran = $1
    LEFT JOIN realisasi_belanja rb ON kr.id = rb.kode_rekening_id AND rb.tahun = $1
    WHERE kr.kode LIKE '5.%'  -- Belanja only
    GROUP BY kr.id, kr.kode, kr.uraian
    ORDER BY kr.kode
  `, [tahun]);
  
  return data;
}
```

---

## 🔄 Data Synchronization

### **Scenario 1: RBA Revision → Update RAK**

When RBA is revised, affected RAK must be flagged.

```typescript
// Event listener in RBAService
async onRBARevised(rbaId: string) {
  // Get affected subkegiatan
  const subkegiatan = await this.getSubkegiatanByRBA(rbaId);
  
  // Find all approved RAK for these subkegiatan
  const affectedRAK = await this.rakRepo.find({
    where: {
      subkegiatan_id: In(subkegiatan.map(s => s.id)),
      status: 'APPROVED',
    },
  });
  
  // Create notification
  for (const rak of affectedRAK) {
    await this.notificationService.create({
      type: 'RAK_NEEDS_REVISION',
      message: `RBA telah direvisi. RAK perlu direview.`,
      target_id: rak.id,
      priority: 'high',
    });
  }
}
```

---

### **Scenario 2: RAK Approved → Unlock Pencairan**

When RAK is approved, enable SP2D creation.

```typescript
// Event listener in RakService
async onRakApproved(rakId: string) {
  const rak = await this.findOne(rakId);
  
  // Update status flag
  await this.subkegiatanRepo.update(
    { id: rak.subkegiatan_id },
    { 
      rak_approved: true,
      rak_approved_at: new Date(),
    }
  );
  
  // Emit event for SPP/SPM module
  this.eventEmitter.emit('rak.approved', {
    subkegiatan_id: rak.subkegiatan_id,
    tahun: rak.tahun_anggaran,
    total_pagu: rak.total_pagu,
  });
}
```

---

## 🧪 Integration Testing Strategy

### **Test Cases:**

```typescript
describe('RAK Integration Tests', () => {
  describe('With RBA Module', () => {
    it('should prevent RAK creation if RBA not approved', async () => {
      // Given: RBA in DRAFT status
      const rba = await createRBA({ status: 'DRAFT' });
      
      // When: Try to create RAK
      const result = rakService.create({
        subkegiatan_id: rba.subkegiatan[0].id,
        tahun_anggaran: 2025,
        total_pagu: 100000,
      });
      
      // Then: Should throw error
      await expect(result).rejects.toThrow('RBA belum approved');
    });
    
    it('should validate total_pagu against subkegiatan.pagu', async () => {
      // Given: Subkegiatan with pagu 100000
      const subkegiatan = await createSubkegiatan({ pagu: 100000 });
      
      // When: Try to create RAK with pagu 150000
      const result = rakService.create({
        subkegiatan_id: subkegiatan.id,
        total_pagu: 150000,
      });
      
      // Then: Should throw error
      await expect(result).rejects.toThrow('melebihi pagu subkegiatan');
    });
  });
  
  describe('With Realisasi Module', () => {
    it('should calculate variance correctly', async () => {
      // Given: RAK with plan
      const rak = await createRAK({
        details: [
          { kode_rekening_id: 'xxx', januari: 1000000 }
        ],
      });
      
      // And: Realisasi exists
      await createRealisasi({
        kode_rekening_id: 'xxx',
        januari: 900000,
      });
      
      // When: Get comparison
      const comparison = await rakService.getComparison(rak.id);
      
      // Then: Should show correct variance
      expect(comparison[0].var_jan).toBe(-100000);
      expect(comparison[0].pct_jan).toBe(90);
    });
  });
  
  describe('Cash Flow Aggregation', () => {
    it('should aggregate multiple RAK into cash flow', async () => {
      // Given: Multiple RAK
      await createRAK({ total_pagu: 1000000 });
      await createRAK({ total_pagu: 2000000 });
      
      // When: Get cash flow
      const cashFlow = await cashFlowService.getProjection(2025);
      
      // Then: Should sum correctly
      expect(cashFlow.total_year).toBe(3000000);
    });
  });
});
```

---

## 📊 Integration Checklist

### **Pre-Integration:**
- [ ] All dependent modules (RBA, Subkegiatan, Kode Rekening) are deployed
- [ ] Database views created
- [ ] Event emitters configured
- [ ] Webhooks/listeners registered

### **Integration Testing:**
- [ ] RAK creation with RBA validation
- [ ] RAK detail with Kode Rekening validation
- [ ] RAK approval workflow
- [ ] Cash flow aggregation
- [ ] Variance calculation with Realisasi
- [ ] LRA report generation

### **Post-Integration:**
- [ ] Monitor event logs
- [ ] Verify data consistency
- [ ] Check performance metrics
- [ ] User acceptance testing

---

**Integration Owner:** Tech Lead  
**Review Date:** 2025-02-17  
**Status:** ✅ Ready for Implementation
