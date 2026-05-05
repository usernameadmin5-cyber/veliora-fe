import { apiClient } from "./client";

export interface PracticeAttachment {
    practiceId: string;
    title: string;
    titleUk: string;
    durationMin: number;
    category: string;
    thumbnailUrl: string | null;
    videoUrl: string | null;
    gradient: string;
}

export interface ChatReply {
    texts: string[];
    attachment: PracticeAttachment | null;
}

export interface SendMessageResponse {
    conversationId: string;
    reply: ChatReply;
    freeMessagesRemaining: number | null;
}

export interface ChatLimitsResponse {
    isPremium: boolean;
    freeLimit: number;
    usedToday: number;
    remaining: number | null;
    resetsAt: string;
}

export interface ChatHistoryMessage {
    _id: string;
    userId: string;
    conversationId: string;
    role: "user" | "assistant";
    content: string;
    attachment: PracticeAttachment | null;
    sentAt: string;
}

export const aiChatApi = {
    async sendMessage(message: string, conversationId?: string): Promise<SendMessageResponse> {
        const { data } = await apiClient.post<SendMessageResponse>("/ai/chat", {
            message,
            ...(conversationId ? { conversationId } : {}),
        });
        return data;
    },

    async getHistory(limit = 50): Promise<{ messages: ChatHistoryMessage[] }> {
        const { data } = await apiClient.get<{ messages: ChatHistoryMessage[] }>("/ai/chat/history", {
            params: { limit },
        });
        return data;
    },

    async getLimits(): Promise<ChatLimitsResponse> {
        const { data } = await apiClient.get<ChatLimitsResponse>("/ai/chat/limits");
        return data;
    },
};
