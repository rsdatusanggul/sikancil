# 🚀 Deployment Checklist - RAK Module

## 📋 Overview

Dokumen ini berisi checklist lengkap untuk deployment RAK Module ke production, termasuk pre-deployment preparation, migration sequence, rollback procedure, dan post-deployment validation.

---

## 📅 Deployment Timeline

```
┌─────────────────────────────────────────────────────────┐
│ DEPLOYMENT PHASES                                       │
├─────────────────────────────────────────────────────────┤
│ Phase 1: Pre-Deployment (D-7 to D-1)                    │
│ Phase 2: Database Migration (D-Day, 00:00 - 02:00)      │
│ Phase 3: Backend Deployment (D-Day, 02:00 - 04:00)      │
│ Phase 4: Frontend Deployment (D-Day, 04:00 - 05:00)     │
│ Phase 5: Validation & Testing (D-Day, 05:00 - 08:00)    │
│ Phase 6: Go-Live (D-Day, 08:00)                         │
│ Phase 7: Post-Deployment Monitoring (D+1 to D+7)        │
└─────────────────────────────────────────────────────────┘
```

**Recommended Deployment Window:**
- **Day:** Saturday (weekend, minimal user activity)
- **Time:** 00:00 - 08:00 WIB
- **Duration:** 8 hours (with buffer)

---

## 📝 PHASE 1: Pre-Deployment (D-7 to D-1)

### **D-7: Code Freeze & Final Review**

- [ ] **Code Review Complete**
  - All PRs reviewed and approved
  - No pending critical bugs
  - Code coverage >= 80%

- [ ] **Documentation Review**
  - API documentation updated (Swagger)
  - User guide completed
  - Technical documentation reviewed

- [ ] **Security Audit**
  - No critical vulnerabilities (dependency check)
  - SQL injection prevention verified
  - Authentication/Authorization tested

---

### **D-5: Staging Deployment & UAT**

- [ ] **Deploy to Staging**
  - Database migration on staging
  - Backend deployment on staging
  - Frontend deployment on staging

- [ ] **UAT (User Acceptance Testing)**
  - BLUD expert validation
  - Finance team testing
  - PPTK workflow testing
  - SIPD export format validation

- [ ] **Performance Testing**
  - Load testing (100 concurrent users)
  - RAK matrix load time < 2 seconds
  - Export PDF/Excel < 5 seconds
  - Database query performance

---

### **D-3: Production Preparation**

- [ ] **Database Backup**
  ```bash
  # Full database backup
  pg_dump -h localhost -U postgres -d sikancil_prod > \
    backup_sikancil_$(date +%Y%m%d_%H%M%S).sql
  
  # Verify backup
  pg_restore --list backup_sikancil_*.sql | head -20
  
  # Upload to secure storage
  aws s3 cp backup_sikancil_*.sql s3://sikancil-backups/
  ```

- [ ] **Environment Variables**
  ```bash
  # Production .env file
  DATABASE_URL=postgresql://...
  REDIS_URL=redis://...
  JWT_SECRET=...
  
  # Feature flags
  ENABLE_RAK_MODULE=true
  RAK_APPROVAL_WORKFLOW=true
  ```

- [ ] **Infrastructure Check**
  - Database connections available
  - Redis cache working
  - File storage accessible
  - CDN configured

---

### **D-1: Final Verification**

- [ ] **Team Readiness**
  - [ ] Database Engineer (on-call)
  - [ ] Backend Developer (on-call)
  - [ ] Frontend Developer (on-call)
  - [ ] DevOps Engineer (on-call)
  - [ ] QA Engineer (on-call)

- [ ] **Rollback Plan Prepared**
  - Rollback scripts tested on staging
  - Rollback time estimate: ~30 minutes
  - Communication plan ready

- [ ] **User Communication**
  - [ ] Maintenance notice sent (email)
  - [ ] System banner activated
  - [ ] Support team briefed

---

## 🗄️ PHASE 2: Database Migration (00:00 - 02:00)

### **Step 1: Enable Maintenance Mode** (00:00)

```bash
# Set maintenance mode
redis-cli SET system:maintenance true
redis-cli SET system:maintenance_message "Sistem sedang maintenance. Kembali jam 08:00 WIB"

# Verify
curl https://sikancil.rsds.id/health
# Should return: { "status": "maintenance" }
```

---

### **Step 2: Backup Current Database** (00:05)

```bash
# Create backup
pg_dump -h prod-db.rsds.id -U sikancil -d sikancil_prod \
  --format=custom \
  --file=backup_before_rak_migration_$(date +%Y%m%d_%H%M%S).dump

# Verify backup size
ls -lh backup_*.dump

# Upload to S3
aws s3 cp backup_*.dump s3://sikancil-backups/migrations/
```

