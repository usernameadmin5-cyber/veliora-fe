import { apiClient } from "./client";

export interface Practice {
    id: string;
    title: string;
    titleUk: string;
    durationMin: number;
    category: "Anxiety Relief" | "Meditation" | "Sleep" | "Emotional health";
    thumbnailUrl: string | null;
    videoUrl: string | null;
    gradient: string;
}

export interface PracticesResponse {
    items: Practice[];
    total: number;
    page: number;
    limit: number;
}

export interface GetPracticesParams {
    category?: string;
    page?: number;
    limit?: number;
}

export const practicesApi = {
    async getPractices(params?: GetPracticesParams): Promise<PracticesResponse> {
        const { data } = await apiClient.get<PracticesResponse>("/practices", { params });
        return data;
    },

    async getRecommended(): Promise<{ items: Practice[] }> {
        const { data } = await apiClient.get<{ items: Practice[] }>("/practices/recommended");
        return data;
    },
};
