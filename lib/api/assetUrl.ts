// Backend static-serves uploaded files at `/uploads/...` (relative to the
// server root, NOT under the /v1 API prefix). The stored avatarUrl is a
// path like `/uploads/avatars/<userId>_<uuid>.jpg`.
//
// This helper turns that root-relative path into an absolute URL the
// browser can fetch, using the same origin as the API client.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";

function apiOrigin(): string {
    try {
        const u = new URL(API_URL);
        return `${u.protocol}//${u.host}`;
    } catch {
        // Fallback: strip a trailing /v1 if it's there, otherwise return as-is.
        return API_URL.replace(/\/v\d+\/?$/, "");
    }
}

/**
 * Resolves a server-relative asset path (e.g. "/uploads/avatars/abc.jpg")
 * to an absolute URL. Returns absolute URLs unchanged and returns null for
 * falsy input so callers can pass it straight to `<img src>`.
 */
export function absoluteAssetUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const origin = apiOrigin();
    return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
