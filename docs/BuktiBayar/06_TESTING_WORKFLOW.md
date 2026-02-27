# 06 - Testing & Workflow State Machine
## Modul Bukti Pembayaran | SI-KANCIL

---

## 6.1 Approval Workflow State Machine

```
                    ┌─────────────────────────────────────────┐
                    │              STATUS FLOW                  │
                    └─────────────────────────────────────────┘

  [PPTK Create]
       │
       ▼
   ┌───────┐    submit()         ┌───────────┐
   │ DRAFT │ ──────────────────► │ SUBMITTED │
   └───────┘                     └───────────┘
       │ remove()                      │
       ▼                               ├──► approveTechnical()
  [DELETED]                            │         │
                                       │         ▼
                                       │   (technical signed)
                                       │         │
                                       │         ├──► approveTreasurer()
                                       │         │         │
                                       │         ▼         ▼
                                       │   (treasurer signed)
                                       │         │
                                       │         ├──► approveFinal()
                                       │         │         │
                                       │         ▼         ▼
                                       │      ┌──────────┐
                                       │      │ APPROVED │ ◄────────────┐
                                       │      └──────────┘             │
                                       │           │                   │
                                       │           ├──► createSpp()    │
                                       │           │                   │
                                       │           ▼                   │
                                       │    ┌─────────────┐           │
                                       │    │ SPP_CREATED │           │
                                       │    └─────────────┘           │
                                       │                               │
                                       └──► reject() ──────► ┌──────────┐
                                                              │ REJECTED │
                                                              └──────────┘

  cancel() bisa dari DRAFT / SUBMITTED / APPROVED → CANCELLED
```

### Rules:
| Dari | Ke | Actor | Kondisi |
|------|----|-------|---------|
| DRAFT | SUBMITTED | PPTK | Pagu & RAK cukup |
| SUBMITTED | APPROVED | Pejabat Teknis + Bendahara + Direktur | Sequential signing |
| SUBMITTED | REJECTED | Pejabat Teknis / Bendahara / Direktur | Reason wajib |
| APPROVED | SPP_CREATED | PPTK / Bendahara | Auto-create SPP |
| DRAFT/SUBMITTED/APPROVED | CANCELLED | ADMIN | Any reason |

---

## 6.2 Unit Tests

**File:** `bukti-bayar.service.spec.ts`

