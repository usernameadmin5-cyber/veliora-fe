import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileState {
    name: string;
    email: string;
    age: number | null;
    timeZone: string;
    language: "en" | "uk";
    avatarUrl: string | null;
    practices: string[];
    moodThisWeek: string | null;
    stressAvg: number | null;
    isPremium: boolean;
    createdAt: string | null;
    setProfile: (data: Partial<Omit<ProfileState, "setProfile" | "reset">>) => void;
    reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set) => ({
            name: "",
            email: "",
            age: null,
            timeZone: "UTC",
            language: "en",
            avatarUrl: null,
            practices: [],
            moodThisWeek: null,
            stressAvg: null,
            isPremium: false,
            createdAt: null,
            setProfile: (data) => set((state) => ({ ...state, ...data })),
            reset: () => set({
                name: "", email: "", age: null, timeZone: "UTC", language: "en",
                avatarUrl: null, practices: [], moodThisWeek: null, stressAvg: null,
                isPremium: false, createdAt: null,
            }),
        }),
        { name: "veliora-profile" }
    )
);
