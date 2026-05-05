"use client";

import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface HeroSectionProps {
    userName: string;
    stressLevel: number;
}

function getGreetingKey(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "dashboard.hero.goodMorning";
    if (hour < 17) return "dashboard.hero.goodAfternoon";
    return "dashboard.hero.goodEvening";
}

function getRecommendationKey(stress: number): string {
    if (stress <= 3) return "dashboard.hero.recommendations.low";
    if (stress <= 6) return "dashboard.hero.recommendations.medium";
    return "dashboard.hero.recommendations.high";
}

export default function HeroSection({ userName, stressLevel }: HeroSectionProps) {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 3,
                py: { xs: 3, sm: 4 },
            }}
        >
            <Stack spacing={1.5} sx={{ flex: 1 }}>
                <Typography
                    sx={{ fontWeight: 700, fontSize: { xs: "2rem", sm: "2.6rem" }, color: "#7E6BB5", lineHeight: 1.15 }}
                >
                    {t(getGreetingKey())}, {userName}
                </Typography>

                <Typography sx={{ color: "#8E7CC3", fontSize: { xs: "1rem", sm: "1.1rem" }, fontWeight: 500 }}>
                    {t("dashboard.hero.stressToday")}{" "}
                    <Box component="span" sx={{ fontWeight: 700, color: "#7E6BB5" }}>
                        {stressLevel}/10
                    </Box>
                </Typography>

                <Typography sx={{ color: "#A899CF", fontSize: "0.875rem" }}>
                    {t("dashboard.hero.recommendation")} {t(getRecommendationKey(stressLevel))}
                </Typography>

                <Box>
                    <Button
                        variant="contained"
                        component="a"
                        href="#recommended-practices"
                        sx={{
                            mt: 1, borderRadius: 3, px: 3.5, py: 1.2,
                            backgroundColor: "#8E7CC3", textTransform: "none", fontWeight: 600, fontSize: "0.95rem",
                            boxShadow: "0 6px 18px rgba(126,107,181,0.35)", "&:hover": { backgroundColor: "#7B69B1" },
                        }}
                    >
                        {t("dashboard.hero.startPractice")}
                    </Button>
                </Box>
            </Stack>

            {/* Planet illustration */}
            <Box
                sx={{
                    flexShrink: 0, width: { xs: 140, sm: 200, md: 220 }, height: { xs: 140, sm: 200, md: 220 },
                    borderRadius: "50%", overflow: "hidden", position: "relative",
                    display: { xs: "none", sm: "block" },
                }}
            >
                <Box
                    component="img"
                    src="/veliora-planet.svg"
                    alt=""
                    sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        if (target.parentElement) {
                            target.parentElement.style.background =
                                "radial-gradient(circle at 35% 35%, #C4B5F4 0%, #9B87D8 40%, #6B55B5 100%)";
                        }
                    }}
                />
            </Box>
        </Box>
    );
}
