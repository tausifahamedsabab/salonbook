'use client';

import { useSyncExternalStore } from 'react';
import { getSession, subscribe, type Session } from './session';

/**
 * Returns the current session to client components.
 *
 * The Navbar uses this via useSyncExternalStore, so it updates immediately when
 * authentication state changes (login/logout).
 */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession, () => null);
}