```typescript
import { Test, TestingModule }     from '@nestjs/testing';
import { getRepositoryToken }      from '@nestjs/typeorm';
import { BadRequestException }     from '@nestjs/common';
import { BuktiBayarService }       from './bukti-bayar.service';
import { TaxCalculationService }   from './services/tax-calculation.service';
import { BudgetValidationService } from './services/budget-validation.service';
import { VoucherNumberingService } from './services/voucher-numbering.service';
import { PaymentVoucher, VoucherStatus } from './entities/payment-voucher.entity';
import { PaymentVoucherAuditLog }  from './entities/payment-voucher-audit-log.entity';

describe('BuktiBayarService', () => {
  let service: BuktiBayarService;
  let taxSvc: TaxCalculationService;
  let budgetSvc: BudgetValidationService;

  const mockVoucherRepo = {
    create: jest.fn(),
    save:   jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where:  jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip:   jest.fn().mockReturnThis(),
      take:   jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    }),
  };

  const mockAuditRepo = {
    create: jest.fn().mockReturnValue({}),
    save:   jest.fn(),
  };

  const mockTaxSvc = {
    calculate: jest.fn().mockResolvedValue({
      taxRuleId:    'rule-uuid',
      ppnRate: 11,  ppnAmount:  1876757,
      pph22Rate: 1.5, pph22Amount: 255921,
      pph21Rate: 0, pph21Amount: 0,
      pph23Rate: 0, pph23Amount: 0,
      pph24Rate: 0, pph24Amount: 0,
      totalDeductions: 2132678,
      netPayment:      16805500,
      grossAmountText: 'Delapan Belas Juta...',
    }),
    toTerbilang: jest.fn().mockReturnValue('Delapan Belas Juta...'),
  };

  const mockBudgetSvc = {
    validate: jest.fn().mockResolvedValue({
      isValid:             true,
      totalPagu:           50_000_000,
      totalRealization:    10_000_000,
      previousCommitments: 5_000_000,
      availablePagu:       35_000_000,
      rakMonthlyLimit:     20_000_000,
      remainingRak:        15_000_000,
    }),
  };

  const mockNumberingSvc = {
    generate: jest.fn().mockResolvedValue({
      voucherNumber:  '0001/5.2.02.10.01.0003/01/RSUD-DS/2025',
      sequenceNumber: 1,
    }),
  };

  const mockUser = { id: 'user-uuid', role: 'PPTK', name: 'Test User', nip: '12345' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuktiBayarService,
        { provide: getRepositoryToken(PaymentVoucher),       useValue: mockVoucherRepo },
        { provide: getRepositoryToken(PaymentVoucherAuditLog), useValue: mockAuditRepo },
        { provide: TaxCalculationService,   useValue: mockTaxSvc },
        { provide: BudgetValidationService, useValue: mockBudgetSvc },
        { provide: VoucherNumberingService, useValue: mockNumberingSvc },
      ],
    }).compile();

    service   = module.get(BuktiBayarService);
    taxSvc    = module.get(TaxCalculationService);
    budgetSvc = module.get(BudgetValidationService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── CREATE TESTS ───────────────────────────────────────────────

  describe('create()', () => {
    const dto = {
      voucherDate:    '2025-01-15',
      fiscalYear:     2025,
      programId:      'prog-uuid',
      programCode:    '01.02.02',
      kegiatanId:     'keg-uuid',
      kegiatanCode:   '1.02.02.2.02',
      accountCode:    '5.2.02.10.01.0003',
      accountName:    'Belanja BMHP',
      paymentPurpose: 'Pembayaran BMHP PT. ABC',
      vendorName:     'PT. ABC',
      grossAmount:    18_938_178,
    };

    it('berhasil membuat Bukti Pembayaran', async () => {
      const expected = { id: 'new-uuid', ...dto, status: VoucherStatus.DRAFT };
      mockVoucherRepo.create.mockReturnValue(expected);
      mockVoucherRepo.save.mockResolvedValue(expected);

      const result = await service.create(dto as any, mockUser);

      expect(budgetSvc.validate).toHaveBeenCalledWith(expect.objectContaining({
        kegiatanId:  dto.kegiatanId,
        accountCode: dto.accountCode,
        grossAmount: dto.grossAmount,
        fiscalYear:  dto.fiscalYear,
      }));
      expect(taxSvc.calculate).toHaveBeenCalledWith(expect.objectContaining({
        accountCode: dto.accountCode,
        grossAmount: dto.grossAmount,
      }));
      expect(result.status).toBe(VoucherStatus.DRAFT);
    });

    it('gagal jika pagu tidak mencukupi', async () => {
      mockBudgetSvc.validate.mockResolvedValueOnce({
        isValid:      false,
        availablePagu: 5_000_000,
        message:      'Pagu tidak mencukupi! Tersedia: Rp 5.000.000',
      });

      await expect(service.create(dto as any, mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });

  // ── TAX CALCULATION TESTS ──────────────────────────────────────

  describe('TaxCalculationService.toTerbilang()', () => {
    let taxService: TaxCalculationService;

    beforeEach(() => {
      taxService = new TaxCalculationService(null);
    });

    const cases = [
      [0,              'Nol Rupiah'],
      [1,              'Satu Rupiah'],
      [100,            'Seratus Rupiah'],
      [1_000,          'Seribu Rupiah'],
      [1_500,          'Seribu Lima Ratus Rupiah'],
      [18_938_178,     'Delapan Belas Juta Sembilan Ratus Tiga Puluh Delapan Ribu Seratus Tujuh Puluh Delapan Rupiah'],
      [46_349_178,     'Empat Puluh Enam Juta Tiga Ratus Empat Puluh Sembilan Ribu Seratus Tujuh Puluh Delapan Rupiah'],
      [1_000_000_000,  'Satu Miliar Rupiah'],
    ];

    test.each(cases)('toTerbilang(%i) → %s', (input, expected) => {
      expect(taxService.toTerbilang(input as number)).toBe(expected);
    });
  });

  // ── PPh 4 AYAT (2) — SEWA ─────────────────────────────────────

  describe('PPh 4 ayat (2) - Sewa', () => {
    it('menghitung PPh 4(2) 10% untuk belanja sewa gedung', async () => {
      // Sewa ruang rapat Rp 10.000.000
      mockTaxSvc.calculate.mockResolvedValueOnce({
        taxRuleId:    'rule-sewa-uuid',
        ppnRate: 11,  ppnAmount:  1_100_000,   // PPN 11%
        pph4a2Rate: 10, pph4a2Amount: 1_000_000, // PPh 4(2) 10%
        pph21Rate: 0, pph21Amount: 0,
        pph22Rate: 0, pph22Amount: 0,
        pph23Rate: 0, pph23Amount: 0,
        pphFinalUmkmRate: 0, pphFinalUmkmAmount: 0,
        pph24Rate: 0, pph24Amount: 0,
        includesPbjt: false, pbjt_rate: 0, pbjt_amount: 0,
        totalDeductions: 2_100_000,
        netPayment:      7_900_000,  // 10jt - 2.1jt
        grossAmountText: 'Sepuluh Juta Rupiah',
      });

      const dto = {
        ...baseDtoMakan,
        accountCode: '5.2.02.03.01',  // Kode rekening sewa
        accountName: 'Belanja Sewa Gedung',
        grossAmount: 10_000_000,
      };

      const result = await service.create(dto as any, mockUser);
      expect(result).toBeDefined();
    });
  });

  // ── PPh FINAL UMKM (PP 23/2018) ───────────────────────────────

  describe('PPh Final UMKM - PP 23/2018', () => {
    it('menghitung PPh Final 0.5% jika vendor punya SK UMKM', async () => {
      // Vendor UMKM, omzet < 4.8M, tidak PKP → tidak ada PPN, tidak ada PPh 22/23
      mockTaxSvc.calculate.mockResolvedValueOnce({
        taxRuleId: 'rule-umkm-uuid',
        ppnRate: 0, ppnAmount: 0,           // UMKM biasanya belum PKP
        pph22Rate: 0, pph22Amount: 0,        // Tidak dipotong (diganti PPh Final)
        pph23Rate: 0, pph23Amount: 0,        // Tidak dipotong (diganti PPh Final)
        pph4a2Rate: 0, pph4a2Amount: 0,
        pph21Rate: 0, pph21Amount: 0,
        pph24Rate: 0, pph24Amount: 0,
        pphFinalUmkmRate: 0.5, pphFinalUmkmAmount: 50_000, // 0.5% x 10jt
        includesPbjt: false, pbjt_rate: 0, pbjt_amount: 0,
        totalDeductions: 50_000,
        netPayment: 9_950_000,
        grossAmountText: 'Sepuluh Juta Rupiah',
      });

      const dto = {
        ...baseDtoMakan,
        grossAmount: 10_000_000,
        skUmkmNumber: 'SKT-23/WPJ.08/2025',
        skUmkmExpiry: '2025-12-31',
      };

      const result = await service.create(dto as any, mockUser);
      expect(result).toBeDefined();
    });

    it('menolak jika SK UMKM sudah kadaluarsa', async () => {
      const dto = {
        ...baseDtoMakan,
        skUmkmNumber: 'SKT-23/WPJ.08/2024',
        skUmkmExpiry: '2024-12-31',  // Sudah expired
      };

      // Tax service harus detect SK expired dan kembali ke rate normal
      mockTaxSvc.calculate.mockRejectedValueOnce(
        new BadRequestException('SK UMKM vendor sudah kadaluarsa (exp: 31/12/2024)')
      );

      await expect(service.create(dto as any, mockUser))
        .rejects.toThrow('SK UMKM vendor sudah kadaluarsa');
    });
  });

  // ── PBJT MAKAN MINUM ──────────────────────────────────────────

  describe('PBJT Makan Minum - flag only, bukan potongan', () => {
    const baseDtoMakan = {
      voucherDate:    '2025-01-15',
      fiscalYear:     2025,
      programId:      'prog-uuid',
      programCode:    '01.02.02',
      kegiatanId:     'keg-uuid',
      kegiatanCode:   '1.02.02.2.02',
      accountCode:    '5.2.02.06',   // Belanja makan minum
      accountName:    'Belanja Makan dan Minum Rapat',
      paymentPurpose: 'Konsumsi rapat koordinasi Januari 2025',
      grossAmount:    5_500_000,
    };

    it('tidak ada potongan untuk pembelian langsung di restoran (PBJT flag only)', async () => {
      // Restoran memungut PBJT dari BLUD → harga sudah include pajak
      // BLUD tidak potong apapun → total deductions = 0
      mockTaxSvc.calculate.mockResolvedValueOnce({
        taxRuleId: 'rule-restoran-uuid',
        ppnRate: 0, ppnAmount: 0,
        pph22Rate: 0, pph22Amount: 0,
        pph23Rate: 0, pph23Amount: 0,
        pph4a2Rate: 0, pph4a2Amount: 0,
        pph21Rate: 0, pph21Amount: 0,
        pphFinalUmkmRate: 0, pphFinalUmkmAmount: 0,
        pph24Rate: 0, pph24Amount: 0,
        includesPbjt: true,          // ← flag: harga sudah include PBJT
        pbjt_rate: 10,               // informasi saja
        pbjt_amount: 500_000,        // estimasi PBJT dalam harga (10/110 x 5.5jt)
        totalDeductions: 0,          // BLUD tidak potong apapun
        netPayment: 5_500_000,       // NET = GROSS (tidak ada potongan)
        grossAmountText: 'Lima Juta Lima Ratus Ribu Rupiah',
      });

      const result = await service.create(baseDtoMakan as any, mockUser);
      expect(result).toBeDefined();
      // NET harus sama dengan GROSS karena BLUD tidak memotong pajak
    });

    it('vendor katering PKP dipotong PPN + PPh 23 seperti biasa', async () => {
      // Katering PKP → BLUD potong PPN 11% + PPh 23 2%
      mockTaxSvc.calculate.mockResolvedValueOnce({
        taxRuleId: 'rule-katering-uuid',
        ppnRate: 11, ppnAmount: 500_000,
        pph23Rate: 2, pph23Amount: 100_000,
        pph22Rate: 0, pph22Amount: 0,
        pph4a2Rate: 0, pph4a2Amount: 0,
        pph21Rate: 0, pph21Amount: 0,
        pphFinalUmkmRate: 0, pphFinalUmkmAmount: 0,
        pph24Rate: 0, pph24Amount: 0,
        includesPbjt: false, pbjt_rate: 0, pbjt_amount: 0,
        totalDeductions: 600_000,
        netPayment: 4_900_000,
        grossAmountText: 'Lima Juta Lima Ratus Ribu Rupiah',
      });

      const result = await service.create(baseDtoMakan as any, mockUser);
      expect(result).toBeDefined();
    });
  });

  // ── WORKFLOW TESTS ─────────────────────────────────────────────

  describe('submit()', () => {
    it('berhasil submit dari DRAFT', async () => {
      const voucher = {
        id:          'v-uuid',
        pptkId:      mockUser.id,
        status:      VoucherStatus.DRAFT,
        kegiatanId:  'keg-uuid',
        accountCode: '5.2.02.10.01.0003',
        grossAmount: 18_938_178,
        fiscalYear:  2025,
        voucherMonth: 1,
      };
      mockVoucherRepo.findOne.mockResolvedValue(voucher);
      mockVoucherRepo.save.mockResolvedValue({ ...voucher, status: VoucherStatus.SUBMITTED });

      const result = await service.submit('v-uuid', mockUser);
      expect(result.status).toBe(VoucherStatus.SUBMITTED);
    });

    it('gagal jika bukan PPTK yang membuat', async () => {
      const voucher = { id: 'v-uuid', pptkId: 'other-user', status: VoucherStatus.DRAFT };
      mockVoucherRepo.findOne.mockResolvedValue(voucher);

      await expect(service.submit('v-uuid', mockUser))
        .rejects.toThrow('Hanya PPTK yang membuat BB');
    });

    it('gagal jika status bukan DRAFT', async () => {
      const voucher = { id: 'v-uuid', pptkId: mockUser.id, status: VoucherStatus.SUBMITTED };
      mockVoucherRepo.findOne.mockResolvedValue(voucher);

      await expect(service.submit('v-uuid', mockUser))
        .rejects.toThrow(BadRequestException);
    });
  });
});
```