- [ ] Backup completed successfully
- [ ] Backup size verified (> 0 bytes)
- [ ] Backup uploaded to S3

---

### **Step 3: Run Migration Scripts** (00:10)

```bash
# Connect to production database
psql -h prod-db.rsds.id -U sikancil -d sikancil_prod

# Run migration (in transaction)
BEGIN;

-- 1. Create tables
\i migrations/01_create_rak_tables.sql

-- 2. Create indexes
\i migrations/02_create_rak_indexes.sql

-- 3. Create views
\i migrations/03_create_rak_views.sql

-- 4. Create triggers
\i migrations/04_create_rak_triggers.sql

-- Verify
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('rak_subkegiatan', 'rak_detail');

-- If all OK, commit
COMMIT;

-- If error, rollback
-- ROLLBACK;
```

**Migration Checklist:**
- [ ] Tables created: `rak_subkegiatan`, `rak_detail`
- [ ] Indexes created (9 indexes)
- [ ] Views created (3 views)
- [ ] Triggers created (3 triggers)
- [ ] No errors in migration log

---

### **Step 4: Validate Migration** (00:30)

```sql
-- Check table structure
\d rak_subkegiatan
\d rak_detail

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('rak_subkegiatan', 'rak_detail');

-- Check constraints
SELECT conname, contype FROM pg_constraint 
WHERE conrelid IN ('rak_subkegiatan'::regclass, 'rak_detail'::regclass);

-- Test insert (sample data)
INSERT INTO rak_subkegiatan (
  subkegiatan_id, 
  tahun_anggaran, 
  total_pagu, 
  created_by
) VALUES (
  (SELECT id FROM subkegiatan LIMIT 1),
  2025,
  1000000,
  (SELECT id FROM users WHERE role = 'ADMIN_KEUANGAN' LIMIT 1)
) RETURNING id;

-- Test view
SELECT * FROM v_rak_summary LIMIT 1;

-- Clean up test data
DELETE FROM rak_subkegiatan WHERE tahun_anggaran = 2025;
```

**Validation Checklist:**
- [ ] All tables accessible
- [ ] All indexes present
- [ ] All constraints working
- [ ] Sample insert successful
- [ ] Views returning data
- [ ] Triggers executing

---

## 🔧 PHASE 3: Backend Deployment (02:00 - 04:00)

### **Step 1: Build Backend** (02:00)

```bash
# On deployment server
cd /opt/sikancil/backend

# Pull latest code
git fetch origin
git checkout v1.5.0-rak-module  # Release tag
git pull origin v1.5.0-rak-module

# Install dependencies
pnpm install --frozen-lockfile

# Build
pnpm build

# Run tests
pnpm test

# Verify build
ls -lh dist/
```

- [ ] Code pulled successfully
- [ ] Dependencies installed
- [ ] Build completed without errors
- [ ] All tests passed

---

### **Step 2: Update Environment** (02:15)

```bash
# Update .env file
nano .env

# Add new variables
ENABLE_RAK_MODULE=true
RAK_EXPORT_PATH=/var/www/sikancil/exports
RAK_MAX_MATRIX_ROWS=100

# Verify
source .env
echo $ENABLE_RAK_MODULE
```

- [ ] Environment variables updated
- [ ] No sensitive data exposed

---

### **Step 3: Deploy Backend** (02:20)

```bash
# Stop current instance
pm2 stop sikancil-api

# Copy new build
cp -r dist/* /var/www/sikancil/api/

# Start with new code
pm2 start sikancil-api
pm2 save

# Monitor logs
pm2 logs sikancil-api --lines 100
```

**Health Check:**
```bash
# Wait 30 seconds for startup
sleep 30

# Check health endpoint
curl http://localhost:3000/health
# Expected: { "status": "ok", "version": "1.5.0" }

# Check RAK endpoints
curl http://localhost:3000/api/rak
# Expected: { "data": [], "meta": {...} }
```

- [ ] Backend started successfully
- [ ] Health check passing
- [ ] RAK endpoints responding
- [ ] No errors in logs

---

## 🎨 PHASE 4: Frontend Deployment (04:00 - 05:00)

### **Step 1: Build Frontend** (04:00)

```bash
# On deployment server
cd /opt/sikancil/frontend

# Pull latest code
git fetch origin
git checkout v1.5.0-rak-module
git pull origin v1.5.0-rak-module

# Install dependencies
pnpm install --frozen-lockfile

# Build for production
pnpm build

# Verify build
ls -lh dist/
du -sh dist/
```

