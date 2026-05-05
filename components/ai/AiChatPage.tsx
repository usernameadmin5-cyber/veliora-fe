"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box, Button, Divider, IconButton, InputAdornment,
    Stack, TextField, Typography,
} from "@mui/material";
import { ArrowBackRounded, PlayArrowRounded, SendRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { aiChatApi, type ChatLimitsResponse, type PracticeAttachment } from "@/lib/api/aiChatApi";
import type { Practice } from "@/lib/api/practicesApi";
import GetPremiumModal from "@/components/premium/GetPremiumModal";
import PracticeModal from "@/components/practices/PracticeModal";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "ai" | "user";

interface Message {
    id: string;
    role: Role;
    text: string;
    attachment?: PracticeAttachment | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function attachmentToPractice(a: PracticeAttachment): Practice {
    return {
        id: a.practiceId,
        title: a.title,
        titleUk: a.titleUk ?? a.title,
        durationMin: a.durationMin,
        category: (a.category ?? "Meditation") as Practice["category"],
        thumbnailUrl: a.thumbnailUrl ?? null,
        videoUrl: a.videoUrl ?? null,
        gradient: a.gradient,
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1, py: 0.5 }}>
            <Box
                component="img"
                src="/veliora-logo.svg"
                alt="AI"
                sx={{ width: 32, height: 32, flexShrink: 0 }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.display = "none";
                }}
            />
            <Box
                sx={{
                    backgroundColor: "#fff",
                    borderRadius: "4px 20px 20px 20px",
                    px: 2, py: 1.5,
                    boxShadow: "0 2px 12px rgba(142,124,195,0.12)",
                }}
            >
                <Stack direction="row" spacing={0.6} alignItems="center">
                    {[0, 1, 2].map((i) => (
                        <Box
                            key={i}
                            sx={{
                                width: 7, height: 7, borderRadius: "50%",
                                backgroundColor: "#C4B5F4",
                                animation: "velioraDot 1.3s ease-in-out infinite",
                                animationDelay: `${i * 0.18}s`,
                                "@keyframes velioraDot": {
                                    "0%, 80%, 100%": { transform: "scale(0.55)", opacity: 0.35 },
                                    "40%": { transform: "scale(1)", opacity: 1 },
                                },
                            }}
                        />
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
}

function PracticeCard({
    attachment,
    startLabel,
    onClick,
}: {
    attachment: PracticeAttachment;
    startLabel: string;
    onClick: () => void;
}) {
    const { t, i18n } = useTranslation();
    const title = i18n.language === "uk" ? (attachment.titleUk ?? attachment.title) : attachment.title;
    return (
        <Box
            sx={{
                mt: 1.5, borderRadius: 3, overflow: "hidden",
                backgroundColor: "#fff",
                boxShadow: "0 4px 20px rgba(142,124,195,0.15)",
                maxWidth: 280,
                cursor: "pointer",
                transition: "box-shadow 0.2s, transform 0.15s",
                "&:hover": {
                    boxShadow: "0 8px 28px rgba(142,124,195,0.28)",
                    transform: "translateY(-2px)",
                },
            }}
            onClick={onClick}
        >
            <Box
                sx={{
                    position: "relative",
                    aspectRatio: "16/9",
                    background: attachment.gradient,
                }}
            >
                {attachment.thumbnailUrl ? (
                    <Box
                        component="img"
                        src={attachment.thumbnailUrl}
                        alt={title}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = "none";
                        }}
                        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : null}
                <Box
                    sx={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0.12)",
                    }}
                >
                    <Box
                        sx={{
                            width: 46, height: 46, borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.88)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                        }}
                    >
                        <PlayArrowRounded sx={{ color: "#7E6BB5", fontSize: 28, ml: 0.4 }} />
                    </Box>
                </Box>
            </Box>

            <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
                <Typography sx={{ fontWeight: 700, color: "#5B4D8E", fontSize: "0.95rem" }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "#A899CF", fontSize: "0.8rem", mb: 1.5 }}>
                    {attachment.durationMin} {t("dashboard.dailyCalm.min")}
                </Typography>
                <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    component="div"
                    sx={{
                        borderRadius: 3, textTransform: "none", fontWeight: 700,
                        backgroundColor: "#8E7CC3", fontSize: "0.875rem",
                        boxShadow: "0 4px 12px rgba(126,107,181,0.35)",
                        "&:hover": { backgroundColor: "#7B69B1" },
                    }}
                >
                    {startLabel}
                </Button>
            </Box>
        </Box>
    );
}

