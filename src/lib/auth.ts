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

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const userJson = window.localStorage.getItem(USER_KEY);
    if (token && userJson) {
      const user = JSON.parse(userJson);
      if (user?.role && user?.name) {
        return { token, user: { ...user, userId: user.userId || user._id } };
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

export function setSession(session: Session): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify({ ...session.user, userId: session.user.userId }));
  try {
    // Mirror the role in a cookie so Next.js' proxy.ts can guard protected routes server-side.
    const mirror = JSON.stringify({ role: session.user.role, userId: session.user.userId });
    document.cookie = `${USER_COOKIE}=${encodeURIComponent(mirror)}; path=/; max-age=604800`;
  } catch {
    // Cookies unavailable
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  try {
    document.cookie = `${USER_COOKIE}=; path=/; max-age=0`;
  } catch {
    // Cookies unavailable
  }
}

export function isLoggedIn(): boolean {
  return !!getSession();
}

export function isAdmin(): boolean {
  return getSession()?.user.role === 'admin';
}
