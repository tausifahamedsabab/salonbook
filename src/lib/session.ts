import { authClient } from './auth-client';

/**
 * React hook returning the current Better Auth session state:
 * `{ data, isPending, isRefetching, error }` where `data = { user, session } | null`.
 * Components re-render immediately when the session changes (login/logout).
 */
export function useSession() {
  return authClient.useSession();
}