function PaywallCard({
    onUpgrade,
    t,
}: {
    onUpgrade: () => void;
    t: (key: string) => string;
}) {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <Box
                sx={{
                    background: "linear-gradient(160deg, #EDE8F9 0%, #E4DCF5 100%)",
                    border: "1px solid rgba(142,124,195,0.2)",
                    borderRadius: 4,
                    p: 3, maxWidth: 440, width: "100%",
                    boxShadow: "0 4px 24px rgba(142,124,195,0.15)",
                    textAlign: "center",
                }}
            >
                <Typography sx={{ fontWeight: 700, color: "#5B4D8E", fontSize: "1rem", mb: 0.5 }}>
                    {t("aiChat.freeLimit.title")}
                </Typography>
                <Typography sx={{ color: "#A899CF", fontSize: "0.85rem" }}>
                    {t("aiChat.freeLimit.subtitle")}
                </Typography>

                <Divider sx={{ my: 2, borderColor: "rgba(142,124,195,0.2)" }} />

                <Typography sx={{ fontWeight: 700, color: "#5B4D8E", fontSize: "1rem", mb: 0.5 }}>
                    {t("aiChat.freeLimit.upgradeTitle")}
                </Typography>
                <Typography sx={{ color: "#A899CF", fontSize: "0.85rem", mb: 2.5 }}>
                    {t("aiChat.freeLimit.upgradeSubtitle")}
                </Typography>

                <Button
                    variant="contained"
                    onClick={onUpgrade}
                    sx={{
                        borderRadius: 3, px: 3, py: 1.1, textTransform: "none", fontWeight: 700,
                        background: "linear-gradient(135deg, #8E7CC3 0%, #6B5AA0 100%)",
                        boxShadow: "0 6px 18px rgba(94,77,142,0.4)",
                        fontSize: "0.9rem",
                        "&:hover": { opacity: 0.92 },
                    }}
                >
                    {t("aiChat.freeLimit.upgradeBtn")}
                </Button>
            </Box>
        </Box>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

let _msgId = 0;
const uid = () => `msg-${++_msgId}-${Date.now()}`;

export default function AiChatPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuthStore();

    const [conversationId, setConversationId] = useState<string | undefined>(undefined);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [premiumOpen, setPremiumOpen] = useState(false);
    const [limits, setLimits] = useState<ChatLimitsResponse | null>(null);
    const [openPractice, setOpenPractice] = useState<Practice | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // On mount: load history and limits in parallel
    useEffect(() => {
        const name = user?.name ?? "there";

        // Initial greeting
        const t1 = setTimeout(() => {
            setMessages([{ id: uid(), role: "ai", text: t("aiChat.greeting", { name }) }]);
        }, 300);
        const t2 = setTimeout(() => {
            setMessages((prev) => [...prev, {
                id: uid(), role: "ai",
                text: t("aiChat.greetingFollowUp"),
            }]);
        }, 900);

        // Load limits
        aiChatApi.getLimits()
            .then(setLimits)
            .catch(() => {});

        // Load history and append after greetings
        aiChatApi.getHistory(50).then(({ messages: hist }) => {
            if (hist.length === 0) return;
            const lastConvId = hist[hist.length - 1].conversationId;
            setConversationId(lastConvId);
            // Expand assistant messages that contain ||| separators
            const mapped: Message[] = hist.flatMap((m): Message[] => {
                if (m.role === "assistant") {
                    const parts = m.content.split("|||").map((s) => s.trim()).filter(Boolean);
                    return parts.map((text, i) => ({
                        id: `${m._id}-${i}`,
                        role: "ai" as const,
                        text,
                        attachment: i === parts.length - 1 ? (m.attachment ?? null) : null,
                    }));
                }
                return [{ id: m._id, role: "user" as const, text: m.content, attachment: null }];
            });
            clearTimeout(t1);
            clearTimeout(t2);
            setMessages(mapped);
        }).catch(() => {});

        return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isAtLimit = limits
        ? (!limits.isPremium && limits.remaining !== null && limits.remaining <= 0)
        : false;

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isTyping) return;

        setMessages((prev) => [...prev, { id: uid(), role: "user", text }]);
        setInput("");
        setIsTyping(true);

        try {
            const res = await aiChatApi.sendMessage(text, conversationId);
            setConversationId(res.conversationId);

            // Show messages one-by-one with typing indicator between each
            const texts = res.reply.texts.length > 0 ? res.reply.texts : ["…"];
            for (let i = 0; i < texts.length; i++) {
                setIsTyping(true);
                // Simulate per-message typing delay (600–1100ms)
                await new Promise((r) => setTimeout(r, 600 + Math.random() * 500));
                setIsTyping(false);
                // Attach practice card only on the last message
                const isLast = i === texts.length - 1;
                setMessages((prev) => [...prev, {
                    id: uid(),
                    role: "ai",
                    text: texts[i],
                    attachment: isLast ? res.reply.attachment : null,
                }]);
                // Small gap between sequential messages
                if (!isLast) await new Promise((r) => setTimeout(r, 200));
            }

            // Update limits from response
            if (res.freeMessagesRemaining !== null) {
                setLimits((prev) => prev
                    ? { ...prev, remaining: res.freeMessagesRemaining, usedToday: prev.freeLimit - (res.freeMessagesRemaining ?? 0) }
                    : prev
                );
            }
        } catch (err: unknown) {
            setIsTyping(false);
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 429) {
                setLimits((prev) => prev ? { ...prev, remaining: 0 } : prev);
            } else {
                setMessages((prev) => [...prev, {
                    id: uid(), role: "ai",
                    text: t("aiChat.error"),
                }]);
            }
        }

        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const showAvatar = (i: number) =>
        messages[i].role === "ai" && (i === 0 || messages[i - 1].role !== "ai");

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(180deg, #EDE8F9 0%, #F0ECFF 60%, #E8E0F8 100%)",
            }}
        >
            {/* ── Header ── */}
            <Box sx={{ flexShrink: 0, px: { xs: 2, sm: 4 }, pt: 2.5, pb: 1.5 }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box
                        component="img"
                        src="/veliora-logo.svg"
                        alt="Veliora"
                        sx={{ width: 44, height: 44 }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />

                    <Stack alignItems="center" spacing={0.4}>
                        <Typography
                            sx={{ fontWeight: 800, color: "#5B4D8E", fontSize: { xs: "1.3rem", sm: "1.5rem" } }}
                        >
                            {t("aiChat.title")}
                        </Typography>
                        <Typography sx={{ color: "#A899CF", fontSize: "0.85rem" }}>
                            {t("aiChat.subtitle")}
                        </Typography>
                        {limits && !limits.isPremium && (
                            <Typography sx={{ color: "#C4B5F4", fontSize: "0.75rem" }}>
                                {limits.remaining ?? 0}/{limits.freeLimit} {t("aiChat.messagesLeft")}
                            </Typography>
                        )}
                    </Stack>

                    <Stack
                        component="button"
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        onClick={() => router.back()}
                        sx={{
                            background: "rgba(255,255,255,0.7)",
                            border: "1px solid rgba(142,124,195,0.2)",
                            borderRadius: 3, px: 1.8, py: 0.9,
                            cursor: "pointer",
                            backdropFilter: "blur(8px)",
                            transition: "background 0.15s",
                            "&:hover": { background: "rgba(255,255,255,0.9)" },
                        }}
                    >
                        <ArrowBackRounded sx={{ fontSize: 18, color: "#8E7CC3" }} />
                        <Typography sx={{ color: "#8E7CC3", fontWeight: 600, fontSize: "0.875rem" }}>
                            {t("profile.back")}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>

            {/* ── Messages ── */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: { xs: 2, sm: 4, md: 8 },
                    py: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.2,
                    "&::-webkit-scrollbar": { width: 4 },
                    "&::-webkit-scrollbar-thumb": {
                        borderRadius: 4,
                        backgroundColor: "rgba(142,124,195,0.2)",
                    },
                }}
            >
                {messages.map((msg, i) => {
                    if (msg.role === "user") {
                        return (
                            <Box
                                key={msg.id}
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    animation: "msgFadeIn 0.25s ease-out",
                                    "@keyframes msgFadeIn": {
                                        from: { opacity: 0, transform: "translateY(6px)" },
                                        to: { opacity: 1, transform: "translateY(0)" },
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        maxWidth: { xs: "78%", sm: "60%" },
                                        background: "linear-gradient(135deg, #9B87D8 0%, #7E6BB5 100%)",
                                        borderRadius: "20px 4px 20px 20px",
                                        px: 2.2, py: 1.4,
                                        boxShadow: "0 4px 16px rgba(126,107,181,0.3)",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            color: "#fff", fontSize: "0.9rem",
                                            lineHeight: 1.6, whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {msg.text}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    }

                    // AI message
                    return (
                        <Stack
                            key={msg.id}
                            direction="row"
                            alignItems="flex-start"
                            spacing={1.2}
                            sx={{
                                animation: "msgFadeIn 0.25s ease-out",
                                "@keyframes msgFadeIn": {
                                    from: { opacity: 0, transform: "translateY(6px)" },
                                    to: { opacity: 1, transform: "translateY(0)" },
                                },
                            }}
                        >
                            <Box sx={{ width: 32, flexShrink: 0, mt: 0.5 }}>
                                {showAvatar(i) && (
                                    <Box
                                        component="img"
                                        src="/veliora-logo.svg"
                                        alt="AI"
                                        sx={{ width: 32, height: 32 }}
                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                )}
                            </Box>

                            <Stack spacing={0} sx={{ maxWidth: { xs: "78%", sm: "55%" } }}>
                                <Box
                                    sx={{
                                        backgroundColor: "#fff",
                                        borderRadius: "4px 20px 20px 20px",
                                        px: 2.2, py: 1.4,
                                        boxShadow: "0 2px 12px rgba(142,124,195,0.1)",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            color: "#6B5FA0", fontSize: "0.9rem",
                                            lineHeight: 1.65, whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {msg.text}
                                    </Typography>
                                </Box>

                                {msg.attachment && (
                                    <PracticeCard
                                        attachment={msg.attachment}
                                        startLabel={t("aiChat.startPractice")}
                                        onClick={() => setOpenPractice(attachmentToPractice(msg.attachment!))}
                                    />
                                )}
                            </Stack>
                        </Stack>
                    );
                })}

                {isTyping && <TypingIndicator />}

                {isAtLimit && (
                    <PaywallCard onUpgrade={() => setPremiumOpen(true)} t={t} />
                )}

                <div ref={messagesEndRef} />
            </Box>

            {/* ── Input bar ── */}
            <Box
                sx={{
                    flexShrink: 0,
                    px: { xs: 2, sm: 4, md: 8 },
                    py: 1.8,
                    backgroundColor: "rgba(237,232,249,0.7)",
                    backdropFilter: "blur(12px)",
                    borderTop: "1px solid rgba(142,124,195,0.1)",
                }}
            >
                <TextField
                    inputRef={inputRef}
                    fullWidth
                    placeholder={t("aiChat.placeholder")}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isAtLimit}
                    multiline
                    maxRows={4}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleSend}
                                        disabled={!input.trim() || isTyping}
                                        sx={{
                                            color: input.trim() && !isTyping ? "#8E7CC3" : "rgba(142,124,195,0.35)",
                                            transition: "color 0.15s",
                                            "&:hover": { backgroundColor: "rgba(142,124,195,0.08)" },
                                        }}
                                    >
                                        <SendRounded sx={{ fontSize: 22 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 4,
                            backgroundColor: "#fff",
                            fontSize: "0.9rem",
                            "& fieldset": { borderColor: "rgba(142,124,195,0.2)" },
                            "&:hover fieldset": { borderColor: "rgba(142,124,195,0.4)" },
                            "&.Mui-focused fieldset": { borderColor: "#8E7CC3" },
                            "&.Mui-disabled": { backgroundColor: "rgba(255,255,255,0.5)" },
                        },
                    }}
                />
            </Box>

            <GetPremiumModal
                open={premiumOpen}
                onClose={() => {
                    setPremiumOpen(false);
                    aiChatApi.getLimits().then(setLimits).catch(() => {});
                }}
            />
            <PracticeModal practice={openPractice} onClose={() => setOpenPractice(null)} />
        </Box>
    );
}
