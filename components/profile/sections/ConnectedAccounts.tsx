"use client";

import React, { useState } from "react";
import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Divider,
    Stack, Typography,
} from "@mui/material";
import { CheckCircleRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/authApi";
import SetPasswordDialog from "./SetPasswordDialog";

// ─── Google icon (inline SVG to avoid /public dependency) ────────────────────

function GoogleIcon({ size = 20 }: { size?: number }) {
    return (
        <Box
            component="img"
            src="/google-icon.svg"
            alt="Google"
            width={size}
            height={size}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                // Fallback: coloured G letter
                const el = e.currentTarget;
                el.style.display = "none";
                const span = document.createElement("span");
                span.textContent = "G";
                span.style.cssText = `
                    display:inline-flex;align-items:center;justify-content:center;
                    width:${size}px;height:${size}px;border-radius:50%;
                    background:linear-gradient(135deg,#EA4335 0%,#FBBC05 50%,#34A853 100%);
                    color:#fff;font-weight:700;font-size:${size * 0.6}px;font-family:inherit;
                `;
                el.parentNode?.insertBefore(span, el.nextSibling);
            }}
        />
    );
}

// ─── Confirm-disconnect dialog (shown when user HAS a password) ───────────────

interface ConfirmDisconnectDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    disconnecting: boolean;
}

