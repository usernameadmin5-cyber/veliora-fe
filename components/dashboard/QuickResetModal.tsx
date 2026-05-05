"use client";

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Dialog, DialogContent, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { dashboardApi } from "@/lib/api/dashboardApi";

interface QuickResetModalProps {
    open: boolean;
    onClose: () => void;
}

export default function QuickResetModal({ open, onClose }: QuickResetModalProps) {
    const { t, i18n } = useTranslation();
    const [tip, setTip] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchTip = () => {
        setLoading(true);
        dashboardApi.getRandomResetTip(i18n.language)
            .then((res) => setTip(res.tip))
            .catch(() => setTip(null))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (open) fetchTip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 4,
                        background: "linear-gradient(160deg, #DDD6F5 0%, #C9BEF0 100%)",
                        boxShadow: "0 24px 60px rgba(126,107,181,0.25)",
                        overflow: "visible",
                    },
                },
            }}
        >
            <DialogContent sx={{ p: { xs: 4, sm: 5 }, textAlign: "center" }}>
                <Typography sx={{ fontWeight: 800, color: "#5B4D8E", fontSize: { xs: "1.4rem", sm: "1.6rem" }, mb: 1 }}>
                    {t("dashboard.quickReset.title")}
                </Typography>
                <Typography sx={{ color: "#7E6BB5", fontSize: "0.95rem", fontWeight: 500, mb: 4 }}>
                    {t("dashboard.quickReset.subtitle")}
                </Typography>

                {/* Tip card */}
                <Box
                    sx={{
                        backgroundColor: "rgba(255,255,255,0.75)",
                        borderRadius: 3,
                        px: 3, py: 3,
                        minHeight: 72,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        mb: 5,
                        boxShadow: "0 4px 16px rgba(126,107,181,0.1)",
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} sx={{ color: "#9B87D8" }} />
                    ) : (
                        <Typography sx={{ color: "#5B4D8E", fontWeight: 500, fontSize: "1rem", lineHeight: 1.6 }}>
                            {tip || ""}
                        </Typography>
                    )}
                </Box>

                {/* Buttons */}
                <Stack direction="row" spacing={2}>
                    <Box
                        component="button"
                        onClick={fetchTip}
                        disabled={loading}
                        sx={{
                            flex: 1,
                            background: "linear-gradient(135deg, #7E6BB5 0%, #5B4D8E 100%)",
                            color: "#fff", border: "none", borderRadius: 3,
                            py: 1.6, cursor: loading ? "default" : "pointer",
                            fontWeight: 700, fontSize: "1rem", fontFamily: "inherit",
                            boxShadow: "0 6px 18px rgba(94,77,142,0.35)",
                            transition: "opacity 0.2s",
                            opacity: loading ? 0.7 : 1,
                            "&:hover:not(:disabled)": { opacity: 0.88 },
                        }}
                    >
                        {t("dashboard.quickReset.tryAnother")}
                    </Box>
                    <Box
                        component="button"
                        onClick={onClose}
                        sx={{
                            flex: 1,
                            backgroundColor: "rgba(255,255,255,0.8)",
                            color: "#7E6BB5", border: "none", borderRadius: 3,
                            py: 1.6, cursor: "pointer",
                            fontWeight: 700, fontSize: "1rem", fontFamily: "inherit",
                            boxShadow: "0 4px 14px rgba(126,107,181,0.12)",
                            transition: "opacity 0.2s",
                            "&:hover": { opacity: 0.88 },
                        }}
                    >
                        {t("dashboard.quickReset.close")}
                    </Box>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
