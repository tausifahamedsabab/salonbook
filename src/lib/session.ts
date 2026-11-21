'use client';

import { useSyncExternalStore } from 'react';

export interface AppUser {
  userId: string;
  name: string;
  email?: string;
  role: 'admin' | 'customer';
}

export interface Session {
  token: string;
  user: AppUser;
}

const TOKEN_KEY = 'salonbook_token';
const USER_KEY = 'salonbook_user';
const USER_COOKIE = 'salonbook_user';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function b64UrlToUtf8(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  try {
    return atob(base64 + pad);
  } catch {
    return '';
  }
}

function decodeTokenPayload(token: string): AppUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(b64UrlToUtf8(parts[1]));
    if (typeof payload.role !== 'string' || typeof payload.name !== 'string') return null;
    return {
      userId: payload.userId || payload.sub || '',
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

function readSession(): Session | null {
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const userJson = window.localStorage.getItem(USER_KEY);
    if (token && userJson) {
      const user = JSON.parse(userJson);
      if (user?.role && user?.name) {
        return { token, user: { ...user, userId: user.userId || user._id || '' } };
      }
    }
  } catch {
    // Ignore storage errors
  }
  const token = window.localStorage.getItem(TOKEN_KEY);
  const payload = token ? decodeTokenPayload(token) : null;
  if (payload && token) return { token, user: payload };
  return null;
}

let session: Session | null = isBrowser() ? readSession() : null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function getSessionSnapshot(): Session | null {
  return session;
}

export function getSession(): Session | null {
  return session;
}

export function setSession(next: Session): void {
  if (!isBrowser()) return;
  session = next;
  try {
    window.localStorage.setItem(TOKEN_KEY, next.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify({ ...next.user, userId: next.user.userId }));
  } catch {
    // Ignore storage errors
  }
  try {
    // Mirror the role in a cookie so Next.js' proxy.ts can guard protected routes server-side.
    const mirror = JSON.stringify({ role: next.user.role, userId: next.user.userId });
    document.cookie = `${USER_COOKIE}=${encodeURIComponent(mirror)}; path=/; max-age=604800`;
  } catch {
    // Cookies unavailable
  }
  notify();
}

export function clearSession(): void {
  if (!isBrowser()) return;
  session = null;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    document.cookie = `${USER_COOKIE}=; path=/; max-age=0`;
  } catch {
    // Cookies unavailable
  }
  notify();
}

export function isLoggedIn(): boolean {
  return session !== null;
}

export function isAdmin(): boolean {
  return session?.user.role === 'admin';
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Subscribes to session changes. Navbar uses this via useSyncExternalStore so the
 * Navbar content updates immediately whenever authentication state changes.
 */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSessionSnapshot, () => null);
}
