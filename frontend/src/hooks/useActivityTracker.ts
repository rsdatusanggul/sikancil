import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Hook to track user activity and update last activity timestamp
 * This ensures that session timeout is based on actual user activity
 */
export const useActivityTracker = () => {
  const { isAuthenticated, updateLastActivity } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Track various user activities
    const activities = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      updateLastActivity();
    };

    activities.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      activities.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateLastActivity]);
};