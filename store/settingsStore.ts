import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppLanguage = "en" | "uk";

interface SettingsState {
    language: AppLanguage;
    setLanguage: (lang: AppLanguage) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: "en",
            setLanguage: (language) => set({ language }),
        }),
        { name: "veliora-settings" }
    )
);
