# Struktur Kode Program-Kegiatan-Output (RBA BLUD)

**Tanggal:** 15 Februari 2026
**Versi:** 1.0
**Compliance:** Permendagri 61/2007

---

## Format Kode

### Level 1: Program
**Format:** `1.XX.XX` (3 level dengan 1 digit - 2 digit - 2 digit)

**Contoh:**
- `1.02.02` - PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN DAN UPAYA KESEHATAN MASYARAKAT
- `1.01.01` - PROGRAM PELAYANAN ADMINISTRASI PERKANTORAN
- `1.03.05` - PROGRAM PENINGKATAN MUTU PELAYANAN KESEHATAN

**Validasi:**
- Pattern: `/^\d\.\d{2}\.\d{2}$/`
- Min length: 7 karakter
- Max length: 7 karakter
- Unique per tahun anggaran

---

### Level 2: Kegiatan
**Format:** `1.XX.XX.YY` (menambah 2 digit ke kode program)

**Contoh:**
- `1.02.02.01` - Kegiatan Pelayanan Rawat Jalan
- `1.02.02.02` - Kegiatan Pelayanan Rawat Inap
- `1.02.02.03` - Kegiatan Pelayanan IGD

**Validasi:**
- Pattern: `/^\d\.\d{2}\.\d{2}\.\d{2}$/`
- Min length: 10 karakter
- Max length: 10 karakter
- Harus memiliki parent Program yang valid

---

### Level 3: Output/Komponen
**Format:** `1.XX.XX.YY.ZZZ` (menambah 3 digit ke kode kegiatan)

**Contoh:**
- `1.02.02.01.001` - Layanan Poli Umum
- `1.02.02.01.002` - Layanan Poli Anak
- `1.02.02.01.003` - Layanan Poli Gigi

**Validasi:**
- Pattern: `/^\d\.\d{2}\.\d{2}\.\d{2}\.\d{3}$/`
- Min length: 14 karakter
- Max length: 14 karakter
- Harus memiliki parent Kegiatan yang valid

---

## Hierarki Contoh Lengkap

```
1.02.02 PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN
│
├─ 1.02.02.01 Kegiatan Pelayanan Rawat Jalan
│  ├─ 1.02.02.01.001 Layanan Poli Umum
│  ├─ 1.02.02.01.002 Layanan Poli Anak
│  └─ 1.02.02.01.003 Layanan Poli Gigi
│
├─ 1.02.02.02 Kegiatan Pelayanan Rawat Inap
│  ├─ 1.02.02.02.001 Layanan Ruang Perawatan Kelas III
│  ├─ 1.02.02.02.002 Layanan Ruang Perawatan Kelas II
│  └─ 1.02.02.02.003 Layanan Ruang Perawatan Kelas I
│
└─ 1.02.02.03 Kegiatan Pelayanan IGD
   ├─ 1.02.02.03.001 Layanan Gawat Darurat Non-Bedah
   └─ 1.02.02.03.002 Layanan Gawat Darurat Bedah
```

---

## Perbedaan dengan Kode Rekening

**PENTING:** Kode Program-Kegiatan-Output **BERBEDA** dengan Kode Rekening!

### Kode Rekening (Chart of Accounts)
**Format:** `X.X.XX.XX` (4 level)

**Contoh:**
- `1.1.01.01` - Kas di Bendahara Penerimaan (Aset)
- `5.1.01.01` - Gaji PNS (Belanja)
- `4.1.01.01` - Pendapatan Jasa Layanan (Pendapatan)

### Kode Program (RBA)
**Format:** `1.XX.XX` (3 level)

**Contoh:**
- `1.02.02` - Program Pemenuhan UKP
- `1.01.01` - Program Administrasi

**Key Difference:**
- Kode Rekening: untuk **akuntansi** (debit/kredit)
- Kode Program: untuk **perencanaan anggaran** (RBA)

---

## Implementasi di Database

### Table: program_rba
```sql
CREATE TABLE program_rba (
  id UUID PRIMARY KEY,
  kode_program VARCHAR(20) NOT NULL,  -- Format: 1.XX.XX
  nama_program VARCHAR(500) NOT NULL,
  tahun INT NOT NULL,
  UNIQUE(kode_program, tahun)
);

-- Contoh data
INSERT INTO program_rba (kode_program, nama_program, tahun) VALUES
  ('1.02.02', 'PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN', 2026);
```