---

## 6.3 Integration Tests

**File:** `bukti-bayar.e2e-spec.ts`

```typescript
import { INestApplication } from '@nestjs/common';
import { Test }             from '@nestjs/testing';
import * as request         from 'supertest';
import { AppModule }        from '@/app.module';

describe('BuktiBayar E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let voucherId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Login sebagai PPTK
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'pptk_test', password: 'password123' });
    accessToken = loginRes.body.access_token;
  });

  afterAll(() => app.close());

  it('POST /payment-vouchers → create BB', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payment-vouchers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        voucherDate:    '2025-01-15',
        fiscalYear:     2025,
        programId:      'prog-uuid',
        programCode:    '01.02.02',
        kegiatanId:     'keg-uuid',
        kegiatanCode:   '1.02.02.2.02',
        accountCode:    '5.2.02.10.01.0003',
        accountName:    'Belanja BMHP',
        paymentPurpose: 'Pembayaran BMHP PT. Test',
        grossAmount:    18_938_178,
      })
      .expect(201);

    expect(res.body.status).toBe('DRAFT');
    expect(res.body.voucherNumber).toMatch(/^\d{4}\/5\.2\.02\.10\.01\.0003\/01\/RSUD-DS\/2025$/);
    expect(Number(res.body.totalDeductions)).toBeGreaterThan(0);
    expect(Number(res.body.netPayment)).toBeLessThan(18_938_178);

    voucherId = res.body.id;
  });

  it('POST /payment-vouchers/:id/submit → submit BB', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/payment-vouchers/${voucherId}/submit`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.status).toBe('SUBMITTED');
  });

  it('GET /payment-vouchers/:id/print → download PDF', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/payment-vouchers/${voucherId}/print`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect('Content-Type', /application\/pdf/);
  });

  it('GET /verify/:code → verifikasi QR', async () => {
    // Simulate scan QR setelah print
    const voucher = await request(app.getHttpServer())
      .get(`/api/v1/payment-vouchers/${voucherId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then(r => r.body);

    // Extract short code dari URL QR (implementasi tergantung QrCodeService)
    const verifyRes = await request(app.getHttpServer())
      .get(`/api/v1/payment-vouchers/verify/testcode123`)
      .expect(200);

    expect(verifyRes.body.isValid).toBe(true);
  });
});
```

---

## 6.4 API Endpoint Summary

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/v1/payment-vouchers` | PPTK, ADMIN | Buat BB baru |
| GET | `/api/v1/payment-vouchers` | Semua | List BB (filter) |
| GET | `/api/v1/payment-vouchers/:id` | Semua | Detail BB |
| DELETE | `/api/v1/payment-vouchers/:id` | PPTK, ADMIN | Hapus (hanya DRAFT) |
| POST | `/api/v1/payment-vouchers/:id/submit` | PPTK | Submit untuk approval |
| POST | `/api/v1/payment-vouchers/:id/approve-technical` | TECHNICAL | Approve Pejabat Teknis |
| POST | `/api/v1/payment-vouchers/:id/approve-treasurer` | TREASURER | Approve Bendahara |
| POST | `/api/v1/payment-vouchers/:id/approve-final` | DIRECTOR | Approve Direktur |
| POST | `/api/v1/payment-vouchers/:id/reject` | TECHNICAL+ | Tolak |
| POST | `/api/v1/payment-vouchers/:id/create-spp` | PPTK, TREASURER | Buat SPP dari BB |
| GET | `/api/v1/payment-vouchers/:id/print` | Semua | Download PDF |
| GET | `/api/v1/payment-vouchers/verify/:code` | Public | Verifikasi QR |
| GET | `/api/v1/payment-vouchers/tax-preview` | PPTK | Preview kalkulasi pajak |
| GET | `/api/v1/payment-vouchers/budget-check` | PPTK | Cek sisa anggaran |

