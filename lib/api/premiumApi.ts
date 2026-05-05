import { apiClient } from "./client";

export interface SubscribeResponse {
    plan: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
}

export interface CancelResponse {
    message: string;
    cancelledAt: string;
}

export interface PremiumStatusResponse {
    isPremium: boolean;
    plan: "monthly" | "yearly" | null;
    status: "active" | "cancelled" | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
}

export const premiumApi = {
    async subscribe(plan: "monthly" | "yearly"): Promise<SubscribeResponse> {
        const { data } = await apiClient.post<SubscribeResponse>("/premium/subscribe", { plan });
        return data;
    },

    async cancelSubscription(): Promise<CancelResponse> {
        const { data } = await apiClient.post<CancelResponse>("/premium/cancel", {});
        return data;
    },

    async getStatus(): Promise<PremiumStatusResponse> {
        const { data } = await apiClient.get<PremiumStatusResponse>("/premium/status");
        return data;
    },
};
