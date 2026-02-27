# Sikancil UI/UX Style Guide

> **Current State:** new-york style (enhanced with Stages 1, 2, 4 + Inter typography)
> **Last Updated:** February 16, 2026
> **Backup Location:** `.style-backups/new-york-enhanced/`

---

## 📋 Overview

This project uses **shadcn/ui** with the "new-york" style variant, enhanced with custom depth, animations, and Inter typography.

### Completed Enhancements

- ✅ **Stage 1:** Fixed CSS variables, added 9 shadcn components, backward-compatible wrappers
- ✅ **Stage 2:** Elevation system, z-index hierarchy, enhanced shadows
- ✅ **Typography:** Inter font from Google Fonts CDN
- ✅ **Stage 4:** 12 animation keyframes, micro-interactions, loading components

---

## 🎨 Current Style: new-york (Enhanced)

### Characteristics

**Visual Style:**
- Modern, clean aesthetic
- Subtle borders and colors
- Flat-to-dimensional hybrid (enhanced with shadows)
- Contemporary spacing and proportions

**Color System:**
- All components use CSS variables (HSL-based)
- Consistent theming (light/dark mode support)
- No hardcoded colors

**Elevation:**
- 5 shadow levels (elevation-1 through elevation-5)
- Hover interactions with shadow transitions
- Subtle depth without being heavy

**Typography:**
- Font Family: Inter (variable font, 100-900 weights)
- Loaded via Google Fonts CDN
- System font fallback stack

**Animations:**
- 12 custom keyframes (fade, slide, scale, shimmer, shake, etc.)
- Smooth 200ms transitions
- Reduced motion support for accessibility

---

## 📦 Component Inventory

### Core Components (25 total)

**Form Components:**
- Button (with loading state, 6 variants, 4 sizes, shadows)
- Input (with error shake, hover effects, shadow)
- CurrencyInput (focus color transitions, error animations)
- Textarea
- Label
- Checkbox
- Radio Group
- Select / SimpleSelect (backward-compatible wrapper)

**Layout Components:**
- Card (4 elevation variants, interactive mode)
- Table (with row transitions)
- Separator
- Tabs
- Avatar

**Feedback Components:**
- Alert
- Badge
- Skeleton (with shimmer effect)
- LoadingSpinner (4 sizes, with label)
- LoadingOverlay (full-screen with backdrop blur)
- Sonner (toast notifications)

**Overlay Components:**
- Dialog (with staggered header/footer animations)
- Modal (backward-compatible wrapper for Dialog)
- Dropdown Menu (with elevation-3 shadow)
- Popover (with elevation-3 shadow)
- Tooltip (with elevation-2 shadow)

---

## 🔄 Style Switching: new-york ↔ default

### What Changes Between Styles?

**new-york Style (Current):**
- Modern, minimal borders
- Cleaner component compositions
- Contemporary feel
- Better for modern SaaS applications

**default Style:**
- Classic shadcn appearance
- More pronounced borders
- Traditional spacing
- Better for traditional enterprise apps

### Custom Enhancements to Preserve

When switching styles, these custom additions must be **manually reapplied**:

1. **Tailwind Config:**
   - Elevation system (shadow-elevation-1 through 5)
   - Z-index hierarchy (7 levels)
   - Animation keyframes (12 animations)
   - Border CSS variables (border-light, border-medium, border-strong)
   - Font family (Inter)

2. **Component Enhancements:**
   - Card: elevation variants + interactive mode
   - Button: enhanced shadows + active scale
   - Input: hover border + error shake
   - CurrencyInput: focus color transitions
   - Dialog: staggered header/footer animations
   - Skeleton: shimmer effect
   - Table: row transitions

3. **Custom Components:**
   - LoadingSpinner
   - LoadingOverlay
   - Modal wrapper
   - SimpleSelect wrapper

4. **CSS Additions:**
   - Reduced motion support (@media query)
   - Border enhancement variables

---

## 🛡️ Rollback Instructions

### Quick Rollback to new-york (Enhanced)

If you switch to "default" style and want to return:

```bash
# Restore all UI components
cp -r .style-backups/new-york-enhanced/ui/* src/components/ui/

# Restore config files
cp .style-backups/new-york-enhanced/tailwind.config.js tailwind.config.js
cp .style-backups/new-york-enhanced/index.css src/index.css
cp .style-backups/new-york-enhanced/components.json components.json
cp .style-backups/new-york-enhanced/index.html index.html

# Rebuild
npm run build
```

### Verify Rollback Success

