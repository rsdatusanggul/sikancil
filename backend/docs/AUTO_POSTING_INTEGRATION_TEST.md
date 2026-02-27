# Auto-Posting Integration Testing Guide

## Overview
This document provides step-by-step instructions for testing the auto-posting functionality that automatically creates journal entries from transaction events.

## Prerequisites
1. Backend server running (`pnpm run start:dev`)
2. PostgreSQL database running
3. Valid JWT token for authentication

## Test Flow

### Step 1: Get Authentication Token

```bash
# Register a user (if not exists)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@sikancil.id",
    "password": "Admin123",
    "fullName": "Administrator Si-Kancil"
  }'

# Login to get token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123"
  }'

# Save the token from response
export TOKEN="your-jwt-token-here"
```

### Step 2: Create Chart of Accounts (CoA)

Before creating mapping rules, ensure you have the necessary CoA entries:

```bash
# Example: Create CoA for Kas (Cash)
curl -X POST http://localhost:3000/api/v1/accounting/coa \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "kodeRekening": "1.1.1.01.01",
    "namaRekening": "Kas di Bendahara Penerimaan",
    "level": 5,
    "parentId": null,
    "jenisRekening": "ASET",
    "kelompokLaporan": "ASET_LANCAR",
    "normalSaldo": "DEBIT"
  }'

# Example: Create CoA for Pendapatan Jasa Layanan
curl -X POST http://localhost:3000/api/v1/accounting/coa \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "kodeRekening": "4.1.1.01.01",
    "namaRekening": "Pendapatan Jasa Layanan",
    "level": 5,
    "parentId": null,
    "jenisRekening": "PENDAPATAN",
    "kelompokLaporan": "PENDAPATAN_OPERASIONAL",
    "normalSaldo": "KREDIT"
  }'

# Example: Create CoA for Hibah
curl -X POST http://localhost:3000/api/v1/accounting/coa \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "kodeRekening": "4.2.1.01.01",
    "namaRekening": "Pendapatan Hibah",
    "level": 5,
    "parentId": null,
    "jenisRekening": "PENDAPATAN",
    "kelompokLaporan": "PENDAPATAN_LAIN",
    "normalSaldo": "KREDIT"
  }'
```

### Step 3: Create Journal Mapping Rules

#### Mapping Rule for Pendapatan Jasa Layanan

```bash
curl -X POST http://localhost:3000/api/v1/accounting/journal-mappings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "PENDAPATAN_JASA_LAYANAN",
    "description": "Auto-posting untuk Pendapatan Jasa Layanan",
    "debitRules": [
      {
        "coaCode": "1.1.1.01.01",
        "description": "Kas masuk dari pendapatan jasa layanan",
        "percentage": 100,
        "isFixed": false
      }
    ],
    "creditRules": [
      {
        "coaCode": "4.1.1.01.01",
        "description": "Pendapatan Jasa Layanan",
        "percentage": 100,
        "isFixed": false
      }
    ],
    "isActive": true,
    "priority": 1
  }'
```

#### Mapping Rule for Hibah Uang

```bash
curl -X POST http://localhost:3000/api/v1/accounting/journal-mappings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "HIBAH_UANG",
    "description": "Auto-posting untuk Penerimaan Hibah Uang",
    "debitRules": [
      {
        "coaCode": "1.1.1.01.01",
        "description": "Kas masuk dari hibah",
        "percentage": 100,
        "isFixed": false
      }
    ],
    "creditRules": [
      {
        "coaCode": "4.2.1.01.01",
        "description": "Pendapatan Hibah",
        "percentage": 100,
        "isFixed": false
      }
    ],
    "isActive": true,
    "priority": 1
  }'
```

### Step 4: Test Auto-Posting for Pendapatan Operasional

Create a Pendapatan Operasional transaction and verify journal auto-creation:

```bash
# Create Pendapatan Operasional
curl -X POST http://localhost:3000/api/v1/pendapatan-operasional \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorBukti": "BKM/2024/01/0001",
    "tanggal": "2024-01-15",
    "uraian": "Pendapatan Rawat Inap Januari 2024",
    "jumlah": 5000000,
    "sumberDana": "BLUD",
    "jenisPenjamin": "BPJS"
  }'

# Check server logs - you should see:
# [AutoPostingService] Auto-posting for transaction created: PENDAPATAN_JASA_LAYANAN - {id}
# [AutoPostingService] Journal created: JU/2024/01/0001 for PENDAPATAN_JASA_LAYANAN
# [AutoPostingService] Journal auto-posted: JU/2024/01/0001

# List journals to verify auto-created entry
curl -X GET "http://localhost:3000/api/v1/accounting/journals?sourceType=PENDAPATAN_JASA_LAYANAN" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 5: Test Auto-Posting for Hibah

```bash
# Create Hibah Uang
curl -X POST http://localhost:3000/api/v1/hibah \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomorHibah": "HIB/2024/001",
    "nomorSKHibah": "SK/001/2024",
    "tanggalSKHibah": "2024-01-10",
    "namaPemberiHibah": "Pemerintah Provinsi",
    "uraianHibah": "Hibah untuk pengembangan fasilitas kesehatan",
    "jenisHibah": "UANG",
    "nilaiHibah": 10000000,
    "kategoriHibah": "TIDAK_TERIKAT"
  }'