### Table: kegiatan_rba
```sql
CREATE TABLE kegiatan_rba (
  id UUID PRIMARY KEY,
  kode_kegiatan VARCHAR(20) NOT NULL,  -- Format: 1.XX.XX.YY
  nama_kegiatan VARCHAR(500) NOT NULL,
  program_id UUID REFERENCES program_rba(id),
  tahun INT NOT NULL
);
```

### Table: output_rba
```sql
CREATE TABLE output_rba (
  id UUID PRIMARY KEY,
  kode_output VARCHAR(20) NOT NULL,  -- Format: 1.XX.XX.YY.ZZZ
  nama_output VARCHAR(500) NOT NULL,
  kegiatan_id UUID REFERENCES kegiatan_rba(id),
  tahun INT NOT NULL
);
```

---

## Validasi di Backend (NestJS)

```typescript
// create-program-rba.dto.ts
export class CreateProgramRbaDto {
  @Matches(/^\d\.\d{2}\.\d{2}$/, {
    message: 'Format kode program harus 1.XX.XX (contoh: 1.02.02)'
  })
  kodeProgram: string;
}

// create-kegiatan-rba.dto.ts
export class CreateKegiatanRbaDto {
  @Matches(/^\d\.\d{2}\.\d{2}\.\d{2}$/, {
    message: 'Format kode kegiatan harus 1.XX.XX.YY (contoh: 1.02.02.01)'
  })
  kodeKegiatan: string;
}

// create-output-rba.dto.ts
export class CreateOutputRbaDto {
  @Matches(/^\d\.\d{2}\.\d{2}\.\d{2}\.\d{3}$/, {
    message: 'Format kode output harus 1.XX.XX.YY.ZZZ (contoh: 1.02.02.01.001)'
  })
  kodeOutput: string;
}
```

---

## Validasi di Frontend (React + Zod)

```typescript
// Program schema
const programSchema = z.object({
  kodeProgram: z
    .string()
    .regex(/^\d\.\d{2}\.\d{2}$/, 'Format kode program harus 1.XX.XX (contoh: 1.02.02)'),
});

// Kegiatan schema
const kegiatanSchema = z.object({
  kodeKegiatan: z
    .string()
    .regex(/^\d\.\d{2}\.\d{2}\.\d{2}$/, 'Format kode kegiatan harus 1.XX.XX.YY'),
});

// Output schema
const outputSchema = z.object({
  kodeOutput: z
    .string()
    .regex(/^\d\.\d{2}\.\d{2}\.\d{2}\.\d{3}$/, 'Format kode output harus 1.XX.XX.YY.ZZZ'),
});
```

---

## Business Rules

1. **Uniqueness:**
   - Kode Program unique per tahun anggaran
   - Kode Kegiatan unique per program
   - Kode Output unique per kegiatan

2. **Parent-Child Relationship:**
   - Kegiatan harus memiliki parent Program yang valid
   - Output harus memiliki parent Kegiatan yang valid
   - Tidak boleh delete Program jika masih memiliki Kegiatan
   - Tidak boleh delete Kegiatan jika masih memiliki Output

3. **Cascade Operations:**
   - Soft delete Program → cascade ke Kegiatan & Output (set isActive = false)
   - Restore Program → restore semua Kegiatan & Output

---

## FAQ

**Q: Kenapa format kode program bukan `01` saja?**
A: Format `1.XX.XX` adalah level 3 yang sudah sesuai dengan struktur APBD/APBN daerah. Level 1 adalah Urusan (1 = Urusan Kesehatan), level 2 adalah Bidang, level 3 adalah Program.

**Q: Apakah kode program bisa dimulai dari angka selain 1?**
A: Bisa, tergantung struktur APBD daerah. Tapi untuk BLUD Kesehatan, biasanya dimulai dari `1` (Urusan Kesehatan).

**Q: Apakah kode harus berurutan?**
A: Tidak wajib berurutan, tapi **sangat disarankan** untuk memudahkan pembacaan dan sorting.

**Q: Bagaimana jika ingin menambah program baru di tengah-tengah?**
A: Gunakan kode yang belum terpakai. Misal sudah ada `1.02.02`, bisa tambah `1.02.03` atau `1.02.04`.

---

## References

- Permendagri 61/2007 - Pedoman Teknis BLUD
- Permendagri 13/2006 - Pengelolaan Keuangan Daerah
- PMK 220/2016 - Sistem Akuntansi dan Pelaporan Keuangan BLUD

---

**END OF DOCUMENT**