- [ ] Code pulled successfully
- [ ] Dependencies installed
- [ ] Build completed
- [ ] Build size reasonable (< 5MB)

---

### **Step 2: Deploy Frontend** (04:15)

```bash
# Backup current version
mv /var/www/sikancil/public /var/www/sikancil/public.backup

# Copy new build
cp -r dist/* /var/www/sikancil/public/

# Set permissions
chown -R www-data:www-data /var/www/sikancil/public
chmod -R 755 /var/www/sikancil/public

# Clear CDN cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"
```

**Verification:**
```bash
# Check index.html
curl https://sikancil.rsds.id/ | grep "version"

# Check RAK route
curl https://sikancil.rsds.id/rak | grep "RAK"
```

- [ ] Frontend deployed successfully
- [ ] Static files accessible
- [ ] CDN cache cleared
- [ ] No 404 errors

---

## ✅ PHASE 5: Validation & Testing (05:00 - 08:00)

### **Smoke Tests** (05:00)

```bash
# Run automated smoke tests
cd /opt/sikancil/tests
pnpm test:smoke -- --env=production

# Test scenarios:
# 1. User login
# 2. Navigate to RAK page
# 3. Create RAK
# 4. Submit RAK
# 5. Approve RAK
# 6. Export PDF
```

**Manual Testing Checklist:**

- [ ] **Authentication**
  - [ ] Login works
  - [ ] Logout works
  - [ ] Session persists

- [ ] **RAK List Page**
  - [ ] List loads correctly
  - [ ] Filters work
  - [ ] Pagination works
  - [ ] Status badges display

- [ ] **RAK Create**
  - [ ] Form validation works
  - [ ] Subkegiatan dropdown loads
  - [ ] Matrix input works
  - [ ] Auto-calculate works
  - [ ] Save successful

- [ ] **RAK Edit**
  - [ ] Can edit DRAFT RAK
  - [ ] Cannot edit APPROVED RAK
  - [ ] Changes persist

- [ ] **RAK Workflow**
  - [ ] Submit works
  - [ ] Approve works
  - [ ] Reject works
  - [ ] Notifications sent

- [ ] **RAK Export**
  - [ ] PDF export works
  - [ ] Excel export works
  - [ ] Format is correct (SIPD)

- [ ] **Cash Flow View**
  - [ ] Chart displays
  - [ ] Data is accurate
  - [ ] Filters work

---

### **Integration Tests** (05:30)

- [ ] **With RBA Module**
  - [ ] RAK validates against RBA pagu
  - [ ] Cannot create RAK if RBA not approved

- [ ] **With Realisasi Module**
  - [ ] Variance calculates correctly
  - [ ] Alerts show when > 90%

- [ ] **With Laporan Module**
  - [ ] LRA shows RAK vs Realisasi
  - [ ] Data is consistent

---

### **Performance Tests** (06:00)

```bash
# Load testing with Artillery
artillery run load-test-rak.yml

# Expected results:
# - p95 response time < 2000ms
# - Error rate < 1%
# - Throughput > 50 req/sec
```

- [ ] Load test passed
- [ ] No memory leaks
- [ ] Database connections stable
- [ ] Redis cache working

---

### **Security Tests** (06:30)

- [ ] **Authorization**
  - [ ] PPTK can create RAK
  - [ ] PPTK cannot approve own RAK
  - [ ] Verifikator can approve
  - [ ] Guest cannot access

- [ ] **Data Validation**
  - [ ] SQL injection prevented
  - [ ] XSS prevented
  - [ ] CSRF token validated

---

## 🎉 PHASE 6: Go-Live (08:00)

### **Step 1: Disable Maintenance Mode** (08:00)

```bash
# Remove maintenance mode
redis-cli DEL system:maintenance
redis-cli DEL system:maintenance_message

# Verify
curl https://sikancil.rsds.id/health
# Should return: { "status": "ok" }
```

---

### **Step 2: User Communication** (08:00)

**Send Email:**
```
Subject: 🎉 Fitur Baru: RAK & Cash Flow Planning

Dear Tim Keuangan,

Sistem Si-Kancil telah diupdate dengan fitur baru:
✅ RAK (Rencana Anggaran Kas) per Subkegiatan
✅ Cash Flow Planning & Monitoring
✅ Export format SIPD

Silakan login dan coba fitur baru di menu "RAK & Cash Flow".

Panduan lengkap: https://docs.sikancil.rsds.id/rak

Terima kasih,
Tim Si-Kancil
```