After rollback, verify:
- [ ] All 25 components render correctly
- [ ] Inter font loads
- [ ] Animations work (check shimmer on Skeleton)
- [ ] No TypeScript errors
- [ ] Forms still submit
- [ ] Modals/Dialogs open/close

---

## 🔧 Switching to "default" Style

### ⚠️ Important Warnings

1. **Breaking Changes Expected:**
   - Component APIs may differ
   - Props might change
   - Custom variants will be lost

2. **Manual Work Required:**
   - All Stage 1-4 enhancements must be reapplied
   - Custom components (LoadingSpinner, LoadingOverlay) must be preserved
   - Wrapper components (Modal, SimpleSelect) must be preserved

3. **Testing Required:**
   - Every page must be visually tested
   - All forms must be functionally tested
   - TypeScript errors must be fixed

### Step-by-Step Switch Process

1. **Create Switch Branch** (if using git):
   ```bash
   git checkout -b test-default-style
   ```

2. **Update components.json:**
   ```json
   {
     "style": "default"
   }
   ```

3. **Regenerate Components:**
   ```bash
   # List of components to regenerate:
   npx shadcn-ui@latest add button --overwrite
   npx shadcn-ui@latest add input --overwrite
   npx shadcn-ui@latest add card --overwrite
   # ... (continue for all 25 components)
   ```

4. **Preserve Custom Components:**
   - Do NOT regenerate: LoadingSpinner, LoadingOverlay, Modal, SimpleSelect, CurrencyInput

5. **Reapply Enhancements:**
   - Manually add all custom variants
   - Restore animation classes
   - Restore transition properties

6. **Test Thoroughly:**
   - Visual check all pages
   - Test all forms
   - Check TypeScript
   - Verify accessibility

---

## 🎯 Recommendation

**Stay with "new-york" style (current) UNLESS:**
- Specific design requirement for "default" style
- Team strong preference after visual comparison
- Certain components work better in "default"

**Rationale:**
- ✅ "new-york" is more modern and contemporary
- ✅ Already configured and fully working
- ✅ All Stage 1-4 enhancements applied
- ✅ Zero breaking changes needed
- ✅ Better for modern SaaS applications
- ⚠️ Switching adds risk, time, and potential bugs

**If Switching:**
- Budget 6-8 hours for full switch + testing
- Create separate branch for safety
- Keep backup readily available
- Be prepared to rollback if issues arise

---

## 📊 Visual Comparison

### new-york (Current)
- **Borders:** Subtle, thin (1px)
- **Shadows:** Custom elevation system (5 levels)
- **Spacing:** Modern, spacious
- **Corners:** Rounded (--radius: 0.5rem)
- **Feel:** Clean, minimal, contemporary

### default
- **Borders:** More pronounced
- **Shadows:** Standard shadcn shadows
- **Spacing:** Traditional
- **Corners:** Rounded (similar)
- **Feel:** Classic, traditional, robust

### Which to Choose?

**Choose new-york if:**
- Building modern SaaS product ✅ (Sikancil BLUD - modern finance system)
- Want contemporary feel ✅
- Prefer subtle, minimal design ✅

**Choose default if:**
- Building traditional enterprise app
- Need stronger visual boundaries
- Prefer classic UI patterns

**For Sikancil:** **new-york** is the better choice (already using it!)

---

## 🔒 Backup Strategy

**Current Backup:**
- Location: `.style-backups/new-york-enhanced/`
- Contents: All 25 UI components + configs
- Date: February 16, 2026

**Before Any Changes:**
Always create timestamped backup:
```bash
cp -r .style-backups/new-york-enhanced .style-backups/new-york-$(date +%Y%m%d-%H%M%S)
```

---

## 📝 Change Log

### February 16, 2026
- ✅ Stage 1: Component fixes & additions
- ✅ Stage 2: Elevation system & depth
- ✅ Typography: Inter font implementation
- ✅ Stage 4: Animations & micro-interactions
- ✅ Created comprehensive backup
- ✅ Created this style guide

### Future Changes
- [ ] Stage 3: Style comparison testing (optional)
- [ ] Production deployment
- [ ] Performance optimization

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] All animations smooth at 60fps
- [ ] Reduced motion tested (OS setting enabled)
- [ ] Light & dark mode both work
- [ ] All forms functional
- [ ] No TypeScript errors
- [ ] Bundle size acceptable
- [ ] Inter font loads correctly
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile responsive
- [ ] Accessibility audit passed

---

**Maintained by:** Claude Code
**Project:** Sikancil - Sistem Keuangan BLUD
**Stack:** React + TypeScript + Vite + shadcn/ui + Tailwind CSS
