"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Alert, Avatar, Box, Button, Chip, CircularProgress, Container, Dialog,
    DialogActions, DialogContent, DialogContentText, DialogTitle, Grid,
    IconButton, Snackbar, Stack, Typography,
} from "@mui/material";
import { ArrowBackRounded, EditRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/store/profileStore";
import { usePremiumStore } from "@/store/premiumStore";
import { premiumApi } from "@/lib/api/premiumApi";
import { profileApi } from "@/lib/api/profileApi";
import { absoluteAssetUrl } from "@/lib/api/assetUrl";
import GoogleOAuthHandler from "@/components/auth/GoogleOAuthHandler";
import GetPremiumModal from "@/components/premium/GetPremiumModal";
import PersonalInfo from "./sections/PersonalInfo";
import HealthTracking from "./sections/HealthTracking";
import ConnectedAccounts from "./sections/ConnectedAccounts";

const MAX_AVATAR_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_AVATAR_MIME = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

export default function ProfilePage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { name, email, avatarUrl, setProfile } = useProfileStore();
    const { isPremium, setSubscription } = usePremiumStore();

    const [premiumOpen, setPremiumOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    const handleAvatarClick = () => {
        if (uploading) return;
        fileInputRef.current?.click();
    };

    const handleAvatarFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        // Reset the input so selecting the same file twice re-triggers change.
        e.target.value = "";
        if (!file) return;

        if (!ALLOWED_AVATAR_MIME.includes(file.type)) {
            setAvatarError("Unsupported image format. Use JPG, PNG, WebP or GIF.");
            return;
        }
        if (file.size > MAX_AVATAR_BYTES) {
            setAvatarError("Image is too large. Maximum size is 20 MB.");
            return;
        }

        setUploading(true);
        try {
            const profile = await profileApi.uploadAvatar(file);
            setProfile({
                name: profile.name,
                email: profile.email,
                age: profile.age,
                timeZone: profile.timeZone,
                language: profile.language,
                avatarUrl: profile.avatarUrl,
                practices: profile.practicePreferences,
                moodThisWeek: profile.moodThisWeek,
                stressAvg: profile.stressAvg,
                isPremium: profile.isPremium,
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Upload failed";
            setAvatarError(message);
        } finally {
            setUploading(false);
        }
    };

    const handleCancelConfirm = async () => {
        setCancelling(true);
        try {
            await premiumApi.cancelSubscription();
            setSubscription({ isPremium: false, plan: null, status: "cancelled", currentPeriodEnd: null });
        } catch {
            // ignore — UI stays open if it fails
        } finally {
            setCancelling(false);
            setCancelOpen(false);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#F5F0FD" }}>
            <GoogleOAuthHandler />
            {/* Header */}
            <Box
                sx={{
                    backgroundColor: "rgba(240,235,252,0.85)",
                    backdropFilter: "blur(10px)",
                    borderBottom: "1px solid rgba(142,124,195,0.12)",
                    position: "sticky", top: 0, zIndex: 100,
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: { xs: 2, sm: 3, md: 4 }, height: 64 }}
                >
                    {/* Logo */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                            component="img"
                            src="/veliora-logo.svg"
                            alt="Veliora"
                            sx={{ width: 36, height: 36 }}
                        />
                        <Typography sx={{ fontWeight: 700, color: "#7E6BB5", fontSize: "1.1rem" }}>
                            Veliora
                        </Typography>
                    </Stack>

                    {/* Back */}
                    <Stack
                        component="button"
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        onClick={() => router.push("/dashboard")}
                        sx={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#8E7CC3", px: 1.5, py: 0.8, borderRadius: 2,
                            transition: "background 0.15s",
                            "&:hover": { backgroundColor: "rgba(142,124,195,0.08)" },
                        }}
                    >
                        <ArrowBackRounded sx={{ fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#8E7CC3" }}>
                            {t("profile.back")}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 5 } }}>
                {/* Avatar section */}
                <Stack alignItems="center" spacing={1.5} mb={5}>
                    <Box sx={{ position: "relative", display: "inline-block" }}>
                        <Avatar
                            src={absoluteAssetUrl(avatarUrl) ?? undefined}
                            sx={{
                                width: 96, height: 96,
                                background: "linear-gradient(135deg, #C4B5F4 0%, #9B87D8 100%)",
                                fontSize: "2.2rem", fontWeight: 700, color: "#fff",
                                boxShadow: "0 8px 24px rgba(142,124,195,0.35)",
                            }}
                        >
                            {name.charAt(0).toUpperCase()}
                        </Avatar>
                        {uploading && (
                            <Box
                                sx={{
                                    position: "absolute", inset: 0,
                                    borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    backgroundColor: "rgba(91,77,142,0.35)",
                                }}
                            >
                                <CircularProgress size={28} sx={{ color: "#fff" }} />
                            </Box>
                        )}
                        <IconButton
                            size="small"
                            onClick={handleAvatarClick}
                            disabled={uploading}
                            sx={{
                                position: "absolute", bottom: 2, right: 2,
                                width: 28, height: 28,
                                backgroundColor: "#8E7CC3",
                                "&:hover": { backgroundColor: "#7B69B1" },
                                "&.Mui-disabled": { backgroundColor: "#C4B5F4" },
                                boxShadow: "0 2px 8px rgba(126,107,181,0.4)",
                            }}
                        >
                            <EditRounded sx={{ fontSize: 14, color: "#fff" }} />
                        </IconButton>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ALLOWED_AVATAR_MIME.join(",")}
                            hidden
                            onChange={handleAvatarFileChange}
                        />
                    </Box>

                    <Typography sx={{ fontWeight: 700, color: "#5B4D8E", fontSize: "1.4rem" }}>
                        {name}
                    </Typography>

                    <Typography sx={{ color: "#A899CF", fontSize: "0.9rem" }}>
                        {email}
                    </Typography>

                    {/* Premium badge / Get Premium */}
                    {isPremium ? (
                        <Stack alignItems="center" spacing={1}>
                            <Chip
                                label={t("profile.premiumMember")}
                                size="small"
                                sx={{
                                    border: "1.5px solid #C9A84C",
                                    color: "#C9A84C",
                                    backgroundColor: "transparent",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                    height: 28,
                                    px: 0.5,
                                }}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setCancelOpen(true)}
                                sx={{
                                    borderRadius: 3, px: 2.5, textTransform: "none", fontWeight: 600,
                                    fontSize: "0.8rem", borderColor: "#EF4444", color: "#EF4444",
                                    "&:hover": { backgroundColor: "rgba(239,68,68,0.05)", borderColor: "#DC2626" },
                                }}
                            >
                                {t("premium.cancelSubscription")}
                            </Button>
                        </Stack>
                    ) : (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => setPremiumOpen(true)}
                            sx={{
                                borderRadius: 3, px: 3, py: 0.9, textTransform: "none", fontWeight: 600,
                                backgroundColor: "#8E7CC3", fontSize: "0.875rem",
                                boxShadow: "0 4px 12px rgba(126,107,181,0.35)",
                                "&:hover": { backgroundColor: "#7B69B1" },
                            }}
                        >
                            {t("premium.getPremium")}
                        </Button>
                    )}
                </Stack>

                {/* Cards grid */}
                <Grid container spacing={3} alignItems="stretch">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <PersonalInfo />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <HealthTracking />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <ConnectedAccounts />
                    </Grid>
                </Grid>
            </Container>

            {/* Avatar upload error */}
            <Snackbar
                open={!!avatarError}
                autoHideDuration={5000}
                onClose={() => setAvatarError(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setAvatarError(null)}
                    severity="error"
                    variant="filled"
                    sx={{ borderRadius: 3 }}
                >
                    {avatarError}
                </Alert>
            </Snackbar>

            {/* Get Premium modal */}
            <GetPremiumModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />

            {/* Cancel Subscription confirmation dialog */}
            <Dialog
                open={cancelOpen}
                onClose={() => setCancelOpen(false)}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 4,
                            p: 1,
                            boxShadow: "0 16px 48px rgba(126,107,181,0.2)",
                        },
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: "#5B4D8E", fontSize: "1.1rem" }}>
                    {t("premium.cancelSubscription")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "#8E7CC3" }}>
                        {t("premium.cancelConfirm")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={() => setCancelOpen(false)}
                        sx={{
                            borderRadius: 3, textTransform: "none", fontWeight: 600,
                            color: "#8E7CC3", borderColor: "rgba(142,124,195,0.4)",
                        }}
                        variant="outlined"
                    >
                        {t("premium.keepPremium")}
                    </Button>
                    <Button
                        onClick={handleCancelConfirm}
                        disabled={cancelling}
                        variant="contained"
                        sx={{
                            borderRadius: 3, textTransform: "none", fontWeight: 600,
                            backgroundColor: "#EF4444",
                            "&:hover": { backgroundColor: "#DC2626" },
                            "&.Mui-disabled": { backgroundColor: "#FCA5A5", color: "#fff" },
                        }}
                    >
                        {cancelling ? t("dashboard.checkIn.saving") : t("premium.cancelSubscription")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
