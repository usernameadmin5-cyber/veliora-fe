import { apiClient } from "./client";

export interface User {
    id: string;
    name: string;
    email: string;
    language: "en" | "uk";
}

export interface SignInPayload {
    email: string;
    password: string;
}

export interface SignUpPayload {
    name: string;
    email: string;
    password: string;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
    context: "signup" | "forgot-password";
}

export interface ForgotPasswordPayload {
    email: string;
    password: string;
    confirmPassword: string;
}

export const authApi = {
    async signIn(payload: SignInPayload): Promise<{ accessToken: string; user: User }> {
        const { data } = await apiClient.post<{ accessToken: string; user: User }>("/auth/sign-in", {
            email: payload.email,
            password: payload.password,
        });
        return data;
    },

    async signUp(payload: SignUpPayload): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>("/auth/sign-up", payload);
        return data;
    },

    async verifyOtp(payload: VerifyOtpPayload): Promise<{ accessToken?: string; user?: User; message: string }> {
        const { data } = await apiClient.post<{ accessToken?: string; user?: User; message: string }>(
            "/auth/verify-otp",
            payload,
        );
        return data;
    },

    async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>("/auth/forgot-password", {
            email: payload.email,
            newPassword: payload.password,
            confirmPassword: payload.confirmPassword,
        });
        return data;
    },

    async resendOtp(email: string, context: "signup" | "forgot-password" = "signup"): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>("/auth/resend-otp", { email, context });
        return data;
    },

    async refresh(): Promise<{ accessToken: string; user: User }> {
        const { data } = await apiClient.post<{ accessToken: string; user: User }>("/auth/refresh");
        return data;
    },

    async signOut(): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>("/auth/sign-out");
        return data;
    },

    async connectGoogle(googleToken: string): Promise<{ email: string }> {
        const { data } = await apiClient.post<{ message: string; googleEmail: string }>("/auth/google/connect", { googleToken });
        return { email: data.googleEmail };
    },

    async disconnectGoogle(): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>("/auth/google/disconnect");
        return data;
    },

    async setPassword(password: string, confirmPassword: string): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>("/auth/set-password", { password, confirmPassword });
        return data;
    },
};
