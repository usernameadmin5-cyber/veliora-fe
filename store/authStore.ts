import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/api/authApi";
import i18n from "@/i18n/config";
import { useProfileStore } from "./profileStore";
import { useSurveyStore } from "./surveyStore";
import { usePremiumStore } from "./premiumStore";
import { useAiChatStore } from "./aiChatStore";

/** Wipe every non-auth persisted store so no data leaks between accounts. */
function resetAllUserStores() {
    useProfileStore.getState().reset();
    useSurveyStore.getState().reset();
    usePremiumStore.getState().reset();
    useAiChatStore.getState().reset();
}

interface PendingSignUp {
    name: string;
    email: string;
    password: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    // Access token stored in persisted state so the axios interceptor
    // can read it from localStorage between page navigations.
    accessToken: string | null;
    // Tracks which flow triggered OTP verification and where to redirect after
    otpContext: "signup" | "forgot-password" | null;
    // Email used in the current OTP flow
    pendingEmail: string;
    // Sign-up data held until OTP is verified
    pendingSignUp: PendingSignUp | null;
    // Connected auth methods
    googleConnected: boolean;
    // Whether the account has a password set (false for Google-only signups)
    hasPassword: boolean;

    setUser: (user: User, accessToken: string) => void;
    setAccessToken: (token: string) => void;
    setOtpContext: (context: "signup" | "forgot-password", email: string) => void;
    setPendingSignUp: (data: PendingSignUp) => void;
    setGoogleConnected: (value: boolean) => void;
    setHasPassword: (value: boolean) => void;
    signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            otpContext: null,
            pendingEmail: "",
            pendingSignUp: null,
            googleConnected: false,
            hasPassword: true,

            setUser: (user, accessToken) => {
                // If a different user is signing in (e.g. switching accounts),
                // wipe all per-user stores so no data leaks across sessions.
                const currentId = get().user?.id;
                if (currentId && currentId !== user.id) {
                    resetAllUserStores();
                }
                if (user.language && user.language !== i18n.language) {
                    i18n.changeLanguage(user.language);
                }
                set({ user, isAuthenticated: true, accessToken });
            },

            setAccessToken: (token) => set({ accessToken: token }),

            setOtpContext: (context, email) =>
                set({ otpContext: context, pendingEmail: email }),

            setPendingSignUp: (data) => set({ pendingSignUp: data }),

            setGoogleConnected: (value) => set({ googleConnected: value }),

            setHasPassword: (value) => set({ hasPassword: value }),

            signOut: () => {
                resetAllUserStores();
                set({
                    user: null,
                    isAuthenticated: false,
                    accessToken: null,
                    otpContext: null,
                    pendingEmail: "",
                    pendingSignUp: null,
                    googleConnected: false,
                    hasPassword: true,
                });
            },
        }),
        { name: "veliora-auth" }
    )
);
