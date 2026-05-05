"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack, Typography } from "@mui/material";
import { RadioButtonUnchecked } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { usePremiumStore } from "@/store/premiumStore";

export default function AiChatCard() {
    const { t } = useTranslation();
    const router = useRouter();
    const isPremium = usePremiumStore((s) => s.isPremium);

    if (!isPremium) return null;

    const bullet = (label: string) => (
        <Stack direction="row" alignItems="center" spacing={1.2}>
            <RadioButtonUnchecked sx={{ color: "#8E7CC3", fontSize: 18 }} />
            <Typography sx={{ color: "#8E7CC3", fontSize: "0.95rem", fontWeight: 500 }}>
                {label}
            </Typography>
        </Stack>
    );

    return (
        <Box
            sx={{
                backgroundColor: "#fff",
                borderRadius: 4,
                boxShadow: "0 4px 24px rgba(142,124,195,0.1)",
                p: { xs: 2.5, sm: 3.5 },
            }}
        >
            <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                spacing={{ xs: 2, sm: 3 }}
            >
                <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="wrap">
                        <Typography sx={{ fontWeight: 700, color: "#7E6BB5", fontSize: "1.1rem" }}>
                            {t("dashboard.aiChatCard.title")}
                        </Typography>
                        <Box
                            sx={{
                                px: 1.4,
                                py: 0.4,
                                borderRadius: 2,
                                backgroundColor: "rgba(142,124,195,0.15)",
                            }}
                        >
                            <Typography sx={{ color: "#7E6BB5", fontSize: "0.78rem", fontWeight: 600 }}>
                                {t("dashboard.aiChatCard.badge")}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack spacing={0.8}>
                        {bullet(t("dashboard.aiChatCard.instantResponses"))}
                        {bullet(t("dashboard.aiChatCard.smartRecommendation"))}
                    </Stack>
                </Stack>

                <Button
                    variant="contained"
                    onClick={() => router.push("/ai")}
                    sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.2,
                        backgroundColor: "#8E7CC3",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        boxShadow: "0 4px 12px rgba(126,107,181,0.3)",
                        alignSelf: { xs: "stretch", sm: "center" },
                        flexShrink: 0,
                        "&:hover": { backgroundColor: "#7B69B1" },
                    }}
                >
                    {t("dashboard.aiChatCard.startChatting")}
                </Button>
            </Stack>
        </Box>
    );
}
