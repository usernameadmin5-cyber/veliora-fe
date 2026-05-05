"use client";

import React, { useState } from "react";
import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, InputAdornment,
    Stack, TextField, Typography,
} from "@mui/material";
import { VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/authApi";

interface SetPasswordDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    /** Override button label. Default: connected-accounts "Set and disconnect". */
    submitLabel?: string;
    savingLabel?: string;
    /** Override title. Default: connected-accounts "Set a password first". */
    title?: string;
    /** Override description. Default: connected-accounts explanation. */
    description?: string;
}

/**
 * Shared dialog for users who signed up via Google and don't yet have a local
 * password. Used by:
 *  - Connected Accounts (before disconnecting Google)
 *  - Personal Info (before changing the login email)
 */
export default function SetPasswordDialog({
    open,
    onClose,
    onSuccess,
    submitLabel,
    savingLabel,
    title,
    description,
}: SetPasswordDialogProps) {
    const { t } = useTranslation();
    const { setHasPassword } = useAuthStore();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
        setError("");
        try {
            setSaving(true);
            await authApi.setPassword(password, confirm);
            setHasPassword(true);
            setSaving(false);
            setPassword("");
            setConfirm("");
            onSuccess();
        } catch (err: unknown) {
            setSaving(false);
            setError(err instanceof Error ? err.message : "Something went wrong");
        }
    };

    const fieldSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "rgba(142,124,195,0.06)",
            "& fieldset": { borderColor: "rgba(142,124,195,0.3)" },
            "&:hover fieldset": { borderColor: "#8E7CC3" },
            "&.Mui-focused fieldset": { borderColor: "#8E7CC3" },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: "#8E7CC3" },
    };

    const resolvedTitle = title ?? t("profile.connectedAccounts.setPasswordFirst");
    const resolvedDesc = description ?? t("profile.connectedAccounts.setPasswordDesc");
    const resolvedSubmit = submitLabel ?? t("profile.connectedAccounts.setAndDisconnect");
    const resolvedSaving = savingLabel ?? t("profile.connectedAccounts.setting");

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: { sx: { borderRadius: 4, p: 1, boxShadow: "0 16px 48px rgba(126,107,181,0.2)" } },
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, color: "#5B4D8E", fontSize: "1.05rem" }}>
                {resolvedTitle}
            </DialogTitle>

            <DialogContent>
                <DialogContentText sx={{ color: "#8E7CC3", fontSize: "0.875rem", mb: 2.5 }}>
                    {resolvedDesc}
                </DialogContentText>

                <Stack spacing={2}>
                    <TextField
                        label={t("profile.connectedAccounts.newPassword")}
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        size="small"
                        sx={fieldSx}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Box
                                            component="button"
                                            onClick={() => setShowPw((v) => !v)}
                                            sx={{ background: "none", border: "none", cursor: "pointer", p: 0.5, color: "#A899CF" }}
                                        >
                                            {showPw
                                                ? <VisibilityOffRounded sx={{ fontSize: 18 }} />
                                                : <VisibilityRounded sx={{ fontSize: 18 }} />}
                                        </Box>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <TextField
                        label={t("profile.connectedAccounts.confirmPassword")}
                        type={showConfirm ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        fullWidth
                        size="small"
                        sx={fieldSx}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Box
                                            component="button"
                                            onClick={() => setShowConfirm((v) => !v)}
                                            sx={{ background: "none", border: "none", cursor: "pointer", p: 0.5, color: "#A899CF" }}
                                        >
                                            {showConfirm
                                                ? <VisibilityOffRounded sx={{ fontSize: 18 }} />
                                                : <VisibilityRounded sx={{ fontSize: 18 }} />}
                                        </Box>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    {error && (
                        <Typography sx={{ color: "#EF4444", fontSize: "0.8rem" }}>{error}</Typography>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 3, textTransform: "none", fontWeight: 600,
                        color: "#8E7CC3", borderColor: "rgba(142,124,195,0.4)",
                        "&:hover": { borderColor: "#8E7CC3", backgroundColor: "rgba(142,124,195,0.05)" },
                    }}
                >
                    {t("survey.back")}
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={saving || !password || !confirm}
                    variant="contained"
                    sx={{
                        borderRadius: 3, textTransform: "none", fontWeight: 600,
                        backgroundColor: "#8E7CC3", "&:hover": { backgroundColor: "#7B69B1" },
                        boxShadow: "0 4px 12px rgba(126,107,181,0.3)",
                        "&.Mui-disabled": { backgroundColor: "#C5B8E8", color: "#fff" },
                    }}
                >
                    {saving ? resolvedSaving : resolvedSubmit}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
