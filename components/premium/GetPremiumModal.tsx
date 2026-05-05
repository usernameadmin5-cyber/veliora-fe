"use client";

import React, { useState } from "react";
import {
    Box, Checkbox, Dialog, DialogContent, Divider, FormControlLabel,
    IconButton, InputAdornment, Stack, TextField, Typography,
} from "@mui/material";
import { CloseRounded, LockOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { premiumApi } from "@/lib/api/premiumApi";
import { usePremiumStore } from "@/store/premiumStore";

type Plan = "monthly" | "yearly";

interface PlanConfig {
    key: Plan;
    labelKey: string;
    priceKey: string;
    secondaryKey: string;
    price: string;
}

const PLANS: PlanConfig[] = [
    {
        key: "monthly",
        labelKey: "premium.plans.monthly",
        priceKey: "premium.plans.monthlyPrice",
        secondaryKey: "premium.plans.monthlySecondary",
        price: "$9.99",
    },
    {
        key: "yearly",
        labelKey: "premium.plans.yearly",
        priceKey: "premium.plans.yearlyPrice",
        secondaryKey: "premium.plans.yearlySecondary",
        price: "$59.99",
    },
];

const FEATURES = [
    "premium.features.unlimited",
    "premium.features.aiInsights",
    "premium.features.moodAnalytics",
] as const;

interface GetPremiumModalProps {
    open: boolean;
    onClose: () => void;
}

export default function GetPremiumModal({ open, onClose }: GetPremiumModalProps) {
    const { t } = useTranslation();
    const { setSubscription } = usePremiumStore();

    const [selectedPlan, setSelectedPlan] = useState<Plan>("monthly");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [processing, setProcessing] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activePlan = PLANS.find((p) => p.key === selectedPlan)!;

    const formatCard = (v: string) => {
        const digits = v.replace(/\D/g, "").slice(0, 16);
        return digits.replace(/(.{4})/g, "$1 ").trim();
    };

    const formatExpiry = (v: string) => {
        const digits = v.replace(/\D/g, "").slice(0, 4);
        if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2);
        return digits;
    };

    const handleSubscribe = async () => {
        setProcessing(true);
        setError(null);
        try {
            const result = await premiumApi.subscribe(selectedPlan);
            setSubscription({
                isPremium: true,
                plan: result.plan as Plan,
                status: "active",
                currentPeriodEnd: result.currentPeriodEnd,
            });
            setDone(true);
            setTimeout(() => {
                setDone(false);
                onClose();
            }, 1400);
        } catch {
            setError(t("premium.payment.error"));
        } finally {
            setProcessing(false);
        }
    };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            backgroundColor: "#fff",
            fontSize: "0.95rem",
            "& fieldset": { borderColor: "rgba(142,124,195,0.25)" },
            "&:hover fieldset": { borderColor: "#8E7CC3" },
            "&.Mui-focused fieldset": { borderColor: "#8E7CC3" },
        },
    };

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
                        background: "linear-gradient(160deg, #EDE8F9 0%, #E4DCF5 100%)",
                        border: "2px solid #8B9FE8",
                        boxShadow: "0 24px 60px rgba(126,107,181,0.25)",
                        overflow: "visible",
                    },
                },
            }}
        >
            <DialogContent sx={{ p: { xs: 3, sm: 4 }, position: "relative" }}>
                {/* Close */}
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: "absolute", top: 14, right: 14,
                        color: "#8E7CC3",
                        "&:hover": { backgroundColor: "rgba(142,124,195,0.1)" },
                    }}
                >
                    <CloseRounded />
                </IconButton>

                {/* Title */}
                <Typography
                    sx={{
                        fontWeight: 800, color: "#5B4D8E", fontSize: { xs: "1.3rem", sm: "1.5rem" },
                        textAlign: "center", mb: 3,
                    }}
                >
                    {t("premium.title")}
                </Typography>

                {/* Features + Plan selector row */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mb={3}>
                    {/* Left: features + plan checkboxes */}
                    <Stack spacing={1.5} flex={1}>
                        {/* Feature bullets */}
                        {FEATURES.map((key) => (
                            <Stack key={key} direction="row" alignItems="center" spacing={1.2}>
                                <Box
                                    sx={{
                                        width: 22, height: 22, borderRadius: "50%",
                                        background: "linear-gradient(135deg, #F5C842 0%, #E8A320 100%)",
                                        flexShrink: 0,
                                        boxShadow: "0 2px 6px rgba(232,163,32,0.4)",
                                    }}
                                />
                                <Typography sx={{ color: "#7E6BB5", fontSize: "0.9rem", fontWeight: 500 }}>
                                    {t(key)}
                                </Typography>
                            </Stack>
                        ))}

                        <Box sx={{ mt: 1 }} />

                        {/* Plan checkboxes */}
                        {PLANS.map((plan) => (
                            <FormControlLabel
                                key={plan.key}
                                control={
                                    <Checkbox
                                        checked={selectedPlan === plan.key}
                                        onChange={() => setSelectedPlan(plan.key)}
                                        sx={{
                                            color: "rgba(142,124,195,0.4)",
                                            "&.Mui-checked": { color: "#7E6BB5" },
                                            p: 0.5,
                                        }}
                                    />
                                }
                                label={
                                    <Typography sx={{ color: "#5B4D8E", fontWeight: 600, fontSize: "0.95rem" }}>
                                        {t(plan.labelKey)}
                                    </Typography>
                                }
                                sx={{ ml: 0, mr: 0 }}
                            />
                        ))}
                    </Stack>

                    {/* Right: plan card */}
                    <Box sx={{ flexShrink: 0, width: { xs: "100%", sm: 200 } }}>
                        <Box
                            sx={{
                                borderRadius: 3,
                                overflow: "hidden",
                                boxShadow: "0 6px 20px rgba(126,107,181,0.25)",
                            }}
                        >
                            {/* Card header */}
                            <Box
                                sx={{
                                    background: "linear-gradient(135deg, #9B87D8 0%, #7E6BB5 100%)",
                                    py: 1.8, px: 2, textAlign: "center",
                                }}
                            >
                                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                                    {t(activePlan.labelKey)}
                                </Typography>
                            </Box>

                            {/* Card body */}
                            <Box
                                sx={{
                                    backgroundColor: "rgba(255,255,255,0.7)",
                                    py: 2, px: 2, textAlign: "center",
                                }}
                            >
                                <Typography sx={{ color: "#5B4D8E", fontWeight: 700, fontSize: "1.15rem" }}>
                                    {t(activePlan.priceKey)}
                                </Typography>
                                <Typography sx={{ color: "#A899CF", fontSize: "0.78rem", mt: 0.3 }}>
                                    {t(activePlan.secondaryKey)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Stack>

                <Divider sx={{ borderColor: "rgba(142,124,195,0.18)", mb: 2.5 }} />

                {/* Payment section */}
                <Typography sx={{ color: "#5B4D8E", fontWeight: 600, fontSize: "0.95rem", mb: 1.8 }}>
                    {t("premium.payment.title")}
                </Typography>

                <Stack spacing={1.5}>
                    <TextField
                        fullWidth
                        placeholder={t("premium.payment.cardPlaceholder")}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        inputProps={{ maxLength: 19 }}
                        sx={inputSx}
                    />

                    <Stack direction="row" spacing={1.5}>
                        <TextField
                            placeholder={t("premium.payment.expiryPlaceholder")}
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            sx={{ ...inputSx, flex: 1 }}
                        />
                        <TextField
                            placeholder={t("premium.payment.cvvPlaceholder")}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                            sx={{ ...inputSx, width: 100 }}
                        />
                    </Stack>
                </Stack>

                {/* Error message */}
                {error && (
                    <Typography sx={{ color: "#EF4444", fontSize: "0.82rem", mt: 1.5, textAlign: "center" }}>
                        {error}
                    </Typography>
                )}

                {/* Subscribe button */}
                <Box
                    component="button"
                    onClick={handleSubscribe}
                    disabled={processing || done}
                    sx={{
                        mt: 2.5, width: "100%",
                        background: done
                            ? "linear-gradient(135deg, #6EBF8B 0%, #4CAF72 100%)"
                            : "linear-gradient(135deg, #7E6BB5 0%, #5B4D8E 100%)",
                        color: "#fff", border: "none", borderRadius: 3,
                        py: 1.6, cursor: processing || done ? "default" : "pointer",
                        fontWeight: 700, fontSize: "1rem",
                        fontFamily: "inherit",
                        boxShadow: "0 6px 18px rgba(94,77,142,0.4)",
                        transition: "opacity 0.2s, background 0.3s",
                        opacity: processing ? 0.8 : 1,
                        "&:hover:not(:disabled)": { opacity: 0.92 },
                    }}
                >
                    {done
                        ? t("premium.subscribed")
                        : processing
                        ? t("premium.payment.processing")
                        : `${t("premium.payment.subscribeBtn")} ${activePlan.price}`}
                </Box>

                {/* Terms */}
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} mt={1.5}>
                    <LockOutlined sx={{ fontSize: 13, color: "#A899CF" }} />
                    <Typography sx={{ color: "#A899CF", fontSize: "0.75rem", textAlign: "center" }}>
                        {t("premium.payment.terms")}{" "}
                        <Box component="span" sx={{ textDecoration: "underline", cursor: "pointer" }}>
                            {t("premium.payment.termsLink")}
                        </Box>{" "}
                        {t("premium.payment.and")}{" "}
                        <Box component="span" sx={{ textDecoration: "underline", cursor: "pointer" }}>
                            {t("premium.payment.privacyPolicy")}
                        </Box>
                    </Typography>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
