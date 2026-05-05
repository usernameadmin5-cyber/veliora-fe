import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";

function getAdminToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem("veliora-admin");
        return raw ? (JSON.parse(raw)?.state?.adminToken ?? null) : null;
    } catch {
        return null;
    }
}

const adminClient = axios.create({ baseURL: BASE_URL });

adminClient.interceptors.request.use((config) => {
    const token = getAdminToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    isVerified: boolean;
    language: string;
    googleConnected: boolean;
    createdAt: string;
    age: number | null;
    timeZone: string;
}

export interface AdminPractice {
    _id: string;
    title: string;
    titleUk: string;
    durationMin: number;
    category: string;
    thumbnailUrl: string | null;
    videoUrl: string | null;
    gradient: string;
    active: boolean;
    createdAt: string;
}

export interface AdminResetTip {
    _id: string;
    en: string;
    uk: string;
}

export interface PracticePayload {
    title: string;
    titleUk: string;
    durationMin: number;
    category: string;
    thumbnailUrl?: string | null;
    videoUrl?: string | null;
    gradient: string;
    active?: boolean;
}

export interface ResetPayload { en: string; uk: string; }

export interface AdminSurvey {
    _id: string;
    userId: string;
    stress: number;
    emotion: string;
    sleepQuality: string;
    activity: number;
    submittedAt: string;
}

export interface SurveyPayload {
    stress: number;
    emotion: string;
    sleepQuality: string;
    activity: number;
    submittedAt?: string;
}

// ── API ────────────────────────────────────────────────────────────────────

export const adminApi = {
    async login(username: string, password: string): Promise<{ accessToken: string }> {
        const { data } = await adminClient.post("/admin/auth/login", { username, password });
        return data;
    },

    // Users
    async getUsers(page = 1): Promise<{ items: AdminUser[]; total: number }> {
        const { data } = await adminClient.get("/admin/users", { params: { page, limit: 50 } });
        return data;
    },
    async verifyUser(id: string): Promise<AdminUser> {
        const { data } = await adminClient.patch(`/admin/users/${id}/verify`);
        return data;
    },
    async deleteUser(id: string): Promise<void> {
        await adminClient.delete(`/admin/users/${id}`);
    },

    // Practices
    async getPractices(page = 1): Promise<{ items: AdminPractice[]; total: number }> {
        const { data } = await adminClient.get("/admin/practices", { params: { page, limit: 50 } });
        return data;
    },
    async createPractice(payload: PracticePayload): Promise<AdminPractice> {
        const { data } = await adminClient.post("/admin/practices", payload);
        return data;
    },
    async updatePractice(id: string, payload: PracticePayload): Promise<AdminPractice> {
        const { data } = await adminClient.patch(`/admin/practices/${id}`, payload);
        return data;
    },
    async deletePractice(id: string): Promise<void> {
        await adminClient.delete(`/admin/practices/${id}`);
    },

    // Reset tips
    async getResetTips(): Promise<AdminResetTip[]> {
        const { data } = await adminClient.get("/admin/resets");
        return data;
    },
    async createResetTip(payload: ResetPayload): Promise<AdminResetTip> {
        const { data } = await adminClient.post("/admin/resets", payload);
        return data;
    },
    async updateResetTip(id: string, payload: ResetPayload): Promise<AdminResetTip> {
        const { data } = await adminClient.patch(`/admin/resets/${id}`, payload);
        return data;
    },
    async deleteResetTip(id: string): Promise<void> {
        await adminClient.delete(`/admin/resets/${id}`);
    },

    // Surveys
    async getUserSurveys(userId: string): Promise<AdminSurvey[]> {
        const { data } = await adminClient.get(`/admin/users/${userId}/surveys`);
        return data;
    },
    async createSurvey(userId: string, payload: SurveyPayload): Promise<AdminSurvey> {
        const { data } = await adminClient.post(`/admin/users/${userId}/surveys`, payload);
        return data;
    },
    async updateSurvey(id: string, payload: SurveyPayload): Promise<AdminSurvey> {
        const { data } = await adminClient.patch(`/admin/surveys/${id}`, payload);
        return data;
    },
    async deleteSurvey(id: string): Promise<void> {
        await adminClient.delete(`/admin/surveys/${id}`);
    },
};
