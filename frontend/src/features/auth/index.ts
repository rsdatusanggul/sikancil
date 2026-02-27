/**
 * Auth Module Barrel Export
 */

// Types (exclude duplicates from schemas)
export type { User, LoginCredentials, RegisterData, AuthResponse, UserRole, UserStatus } from './types';

// API
export * from './api';

// Hooks
export * from './hooks';

// Components
export * from './components';

// Pages
export { LoginPage } from './pages/LoginPage';

// Schemas
export { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from './schemas';
