"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function WhoWeAre() {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                backgroundColor: "#fff", borderRadius: 4,
                boxShadow: "0 4px 24px rgba(142,124,195,0.1)",
                p: { xs: 2.5, sm: 3.5 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 2.5, sm: 4 },
            }}
        >
            <Stack spacing={2} sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: "#8E7CC3", fontSize: "1.1rem" }}>
                    {t("dashboard.whoWeAre.title")}
                </Typography>
                <Typography sx={{ color: "#8E7CC3", fontSize: "0.9rem", lineHeight: 1.75 }}>
                    {t("dashboard.whoWeAre.description")}
                </Typography>
            </Stack>

            <Box
                sx={{
                    flexShrink: 0, width: { xs: "100%", sm: 200 }, height: { xs: 180, sm: 180 },
                    borderRadius: 3, overflow: "hidden",
                    background: "linear-gradient(135deg, #C4B5F4 0%, #9B87D8 60%, #7E6BB5 100%)",
                }}
            >
                <Box
                    component="img"
                    src="/meditation.svg"
                    alt="Meditation"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = "none"; }}
                />
            </Box>
        </Box>
    );
}
