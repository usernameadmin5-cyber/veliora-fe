"use client";

import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./config";
import { useSettingsStore, type AppLanguage } from "@/store/settingsStore";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
    const { language } = useSettingsStore();

    // Sync i18n instance with persisted language on mount and whenever it changes
    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language]);

    // Mirror any i18n language change back into the persisted settings store so
    // the latest selected language is remembered across sessions (incl. after
    // logout), no matter which code path triggered the change.
    useEffect(() => {
        const handler = (lng: string) => {
            const normalized = (lng.split("-")[0] as AppLanguage);
            if (normalized !== "en" && normalized !== "uk") return;
            if (useSettingsStore.getState().language !== normalized) {
                useSettingsStore.getState().setLanguage(normalized);
            }
        };
        i18n.on("languageChanged", handler);
        return () => {
            i18n.off("languageChanged", handler);
        };
    }, []);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
