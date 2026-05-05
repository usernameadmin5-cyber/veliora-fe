import { apiClient } from "./client";

export const PRACTICE_CATEGORIES = ["All", "Recommended", "Anxiety Relief", "Meditation", "Sleep", "Emotional health"] as const;
export type PracticeCategory = typeof PRACTICE_CATEGORIES[number];

export type WeeklyProgressResponse =
    | { tier: "free"; data: { dayIndex: number; value: number | null }[] }
    | { tier: "premium"; data: { dayIndex: number; stress: number | null; activity: number | null }[]; avgStress: number | null; avgActivity: number | null };

export interface TodayCheckInResponse {
    hasCheckIn: boolean;
    mood?: string;
    stressLevel?: number;
    date?: string;
}


export const dashboardApi = {
    async getTodayCheckIn(): Promise<TodayCheckInResponse> {
        const { data } = await apiClient.get<TodayCheckInResponse>("/dashboard/check-in/today");
        return data;
    },

    async getRandomResetTip(lang: string): Promise<{ tip: string }> {
        const { data } = await apiClient.get<{ tip: string }>("/dashboard/small-reset/tip", { params: { lang } });
        return data;
    },

    async startSmallReset(): Promise<{ message: string; sessionId: string }> {
        const { data } = await apiClient.post<{ message: string; sessionId: string }>("/dashboard/small-reset");
        return data;
    },

    async getWeeklyProgress(timezone?: string, weekStart?: string): Promise<WeeklyProgressResponse> {
        const params: Record<string, string> = {};
        if (timezone) params.timezone = timezone;
        if (weekStart) params.weekStart = weekStart;
        const { data } = await apiClient.get<WeeklyProgressResponse>("/dashboard/weekly-progress", { params });
        return data;
    },

    async startPractice(practiceId: string): Promise<{ message: string; sessionId: string }> {
        const { data } = await apiClient.post<{ message: string; sessionId: string }>("/dashboard/practice/start", { practiceId });
        return data;
    },
};
