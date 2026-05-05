"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { ArrowForwardRounded, PlayArrowRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { practicesApi, type Practice } from "@/lib/api/practicesApi";
import { PRACTICE_CATEGORIES, type PracticeCategory } from "@/lib/api/dashboardApi";
import PracticeModal from "@/components/practices/PracticeModal";
import { usePremiumStore } from "@/store/premiumStore";

// ─── Shared practice card (used here and on the full practices page) ──────────

export function PracticeCard({ practice, onClick }: { practice: Practice; onClick?: (p: Practice) => void }) {
    const { t, i18n } = useTranslation();
    const title = i18n.language === "uk" ? practice.titleUk : practice.title;
    const duration = `${practice.durationMin} ${t("dashboard.dailyCalm.min")}`;

    return (
        <Box
            onClick={() => onClick?.(practice)}
            sx={{
                backgroundColor: "#fff",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(142,124,195,0.12)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 28px rgba(142,124,195,0.2)",
                },
            }}
        >
            {/* Thumbnail */}
            <Box
                sx={{
                    position: "relative",
                    aspectRatio: "16/9",
                    background: practice.gradient,
                    overflow: "hidden",
                }}
            >
                {practice.thumbnailUrl && (
                    <Box
                        component="img"
                        src={practice.thumbnailUrl}
                        alt={title}
                        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = "none"; }}
                    />
                )}
                <Box
                    sx={{
                        position: "absolute", inset: 0,
                        backgroundColor: "rgba(0,0,0,0.14)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: 42, height: 42, borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.82)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                        }}
                    >
                        <PlayArrowRounded sx={{ color: "#7E6BB5", fontSize: 26, ml: 0.4 }} />
                    </Box>
                </Box>
            </Box>

            {/* Info — fixed height so all cards stay the same size */}
            <Box sx={{ p: 1.5, pt: 1.2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Typography sx={{ fontWeight: 700, color: "#5B4D8E", fontSize: "0.9rem", mb: 0.3, minHeight: "2.6em", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "#A899CF", fontSize: "0.8rem" }}>
                    {duration}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Category chip ────────────────────────────────────────────────────────────

export function CategoryChip({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <Box
            component="button"
            onClick={onClick}
            sx={{
                px: 2, py: 0.65,
                borderRadius: 5,
                border: active ? "none" : "1.5px solid rgba(142,124,195,0.35)",
                backgroundColor: active ? "#8E7CC3" : "transparent",
                color: active ? "#fff" : "#8E7CC3",
                fontWeight: active ? 600 : 500,
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                "&:hover": {
                    backgroundColor: active ? "#7B69B1" : "rgba(142,124,195,0.07)",
                },
            }}
        >
            {label}
        </Box>
    );
}

// ─── DailyCalm section ────────────────────────────────────────────────────────

interface DailyCalmProps {
    hasCheckIn: boolean;
}

export default function DailyCalm({ hasCheckIn: _hasCheckIn }: DailyCalmProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const isPremium = usePremiumStore((s) => s.isPremium);
    const [activeCategory, setActiveCategory] = useState<PracticeCategory>("All");
    const [practices, setPractices] = useState<Practice[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);

    useEffect(() => {
        setLoading(true);
        let fetch: Promise<Practice[]>;
        if (!isPremium || activeCategory === "Recommended") {
            fetch = practicesApi.getRecommended().then((res) => res.items);
        } else if (activeCategory === "All") {
            fetch = practicesApi.getPractices({ limit: 8 }).then((res) => res.items);
        } else {
            fetch = practicesApi.getPractices({ category: activeCategory, limit: 8 }).then((res) => res.items);
        }
        fetch
            .then(setPractices)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [isPremium, activeCategory]);

    return (
        <Stack spacing={2} id="recommended-practices" sx={{ scrollMarginTop: 16 }}>
            {/* Title row */}
            <Stack direction="row" alignItems="center" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 700, color: "#8E7CC3", fontSize: "1.1rem", flexShrink: 0 }}>
                    {t("dashboard.dailyCalm.title")}
                </Typography>

                {/* Divider line */}
                <Box sx={{ flex: 1, minWidth: 20, height: "1px", backgroundColor: "rgba(142,124,195,0.2)" }} />

                {/* View All — premium only */}
                {isPremium && (
                    <Stack
                        component="button"
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        spacing={0.4}
                        onClick={() => router.push("/practices")}
                        sx={{
                            background: "none",
                            border: "1.5px solid rgba(142,124,195,0.3)",
                            borderRadius: 3,
                            px: 1.6, py: 0.55,
                            cursor: "pointer",
                            transition: "border-color 0.15s, background 0.15s",
                            "&:hover": {
                                borderColor: "#8E7CC3",
                                backgroundColor: "rgba(142,124,195,0.05)",
                            },
                            flexShrink: 0,
                            width: { xs: "100%", sm: "auto" },
                        }}
                    >
                        <Typography sx={{ color: "#8E7CC3", fontWeight: 600, fontSize: "0.85rem" }}>
                            {t("dashboard.dailyCalm.viewAll")}
                        </Typography>
                        <ArrowForwardRounded sx={{ fontSize: 16, color: "#8E7CC3" }} />
                    </Stack>
                )}
            </Stack>

            {/* Category filters — premium only */}
            {isPremium && (
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        pb: 0.5,
                    }}
                >
                    {PRACTICE_CATEGORIES.map((cat) => (
                        <CategoryChip
                            key={cat}
                            label={t(`dashboard.dailyCalm.categories.${cat}`)}
                            active={activeCategory === cat}
                            onClick={() => setActiveCategory(cat)}
                        />
                    ))}
                </Box>
            )}

            {/* Cards grid */}
            {loading ? (
                <Stack alignItems="center" py={3}>
                    <CircularProgress size={24} sx={{ color: "#9B87D8" }} />
                </Stack>
            ) : (
                <Grid container spacing={2} alignItems="stretch">
                    {practices.map((practice, index) => (
                        <Grid key={`${index}_${practice.id}`} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: "flex", minWidth: 0 }}>
                            <PracticeCard practice={practice} onClick={setSelectedPractice} />
                        </Grid>
                    ))}
                </Grid>
            )}

            <PracticeModal
                practice={selectedPractice}
                onClose={() => setSelectedPractice(null)}
            />
        </Stack>
    );
}
