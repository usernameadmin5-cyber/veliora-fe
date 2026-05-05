"use client";

import React from "react";
import { Box, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/store/profileStore";
import { profileApi } from "@/lib/api/profileApi";

const ALL_PRACTICES = ["Breathing", "Meditation", "Affirmations", "Focus", "Sleep"] as const;

export default function HealthTracking() {
    const { t } = useTranslation();
    const { practices, moodThisWeek, stressAvg, setProfile } = useProfileStore();

    const handleToggle = (practice: string) => {
        const next = practices.includes(practice)
            ? practices.filter((p) => p !== practice)
            : [...practices, practice];
        setProfile({ practices: next });
        profileApi.updateProfile({ practicePreferences: next }).catch(() => {});
    };

    const displayMood = moodThisWeek
        ? t(`survey.steps.emotion.options.${moodThisWeek}`, moodThisWeek)
        : "—";

    return (
        <Box
            sx={{
                backgroundColor: "#fff", borderRadius: 4,
                boxShadow: "0 4px 24px rgba(142,124,195,0.1)",
                p: { xs: 2.5, sm: 3.5 },
                height: "100%",
            }}
        >
            <Typography sx={{ fontWeight: 700, color: "#8E7CC3", fontSize: "1.05rem", mb: 2.5 }}>
                {t("profile.healthTracking.title")}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {/* My Statistics Snapshot */}
                <Box
                    sx={{
                        flex: 1,
                        background: "linear-gradient(135deg, #EDE9F8 0%, #DDD5F5 100%)",
                        borderRadius: 3, p: 2.5,
                    }}
                >
                    <Typography sx={{ fontWeight: 700, color: "#7E6BB5", fontSize: "0.95rem", mb: 2 }}>
                        {t("profile.healthTracking.myStats")}
                    </Typography>

                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ color: "#8E7CC3", fontSize: "0.875rem", fontWeight: 500 }}>
                                {t("profile.healthTracking.moodThisWeek")}
                            </Typography>
                            <Typography sx={{ color: "#5B4D8E", fontWeight: 700, fontSize: "0.875rem" }}>
                                {displayMood}
                            </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ color: "#8E7CC3", fontSize: "0.875rem", fontWeight: 500 }}>
                                {t("profile.healthTracking.stress")}
                            </Typography>
                            <Typography sx={{ color: "#5B4D8E", fontWeight: 700, fontSize: "0.875rem" }}>
                                {stressAvg}/10
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>

                {/* Practice Preferences */}
                <Box
                    sx={{
                        flex: 1,
                        backgroundColor: "#FAFAFA",
                        border: "1px solid rgba(142,124,195,0.12)",
                        borderRadius: 3, p: 2.5,
                    }}
                >
                    <Typography sx={{ fontWeight: 700, color: "#7E6BB5", fontSize: "0.95rem", mb: 0.5 }}>
                        {t("profile.healthTracking.practicePrefs")}
                    </Typography>
                    <Typography sx={{ color: "#A899CF", fontSize: "0.8rem", mb: 1.5 }}>
                        {t("profile.healthTracking.whichPractices")}
                    </Typography>

                    <Stack spacing={0.5}>
                        {ALL_PRACTICES.map((practice) => (
                            <FormControlLabel
                                key={practice}
                                control={
                                    <Checkbox
                                        checked={practices.includes(practice)}
                                        onChange={() => handleToggle(practice)}
                                        size="small"
                                        sx={{
                                            color: "rgba(142,124,195,0.4)",
                                            "&.Mui-checked": { color: "#8E7CC3" },
                                            py: 0.4,
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ color: "#5B4D8E", fontSize: "0.875rem", fontWeight: 500 }}>
                                        {t(`profile.healthTracking.practices.${practice}`)}
                                    </Typography>
                                }
                                sx={{ ml: 0, mr: 0 }}
                            />
                        ))}
                    </Stack>

                    <Typography sx={{ color: "#A899CF", fontSize: "0.75rem", mt: 1.5, fontStyle: "italic" }}>
                        {t("profile.healthTracking.willInfluence")}
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );
}