**Update System Banner:**
```bash
redis-cli SET system:announcement "🎉 Fitur baru RAK tersedia! Lihat menu RAK & Cash Flow"
```

---

### **Step 3: Monitor Initial Usage** (08:00 - 12:00)

```bash
# Monitor logs
pm2 logs sikancil-api --lines 200

# Monitor errors
tail -f /var/log/sikancil/error.log

# Monitor performance
pm2 monit

# Monitor database
psql -h prod-db.rsds.id -U sikancil -d sikancil_prod -c "
  SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  WHERE tablename LIKE 'rak%'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

**Monitoring Checklist:**
- [ ] No critical errors in logs
- [ ] Response time < 2s
- [ ] Memory usage stable
- [ ] Database queries optimized
- [ ] No user complaints

---

## 📊 PHASE 7: Post-Deployment Monitoring (D+1 to D+7)

### **Daily Checks (D+1 to D+7)**

**Day 1:**
- [ ] Review error logs
- [ ] Check user activity (how many RAK created)
- [ ] Monitor performance metrics
- [ ] Collect user feedback

**Day 3:**
- [ ] Review performance trends
- [ ] Check database growth
- [ ] Optimize slow queries
- [ ] Update documentation based on feedback

**Day 7:**
- [ ] Deployment retrospective meeting
- [ ] Document lessons learned
- [ ] Plan for next iteration
- [ ] Close deployment ticket

---

## 🔄 Rollback Procedure

**If critical issues found, execute rollback:**

### **Step 1: Activate Maintenance Mode**
```bash
redis-cli SET system:maintenance true
```

### **Step 2: Rollback Database**
```bash
# Drop new tables
psql -h prod-db.rsds.id -U sikancil -d sikancil_prod <<EOF
BEGIN;
DROP TABLE IF EXISTS rak_detail CASCADE;
DROP TABLE IF EXISTS rak_subkegiatan CASCADE;
DROP VIEW IF EXISTS v_rak_summary CASCADE;
DROP VIEW IF EXISTS v_cash_flow_monthly CASCADE;
DROP VIEW IF EXISTS v_rak_detail_with_realisasi CASCADE;
COMMIT;
EOF

# Or restore from backup
pg_restore -h prod-db.rsds.id -U sikancil -d sikancil_prod \
  --clean --if-exists \
  backup_before_rak_migration_*.dump
```

### **Step 3: Rollback Backend**
```bash
# Checkout previous version
cd /opt/sikancil/backend
git checkout v1.4.0  # Previous stable version

# Rebuild
pnpm install
pnpm build

# Restart
pm2 restart sikancil-api
```

### **Step 4: Rollback Frontend**
```bash
# Restore backup
rm -rf /var/www/sikancil/public
mv /var/www/sikancil/public.backup /var/www/sikancil/public

# Clear CDN
aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
```

### **Step 5: Verify Rollback**
```bash
# Check system health
curl https://sikancil.rsds.id/health

# Test basic functionality
# (manual testing)
```

### **Step 6: Disable Maintenance**
```bash
redis-cli DEL system:maintenance
```

**Rollback Time Estimate:** 30-45 minutes

---

## 📋 Final Checklist

### **Pre-Go-Live:**
- [ ] All deployment phases completed
- [ ] All tests passed
- [ ] No critical bugs
- [ ] Team ready for support
- [ ] Rollback plan tested

### **Go-Live:**
- [ ] Maintenance mode disabled
- [ ] Users notified
- [ ] Monitoring active
- [ ] Support team ready

### **Post-Go-Live:**
- [ ] No critical errors (24 hours)
- [ ] Performance acceptable
- [ ] Users satisfied
- [ ] Documentation complete
- [ ] Deployment retrospective scheduled

---

## 📞 Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Project Manager | [Name] | +62xxx | pm@rsds.id |
| Tech Lead | [Name] | +62xxx | tech@rsds.id |
| Database Engineer | [Name] | +62xxx | dba@rsds.id |
| DevOps Engineer | [Name] | +62xxx | devops@rsds.id |
| BLUD Expert | [Name] | +62xxx | blud@rsds.id |

---

## 📄 Deployment Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | _________ | _________ | __/__/__ |
| Tech Lead | _________ | _________ | __/__/__ |
| Database Engineer | _________ | _________ | __/__/__ |
| QA Lead | _________ | _________ | __/__/__ |
| Client Representative | _________ | _________ | __/__/__ |

---

**Deployment Owner:** DevOps Team  
**Prepared Date:** 2025-02-17  
**Target Deployment:** 2025-03-01 (Saturday, 00:00 - 08:00 WIB)  
**Status:** ✅ Ready for Execution
