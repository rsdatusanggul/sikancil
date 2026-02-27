import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  ShoppingCart,
  Wallet,
  BookOpen,
  BarChart3,
  FileBarChart,
  Package,
  Users,
  Settings,
  ChevronDown,
  Shield,
  UserCog,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useCurrentUser, useLogout } from '@/features/auth';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Perencanaan & RBA',
    icon: FileText,
    children: [
      { title: 'Program RBA', href: '/program-rba', icon: FileText },
      { title: 'Kegiatan RBA', href: '/kegiatan-rba', icon: FileText },
      { title: 'Sub Kegiatan RBA', href: '/subkegiatan-rba', icon: FileText },
      { title: 'Aktivitas', href: '/aktivitas-rba', icon: FileText },
      { title: 'RAK (Anggaran Kas)', href: '/rak', icon: Wallet },
      { title: 'Revisi RBA', href: '/revisi-rba', icon: FileText },
      { title: 'DPA/DPPA', href: '/dpa', icon: FileText },
    ],
  },
  {
    title: 'Pendapatan',
    icon: DollarSign,
    children: [
      { title: 'Pendapatan Operasional', href: '/pendapatan-operasional', icon: DollarSign },
      { title: 'Penerimaan APBD', href: '/penerimaan-apbd', icon: DollarSign },
      { title: 'Hibah', href: '/hibah', icon: DollarSign },
      { title: 'Piutang', href: '/piutang', icon: DollarSign },
      { title: 'Integrasi SIMRS', href: '/simrs-integration', icon: Settings },
    ],
  },
  {
    title: 'Belanja',
    icon: ShoppingCart,
    children: [
      { title: 'Bukti Bayar', href: '/bukti-bayar', icon: FileText },
      { title: 'SPP', href: '/spp', icon: FileText },
      { title: 'SPM', href: '/spm', icon: FileText },
      { title: 'SP2D', href: '/sp2d', icon: FileText },
      { title: 'Realisasi Belanja', href: '/realisasi-belanja', icon: BarChart3 },
      { title: 'Pajak', href: '/pajak', icon: FileText },
    ],
  },
  {
    title: 'Penatausahaan',
    icon: BookOpen,
    children: [
      { title: 'BKU Penerimaan', href: '/bku-penerimaan', icon: BookOpen },
      { title: 'BKU Pengeluaran', href: '/bku-pengeluaran', icon: BookOpen },
      { title: 'Buku Pembantu', href: '/buku-pembantu', icon: BookOpen },
      { title: 'SPJ UP', href: '/spj-up', icon: FileText },
      { title: 'SPJ GU', href: '/spj-gu', icon: FileText },
      { title: 'SPJ TU', href: '/spj-tu', icon: FileText },
      { title: 'STS', href: '/sts', icon: FileText },
      { title: 'Penutupan Kas', href: '/penutupan-kas', icon: Wallet },
    ],
  },
  {
    title: 'Akuntansi',
    icon: BarChart3,
    children: [
      { title: 'Jurnal', href: '/jurnal', icon: BookOpen },
      { title: 'Buku Besar', href: '/buku-besar', icon: BookOpen },
      { title: 'Neraca Saldo', href: '/neraca-saldo', icon: BarChart3 },
    ],
  },
  {
    title: 'Laporan Keuangan',
    icon: FileBarChart,
    children: [
      { title: 'LRA', href: '/lra', icon: FileBarChart },
      { title: 'LPSAL', href: '/lpsal', icon: FileBarChart },
      { title: 'Neraca', href: '/neraca', icon: FileBarChart },
      { title: 'Laporan Operasional', href: '/laporan-operasional', icon: FileBarChart },
      { title: 'Laporan Arus Kas', href: '/laporan-arus-kas', icon: FileBarChart },
      { title: 'Laporan Perubahan Ekuitas', href: '/laporan-perubahan-ekuitas', icon: FileBarChart },
      { title: 'CaLK', href: '/calk', icon: FileText },
    ],
  },
  {
    title: 'Laporan Penatausahaan',
    icon: FileText,
    children: [
      { title: 'Laporan Pendapatan BLUD', href: '/laporan-pendapatan-blud', icon: FileText },
      { title: 'Laporan Pengeluaran BLUD', href: '/laporan-pengeluaran-blud', icon: FileText },
      { title: 'SPJ Fungsional', href: '/spj-fungsional', icon: FileText },
    ],
  },
  {
    title: 'Aset & Gaji',
    icon: Package,
    children: [
      { title: 'Aset Tetap', href: '/aset', icon: Package },
      { title: 'Gaji & Honorarium', href: '/gaji', icon: DollarSign },
      { title: 'Kontrak', href: '/kontrak', icon: FileText },
    ],
  },
  {
    title: 'Master Data',
    icon: Settings,
    children: [
      { title: 'Chart of Accounts', href: '/master-data/chart-of-accounts', icon: BookOpen },
      { title: 'Unit Kerja', href: '/master-data/unit-kerja', icon: Users },
      { title: 'Pegawai', href: '/master-data/pegawai', icon: Users },
      { title: 'Supplier', href: '/master-data/supplier', icon: Users },
      { title: 'Bank Account', href: '/master-data/bank-account', icon: Wallet },
    ],
  },
];

