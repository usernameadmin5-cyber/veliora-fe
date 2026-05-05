import { apiClient } from "./client";

export interface ProfileData {
    id?: string;
    name: string;
    email: string;
    age: number | null;
    timeZone: string;
    language: "en" | "uk";
    hasPassword: boolean;
    googleConnected: boolean;
    googleEmail: string | null;
    avatarUrl: string | null;
    practicePreferences: string[];
    moodThisWeek: string | null;
    stressAvg: number | null;
    isPremium: boolean;
    createdAt: string | null;
}

export interface UpdateProfilePayload {
    name?: string;
    age?: number | null;
    timeZone?: string;
    language?: "en" | "uk";
    practicePreferences?: string[];
}

export interface RequestEmailChangePayload {
    newEmail: string;
    currentPassword: string;
}

export interface ConfirmEmailChangePayload {
    newEmail: string;
    otp: string;
}

export interface ConfirmEmailChangeResponse {
    email: string;
    message: string;
    profile: ProfileData;
}

export const profileApi = {
    async getProfile(): Promise<ProfileData> {
        const { data } = await apiClient.get<ProfileData>("/users/me");
        return data;
    },

    async updateProfile(payload: UpdateProfilePayload): Promise<ProfileData> {
        const { data } = await apiClient.patch<ProfileData>("/users/me", payload);
        return data;
    },

    async requestEmailChange(
        payload: RequestEmailChangePayload,
    ): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>(
            "/users/me/email/request-change",
            payload,
        );
        return data;
    },

    async confirmEmailChange(
        payload: ConfirmEmailChangePayload,
    ): Promise<ConfirmEmailChangeResponse> {
        const { data } = await apiClient.post<ConfirmEmailChangeResponse>(
            "/users/me/email/confirm-change",
            payload,
        );
        return data;
    },

    async uploadAvatar(file: File): Promise<ProfileData> {
        const fd = new FormData();
        fd.append("avatar", file);
        // Do NOT set Content-Type manually — axios emits the correct
        // multipart boundary when given a FormData body.
        const { data } = await apiClient.post<ProfileData>(
            "/users/me/avatar",
            fd,
        );
        return data;
    },
};
