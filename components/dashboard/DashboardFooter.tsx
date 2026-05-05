"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function DashboardFooter() {
    const { t } = useTranslation();

    return (
        <Box
            component="footer"
            sx={{ py: 5, mt: 4, textAlign: "center", borderTop: "1px solid rgba(142,124,195,0.12)" }}
        >
            <Stack spacing={0.5} alignItems="center">
                <Typography sx={{ fontWeight: 700, color: "#8E7CC3", fontSize: "0.95rem" }}>
                    Veliora
                </Typography>
                <Typography sx={{ color: "#A899CF", fontSize: "0.8rem" }}>
                    {t("dashboard.footer.tagline")}
                </Typography>
                <Typography sx={{ color: "#B8ACDA", fontSize: "0.75rem" }}>
                    {t("dashboard.footer.rights")}
                </Typography>
            </Stack>
        </Box>
    );
}
