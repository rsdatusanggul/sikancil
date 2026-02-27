import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { queryClient, cn } from '@/lib';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useAuthStore } from '@/stores/auth.store';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function SessionTimeoutHandler() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track user activity
  useActivityTracker();

  // Initialize session timeout checker
  useEffect(() => {
    const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

    const checkTimeout = () => {
      const { lastActivity, isAuthenticated: authenticated } = useAuthStore.getState();

      if (!authenticated || !lastActivity) {
        return;
      }

      const elapsed = Date.now() - lastActivity;
      if (elapsed >= TIMEOUT_DURATION) {
        handleSessionTimeout();
      }
    };

    const handleSessionTimeout = () => {
      // Clear all queries and logout
      queryClient.clear();
      useAuthStore.getState().logout();
      
      // Show alert and navigate to login
      alert('Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan login kembali.');
      navigate('/login');
    };

    if (isAuthenticated) {
      // Check every minute
      timeoutRef.current = setInterval(checkTimeout, 60000);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [isAuthenticated, navigate]);

  return null;
}

function MainLayoutContent() {
  const { isCollapsed, isMobileOpen } = useSidebar();

  return (
    <>
      <SessionTimeoutHandler />
      <Sidebar />
      <Header isCollapsed={isCollapsed} />
      <main className={cn(
        'fixed top-16 bottom-0 right-0 overflow-y-auto p-4 lg:p-6 transition-all duration-300',
        // Desktop behavior
        'lg:fixed',
        isCollapsed ? 'lg:left-16' : 'lg:left-72',
        // Mobile behavior
        'left-0',
        isMobileOpen && 'lg:blur-sm lg:pointer-events-none'
      )}>
        <Outlet />
      </main>
    </>
  );
}

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="h-screen bg-background overflow-hidden">
        <MainLayoutContent />
      </div>
    </SidebarProvider>
  );
}
