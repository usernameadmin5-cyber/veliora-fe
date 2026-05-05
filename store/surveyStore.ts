import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SurveyAnswers } from "@/lib/api/surveyApi";

// Returns "YYYY-MM-DD" for today in local time
export function todayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface SurveyState {
    // Most recent survey answers (updated on every completion)
    answers: Partial<SurveyAnswers>;

    setAnswers: (answers: Partial<SurveyAnswers>) => void;
    reset: () => void;
}

export const useSurveyStore = create<SurveyState>()(
    persist(
        (set) => ({
            answers: {},

            setAnswers: (answers) => set({ answers }),
            reset: () => set({ answers: {} }),
        }),
        { name: "veliora-survey" }
    )
);
