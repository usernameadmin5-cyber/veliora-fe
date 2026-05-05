import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayKey } from "./surveyStore";

export const FREE_MESSAGES_LIMIT = 3;

interface AiChatState {
    freeMessagesUsed: number;
    lastUsedDate: string | null;
    recordMessage: () => void;
    reset: () => void;
}

export const useAiChatStore = create<AiChatState>()(
    persist(
        (set, get) => ({
            freeMessagesUsed: 0,
            lastUsedDate: null,
            reset: () => set({ freeMessagesUsed: 0, lastUsedDate: null }),
            recordMessage: () => {
                const today = todayKey();
                const { lastUsedDate, freeMessagesUsed } = get();
                if (lastUsedDate !== today) {
                    set({ freeMessagesUsed: 1, lastUsedDate: today });
                } else {
                    set({ freeMessagesUsed: freeMessagesUsed + 1 });
                }
            },
        }),
        { name: "veliora-ai-chat" }
    )
);