interface SidebarItemProps {
  item: MenuItem;
  level?: number;
  isCollapsed?: boolean;
}

// Helper function to get role labels
function getRoleLabel(role?: string): string {
  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    kepala_blud: 'Kepala BLUD',
    bendahara: 'Bendahara',
    staff_keuangan: 'Staff Keuangan',
    user: 'User',
  };
  return roleLabels[role || ''] || role || 'Staff';
}

// Helper function to get initials from full name
function getInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function SidebarItem({ item, level = 0, isCollapsed = false }: SidebarItemProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === location.pathname;

  const Icon = item.icon;
  const { toggleSidebar } = useSidebar();

  if (isCollapsed) {
    if (hasChildren) {
      return (
        <button
          onClick={() => {
            toggleSidebar();
            setTimeout(() => setIsOpen(true), 100);
          }}
          className={cn(
            'flex items-center justify-center rounded-md p-2 text-base font-normal transition-colors',
            'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
            isActive && 'bg-primary/10 text-primary font-semibold hover:bg-primary/20'
          )}
          title={item.title}
        >
          <Icon className="h-4 w-4" />
        </button>
      );
    }
    
    return (
      <Link
        to={item.href!}
        className={cn(
          'flex items-center justify-center rounded-md p-2 text-base font-normal transition-colors',
          'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
          isActive && 'bg-primary/10 text-primary font-semibold hover:bg-primary/20'
        )}
        title={item.title}
      >
        <Icon className="h-4 w-4" />
      </Link>
    );
  }

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-semibold',
            'text-gray-950 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            level > 0 && 'pl-6'
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
          </div>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          />
        </button>
        {isOpen && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child, index) => (
              <SidebarItem key={index} item={child} level={level + 1} isCollapsed={isCollapsed} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.href!}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-base font-normal transition-colors',
        'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
        isActive && 'bg-primary/10 text-primary font-semibold hover:bg-primary/20',
        level > 0 && 'pl-6'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.title}</span>
    </Link>
  );
}

export function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleSidebar, toggleMobileSidebar, closeMobileSidebar } = useSidebar();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen border-r border-border bg-card flex flex-col transition-all duration-300 z-30',
        'lg:translate-x-0',
        isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:w-72',
        isCollapsed && !isMobileOpen && 'lg:w-16'
      )}
    >
      {/* Header - App Info + System Menu + Collapse Toggle */}
      <div className="flex items-center p-3 relative">
        {isCollapsed && !isMobileOpen ? (
          <div className="flex flex-col items-center w-full gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-md p-1.5 hover:bg-muted" title="Si-Kancil">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-primary text-sm">SK</span>
                    <span className="font-bold text-primary text-sm mt-0.5">RSDS</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="center">
                <DropdownMenuItem onClick={() => navigate('/users')}>
                  <UserCog className="mr-2 h-4 w-4" />
                  Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/roles')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Roles & Permissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/audit/activity-log')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Log Aktivitas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center w-full justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted flex-1 text-left">
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-primary text-xl leading-none">Si-Kancil</span>
                    <span className="font-bold text-primary text-base leading-none mt-1">RSUD Datu Sanggul</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-gray-500 dark:text-gray-400 ml-auto" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuItem onClick={() => navigate('/users')}>
                  <UserCog className="mr-2 h-4 w-4" />
                  Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/roles')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Roles & Permissions
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/audit/activity-log')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Log Aktivitas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Close Button */}
            <button 
              onClick={closeMobileSidebar} 
              className="lg:hidden ml-1 p-1.5 rounded-md hover:bg-muted"
              title="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Desktop Toggle - Always visible on desktop, positioned outside sidebar */}
        <button 
          onClick={toggleSidebar} 
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 bg-card border border-border rounded-full p-1 shadow-md hover:bg-muted transition-all"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto', isCollapsed && !isMobileOpen ? 'p-2' : 'p-4 space-y-1')}>
        {menuItems.map((item, index) => (
          <SidebarItem key={index} item={item} isCollapsed={isCollapsed && !isMobileOpen} />
        ))}
      </nav>

      {/* Footer - Avatar + User Info + User Dropdown */}
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              'flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted transition-colors',
              isCollapsed && !isMobileOpen ? 'w-full justify-center' : 'w-full'
            )}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              {!(isCollapsed && !isMobileOpen) && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-base font-medium text-gray-950 dark:text-gray-50 truncate">
                      {currentUser?.fullName || 'User'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {getRoleLabel(currentUser?.role)}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isCollapsed && !isMobileOpen ? 'right' : 'bottom'} align={isCollapsed && !isMobileOpen ? 'center' : 'start'}>
            <DropdownMenuItem onClick={handleProfile}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              disabled={logoutMutation.isPending}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logoutMutation.isPending ? 'Keluar...' : 'Keluar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}
    </aside>
  );
}