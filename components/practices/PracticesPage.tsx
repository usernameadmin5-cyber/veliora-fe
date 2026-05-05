"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Container, Grid, Stack, Typography } from "@mui/material";
import { ArrowBackRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { practicesApi, type Practice } from "@/lib/api/practicesApi";
import { PracticeCard, CategoryChip } from "@/components/dashboard/sections/DailyCalm";
import { PRACTICE_CATEGORIES, type PracticeCategory } from "@/lib/api/dashboardApi";
import PracticeModal from "@/components/practices/PracticeModal";
import { usePremiumStore } from "@/store/premiumStore";

export default function PracticesPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const isPremium = usePremiumStore((s) => s.isPremium);
    const [activeCategory, setActiveCategory] = useState<PracticeCategory>("All");
    const [practices, setPractices] = useState<Practice[]>([]);
    const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
    const LIMIT = 20;

    useEffect(() => {
        if (!isPremium) {
            router.replace("/dashboard");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPremium]);

    // Fetch recommended IDs once so we can surface them first in other listings.
    useEffect(() => {
        if (!isPremium) return;
        practicesApi.getRecommended()
            .then((res) => setRecommendedIds(res.items.map((p) => p.id)))
            .catch(() => {});
    }, [isPremium]);

    useEffect(() => {
        setLoading(true);
        if (activeCategory === "Recommended") {
            practicesApi.getRecommended()
                .then((res) => {
                    setPractices(res.items);
                    setTotal(res.items.length);
                })
                .catch(() => {})
                .finally(() => setLoading(false));
            return;
        }
        const params = {
            page,
            limit: LIMIT,
            ...(activeCategory !== "All" ? { category: activeCategory } : {}),
        };
        practicesApi.getPractices(params)
            .then((res) => {
                if (page === 1) {
                    setPractices(res.items);
                } else {
                    setPractices((prev) => [...prev, ...res.items]);
                }
                setTotal(res.total);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeCategory, page]);

    const handleCategoryChange = (cat: PracticeCategory) => {
        setActiveCategory(cat);
        setPage(1);
        setPractices([]);
    };

    // Sort so recommended items appear before the rest (except on the
    // dedicated "Recommended" view, which is already entirely recommended).
    const displayPractices = useMemo(() => {
        if (activeCategory === "Recommended" || recommendedIds.length === 0) {
            return practices;
        }
        const recSet = new Set(recommendedIds);
        const recs = practices.filter((p) => recSet.has(p.id));
        const rest = practices.filter((p) => !recSet.has(p.id));
        return [...recs, ...rest];
    }, [practices, recommendedIds, activeCategory]);

    const hasMore = activeCategory !== "Recommended" && practices.length < total;

    if (!isPremium) return null;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #EDE8F9 0%, #F5F2FC 100%)",
            }}
        >
            {/* ── Sticky header ── */}
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    backgroundColor: "rgba(240,235,252,0.88)",
                    backdropFilter: "blur(12px)",
                    borderBottom: "1px solid rgba(142,124,195,0.12)",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: { xs: 2, sm: 3, md: 4 }, height: 64, gap: 2 }}
                >
                    {/* Logo */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                        <Box
                            component="img"
                            src="/veliora-logo.svg"
                            alt="Veliora"
                            sx={{ width: 34, height: 34 }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                        <Typography sx={{ fontWeight: 700, color: "#7E6BB5", fontSize: "1rem" }}>
                            Veliora
                        </Typography>
                    </Stack>

                    {/* Back button */}
                    <Stack
                        component="button"
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        onClick={() => router.back()}
                        sx={{
                            flexShrink: 0,
                            background: "rgba(255,255,255,0.7)",
                            border: "1px solid rgba(142,124,195,0.2)",
                            borderRadius: 3,
                            px: 1.8, py: 0.75,
                            cursor: "pointer",
                            transition: "background 0.15s",
                            "&:hover": { background: "rgba(255,255,255,0.95)" },
                        }}
                    >
                        <ArrowBackRounded sx={{ fontSize: 18, color: "#8E7CC3" }} />
                        <Typography sx={{ color: "#8E7CC3", fontWeight: 600, fontSize: "0.875rem" }}>
                            {t("profile.back")}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>

            {/* ── Category filters ── */}
            <Container maxWidth="xl" sx={{ pt: { xs: 2, sm: 3 } }}>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                    }}
                >
                    {PRACTICE_CATEGORIES.map((cat) => (
                        <CategoryChip
                            key={cat}
                            label={t(`dashboard.dailyCalm.categories.${cat}`)}
                            active={activeCategory === cat}
                            onClick={() => handleCategoryChange(cat)}
                        />
                    ))}
                </Box>
            </Container>

            {/* ── Grid ── */}
            <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>
                {loading && page === 1 ? (
                    <Stack alignItems="center" py={10}>
                        <CircularProgress size={32} sx={{ color: "#9B87D8" }} />
                    </Stack>
                ) : (
                    <>
                        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                            {displayPractices.map((practice, index) => (
                                <Grid key={`${index}_${practice.id}`} size={{ xs: 6, sm: 4, md: 3, lg: 12 / 5 }}>
                                    <PracticeCard practice={practice} onClick={setSelectedPractice} />
                                </Grid>
                            ))}
                        </Grid>

                        {displayPractices.length === 0 && !loading && (
                            <Box sx={{ textAlign: "center", py: 10 }}>
                                <Typography sx={{ color: "#A899CF", fontSize: "1rem" }}>
                                    No practices found in this category.
                                </Typography>
                            </Box>
                        )}

                        {hasMore && (
                            <Stack alignItems="center" mt={4}>
                                {loading ? (
                                    <CircularProgress size={24} sx={{ color: "#9B87D8" }} />
                                ) : (
                                    <Box
                                        component="button"
                                        onClick={() => setPage((p) => p + 1)}
                                        sx={{
                                            px: 4, py: 1.2,
                                            borderRadius: 3,
                                            border: "1.5px solid rgba(142,124,195,0.35)",
                                            background: "none",
                                            color: "#8E7CC3",
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            "&:hover": { backgroundColor: "rgba(142,124,195,0.07)" },
                                        }}
                                    >
                                        Load more
                                    </Box>
                                )}
                            </Stack>
                        )}
                    </>
                )}
            </Container>

            <PracticeModal
                practice={selectedPractice}
                onClose={() => setSelectedPractice(null)}
            />
        </Box>
    );
}
