# Visual Template - Panduan Pembuatan Frontend

Dokumen ini berisi panduan visual dan styling untuk pembuatan frontend Si-Kancil.

---

## 📋 Table of Contents

- [1. Tabel](#1-tabel)
- [2. Typography & Font](#2-typography--font)
- [3. Color Scheme](#3-color-scheme)
- [4. Component Guidelines](#4-component-guidelines)
- [5. Dark Mode Support](#5-dark-mode-support)

---

## 1. Tabel

### 1.1 Struktur Tabel Standar

Tabel harus mengikuti struktur berikut:

```tsx
<Table>
  <TableHeader className="bg-gray-100 dark:bg-gray-950">
    <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
      <TableHead className="text-base dark:text-gray-300">Kolom 1</TableHead>
      <TableHead className="text-base dark:text-gray-300">Kolom 2</TableHead>
      <!-- ... kolom lainnya -->
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
      <TableCell>Konten 1</TableCell>
      <TableCell>Konten 2</TableCell>
      <!-- ... baris lainnya -->
    </TableRow>
  </TableBody>
</Table>
```

### 1.2 Header Tabel

**Background:**
- Light mode: `bg-gray-100`
- Dark mode: `dark:bg-gray-950`

**Text Styling:**
- Font size: `text-base` (16px)
- Font weight: `font-medium` (dari TableHead default)
- Text color (dark mode): `dark:text-gray-300`

**Contoh:**
```tsx
<TableHead className="text-base dark:text-gray-300">Judul Kolom</TableHead>
```

### 1.3 Body Tabel

**Background:**
- Light mode: `bg-background` (putih)
- Dark mode: `dark:bg-background` (≈ gray-950, dari CSS variable)

**Text Styling:**
- Font size: `text-sm` (14px) untuk body, `text-base` (16px) untuk header
- Font weight: `font-medium` untuk primary text, tanpa class untuk secondary text
- Text color:
  - Primary: `text-gray-100 dark:text-gray-50`
  - Secondary: `text-gray-600 dark:text-gray-400`

**Contoh:**
```tsx
<TableRow className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
  <TableCell className="font-medium">{data.primary}</TableCell>
  <TableCell>
    <div className="font-medium text-gray-100 dark:text-gray-50">{data.nama}</div>
    <div className="text-sm text-gray-600 dark:text-gray-400">{data.deskripsi}</div>
  </TableCell>
</TableRow>
```

### 1.4 Pagination / Footer Tabel

**Background:**
- Light mode: `bg-gray-50`
- Dark mode: `dark:bg-gray-950`

**Border:**
- Light mode: `border-t`
- Dark mode: `dark:border-gray-700`

**Contoh:**
```tsx
<div className="px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-950">
  <Pagination ... />
</div>
```

### 1.5 Perbedaan Tabel Kegiatan RBA vs COA

| Element | Kegiatan RBA | COA |
|---------|--------------|------|
| **Header Font Size** | `text-sm` (14px) | `text-base` (16px) ⭐ |
| **Header Background (Dark)** | `gray-800` | `gray-950` ⭐ |
| **Body Background (Light)** | - | `bg-background` ⭐ |
| **Body Background (Dark)** | - | `gray-900` |
| **Font Family** | Sans-serif | Sans-serif (konsisten) ⭐ |
| **Kolom Kode** | Standard | Tanpa `font-mono` ⭐ |
| **Badge Style** | `Badge variant="secondary"` | Custom dengan color-coded ⭐ |

---

## 2. Typography & Font

### 2.1 Font Family

**Primary Font:** Satoshi

**Font Stack:**
```javascript
fontFamily: {
  sans: ['Satoshi', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
}
```

**Import Font:**
```css
@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap');
```

**Global Application:**
```css
html, body {
  @apply bg-background text-foreground font-sans;
}
```

### 2.2 Font Size Hierarchy

| Element | Font Size | Font Weight | Keterangan |
|---------|-----------|-------------|-------------|
| **H1 / Page Title** | `text-2xl` (24px) | `font-bold` (700) |
| **H2 / Section Title** | `text-xl` (20px) | `font-bold` (700) |
| **Tabel Header** | `text-base` (16px) | `font-medium` (500) |
| **Body Text** | `text-base` (16px) | `font-normal` (400) |
| **Tabel Body** | `text-sm` (14px) | `font-medium` (500) untuk primary |
| **Sidebar Menu** | `text-base` (16px) | `font-normal` / `font-semibold` |
| **Secondary Text** | `text-sm` (14px) | `font-normal` (400) |
| **Label / Caption** | `text-xs` (12px) | `font-normal` (400) |

### 2.3 Font Weight Mapping

**Available Weights ( dari CSS import):**
- `400` (normal) - body text, deskripsi, label
- `500` (medium) - header, primary text, nama
- `700` (bold) - heading, button, emphasis

**Penggunaan:**
```tsx
// Normal
<p className="text-base">Body text</p>

// Medium
<p className="font-medium">Important text</p>

// Bold
<h1 className="text-2xl font-bold">Page Title</h1>
```

### 2.4 Font Family Exception

**Monospace Font (hanya untuk kasus khusus):**
- CAPTCHA: `Fira Mono, monospace`
- Kode rekening: TIDAK menggunakan monospace, pakai font-sans saja

**Contoh Salah:**
```tsx
<TableCell className="font-mono font-medium">{kodeRekening}</TableCell> // ❌
```

**Contoh Benar:**
```tsx
<TableCell className="font-medium">{kodeRekening}</TableCell> // ✅
```

---

## 3. Color Scheme

### 3.1 Light Mode

| Element | Background | Text Color |
|---------|-------------|------------|
| **Main Layout** | `bg-background` (white) | `text-foreground` |
| **Card / Filter** | `bg-white` | - |
| **Table Header** | `bg-gray-100` | `text-gray-950` (atau `text-base` dengan default) |
| **Table Body** | `bg-background` (white) | - |
| **Pagination** | `bg-gray-50` | - |
| **Border** | `border` (default) | - |

### 3.2 Dark Mode

| Element | Background | Text Color |
|---------|-------------|------------|
| **Main Layout** | `bg-background` (≈ gray-950) | `text-foreground` |
| **Card / Filter** | `dark:bg-gray-950` | - |
| **Table Header** | `dark:bg-gray-950` | `dark:text-gray-300` |
| **Table Body** | `dark:bg-background` (≈ gray-950) | - |
| **Pagination** | `dark:bg-gray-950` | - |
| **Border** | `dark:border-gray-700` | - |

### 3.3 Gray Scale Reference

**Tailwind Gray Classes (Light Mode):**
- `gray-50` - paling terang (pagination)
- `gray-100` - sedikit terang (header, hover)
- `gray-200` - - (tidak dipakai)
- `gray-300` - label text (light mode)
- `gray-400` - secondary text (light mode)
- `gray-600` - deskripsi text (light mode)
- `gray-900` - sangat gelap
- `gray-950` - paling gelap

**Tailwind Gray Classes (Dark Mode):**
- `gray-50` - - (tidak dipakai)
- `gray-200` - label text (primary)
- `gray-300` - label text (primary, header)
- `gray-400` - deskripsi text
- `gray-700` - border
- `gray-800` - table body hover
- `gray-900` - table body
- `gray-950` - header, filter, pagination

### 3.4 Text Color Reference

| Keterangan | Light Mode | Dark Mode |
|-----------|-------------|-----------|
| **Primary Text** | `text-gray-950` | `dark:text-gray-50` |
| **Secondary Text** | `text-gray-700` | `dark:text-gray-400` |
| **Header Text** | `text-gray-950` | `dark:text-gray-300` |
| **Label Text** | `text-gray-750` | `dark:text-gray-200` |
| **Muted Text** | `text-gray-500` | `dark:text-gray-400` |

---

## 4. Component Guidelines

### 4.1 Card

**Standar Card:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Judul</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Konten */}
  </CardContent>
</Card>
```

**Background:**
- Light mode: Default (`bg-white`)
- Dark mode: `dark:bg-gray-800`

### 4.2 Button

**Primary Button:**
```tsx
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Tambah Baru
</Button>
```

**Icon Button (Small):**
```tsx
<Button variant="ghost" size="sm" onClick={handleEdit}>
  <Edit className="h-4 w-4" />
</Button>
```

**Destructive Button (Delete):**
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={handleDelete}
  className="text-red-600 hover:text-red-700 hover:bg-red-50"
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### 4.3 Form Input

**Standar Input:**
```tsx
<Input
  placeholder="Placeholder..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Labeled Input:**
```tsx
<div>
  <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
    Label
  </label>
  <Input ... />
</div>
```

### 4.4 Badge

**Color-Coded Badge (Contoh COA):**
```tsx
<span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(type)}`}>
  {type}
</span>
```

**Simple Badge:**
```tsx
<Badge variant="secondary">
  Status
</Badge>
```

### 4.5 Modal / Dialog

**Standar Dialog:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Judul</DialogTitle>
      <DialogDescription>
        Deskripsi
      </DialogDescription>
    </DialogHeader>
    {/* Form konten */}
  </DialogContent>
</Dialog>
```

### 4.6 Sidebar

**Sidebar Font Size:**
- All menu items: `text-base` (16px)
- User name: `text-base` (16px)
- User role: `text-sm` (14px)
- App name (primary): `text-xl` (20px)
- App name (secondary): `text-base` (16px)
- Logo (collapsed): `text-sm` (14px)

**Background:**
- Light mode: `bg-card`
- Dark mode: `dark:bg-card`

**Contoh Menu Item:**
```tsx
<Link
  to={href}
  className={cn(
    'flex items-center gap-2 rounded-md px-3 py-2 text-base font-normal transition-colors',
    'hover:bg-muted',
    isActive && 'bg-primary/10 text-primary font-semibold hover:bg-primary/20',
    level > 0 && 'pl-6'
  )}
>
  <Icon className="h-4 w-4" />
  <span>Title</span>
</Link>
```

---

## 5. Dark Mode Support

### 5.1 Prinsip Dasar

**Selalu gunakan class `dark:` untuk dark mode:**
```tsx
className="bg-white dark:bg-gray-950"
className="text-gray-900 dark:text-gray-50"
```

### 5.2 Dark Mode Priority

Background priority (dari paling terang ke paling gelap):
1. Main layout: `bg-background` (CSS variable)
2. Table body: `bg-background` (sama dengan layout)
3. Filter / Card: `dark:bg-gray-950` (sama dengan header)
4. Table header: `dark:bg-gray-950`
5. Pagination: `dark:bg-gray-950`

### 5.3 Contrast Check

Pastikan contrast text dengan background cukup:

| Background Color | Recommended Text Color |
|----------------|------------------------|
| `white` / `bg-background` | `text-gray-900` / `dark:text-gray-50` |
| `gray-50` | `text-gray-900` / `dark:text-gray-50` |
| `gray-100` | `text-gray-900` / `dark:text-gray-50` |
| `gray-800` | `text-gray-100` |
| `gray-900` | `text-gray-100` |
| `gray-950` | `text-gray-200` / `text-gray-300` (header) |

---

## 6. Best Practices

### 6.1 Font Size Consistency

✅ **Selalu gunakan Tailwind class untuk ukuran font:**
- `text-xs` (12px) - label, caption
- `text-sm` (14px) - secondary text, table body
- `text-base` (16px) - default body, table header, sidebar menu
- `text-lg` (18px) - sub-heading
- `text-xl` (20px) - main heading
- `text-2xl` (24px) - page title

❌ **JANGAN gunakan nilai absolut:**
- `font-size: 14px` - TIDAK direkomendasikan
- `style={{ fontSize: '16px' }}` - TIDAK direkomendasikan

### 6.2 Font Family Consistency

✅ **Gunakan `font-sans` untuk semua elemen:**
- Semua text harus menggunakan font Satoshi
- Hanya gunakan monospace untuk CAPTCHA atau kode teknis khusus

❌ **JANGAN gunakan `font-mono` untuk:**
- Kode rekening / kode akun
- Numbers / harga
- Tabel data

### 6.3 Dark Mode Implementation

✅ **Selalu sertakan dark mode:**
```tsx
className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50"
```

❌ **JANGAN lupakan dark mode:**
```tsx
className="bg-white text-gray-900" // ❌ Tidak ada dark mode
```

### 6.4 Background Hierarchy

**Dari background utama ke paling gelap (dark mode):**
```
Layout (gray-950) → Filter/Card (gray-950) → Header (gray-950) → Body (gray-950)
```

**Light mode hierarchy:**
```
Layout (white) → Filter/Card (white) → Header (gray-100) → Body (white)
```

### 6.5 Responsive Design

✅ **Selalu gunakan responsive classes:**
```tsx
<div className="p-4 lg:p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

✅ **Mobile-first approach:**
- Design untuk mobile dulu
- Tambahkan breakpoint untuk tablet dan desktop
- Gunakan `lg:` untuk desktop, `md:` untuk tablet

---

## 7. Common Patterns

### 7.1 Data Table Pattern

```tsx
<Card>
  <CardHeader>
    <CardTitle>Data Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Filters */}
    <div className="bg-white dark:bg-gray-950 border dark:border-gray-700 rounded-lg p-4">
      <Input
        placeholder="Cari..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {/* Table */}
    <Table>
      <TableHeader className="bg-gray-100 dark:bg-gray-950">
        <TableHead className="text-base dark:text-gray-300">Kolom</TableHead>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
            <TableCell className="font-medium">{item.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {/* Pagination */}
    <div className="px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-950">
      <Pagination ... />
    </div>
  </CardContent>
</Card>
```

### 7.2 Form Pattern

```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
      Field Label
    </label>
    <Input
      value={formData.field}
      onChange={(e) => setFormData({...formData, field: e.target.value})}
      placeholder="Placeholder"
    />
  </div>

  <div>
    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
      Select Field
    </label>
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger>
        <SelectValue placeholder="Pilih..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <Button type="submit" disabled={isLoading}>
    {isLoading ? 'Menyimpan...' : 'Simpan'}
  </Button>
</form>
```

### 7.3 Status Badge Pattern

```tsx
const getStatusColor = (status: string) => {
  const colors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
  {status}
</span>
```

---

## 8. Checklist Sebelum Pull Request

Sebelum melakukan pull request untuk component baru atau perubahan styling:

- [ ] Semua font menggunakan `font-sans` (Satoshi)
- [ ] Font size menggunakan Tailwind class (`text-base`, `text-sm`, dll)
- [ ] Font weight sesuai dengan yang tersedia (400, 500, 700)
- [ ] Dark mode support dengan class `dark:`
- [ ] Background dan text color memiliki contrast yang cukup
- [ ] Border menggunakan `dark:border-gray-700` di dark mode
- [ ] Button hover state ditambahkan
- [ ] Loading state ditambahkan untuk async operations
- [ ] Error handling ditambahkan
- [ ] Empty state ditampilkan jika data kosong
- [ ] Responsive design (mobile breakpoint ditambahkan jika perlu)
- [ ] Accessibility (aria labels, keyboard navigation)

---

## 9. Referensi File

### 9.1 Konfigurasi Global

- **Tailwind Config:** `frontend/tailwind.config.js`
- **Global CSS:** `frontend/src/index.css`
- **Main Layout:** `frontend/src/components/layout/MainLayout.tsx`

### 9.2 Component References

- **Table Component:** `frontend/src/components/ui/Table.tsx`
- **Chart of Accounts:** `frontend/src/features/chart-of-accounts/ChartOfAccounts.tsx` (contoh implementasi benar)
- **Sidebar:** `frontend/src/components/layout/Sidebar.tsx`

### 9.3 Contoh Implementasi Benar

**Tabel COA** (`ChartOfAccounts.tsx`) adalah contoh implementasi yang benar dengan:
- ✅ Font size header 16px
- ✅ Font family Satoshi di semua elemen
- ✅ Background header `gray-950` di dark mode
- ✅ Background body `bg-background`
- ✅ Dark mode support lengkap
- ✅ Pagination dengan background `gray-950` di dark mode

---

## 10. Notes & Updates

**Versi:** 1.0
**Tanggal:** 2026-02-20
**Last Updated:** Pembuatan panduan ini mencakup perbaikan tabel COA dan font styling

### Changelog:

**v1.0 - 2026-02-20:**
- Panduan pembuatan tabel dengan dark mode support
- Standar typography dengan font Satoshi
- Font weight mapping (400, 500, 700)
- Font size hierarchy untuk berbagai element
- Color scheme lengkap untuk light & dark mode
- Sidebar styling standar
- Component guidelines (Card, Button, Form, dll)
- Best practices untuk development frontend

---

## 11. Troubleshooting

### 11.1 Font Tidak Terload

**Masalah:** Font Satoshi tidak muncul
**Solusi:**
1. Pastikan import di `index.css` sudah benar:
   ```css
   @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap');
   ```
2. Cek Network tab di DevTools untuk verifikasi font dimuat
3. Clear browser cache dan refresh

### 11.2 Dark Mode Tidak Berfungsi

**Masalah:** Dark mode tidak berubah
**Solusi:**
1. Pastikan class `dark` ditambahkan ke `<html>` atau `<body>`:
   ```tsx
   // Di index.css:
   html, body {
     @apply bg-background text-foreground font-sans;
   }
   ```
2. Cek ThemeContext untuk memastikan theme switching berfungsi
3. Pastikan Tailwind config memiliki: `darkMode: ["class"]`

### 11.3 Font Size Tidak Konsisten

**Masalah:** Font size berbeda antar halaman
**Solusi:**
1. Selalu gunakan Tailwind class (`text-base`, `text-sm`)
2. JANGAN gunakan inline style untuk font size
3. Cek apakah ada global CSS yang mengoverride Tailwind

### 11.4 Kontras Text Tidak Baik

**Masalah:** Text sulit dibaca di dark mode
**Solusi:**
1. Gunakan text color yang lebih terang untuk background gelap:
   - Background `gray-950` → Text `gray-200` atau `gray-300`
2. Verifikasi contrast ratio menggunakan:
   - WCAG AA: minimum 4.5:1
   - WCAG AAA: minimum 7:1
3. Uji di berbagai kondisi cahaya

---

## 12. Contact & Support

**Untuk pertanyaan atau klarifikasi:**
- Review panduan ini terlebih dahulu
- Cek referensi file di Section 9
- Lihat contoh implementasi yang sudah benar

**Update panduan:**
- Jika ada perubahan standar baru
- Update versi dan tambahkan ke changelog
- Dokumentasikan alasan perubahan

---

**End of Visual Template**
