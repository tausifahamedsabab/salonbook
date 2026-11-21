import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client for the REST API (Express backend).
 * Cookies are sent automatically (credentials: 'include').
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  basePath: '/api/auth',
});
