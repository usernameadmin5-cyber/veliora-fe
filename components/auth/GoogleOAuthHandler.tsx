"use client";

import { Suspense } from "react";
import { useGoogleOAuthToken } from "@/lib/hooks/useGoogleOAuthToken";

// Inner component — must be inside Suspense because useSearchParams() requires it
function Inner() {
    useGoogleOAuthToken();
    return null;
}

/**
 * Drop-in component that handles ?token= and ?connected= query params after
 * Google OAuth redirects. Already wrapped in Suspense — safe to render anywhere.
 */
export default function GoogleOAuthHandler() {
    return (
        <Suspense fallback={null}>
            <Inner />
        </Suspense>
    );
}