function ConfirmDisconnectDialog({ open, onClose, onConfirm, disconnecting }: ConfirmDisconnectDialogProps) {
    const { t } = useTranslation();
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
                {t("profile.connectedAccounts.confirmDisconnect")}
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: "#8E7CC3", fontSize: "0.875rem" }}>
                    {t("profile.connectedAccounts.confirmDisconnectDesc")}
                </DialogContentText>
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
                    onClick={onConfirm}
                    disabled={disconnecting}
                    variant="contained"
                    sx={{
                        borderRadius: 3, textTransform: "none", fontWeight: 600,
                        backgroundColor: "#EF4444", "&:hover": { backgroundColor: "#DC2626" },
                        "&.Mui-disabled": { backgroundColor: "#FCA5A5", color: "#fff" },
                    }}
                >
                    {disconnecting
                        ? t("profile.connectedAccounts.disconnecting")
                        : t("profile.connectedAccounts.confirmBtn")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ConnectedAccounts() {
    const { t } = useTranslation();
    const { user, googleConnected, hasPassword, setGoogleConnected } = useAuthStore();

    const [disconnecting, setDisconnecting] = useState(false);

    // Which dialog is open
    const [setPasswordDialog, setSetPasswordDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);

    // ── Connect Google — redirect to backend connect-init (nonce cookie flow) ──
    const handleConnect = () => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";
        window.location.href = `${apiBase}/auth/google/connect-init`;
    };

    // ── Disconnect — decide which dialog to show ──
    const handleDisconnectIntent = () => {
        if (!hasPassword) {
            setSetPasswordDialog(true);
        } else {
            setConfirmDialog(true);
        }
    };

    // ── After setting password, automatically disconnect ──
    const handleSetPasswordSuccess = async () => {
        setSetPasswordDialog(false);
        setDisconnecting(true);
        await authApi.disconnectGoogle();
        setGoogleConnected(false);
        setDisconnecting(false);
    };

    // ── Confirm disconnect (user has password) ──
    const handleConfirmDisconnect = async () => {
        setDisconnecting(true);
        await authApi.disconnectGoogle();
        setGoogleConnected(false);
        setDisconnecting(false);
        setConfirmDialog(false);
    };

    return (
        <>
            <Box
                sx={{
                    backgroundColor: "#fff",
                    borderRadius: 4,
                    boxShadow: "0 4px 24px rgba(142,124,195,0.1)",
                    p: { xs: 2.5, sm: 3.5 },
                }}
            >
                <Typography sx={{ fontWeight: 700, color: "#8E7CC3", fontSize: "1.05rem", mb: 1.5 }}>
                    {t("profile.connectedAccounts.title")}
                </Typography>
                <Divider sx={{ borderColor: "rgba(142,124,195,0.18)", mb: 2.5 }} />

                {/* Google row */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    spacing={2}
                >
                    {/* Icon + labels */}
                    <Stack direction="row" alignItems="center" spacing={2} flex={1} sx={{ minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 44, height: 44, borderRadius: 2,
                                backgroundColor: "rgba(142,124,195,0.07)",
                                border: "1px solid rgba(142,124,195,0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <GoogleIcon size={22} />
                        </Box>

                        <Stack flex={1} spacing={0.2} sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, color: "#5B4D8E", fontSize: "0.95rem" }}>
                                {t("profile.connectedAccounts.google")}
                            </Typography>

                            {googleConnected ? (
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                    flexWrap="wrap"
                                    sx={{ rowGap: 0.2, minWidth: 0 }}
                                >
                                    <CheckCircleRounded sx={{ fontSize: 14, color: "#6EBF8B" }} />
                                    <Typography sx={{ color: "#6EBF8B", fontSize: "0.8rem", fontWeight: 500 }}>
                                        {t("profile.connectedAccounts.connected")}
                                    </Typography>
                                    <Typography sx={{ color: "#C4B5F4", fontSize: "0.8rem" }}>·</Typography>
                                    <Typography
                                        noWrap
                                        sx={{
                                            color: "#A899CF",
                                            fontSize: "0.8rem",
                                            minWidth: 0,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {user?.email ?? ""}
                                    </Typography>
                                </Stack>
                            ) : (
                                <Typography sx={{ color: "#C4B5F4", fontSize: "0.8rem" }}>
                                    {t("profile.connectedAccounts.notConnected")}
                                </Typography>
                            )}
                        </Stack>
                    </Stack>

                    {/* Action button */}
                    {googleConnected ? (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleDisconnectIntent}
                            disabled={disconnecting}
                            sx={{
                                borderRadius: 3, px: 2, textTransform: "none", fontWeight: 600,
                                fontSize: "0.8rem", borderColor: "#EF4444", color: "#EF4444",
                                alignSelf: { xs: "stretch", sm: "center" },
                                "&:hover": { backgroundColor: "rgba(239,68,68,0.05)", borderColor: "#DC2626" },
                                "&.Mui-disabled": { borderColor: "#FCA5A5", color: "#FCA5A5" },
                            }}
                        >
                            {disconnecting
                                ? t("profile.connectedAccounts.disconnecting")
                                : t("profile.connectedAccounts.disconnect")}
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleConnect}
                            sx={{
                                borderRadius: 3, px: 2, textTransform: "none", fontWeight: 600,
                                fontSize: "0.8rem", borderColor: "#8E7CC3", color: "#8E7CC3",
                                alignSelf: { xs: "stretch", sm: "center" },
                                "&:hover": { backgroundColor: "rgba(142,124,195,0.07)", borderColor: "#7B69B1" },
                            }}
                        >
                            {t("profile.connectedAccounts.connect")}
                        </Button>
                    )}
                </Stack>

                {/* Note when Google-only account */}
                {googleConnected && !hasPassword && (
                    <Box
                        sx={{
                            mt: 2, px: 2, py: 1.2,
                            backgroundColor: "rgba(245,158,11,0.08)",
                            border: "1px solid rgba(245,158,11,0.25)",
                            borderRadius: 2,
                        }}
                    >
                        <Typography sx={{ color: "#B45309", fontSize: "0.8rem" }}>
                            ⚠️ {t("profile.connectedAccounts.setPasswordDesc")}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Dialogs */}
            <SetPasswordDialog
                open={setPasswordDialog}
                onClose={() => setSetPasswordDialog(false)}
                onSuccess={handleSetPasswordSuccess}
            />

            <ConfirmDisconnectDialog
                open={confirmDialog}
                onClose={() => setConfirmDialog(false)}
                onConfirm={handleConfirmDisconnect}
                disconnecting={disconnecting}
            />
        </>
    );
}
