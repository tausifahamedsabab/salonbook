/**
 * Base URL of the Express REST API.
 * - Browser: empty string so requests go same-origin (/api/...) through Next rewrites.
 * - Server: uses NEXT_PUBLIC_API_URL in production or localhost in local dev.
 */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_URL must be set in production");
  }
  return "http://localhost:5000";
}
