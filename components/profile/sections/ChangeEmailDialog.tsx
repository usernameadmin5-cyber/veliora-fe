"use client";

import React, { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { profileApi } from "@/lib/api/profileApi";
import { useProfileStore } from "@/store/profileStore";

interface Props {
    open: boolean;
    onClose: () => void;
}

type Step = "request" | "confirm";

const inputSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        backgroundColor: "rgba(142,124,195,0.06)",
        "& fieldset": { borderColor: "rgba(142,124,195,0.3)" },
        "&:hover fieldset": { borderColor: "#8E7CC3" },
        "&.Mui-focused fieldset": { borderColor: "#8E7CC3" },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#8E7CC3" },
};

export default function ChangeEmailDialog({ open, onClose }: Props) {
    const { t } = useTranslation();
    const setProfile = useProfileStore((s) => s.setProfile);

    const [step, setStep] = useState<Step>("request");
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setStep("request");
        setNewEmail("");
        setCurrentPassword("");
        setOtp("");
        setError(null);
        setLoading(false);
    };

    const handleClose = () => {
        if (loading) return;
        reset();
        onClose();
    };

    const extractError = (e: unknown): string => {
        if (typeof e === "object" && e !== null) {
            const anyErr = e as { response?: { data?: { message?: string | string[] } }; message?: string };
            const msg = anyErr.response?.data?.message ?? anyErr.message;
            if (Array.isArray(msg)) return msg.join(", ");
            if (typeof msg === "string") return msg;
        }
        return "Something went wrong";
    };

    const handleRequest = async () => {
        setError(null);
        setLoading(true);
        try {
            await profileApi.requestEmailChange({ newEmail, currentPassword });
            setStep("confirm");
        } catch (e) {
            setError(extractError(e));
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setError(null);
        setLoading(true);
        try {
            const res = await profileApi.confirmEmailChange({ newEmail, otp });
            setProfile({ email: res.email });
            reset();
            onClose();
        } catch (e) {
            setError(extractError(e));
        } finally {
            setLoading(false);
        }
    };

    const primaryBtnSx = {
        borderRadius: 3,
        px: 2.5,
        textTransform: "none" as const,
        fontWeight: 600,
        backgroundColor: "#8E7CC3",
        "&:hover": { backgroundColor: "#7B69B1" },
        boxShadow: "0 4px 12px rgba(126,107,181,0.3)",
        "&.Mui-disabled": { backgroundColor: "#C5B8E8", color: "#fff" },
    };

    const outlinedBtnSx = {
        borderRadius: 3,
        px: 2.5,
        textTransform: "none" as const,
        borderColor: "rgba(142,124,195,0.4)",
        color: "#8E7CC3",
        "&:hover": { borderColor: "#8E7CC3", backgroundColor: "rgba(142,124,195,0.05)" },
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ color: "#5B4D8E", fontWeight: 700 }}>
                {t("profile.personalInfo.changeEmailTitle")}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    {error && <Alert severity="error">{error}</Alert>}

                    {step === "request" ? (
                        <>
                            <TextField
                                label={t("profile.personalInfo.newEmail")}
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                fullWidth
                                size="small"
                                sx={inputSx}
                                autoFocus
                            />
                            <TextField
                                label={t("profile.personalInfo.currentPassword")}
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                fullWidth
                                size="small"
                                sx={inputSx}
                            />
                        </>
                    ) : (
                        <>
                            <Typography sx={{ color: "#5B4D8E", fontSize: "0.9rem" }}>
                                {t("profile.personalInfo.emailOtpSent")}
                            </Typography>
                            <Box sx={{ color: "#8E7CC3", fontWeight: 600, fontSize: "0.9rem" }}>
                                {newEmail}
                            </Box>
                            <TextField
                                label={t("profile.personalInfo.otpLabel")}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                fullWidth
                                size="small"
                                sx={inputSx}
                                inputProps={{ maxLength: 6, inputMode: "numeric" }}
                                autoFocus
                            />
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button variant="outlined" size="small" onClick={handleClose} disabled={loading} sx={outlinedBtnSx}>
                    {t("survey.back")}
                </Button>
                {step === "request" ? (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleRequest}
                        disabled={loading || !newEmail || !currentPassword}
                        sx={primaryBtnSx}
                    >
                        {t("profile.personalInfo.sendCode")}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleConfirm}
                        disabled={loading || otp.length !== 6}
                        sx={primaryBtnSx}
                    >
                        {t("profile.personalInfo.confirmChange")}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
