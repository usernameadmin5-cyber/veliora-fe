"use client";

import React, { useRef, useState } from "react";
import {
    Box, Chip, Dialog, DialogContent, IconButton, Stack, Typography,
} from "@mui/material";
import { CloseRounded, PlayArrowRounded, TimerOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { Practice } from "@/lib/api/practicesApi";

interface PracticeModalProps {
    practice: Practice | null;
    onClose: () => void;
}

function isValidVideoUrl(url: string | null | undefined): url is string {
    return typeof url === "string" && url.trim().length > 0;
}

function getYouTubeEmbedUrl(url: string): string | null {
    try {
        const parsed = new URL(url);
        let videoId: string | null = null;
        if (parsed.hostname === "youtu.be") {
            videoId = parsed.pathname.slice(1).split("?")[0];
        } else if (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") {
            if (parsed.pathname === "/watch") {
                videoId = parsed.searchParams.get("v");
            } else if (parsed.pathname.startsWith("/embed/")) {
                return url; // already an embed URL
            } else if (parsed.pathname.startsWith("/shorts/")) {
                videoId = parsed.pathname.split("/shorts/")[1].split("?")[0];
            }
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
        return null;
    }
}

function VideoPlayer({ url }: { url: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [errored, setErrored] = useState(false);

    const youtubeEmbedUrl = getYouTubeEmbedUrl(url);

    if (youtubeEmbedUrl) {
        return (
            <Box
                component="iframe"
                src={youtubeEmbedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                    backgroundColor: "#000",
                }}
            />
        );
    }

    if (errored) {
        return (
            <Stack alignItems="center" justifyContent="center" spacing={1}
                sx={{ height: "100%", backgroundColor: "rgba(0,0,0,0.35)" }}>
                <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                    Video unavailable
                </Typography>
            </Stack>
        );
    }

    return (
        <Box
            component="video"
            ref={videoRef}
            src={url}
            controls
            playsInline
            onError={() => setErrored(true)}
            sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                backgroundColor: "#000",
                display: "block",
                outline: "none",
                "&::-webkit-media-controls-panel": { backgroundColor: "rgba(0,0,0,0.6)" },
            }}
        />
    );
}

export default function PracticeModal({ practice, onClose }: PracticeModalProps) {
    const { t, i18n } = useTranslation();
    if (!practice) return null;

    const title = i18n.language === "uk" ? practice.titleUk : practice.title;
    const hasVideo = isValidVideoUrl(practice.videoUrl);

    const categoryColors: Record<string, string> = {
        "Anxiety Relief": "#6366F1",
        "Meditation": "#7C3AED",
        "Sleep": "#4338CA",
        "Emotional health": "#C084FC",
    };
    const chipColor = categoryColors[practice.category] ?? "#8E7CC3";

    return (
        <Dialog
            open={!!practice}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                        overflow: "hidden",
                        boxShadow: "0 24px 64px rgba(126,107,181,0.28)",
                    },
                },
            }}
        >
            {/* ── Hero: video or thumbnail ── */}
            <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/9", background: practice.gradient }}>
                {hasVideo ? (
                    <VideoPlayer url={practice.videoUrl!} />
                ) : practice.thumbnailUrl ? (
                    <>
                        <Box
                            component="img"
                            src={practice.thumbnailUrl}
                            alt={title}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.style.display = "none";
                            }}
                            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {/* Play icon overlay — decorative since no video */}
                        <Box sx={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            backgroundColor: "rgba(0,0,0,0.15)",
                        }}>
                            <Box sx={{
                                width: 56, height: 56, borderRadius: "50%",
                                backgroundColor: "rgba(255,255,255,0.78)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
                            }}>
                                <PlayArrowRounded sx={{ color: "#7E6BB5", fontSize: 32, ml: 0.5 }} />
                            </Box>
                        </Box>
                    </>
                ) : (
                    /* Gradient-only fallback */
                    <Box sx={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <PlayArrowRounded sx={{ color: "rgba(255,255,255,0.5)", fontSize: 56 }} />
                    </Box>
                )}

                {/* Close button */}
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: "absolute", top: 12, right: 12,
                        backgroundColor: "rgba(0,0,0,0.45)",
                        color: "#fff",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.65)" },
                    }}
                >
                    <CloseRounded sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            {/* ── Details ── */}
            <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: "#5B4D8E", fontSize: { xs: "1.2rem", sm: "1.4rem" }, lineHeight: 1.25, mb: 1.2 }}>
                            {title}
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Chip
                                label={t(`dashboard.dailyCalm.categories.${practice.category}`)}
                                size="small"
                                sx={{
                                    backgroundColor: `${chipColor}18`,
                                    color: chipColor,
                                    fontWeight: 600,
                                    fontSize: "0.78rem",
                                    border: `1px solid ${chipColor}30`,
                                }}
                            />
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <TimerOutlined sx={{ fontSize: 16, color: "#A899CF" }} />
                                <Typography sx={{ color: "#A899CF", fontSize: "0.85rem", fontWeight: 500 }}>
                                    {practice.durationMin} {t("dashboard.dailyCalm.min")}
                                </Typography>
                            </Stack>
                            {!hasVideo && (
                                <Typography sx={{ color: "#C4B5F4", fontSize: "0.78rem" }}>
                                    {t("practices.noVideo")}
                                </Typography>
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
