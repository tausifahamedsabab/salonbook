'use client';

import { useAuthGuard } from '@/lib/useAuthGuard';

/**
 * Mounted on routes that must be private (e.g. service details pages).
 * Redirects to /sign-in when the visitor is not authenticated.
 */
export default function RequireAuthentication() {
  useAuthGuard('any');
  return null;
}
