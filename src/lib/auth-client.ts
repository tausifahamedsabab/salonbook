import { createAuthClient } from 'better-auth/react';
import { getApiUrl } from '@/lib/apiUrl';

/**
 * Better Auth client for the REST API (Express backend).
 * Cookies are sent automatically (credentials: 'include').
 */
export const authClient = createAuthClient({
  baseURL: getApiUrl(),
  basePath: '/api/auth',
});
