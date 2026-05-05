"use client";

import React, { useState } from "react";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import {
    AppBar, Avatar, Box, Button, Divider, IconButton, ListItemIcon, Menu,
    MenuItem, Stack, Toolbar, Typography,
} from "@mui/material";
import { PersonOutlineRounded, LogoutRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { usePremiumStore } from "@/store/premiumStore";
import { useProfileStore } from "@/store/profileStore";
import { profileApi } from "@/lib/api/profileApi";
import { absoluteAssetUrl } from "@/lib/api/assetUrl";

type AppLanguage = "en" | "uk";

const LANGUAGES: { value: AppLanguage; flag: string; label: string }[] = [
    { value: "en", flag: "🇬🇧", label: "EN" },
    { value: "uk", flag: "🇺🇦", label: "UA" },
];

interface DashboardHeaderProps {
    onSignOut: () => void;
    onGetPremium?: () => void;
}

export default function DashboardHeader({ onSignOut, onGetPremium }: DashboardHeaderProps) {
    const { t, i18n } = useTranslation();
    const { name, avatarUrl, language, setProfile } = useProfileStore();
    const { isPremium } = usePremiumStore();
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
    const userMenuOpen = Boolean(userAnchorEl);

    const current = LANGUAGES.find((l) => l.value === language) ?? LANGUAGES[0];

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleSelect = (lang: AppLanguage) => {
        setProfile({ language: lang });
        i18n.changeLanguage(lang);
        profileApi.updateProfile({ language: lang }).catch(() => {});
        handleClose();
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: "rgba(240,235,252,0.85)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid rgba(142,124,195,0.12)",
            }}
        >
            <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3, md: 4 } }}>
                {/* Left — brand */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                    <Box component="img" src="/veliora-logo.svg" alt="Veliora" sx={{ width: 36, height: 36, scale: 2 }} />
                    <Typography sx={{ fontWeight: 700, color: "#7E6BB5", fontSize: "1.1rem" }}>
                        Veliora
                    </Typography>
                </Stack>

                {/* Center — AI button */}
                <Box
                    onClick={() => router.push("/ai")}
                    sx={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: "linear-gradient(135deg, #9B87D8 0%, #7E6BB5 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", boxShadow: "0 4px 14px rgba(126,107,181,0.45)",
                        transition: "transform 0.15s, box-shadow 0.15s",
                        "&:hover": {
                            transform: "scale(1.08)",
                            boxShadow: "0 6px 20px rgba(126,107,181,0.6)",
                        },
                    }}
                >
                    <Box sx={{ position: "relative", width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Box
                            component="img"
                            src="/ai-logo.svg"
                            alt="AI"
                            sx={{
                                width: 45, height: 45,
                                transform: "rotate(30deg)",
                                position: "absolute",
                                left: 0, top: "50%", mt: "-21px",
                            }}
                        />
                        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1rem", lineHeight: 1, letterSpacing: 0.5, position: "absolute", right: 10, top: 14 }}>
                            AI
                        </Typography>
                    </Box>
                </Box>

                {/* Right — actions */}
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={{ xs: 1, sm: 1.5 }} sx={{ flex: 1 }}>
                    {isPremium ? (
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.8}
                            sx={{
                                px: { xs: 1.5, sm: 2 }, py: 0.7,
                                borderRadius: 3,
                                background: "linear-gradient(135deg, #F5C842 0%, #E8A320 100%)",
                                boxShadow: "0 4px 12px rgba(232,163,32,0.35)",
                            }}
                        >
                            <Typography sx={{ fontSize: "0.9rem", lineHeight: 1 }}>✦</Typography>
                        </Stack>
                    ) : (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={onGetPremium}
                            sx={{
                                borderRadius: 3, px: { xs: 1, sm: 2.5 }, py: 0.8,
                                backgroundColor: "#8E7CC3", textTransform: "none", fontWeight: 600,
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                boxShadow: "0 4px 12px rgba(126,107,181,0.35)",
                                "&:hover": { backgroundColor: "#7B69B1" },
                            }}
                        >
                            {t("dashboard.header.getPremium")}
                        </Button>
                    )}

                    {/* Language dropdown trigger */}
                    <Stack
                        component="button"
                        direction="row"
                        alignItems="center"
                        spacing={0.4}
                        onClick={handleOpen}
                        sx={{
                            px: 1.4, py: 0.55,
                            border: "1px solid rgba(142,124,195,0.3)",
                            borderRadius: 2, cursor: "pointer",
                            backgroundColor: menuOpen ? "rgba(142,124,195,0.08)" : "transparent",
                            transition: "background 0.15s",
                            "&:hover": { backgroundColor: "rgba(142,124,195,0.08)" },
                            display: { xs: "none", sm: "flex" },
                            outline: "none",
                        }}
                    >
                        <Typography sx={{ fontSize: "1rem", lineHeight: 1 }}>{current.flag}</Typography>
                        <Typography sx={{ color: "#8E7CC3", fontWeight: 500, fontSize: "0.85rem" }}>
                            {current.label}
                        </Typography>
                        <KeyboardArrowDownRounded
                            sx={{
                                color: "#8E7CC3", fontSize: 18,
                                transition: "transform 0.2s",
                                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                        />
                    </Stack>

                    {/* Dropdown menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                        slotProps={{
                            paper: {
                                elevation: 4,
                                sx: {
                                    mt: 0.8,
                                    borderRadius: 2,
                                    border: "1px solid rgba(142,124,195,0.15)",
                                    boxShadow: "0 8px 24px rgba(126,107,181,0.18)",
                                    minWidth: 120,
                                    overflow: "visible",
                                },
                            },
                        }}
                    >
                        {LANGUAGES.map((lang) => (
                            <MenuItem
                                key={lang.value}
                                selected={lang.value === language}
                                onClick={() => handleSelect(lang.value)}
                                sx={{
                                    gap: 1.2,
                                    px: 2, py: 1,
                                    borderRadius: 1,
                                    mx: 0.5,
                                    "&.Mui-selected": {
                                        backgroundColor: "rgba(142,124,195,0.1)",
                                        "&:hover": { backgroundColor: "rgba(142,124,195,0.15)" },
                                    },
                                    "&:hover": { backgroundColor: "rgba(142,124,195,0.07)" },
                                }}
                            >
                                <Typography sx={{ fontSize: "1.1rem", lineHeight: 1 }}>{lang.flag}</Typography>
                                <Typography sx={{ color: "#7E6BB5", fontWeight: lang.value === language ? 600 : 400, fontSize: "0.875rem" }}>
                                    {lang.label}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Menu>

                    {/* User avatar → dropdown */}
                    <IconButton onClick={(e) => setUserAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                        <Avatar
                            src={absoluteAssetUrl(avatarUrl) ?? undefined}
                            sx={{
                                width: 36, height: 36,
                                background: "linear-gradient(135deg, #C4B5F4 0%, #9B87D8 100%)",
                                color: "#fff",
                                fontSize: "1rem",
                                fontWeight: 700,
                            }}
                        >
                            {name ? name.charAt(0).toUpperCase() : ""}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={userAnchorEl}
                        open={userMenuOpen}
                        onClose={() => setUserAnchorEl(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                        slotProps={{
                            paper: {
                                elevation: 4,
                                sx: {
                                    mt: 0.8, borderRadius: 2, minWidth: 170,
                                    border: "1px solid rgba(142,124,195,0.15)",
                                    boxShadow: "0 8px 24px rgba(126,107,181,0.18)",
                                    overflow: "visible",
                                },
                            },
                        }}
                    >
                        <MenuItem
                            onClick={() => { setUserAnchorEl(null); router.push("/profile"); }}
                            sx={{
                                gap: 1.2, px: 2, py: 1.1, borderRadius: 1, mx: 0.5,
                                "&:hover": { backgroundColor: "rgba(142,124,195,0.07)" },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: "auto" }}>
                                <PersonOutlineRounded sx={{ fontSize: 20, color: "#8E7CC3" }} />
                            </ListItemIcon>
                            <Typography sx={{ color: "#7E6BB5", fontSize: "0.875rem", fontWeight: 500 }}>
                                {t("profile.viewProfile")}
                            </Typography>
                        </MenuItem>

                        <Divider sx={{ my: 0.5, borderColor: "rgba(142,124,195,0.12)" }} />

                        <MenuItem
                            onClick={() => { setUserAnchorEl(null); onSignOut(); }}
                            sx={{
                                gap: 1.2, px: 2, py: 1.1, borderRadius: 1, mx: 0.5,
                                "&:hover": { backgroundColor: "rgba(239,68,68,0.06)" },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: "auto" }}>
                                <LogoutRounded sx={{ fontSize: 20, color: "#EF4444" }} />
                            </ListItemIcon>
                            <Typography sx={{ color: "#EF4444", fontSize: "0.875rem", fontWeight: 500 }}>
                                {t("profile.signOut")}
                            </Typography>
                        </MenuItem>
                    </Menu>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
