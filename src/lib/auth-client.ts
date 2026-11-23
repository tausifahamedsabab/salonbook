import { createAuthClient } from "better-auth/react";
import { getApiUrl } from "@/lib/apiUrl";

/**
 * Better Auth client for the REST API (Express backend).
 * In the browser, baseURL is empty so requests go to same-origin (/api/auth/*)
 * and get proxied by Next.js rewrites; cookies are then set on the frontend domain.
 */
export const authClient = createAuthClient({
  baseURL: getApiUrl(),
  basePath: "/api/auth",
});
