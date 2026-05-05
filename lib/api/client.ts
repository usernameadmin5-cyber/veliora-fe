import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";

export const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // send httpOnly refresh-token cookie automatically
});

// Attach access token from Zustand store on every request.
// Reading from getState() (in-memory) is instant and always in sync —
// no localStorage parse, no timing races between setUser() and the first request.
apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = useAuthStore.getState().accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401, try one silent refresh then retry original request
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
        const original = error.config as typeof error.config & { _retry?: boolean };

        // Don't attempt refresh for auth endpoints — 401 there means bad credentials/code
        const url = original?.url ?? "";
        if (error.response?.status !== 401 || original?._retry || url.startsWith("/auth/")) {
            return Promise.reject(normalizeError(error));
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push((token) => {
                    original!.headers!.Authorization = `Bearer ${token}`;
                    original!._retry = true;
                    resolve(apiClient(original!));
                });
                // reject after timeout
                setTimeout(() => reject(new Error("Refresh timeout")), 10_000);
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            const { data } = await axios.post<{ accessToken: string; user: { id: string; name: string; email: string; language: "en" | "uk" } }>(
                `${BASE_URL}/auth/refresh`,
                {},
                { withCredentials: true },
            );

            // Persist the refreshed token through the Zustand store so that
            // both in-memory state and localStorage stay in sync atomically.
            useAuthStore.getState().setUser(data.user, data.accessToken);

            refreshQueue.forEach((cb) => cb(data.accessToken));
            refreshQueue = [];

            original.headers!.Authorization = `Bearer ${data.accessToken}`;
            return apiClient(original);
        } catch (refreshError) {
            refreshQueue = [];
            // Sign out: clear all persisted state via the store action
            useAuthStore.getState().signOut();
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
            return Promise.reject(normalizeError(error));
        } finally {
            isRefreshing = false;
        }
    },
);

function normalizeError(error: AxiosError): Error {
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message =
        (data?.["message"] as string) ??
        error.message ??
        "Something went wrong";
    return new Error(message);
}
