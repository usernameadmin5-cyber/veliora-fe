import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import uk from "./locales/uk";

// Initialise once — guarded so Next.js hot-reload doesn't re-run init
if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        resources: {
            en: { translation: en },
            uk: { translation: uk },
        },
        lng: "en",
        fallbackLng: "en",
        interpolation: { escapeValue: false },
    });
} else {
    // Always sync the latest locale objects so new keys added after the
    // first init (or during hot-reload) are picked up immediately.
    i18n.addResourceBundle("en", "translation", en, true, true);
    i18n.addResourceBundle("uk", "translation", uk, true, true);
}

export default i18n;
