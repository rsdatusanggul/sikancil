import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true, // CRITICAL: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ REMOVED: Request interceptor for adding auth token
// Cookies are sent automatically by browser

// ✅ UPDATED RESPONSE INTERCEPTOR WITH LOOP PREVENTION
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop by checking if we're already on login page
    const isLoginPage = window.location.pathname === '/login';

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginPage) {
      originalRequest._retry = true;

      try {
        // ✅ Call refresh endpoint (uses refreshToken cookie)
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true } // Send cookies
        );

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth store and redirect to login
        // Use setTimeout to allow current error to propagate
        setTimeout(() => {
          // Import and use auth store to clear state
          import('@/stores/auth.store').then(({ useAuthStore }) => {
            useAuthStore.getState().logout();
          });
          window.location.href = '/login';
        }, 100);
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
