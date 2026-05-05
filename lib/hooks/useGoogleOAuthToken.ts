"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/authApi";

/**
 * Handles two redirect params set by the backend after Google OAuth:
 *
 *  ?token=<accessToken>  — standard login/sign-up flow (lands on /dashboard)
 *  ?connected=1          — Google account linked to existing user (lands on /profile)
 *  ?connected=error      — nonce expired or some other issue
 *  ?connected=conflict   — Google account already linked to another user
 */
export function useGoogleOAuthToken() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser, setGoogleConnected } = useAuthStore();

    // ── OAuth login / sign-up: ?token=<accessToken> ────────────────────────
    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) return;

        // Store immediately so subsequent requests carry the Authorization header.
        // This covers both returning users (existing localStorage entry) and brand-new
        // users who have no entry yet — without it the refresh call would have no
        // token to send and the user would stay unauthenticated.
        try {
            const raw = localStorage.getItem("veliora-auth");
            const stored = raw ? JSON.parse(raw) : { state: {}, version: 0 };
            stored.state = { ...stored.state, accessToken: token, isAuthenticated: true };
            localStorage.setItem("veliora-auth", JSON.stringify(stored));
        } catch {
            // ignore — refresh() below will still work via the HttpOnly cookie
        }

        // Fetch user info via the refresh endpoint (also rotates refresh cookie)
        authApi
            .refresh()
            .then(({ accessToken, user }) => {
                setUser(user, accessToken);
            })
            .catch(() => {
                // Fallback: keep the URL token
            });

        // Remove ?token= from URL without a hard reload
        const params = new URLSearchParams(searchParams.toString());
        params.delete("token");
        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
        router.replace(newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Google connect result: ?connected=1|error|conflict ─────────────────
    useEffect(() => {
        const connected = searchParams.get("connected");
        if (!connected) return;

        if (connected === "1") {
            setGoogleConnected(true);
        }
        // connected=error / connected=conflict — no store update; UI can surface
        // a message if needed via the param itself.

        // Remove ?connected= from URL
        const params = new URLSearchParams(searchParams.toString());
        params.delete("connected");
        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
        router.replace(newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