# Verify journal auto-creation
curl -X GET "http://localhost:3000/api/v1/accounting/journals?sourceType=HIBAH_UANG" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 6: Test Update Transaction (Auto-Reversal)

```bash
# Update Pendapatan (save the ID from Step 4)
curl -X PATCH http://localhost:3000/api/v1/pendapatan-operasional/{PENDAPATAN_ID} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jumlah": 5500000,
    "uraian": "Pendapatan Rawat Inap Januari 2024 - Updated"
  }'

# Check server logs - you should see:
# [AutoPostingService] Reversed journal JU/2024/01/0001 due to transaction update
# [AutoPostingService] New journal created after update: JU/2024/01/0002
# [AutoPostingService] New journal auto-posted: JU/2024/01/0002

# List journals to verify reversal and new entry
curl -X GET "http://localhost:3000/api/v1/accounting/journals" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 7: Test Delete Transaction (Auto-Reversal)

```bash
# Delete Pendapatan
curl -X DELETE http://localhost:3000/api/v1/pendapatan-operasional/{PENDAPATAN_ID} \
  -H "Authorization: Bearer $TOKEN"

# Check server logs - you should see:
# [AutoPostingService] Reversed journal JU/2024/01/0002 due to transaction deletion

# Verify reversal journal created
curl -X GET "http://localhost:3000/api/v1/accounting/journals" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 8: Test Manual Auto-Posting API

```bash
# Manually trigger auto-posting (for testing or re-posting)
curl -X POST http://localhost:3000/api/v1/accounting/auto-posting/manual \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceType": "PENDAPATAN_JASA_LAYANAN",
    "sourceId": "test-source-id-123",
    "transactionData": {
      "tanggal": "2024-01-20",
      "uraian": "Test Manual Auto-Posting",
      "jumlah": 1000000
    }
  }'
```

### Step 9: Test Mapping Rule Preview

```bash
# Test mapping rule with sample amount (get MAPPING_RULE_ID from Step 3)
curl -X POST "http://localhost:3000/api/v1/accounting/journal-mappings/{MAPPING_RULE_ID}/test" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testAmount": 1000000
  }'

# Response shows preview of journal entries that would be created
```

## Verification Checklist

- [ ] CoA entries created successfully
- [ ] Mapping rules created and active
- [ ] Pendapatan Operasional creation triggers journal auto-posting
- [ ] Journal entry has correct debit/credit amounts
- [ ] Journal entry is automatically posted (status: POSTED)
- [ ] Updating transaction creates reversal journal and new journal
- [ ] Deleting transaction creates reversal journal
- [ ] Manual auto-posting API works correctly
- [ ] Test mapping rule preview shows correct amounts

## Expected Journal Entry Structure

For a Pendapatan of Rp 5,000,000:

```
JU/2024/01/0001
Date: 2024-01-15
Description: Auto-posting untuk Pendapatan Jasa Layanan - Pendapatan Rawat Inap Januari 2024

Details:
┌────────────────┬──────────────────────────────────────┬───────────┬───────────┐
│ Kode Rekening  │ Nama Rekening                        │ Debit     │ Kredit    │
├────────────────┼──────────────────────────────────────┼───────────┼───────────┤
│ 1.1.1.01.01    │ Kas di Bendahara Penerimaan          │ 5,000,000 │         0 │
│ 4.1.1.01.01    │ Pendapatan Jasa Layanan              │         0 │ 5,000,000 │
├────────────────┼──────────────────────────────────────┼───────────┼───────────┤
│ TOTAL          │                                      │ 5,000,000 │ 5,000,000 │
└────────────────┴──────────────────────────────────────┴───────────┴───────────┘

Status: POSTED
Source Type: PENDAPATAN_JASA_LAYANAN
Source ID: {pendapatan-id}
```

## Troubleshooting

### Journal not created automatically
1. Check if mapping rule exists and is active
2. Verify sourceType matches exactly
3. Check server logs for errors
4. Ensure CoA codes in mapping rule exist

### Journal amounts incorrect
1. Verify percentage rules add up to 100%
2. Check if using fixed amounts vs percentages correctly
3. Test mapping rule with `/test` endpoint

### Journal not balanced
1. Check debit and credit rules sum to 100%
2. Verify no rounding errors in calculations
3. Check mapping rule configuration

## Notes

- Auto-posting happens asynchronously via events
- Journals are posted immediately after creation
- Reversal journals swap debit/credit amounts
- Each transaction can only have one active journal
- Mapping rules can be updated without affecting existing journals

## Next Steps

After successful integration testing:
1. Proceed to Week 3: General Ledger auto-update
2. Implement Trial Balance generation
3. Create reporting and export functionality
4. Build frontend UI for monitoring auto-posted journals
