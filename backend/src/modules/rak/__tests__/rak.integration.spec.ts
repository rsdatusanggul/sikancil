import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../../app.module';
import { RakSubkegiatan } from '../entities/rak-subkegiatan.entity';
import { RakDetail } from '../entities/rak-detail.entity';
import { RakService } from '../services/rak.service';
import { RakValidationService } from '../services/rak-validation.service';

/**
 * RAK Module Integration Tests
 * 
 * Tests cover:
 * 1. CRUD operations
 * 2. Integration with RBA, Subkegiatan, Kode Rekening
 * 3. Validation and business rules
 * 4. Authorization and permissions
 * 5. Cash flow aggregation
 */

describe('RAK Module Integration Tests', () => {
  let app: INestApplication;
  let rakRepository: Repository<RakSubkegiatan>;
  let rakDetailRepository: Repository<RakDetail>;
  let authToken: string;
  let adminToken: string;

  // Test data
  const testUser = {
    username: 'test_user_rak',
    email: 'test_rak@example.com',
    password: 'Password123!',
    role: 'PPTK',
  };

  const testAdmin = {
    username: 'test_admin_rak',
    email: 'admin_rak@example.com',
    password: 'AdminPass123!',
    role: 'ADMIN_KEUANGAN',
  };

  const testSubkegiatan = {
    id: 'test-subkeg-001',
    kode: '1.1.1.01.001',
    uraian: 'Test Subkegiatan RAK',
    pagu: 100000000,
  };

  const testRakCreate = {
    subkegiatan_id: 'test-subkeg-001',
    tahun_anggaran: 2025,
    keterangan: 'Test RAK Integration',
  };

  const testRakDetail = {
    kode_rekening_id: 'test-kode-001',
    januari: 1000000,
    februari: 2000000,
    maret: 3000000,
    april: 4000000,
    mei: 5000000,
    juni: 6000000,
    juli: 7000000,
    agustus: 8000000,
    september: 9000000,
    oktober: 10000000,
    november: 11000000,
    desember: 12000000,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Set up global pipes and interceptors
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Get repositories
    rakRepository = app.get<Repository<RakSubkegiatan>>(
      getRepositoryToken(RakSubkegiatan),
    );
    rakDetailRepository = app.get<Repository<RakDetail>>(
      getRepositoryToken(RakDetail),
    );

    await app.init();

    // Setup test users and get tokens
    await setupTestUsers();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await rakDetailRepository.delete({});
    await rakRepository.delete({});
  });

  describe('1. RAK CRUD Operations', () => {
    describe('POST /api/rak', () => {
      it('should create a new RAK (DRAFT status)', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/rak')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testRakCreate)
          .expect(201);

        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.status).toBe('DRAFT');
        expect(response.body.data.tahun_anggaran).toBe(2025);
        expect(response.body.data.subkegiatan_id).toBe(testSubkegiatan.id);
      });

      it('should validate required fields', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/rak')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            // Missing subkegiatan_id
            tahun_anggaran: 2025,
          })
          .expect(400);

        expect(response.body.status).toBe('error');
      });

      it('should prevent duplicate RAK for same subkegiatan and tahun', async () => {
        // Create first RAK
        await request(app.getHttpServer())
          .post('/api/rak')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testRakCreate)
          .expect(201);

        // Try to create duplicate
        const response = await request(app.getHttpServer())
          .post('/api/rak')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testRakCreate)
          .expect(409);

        expect(response.body.message).toContain('sudah ada');
      });
    });

    describe('GET /api/rak', () => {
      it('should return empty array initially', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/rak')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data).toEqual([]);
      });

      it('should return list of RAKs', async () => {
        // Create test RAK
        await createTestRAK();

        const response = await request(app.getHttpServer())
          .get('/api/rak')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });

      it('should filter by tahun_anggaran', async () => {
        await createTestRAK({ tahun_anggaran: 2025 });
        await createTestRAK({ tahun_anggaran: 2026 });

        const response = await request(app.getHttpServer())
          .get('/api/rak?tahun_anggaran=2025')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.every((rak) => rak.tahun_anggaran === 2025)).toBe(true);
      });

      it('should filter by status', async () => {
        await createTestRAK({ status: 'DRAFT' });
        await createTestRAK({ status: 'APPROVED' });

        const response = await request(app.getHttpServer())
          .get('/api/rak?status=DRAFT')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.every((rak) => rak.status === 'DRAFT')).toBe(true);
      });

      it('should paginate results', async () => {
        // Create multiple RAKs
        for (let i = 0; i < 15; i++) {
          await createTestRAK({
            subkegiatan_id: `test-subkeg-${i.toString().padStart(3, '0')}`,
          });
        }

        const response = await request(app.getHttpServer())
          .get('/api/rak?page=1&limit=10')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.length).toBe(10);
        expect(response.body.meta).toHaveProperty('total');
        expect(response.body.meta.total).toBe(15);
      });
    });

    describe('GET /api/rak/:id', () => {
      it('should return RAK by ID', async () => {
        const created = await createTestRAK();

        const response = await request(app.getHttpServer())
          .get(`/api/rak/${created.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.id).toBe(created.id);
      });

      it('should include RAK details', async () => {
        const created = await createTestRAK();
        await createTestRAKDetail(created.id);

        const response = await request(app.getHttpServer())
          .get(`/api/rak/${created.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data).toHaveProperty('details');
        expect(Array.isArray(response.body.data.details)).toBe(true);
        expect(response.body.data.details.length).toBeGreaterThan(0);
      });

      it('should return 404 for non-existent RAK', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/rak/non-existent-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.status).toBe('error');
      });
    });

    describe('PATCH /api/rak/:id', () => {
      it('should update RAK when in DRAFT status', async () => {
        const created = await createTestRAK();

        const response = await request(app.getHttpServer())
          .patch(`/api/rak/${created.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            keterangan: 'Updated Keterangan',
          })
          .expect(200);

        expect(response.body.data.keterangan).toBe('Updated Keterangan');
      });

      it('should not allow update when APPROVED', async () => {
        const created = await createTestRAK({ status: 'APPROVED' });

        const response = await request(app.getHttpServer())
          .patch(`/api/rak/${created.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            keterangan: 'Should not update',
          })
          .expect(400);

        expect(response.body.message).toContain('tidak dapat diedit');
      });

      it('should update total_pagu when details change', async () => {
        const created = await createTestRAK();
        await createTestRAKDetail(created.id);

        const updateResponse = await request(app.getHttpServer())
          .patch(`/api/rak/${created.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            details: [
              {
                id: 'detail-id-1',
                januari: 5000000,
                februari: 6000000,
                maret: 7000000,
                april: 8000000,
                mei: 9000000,
                juni: 10000000,
                juli: 11000000,
                agustus: 12000000,
                september: 13000000,
                oktober: 14000000,
                november: 15000000,
                desember: 16000000,
              },
            ],
          })
          .expect(200);

        expect(updateResponse.body.data.total_pagu).toBe(117000000);
      });
    });

    describe('DELETE /api/rak/:id', () => {
      it('should delete RAK when in DRAFT status', async () => {
        const created = await createTestRAK();

        await request(app.getHttpServer())
          .delete(`/api/rak/${created.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Verify deletion
        await request(app.getHttpServer())
          .get(`/api/rak/${created.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });

      it('should not allow deletion when APPROVED', async () => {
        const created = await createTestRAK({ status: 'APPROVED' });

        await request(app.getHttpServer())
          .delete(`/api/rak/${created.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);
      });
    });
  });

  describe('2. RAK Detail Operations', () => {
    let testRak: RakSubkegiatan;

    beforeEach(async () => {
      testRak = await createTestRAK();
    });

    describe('POST /api/rak/:id/details', () => {
      it('should add RAK detail', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/details`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(testRakDetail)
          .expect(201);

        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.kode_rekening_id).toBe(testRakDetail.kode_rekening_id);
      });

      it('should validate kode_rekening exists', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/details`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...testRakDetail,
            kode_rekening_id: 'non-existent-id',
          })
          .expect(400);

        expect(response.body.message).toContain('Kode rekening');
      });

      it('should prevent duplicate kode_rekening in same RAK', async () => {
        // Add first detail
        await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/details`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(testRakDetail)
          .expect(201);

        // Try to add duplicate
        const response = await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/details`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(testRakDetail)
          .expect(409);

        expect(response.body.message).toContain('sudah ada');
      });
    });

    describe('PATCH /api/rak/:id/details/:detailId', () => {
      it('should update RAK detail', async () => {
        const detail = await createTestRAKDetail(testRak.id);

        const response = await request(app.getHttpServer())
          .patch(`/api/rak/${testRak.id}/details/${detail.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            januari: 15000000,
          })
          .expect(200);

        expect(response.body.data.januari).toBe(15000000);
      });
    });

    describe('DELETE /api/rak/:id/details/:detailId', () => {
      it('should delete RAK detail', async () => {
        const detail = await createTestRAKDetail(testRak.id);

        await request(app.getHttpServer())
          .delete(`/api/rak/${testRak.id}/details/${detail.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Verify deletion
        const getResponse = await request(app.getHttpServer())
          .get(`/api/rak/${testRak.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(getResponse.body.data.details.length).toBe(0);
      });
    });
  });

  describe('3. RAK Workflow Tests', () => {
    let testRak: RakSubkegiatan;

    beforeEach(async () => {
      testRak = await createTestRAK();
      await createTestRAKDetail(testRak.id);
    });

    describe('POST /api/rak/:id/submit', () => {
      it('should submit RAK for approval (DRAFT → SUBMITTED)', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/submit`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.status).toBe('SUBMITTED');
        expect(response.body.data).toHaveProperty('submitted_at');
      });

      it('should not submit RAK without details', async () => {
        const emptyRak = await createTestRAK();

        const response = await request(app.getHttpServer())
          .post(`/api/rak/${emptyRak.id}/submit`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.message).toContain('detail');
      });

      it('should not submit if total_pagu is zero', async () => {
        const zeroRak = await createTestRAK();
        const detail = await createTestRAKDetail(zeroRak.id);
        
        // Update detail to have zero values
        await rakDetailRepository.update(detail.id, {
          januari: 0,
          februari: 0,
          maret: 0,
          april: 0,
          mei: 0,
          juni: 0,
          juli: 0,
          agustus: 0,
          september: 0,
          oktober: 0,
          november: 0,
          desember: 0,
        });

        const response = await request(app.getHttpServer())
          .post(`/api/rak/${zeroRak.id}/submit`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.message).toContain('total pagu');
      });
    });

    describe('POST /api/rak/:id/approve', () => {
      beforeEach(async () => {
        // Submit RAK first
        await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/submit`)
          .set('Authorization', `Bearer ${authToken}`);
      });

      it('should approve RAK (SUBMITTED → APPROVED)', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/approve`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            catatan: 'Disetujui',
          })
          .expect(200);

        expect(response.body.data.status).toBe('APPROVED');
        expect(response.body.data).toHaveProperty('approved_at');
      });

      it('should only allow admin to approve', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/approve`)
          .set('Authorization', `Bearer ${authToken}`) // PPTK token
          .send({
            catatan: 'Should not approve',
          })
          .expect(403);

        expect(response.body.message).toContain('izin');
      });

      it('should not approve DRAFT RAK', async () => {
        const draftRak = await createTestRAK();

        const response = await request(app.getHttpServer())
          .post(`/api/rak/${draftRak.id}/approve`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            catatan: 'Should not approve',
          })
          .expect(400);

        expect(response.body.message).toContain('SUBMITTED');
      });
    });

    describe('POST /api/rak/:id/reject', () => {
      beforeEach(async () => {
        // Submit RAK first
        await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/submit`)
          .set('Authorization', `Bearer ${authToken}`);
      });

      it('should reject RAK (SUBMITTED → REJECTED)', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/reject`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            alasan: 'Data tidak sesuai',
          })
          .expect(200);

        expect(response.body.data.status).toBe('REJECTED');
        expect(response.body.data.alasan_reject).toBe('Data tidak sesuai');
      });

      it('should require alasan for rejection', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/rak/${testRak.id}/reject`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({})
          .expect(400);

        expect(response.body.message).toContain('alasan');
      });
    });
  });

  describe('4. Authorization Tests', () => {
    let testRak: RakSubkegiatan;

    beforeEach(async () => {
      testRak = await createTestRAK();
    });

    it('should deny access without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/rak')
        .expect(401);
    });

    it('should allow PPTK to create RAK', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/rak')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subkegiatan_id: `test-subkeg-${Date.now()}`,
          tahun_anggaran: 2025,
        })
        .expect(201);
    });

    it('should allow ADMIN to approve RAK', async () => {
      const submittedRak = await createTestRAK({ status: 'SUBMITTED' });

      const response = await request(app.getHttpServer())
        .post(`/api/rak/${submittedRak.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ catatan: 'OK' })
        .expect(200);
    });

    it('should deny PPTK from approving RAK', async () => {
      const submittedRak = await createTestRAK({ status: 'SUBMITTED' });

      const response = await request(app.getHttpServer())
        .post(`/api/rak/${submittedRak.id}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ catatan: 'Should not work' })
        .expect(403);
    });
  });

  describe('5. Cash Flow Tests', () => {
    beforeEach(async () => {
      // Create multiple RAKs for cash flow aggregation
      await createTestRAK({ subkegiatan_id: 'subkeg-1' });
      await createTestRAK({ subkegiatan_id: 'subkeg-2' });
      await createTestRAK({ subkegiatan_id: 'subkeg-3' });
    });

    describe('GET /api/rak/cash-flow', () => {
      it('should return cash flow projection', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/rak/cash-flow?tahun_anggaran=2025')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('projection');
        expect(response.body.data).toHaveProperty('summary');
      });

      it('should aggregate monthly totals', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/rak/cash-flow?tahun_anggaran=2025')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const projection = response.body.data.projection;
        expect(Array.isArray(projection)).toBe(true);
        expect(projection.length).toBe(12);
      });
    });
  });

  describe('6. Export Tests', () => {
    let testRak: RakSubkegiatan;

    beforeEach(async () => {
      testRak = await createTestRAK();
      await createTestRAKDetail(testRak.id);
    });

    describe('GET /api/rak/:id/export/pdf', () => {
      it('should generate PDF', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/rak/${testRak.id}/export/pdf`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.headers['content-type']).toContain('application/pdf');
      });
    });

    describe('GET /api/rak/:id/export/excel', () => {
      it('should generate Excel', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/rak/${testRak.id}/export/excel`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.headers['content-type']).toContain(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
      });
    });
  });

  // Helper functions
  async function setupTestUsers() {
    // Create test users (simplified - in real app, use proper auth service)
    // For now, we'll use mock tokens
    authToken = 'Bearer mock_token_for_pptk';
    adminToken = 'Bearer mock_token_for_admin';
  }

  async function cleanupTestData() {
    // Clean up test RAKs
    await rakDetailRepository.delete({});
    await rakRepository.delete({});
  }

  async function createTestRAK(overrides = {}) {
    const rakData = {
      subkegiatan_id: overrides.subkegiatan_id || testSubkegiatan.id,
      tahun_anggaran: overrides.tahun_anggaran || 2025,
      keterangan: 'Test RAK',
      status: overrides.status || 'DRAFT',
      total_pagu: overrides.total_pagu || 0,
      created_by: 'test-user',
      ...overrides,
    };

    const rak = rakRepository.create(rakData);
    return await rakRepository.save(rak);
  }

  async function createTestRAKDetail(rakId: string, overrides = {}) {
    const detailData = {
      rak_subkegiatan_id: rakId,
      kode_rekening_id: testRakDetail.kode_rekening_id,
      ...testRakDetail,
      ...overrides,
    };

    const detail = rakDetailRepository.create(detailData);
    return await rakDetailRepository.save(detail);
  }
});