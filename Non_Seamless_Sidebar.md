# Plan: Sidebar Redesign — Seamless, Collapsible, Avatar Footer, System Header Menu

## Context
The current sidebar has several UX issues:
- Internal `border-b` / `border-t` dividers between header, nav, and footer create a "lined" look
- The collapse toggle is stuck at the very bottom (awkward placement)
- The footer "User Section" is a placeholder comment (no real content)
- The header shows only static text with no interaction
- No avatar is shown anywhere in the sidebar

The redesign makes the sidebar seamless, moves the collapse toggle to the header area, adds an interactive app-info header dropdown (for Sistem menu), and places a proper avatar in the footer.

---

## File to Modify
**`/opt/sikancil/frontend/src/components/layout/Sidebar.tsx`**

---

## Changes

### 1. Remove Distracting Internal Border Lines
- Remove `border-b border-border` from the header `div`
- Remove `border-t border-border` from the user/footer section
- Remove `border-t border-border` from the collapse button section (entire section deleted, toggle moves to header)
- Keep `border-r border-border` on the `<aside>` (needed to separate from main content)
- Use spacing/padding alone for visual grouping between sections

### 2. Move Collapse Toggle to the Header Area
- Remove the standalone bottom `<div className="border-t border-border p-2">` collapse button section
- Integrate the collapse toggle as a small icon button at the **right side of the header row**
- When **expanded**: header row = `[Si-Kancil name/button] [collapse-icon btn →]`
- When **collapsed**: header row = `[SK icon centered]` with a small collapse icon below or overlaid
- Use `ChevronLeft` (collapse) / `ChevronRight` (expand) — already imported and proven to work

### 3. Header = App Info + Sistem Menu Dropdown
- The "Si-Kancil" / "SK" label becomes a `DropdownMenuTrigger`
- Uses the existing `DropdownMenu` component from `@/components/ui/dropdown-menu`
- Clicking the label opens a dropdown (using `side="right"` or `side="bottom"`) showing Sistem menu items:
  - Users → `/users` (UserCog icon)
  - Roles & Permissions → `/roles` (Shield icon)
  - Log Aktivitas → `/audit/activity-log` (FileText/Shield icon)
  - Settings → `/settings` (Settings icon)
- The "Sistem" entry is **removed from `menuItems`** (the main nav array) since it's now exclusively in the header dropdown — avoids duplication and separates admin actions from regular navigation

### 4. Footer: Avatar + User Info + User Dropdown
- Replace the empty comment placeholder with a real user section
- Import `Avatar`, `AvatarImage`, `AvatarFallback` from `@/components/ui/avatar`
- Wrap in a `DropdownMenu` for user actions (profile, logout)
- **Expanded view**: `[Avatar h-8 w-8] [fullName (truncated)] [jabatan or role label]` — full row as dropdown trigger
- **Collapsed view**: just `[Avatar h-8 w-8]` centered, still as dropdown trigger
- Avatar fallback: extract initials from `user?.fullName` (e.g. "Ahmad Ridwan" → "AR")
- Dropdown items:
  - Profile → navigate to `/profile` (User icon)
  - Separator
  - Logout (LogOut icon, destructive color)

### 5. Role Label Helper (inline)
- Add a small inline helper to map `UserRole` enum values to human-readable labels (e.g. `super_admin` → `Super Admin`), reusing the pattern from `/opt/sikancil/frontend/src/features/users/types.ts`

---

## Implementation Details

### New Imports to Add
```ts
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
```

### Header Structure (expanded)
```tsx
<div className="flex items-center justify-between h-14 px-3">
  {/* App info as dropdown trigger */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted flex-1 text-left">
        <span className="font-bold text-primary text-lg">Si-Kancil</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="bottom" align="start">
      {/* Sistem menu items */}
    </DropdownMenuContent>
  </DropdownMenu>
  {/* Collapse toggle */}
  <button onClick={toggleSidebar} className="ml-1 p-1.5 rounded-md hover:bg-muted">
    <ChevronLeft className="h-4 w-4" />
  </button>
</div>
```

### Header Structure (collapsed)
```tsx
<div className="flex flex-col items-center pt-3 pb-2 gap-2">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="rounded-md p-1.5 hover:bg-muted" title="Si-Kancil">
        <span className="font-bold text-primary text-sm">SK</span>
      </button>
    </DropdownMenuTrigger>
    ...
  </DropdownMenu>
  <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-muted" title="Expand">
    <ChevronRight className="h-4 w-4" />
  </button>
</div>
```

### Footer Structure (expanded)
```tsx
<div className="p-3">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-muted">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={currentUser?.avatar} />
          <AvatarFallback className="text-xs">{getInitials(currentUser?.fullName)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium truncate">{currentUser?.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{getRoleLabel(currentUser?.role)}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="top" align="start">
      <DropdownMenuItem onClick={handleProfile}><User ... /> Profile</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut ... /> Keluar</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

---

## Verification
1. Run dev server: `npm run dev` (or `pnpm dev`) in `/opt/sikancil/frontend/`
2. Log in and check sidebar:
   - No visible horizontal divider lines inside the sidebar
   - Collapse toggle is in the header area (not at the bottom)
   - Clicking "Si-Kancil" label opens a dropdown with Sistem menu items
   - Clicking the collapse toggle shrinks the sidebar to icon-only mode
   - In collapsed mode: "SK" abbreviation + expand toggle visible
   - Footer shows user avatar with initials fallback + name + role
   - Clicking the avatar opens a dropdown with Profile and Logout
3. Test collapsed state: avatar only, centered; dropdown still works via avatar click
4. Verify "Sistem" group no longer appears in the main nav scroll list
