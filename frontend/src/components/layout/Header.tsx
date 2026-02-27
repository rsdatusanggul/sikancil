import React from 'react';
import { Bell, Search, Calendar, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useFiscalYear } from '@/contexts/FiscalYearContext';
import { useSidebar } from '@/contexts/SidebarContext';

interface HeaderProps {
  isCollapsed?: boolean;
}

export function Header({ isCollapsed = false }: HeaderProps) {
  const [showFiscalYearMenu, setShowFiscalYearMenu] = React.useState(false);
  const { activeFiscalYear, fiscalYears, setActiveFiscalYear, isLoading } = useFiscalYear();
  const { toggleMobileSidebar } = useSidebar();

  const handleFiscalYearChange = async (fiscalYearId: string) => {
    const selectedYear = fiscalYears.find((fy) => fy.id === fiscalYearId);
    if (selectedYear) {
      await setActiveFiscalYear(selectedYear);
      setShowFiscalYearMenu(false);
      // Reload page to refresh all data with new fiscal year
      window.location.reload();
    }
  };

  return (
    <header className={cn('fixed top-0 right-0 h-16 bg-background z-10 transition-all duration-300', isCollapsed ? 'left-16' : 'left-72 lg:left-72')}>
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
          title="Buka Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search - Hidden on mobile, visible on larger screens */}
        <div className="hidden sm:flex flex-1 max-w-xs">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Cari..."
              className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Fiscal Year Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFiscalYearMenu(!showFiscalYearMenu)}
              disabled={isLoading}
              className="flex items-center gap-1 lg:gap-2 p-1.5 lg:p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-foreground hidden md:block">
                {activeFiscalYear?.tahun || 'Loading...'}
              </span>
            </button>

            {/* Fiscal Year Dropdown */}
            {showFiscalYearMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-950 ring-1 ring-gray-200 dark:ring-gray-700 z-20">
                <div className="py-1">
                  <p className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Pilih Tahun Anggaran
                  </p>
                  {fiscalYears.map((fy) => (
                    <button
                      key={fy.id}
                      onClick={() => handleFiscalYearChange(fy.id)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors ${
                        activeFiscalYear?.id === fy.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-950 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span>{fy.tahun}</span>
                      {fy.isCurrent && (
                        <span className="text-xs opacity-75">Tahun Berjalan</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-1.5 lg:p-2 rounded-md hover:bg-muted transition-colors">
            <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500 dark:text-gray-400" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </button>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}