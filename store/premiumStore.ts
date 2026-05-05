import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PremiumState {
    isPremium: boolean;
    plan: "monthly" | "yearly" | null;
    status: "active" | "cancelled" | null;
    currentPeriodEnd: string | null;
    setSubscription: (data: {
        isPremium: boolean;
        plan: "monthly" | "yearly" | null;
        status: "active" | "cancelled" | null;
        currentPeriodEnd: string | null;
    }) => void;
    reset: () => void;
}

export const usePremiumStore = create<PremiumState>()(
    persist(
        (set) => ({
            isPremium: false,
            plan: null,
            status: null,
            currentPeriodEnd: null,
            setSubscription: (data) =>
                set({
                    isPremium: data.isPremium,
                    plan: data.plan,
                    status: data.status,
                    currentPeriodEnd: data.currentPeriodEnd,
                }),
            reset: () => set({ isPremium: false, plan: null, status: null, currentPeriodEnd: null }),
        }),
        { name: "veliora-premium" }
    )
);
