"use client";

import React, { useState } from "react";
import { Box, Button, Divider, LinearProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import QuickResetModal from "@/components/dashboard/QuickResetModal";

interface TodaysCheckInProps {
    mood: string;
    stressLevel: number;
    hasCheckIn: boolean;
    onTakeSurvey: () => void;
}

export default function TodaysCheckIn({ mood, stressLevel, hasCheckIn, onTakeSurvey }: TodaysCheckInProps) {
    const { t } = useTranslation();
    const [resetOpen, setResetOpen] = useState(false);

    // Translate stored emotion key → display label
    const displayMood = mood ? t(`survey.steps.emotion.options.${mood}`, mood) : t("survey.steps.emotion.options.Neutral");

    return (
        <Box
            sx={{
                backgroundColor: "#fff", borderRadius: 4,
                boxShadow: "0 4px 24px rgba(142,124,195,0.1)",
                p: { xs: 2.5, sm: 3.5 },
            }}
        >
            <Typography sx={{ fontWeight: 700, color: "#8E7CC3", fontSize: "1.1rem", mb: 2.5 }}>
                {t("dashboard.checkIn.title")}
            </Typography>

            {!hasCheckIn ? (
                <Stack alignItems="center" justifyContent="center" spacing={3} sx={{ py: { xs: 4, sm: 5 } }}>
                    <Typography sx={{ color: "#A899CF", fontSize: "1rem" }}>
                        {t("dashboard.checkIn.takeSurveyPrompt")}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={onTakeSurvey}
                        sx={{
                            borderRadius: 3, px: 4, py: 1.2, backgroundColor: "#8E7CC3",
                            textTransform: "none", fontWeight: 600, fontSize: "0.95rem",
                            boxShadow: "0 6px 18px rgba(126,107,181,0.35)", "&:hover": { backgroundColor: "#7B69B1" },
                        }}
                    >
                        {t("dashboard.checkIn.takeSurvey")}
                    </Button>
                </Stack>
            ) : (
                <>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        divider={
                            <Divider orientation="vertical" flexItem
                                sx={{ borderColor: "rgba(142,124,195,0.15)", display: { xs: "none", sm: "block" } }} />
                        }
                        spacing={0}
                    >
                        {/* Current Mood */}
                        <Stack flex={1} spacing={1} sx={{ px: { xs: 0, sm: 3 }, py: { xs: 2, sm: 0 } }}>
                            <Typography sx={{ color: "#A899CF", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {t("dashboard.checkIn.currentMood")}
                            </Typography>
                            <Typography sx={{ color: "#7E6BB5", fontWeight: 500, fontSize: "1rem" }}>
                                {displayMood}
                            </Typography>
                        </Stack>

                        {/* Stress Level */}
                        <Stack flex={1} spacing={1.5} sx={{ px: { xs: 0, sm: 3 }, py: { xs: 2, sm: 0 } }}>
                            <Typography sx={{ color: "#A899CF", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {t("dashboard.checkIn.stressLevel")}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={(stressLevel / 10) * 100}
                                sx={{
                                    height: 8, borderRadius: 4,
                                    backgroundColor: "rgba(142,124,195,0.15)",
                                    "& .MuiLinearProgress-bar": {
                                        borderRadius: 4,
                                        background: "linear-gradient(90deg, #9B87D8 0%, #7E6BB5 100%)",
                                    },
                                }}
                            />
                            <Typography sx={{ color: "#7E6BB5", fontWeight: 600, fontSize: "0.9rem" }}>
                                {stressLevel}/10
                            </Typography>
                        </Stack>

                        {/* Small Reset */}
                        <Stack flex={1} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }}
                            sx={{ px: { xs: 0, sm: 3 }, py: { xs: 2, sm: 0 } }}>
                            <Typography sx={{ color: "#A899CF", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {t("dashboard.checkIn.smallReset")}
                            </Typography>
                            <Button
                                variant="contained" onClick={() => setResetOpen(true)} size="small"
                                sx={{
                                    borderRadius: 3, px: 3, py: 0.8, backgroundColor: "#8E7CC3",
                                    textTransform: "none", fontWeight: 600, fontSize: "0.875rem",
                                    boxShadow: "0 4px 12px rgba(126,107,181,0.3)", "&:hover": { backgroundColor: "#7B69B1" },
                                }}
                            >
                                {t("dashboard.checkIn.start")}
                            </Button>
                        </Stack>
                    </Stack>

                    <Divider sx={{ mt: 3, mb: 2.5, borderColor: "rgba(142,124,195,0.12)" }} />

                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Button
                            variant="contained"
                            onClick={onTakeSurvey}
                            sx={{
                                borderRadius: 3, px: 4, py: 1, backgroundColor: "#8E7CC3",
                                textTransform: "none", fontWeight: 600, fontSize: "0.875rem",
                                boxShadow: "0 4px 12px rgba(126,107,181,0.25)", "&:hover": { backgroundColor: "#7B69B1" },
                            }}
                        >
                            {t("dashboard.checkIn.update")}
                        </Button>
                    </Box>
                </>
            )}

            <QuickResetModal open={resetOpen} onClose={() => setResetOpen(false)} />
        </Box>
    );
}