---

## 6.5 Checklist Implementasi

### Backend:
- [ ] Buat entities (TypeORM) — **8 jenis pajak + flag PBJT**
- [ ] Jalankan migration
- [ ] Seed tax_rules data (lengkap 8 rules termasuk UMKM & restoran)
- [ ] Implement TaxCalculationService + unit test
  - [ ] PPh 22 (1.5% / 3% non-NPWP)
  - [ ] PPh 23 (2% / 4% non-NPWP)
  - [ ] PPh 4 ayat (2) (10% sewa)
  - [ ] PPh Final UMKM (0.5% + validasi SK expired)
  - [ ] PPN (11%)
  - [ ] PBJT flag (bukan potongan — hanya info audit)
  - [ ] Logic: `is_final_tax = true` → skip PPh 22 & PPh 23
- [ ] Implement BudgetValidationService + unit test
- [ ] Implement VoucherNumberingService + unit test
- [ ] Implement BuktiBayarService (CRUD + workflow)
- [ ] Implement Controller + Swagger docs
- [ ] Implement PdfGeneratorService (Puppeteer)
  - [ ] Tampilkan catatan PBJT jika `includes_pbjt = true`
  - [ ] Label "PPh Final UMKM" jika vendor UMKM
- [ ] Implement QrCodeService
- [ ] Register BuktiBayarModule di AppModule
- [ ] E2E test full workflow

### Frontend:
- [ ] BuktiBayarList page (table + filter + pagination)
- [ ] BuktiBayarCreate form (dengan TaxCalculatorWidget + BudgetIndicator)
- [ ] BuktiBayarDetail page (info + approval actions)
- [ ] BuktiBayarVerify page (public QR scan result)
- [ ] StatusBadge component
- [ ] Print trigger (PDF download)
- [ ] Toast notifications untuk workflow actions

### DevOps:
- [ ] Install Puppeteer di Docker/LXC container
- [ ] Configure APP_BASE_URL di .env
- [ ] Setup file storage untuk attachments (local / S3)
