# 🎨 Style Switching Guide - Quick Reference

> **TL;DR:** You probably want to STAY with new-york. Only switch if you have strong reasons and 10+ hours.

---

## 🚦 Quick Decision Tree

```
Do stakeholders explicitly prefer "classic" enterprise UI?
├─ NO → ✅ STAY with new-york
└─ YES → Continue...
           |
           Do you have 10+ hours to invest?
           ├─ NO → ✅ STAY with new-york
           └─ YES → Continue...
                    |
                    Are you OK losing all Stage 1-4 enhancements?
                    ├─ NO → ✅ STAY with new-york
                    └─ YES → 🟡 CONSIDER switching
```

---

## 📁 Files Created for Stage 3

1. **[STYLE_GUIDE.md](STYLE_GUIDE.md)** - Complete style documentation (6KB)
2. **[STYLE_COMPARISON.md](STYLE_COMPARISON.md)** - Detailed new-york vs default comparison (8KB)
3. **[scripts/rollback-to-newyork.sh](scripts/rollback-to-newyork.sh)** - One-command rollback (2.5KB)
4. **[scripts/switch-to-default.sh](scripts/switch-to-default.sh)** - Guided switch process (4.2KB)
5. **[.style-backups/new-york-enhanced/](/.style-backups/new-york-enhanced/)** - Complete backup (25 components + configs)

---

## 🎯 Our Recommendation: ✅ STAY with new-york

**Why?**
- ✅ Perfect for modern finance SaaS (Sikancil)
- ✅ All enhancements working (Stages 1, 2, 4 + Typography)
- ✅ Zero risk, zero work
- ✅ Professional, contemporary look
- 🔴 Switching = HIGH risk (breakage), LOW reward (minimal visual change)

---

## 🔄 How to Rollback (If You Experiment)

**One command:**
```bash
cd /opt/sikancil/frontend
./scripts/rollback-to-newyork.sh
```

**What it does:**
1. ✅ Backs up current state (safety net)
2. ✅ Restores all 25 UI components
3. ✅ Restores all config files
4. ✅ Preserves all Stage 1-4 enhancements

**After rollback:**
```bash
npm run build
npm run dev
```

---

## 🧪 How to Test "default" Style (Optional)

**Visual comparison ONLY (No code changes):**
1. Visit https://ui.shadcn.com
2. Click style toggle (top-right)
3. Compare new-york ↔ default
4. Make decision based on visuals

**Actual switch (⚠️ RISKY):**
```bash
cd /opt/sikancil/frontend
./scripts/switch-to-default.sh
```

This will:
- Create backup
- Update components.json to "default"
- Give you manual regeneration instructions
- **Budget 8-13 hours for full process**

---

## 📊 Visual Differences Summary

| Feature | new-york | default |
|---------|----------|---------|
| Badge shape | Pill (rounded-full) | Rounded corners (rounded-md) |
| Overall feel | Modern, minimal | Classic, traditional |
| Best for | SaaS, fintech ✅ | Enterprise apps |
| Borders | Subtle | Pronounced |
| Sikancil fit | ✅ Perfect | 🟡 OK |

---

## ⚠️ What You Lose by Switching

- ❌ Custom elevation system (5 levels)
- ❌ All animations (12 keyframes)
- ❌ Enhanced shadows and depth
- ❌ Interactive micro-interactions
- ❌ Error shake animations
- ❌ Focus color transitions
- ❌ Shimmer loading effects
- ❌ Staggered dialog animations
- ❌ LoadingSpinner component
- ❌ LoadingOverlay component

**Can you get them back?**
Yes, but requires 4-6 hours to manually reapply ALL Stage 1-4 enhancements to default style.

---

## 📋 Backup Info

**Location:** `.style-backups/new-york-enhanced/`

**Contents:**
- ✅ All 25 UI components
- ✅ tailwind.config.js (with elevation + animations)
- ✅ index.css (with reduced motion support)
- ✅ components.json (new-york config)
- ✅ index.html (with Inter font)

**Created:** February 16, 2026

---

## 🚀 Recommended Next Steps

**If STAYING with new-york (Recommended ✅):**
1. No action needed
2. Proceed to production deployment
3. Enjoy your polished, modern UI

**If TESTING default:**
1. Read [STYLE_COMPARISON.md](STYLE_COMPARISON.md) fully
2. Visit shadcn.com for visual comparison
3. If still interested, run `./scripts/switch-to-default.sh`
4. Budget 8-13 hours
5. Keep `./scripts/rollback-to-newyork.sh` ready

**If UNCERTAIN:**
1. Take screenshots of current UI
2. Share with stakeholders
3. Get feedback on visual appearance
4. Decide based on actual user preference

---

## 📞 Quick Q&A

**Q: Can I just change Badge to `rounded-md` without full switch?**
A: Yes! Edit `src/components/ui/Badge.tsx` line 6, change `rounded-full` to `rounded-md`. No need to regenerate.

**Q: Will switching break existing code?**
A: Potentially yes. Component APIs may change, requiring code updates in feature files.

**Q: Can I cherry-pick some components from default?**
A: Yes! Regenerate specific components only. But be careful with API consistency.

**Q: Is Inter font affected by style switching?**
A: No. Inter font is in `index.html`, separate from component styles.

**Q: How long does rollback take?**
A: ~30 seconds (just runs the script + rebuild).

**Q: Do I need to test rollback now?**
A: No, only if you actually switch and want to come back.

---

## 🎬 Action Items

### For You (User):

**Option 1: Stay (Recommended ✅)**
- [ ] Review screenshots of current UI
- [ ] Confirm with stakeholders that current look is good
- [ ] Mark Stage 3 as "Complete - Staying with new-york"
- [ ] Move to production deployment

**Option 2: Test**
- [ ] Read [STYLE_COMPARISON.md](STYLE_COMPARISON.md)
- [ ] Visit shadcn.com, compare styles
- [ ] If interested, run `./scripts/switch-to-default.sh`
- [ ] Budget 8-13 hours
- [ ] Test exhaustively
- [ ] Rollback if unsatisfied

**Option 3: Hybrid**
- [ ] Identify specific elements you want from default
- [ ] Make targeted CSS changes manually
- [ ] No full regeneration needed

---

## 📚 Documentation Index

1. **[STYLE_GUIDE.md](STYLE_GUIDE.md)** - Full style guide (inventory, rollback, production checklist)
2. **[STYLE_COMPARISON.md](STYLE_COMPARISON.md)** - Detailed comparison, recommendations, impact analysis
3. **This file** - Quick reference for decision-making

---

**Created:** February 16, 2026
**Author:** Claude Code
**Project:** Sikancil - Sistem Keuangan BLUD
**Verdict:** ✅ **Stay with new-york enhanced**
