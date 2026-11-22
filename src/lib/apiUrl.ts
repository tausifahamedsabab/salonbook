/**
 * Base URL of the Express REST API.
 *
 * `NEXT_PUBLIC_API_URL` must point at the deployed backend in production.
 * The localhost fallback exists only for local development so a missing
 * deployment variable fails fast instead of silently calling the developer's
 * own machine from a live site.
 */
export function getApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/+$/, '');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL must be set in production');
  }
  return 'http://localhost:5000';
}
