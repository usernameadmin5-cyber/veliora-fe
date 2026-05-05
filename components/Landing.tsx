"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Container,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore, type AppLanguage } from "@/store/settingsStore";

const LANGUAGES: { value: AppLanguage; flag: string; label: string }[] = [
    { value: "en", flag: "🇬🇧", label: "EN" },
    { value: "uk", flag: "🇺🇦", label: "UA" },
];

export default function Landing() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const { language, setLanguage } = useSettingsStore();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const current = LANGUAGES.find((l) => l.value === language) ?? LANGUAGES[0];

    useEffect(() => {
        if (isAuthenticated) router.replace("/dashboard");
    }, [isAuthenticated, router]);

    const handleSelect = (lang: AppLanguage) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
        setAnchorEl(null);
    };

    if (isAuthenticated) return null;

    return (
        <Box
            sx={{
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(180deg, #EAE4F6 0%, #D7CCEE 40%, #C7B6E6 100%)",
                textAlign: "center",
                px: {
                    xs: 2,
                    sm: 3,
                    md: 4,
                },
                py: {
                    xs: 6,
                    md: 0,
                },
            }}
        >
            {/* Language switcher — top right */}
            <Stack
                component="button"
                direction="row"
                alignItems="center"
                spacing={0.4}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                    position: "absolute",
                    top: { xs: 16, sm: 24 },
                    right: { xs: 16, sm: 24 },
                    px: 1.4,
                    py: 0.55,
                    border: "1px solid rgba(142,124,195,0.3)",
                    borderRadius: 2,
                    cursor: "pointer",
                    backgroundColor: menuOpen
                        ? "rgba(142,124,195,0.12)"
                        : "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(6px)",
                    transition: "background 0.15s",
                    "&:hover": { backgroundColor: "rgba(142,124,195,0.15)" },
                    outline: "none",
                }}
            >
                <Typography sx={{ fontSize: "1rem", lineHeight: 1 }}>
                    {current.flag}
                </Typography>
                <Typography
                    sx={{ color: "#7E6BB5", fontWeight: 600, fontSize: "0.85rem" }}
                >
                    {current.label}
                </Typography>
                <KeyboardArrowDownRounded
                    sx={{
                        color: "#7E6BB5",
                        fontSize: 18,
                        transition: "transform 0.2s",
                        transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                />
            </Stack>

            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={() => setAnchorEl(null)}
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
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            mx: 0.5,
                            "&.Mui-selected": {
                                backgroundColor: "rgba(142,124,195,0.1)",
                                "&:hover": {
                                    backgroundColor: "rgba(142,124,195,0.15)",
                                },
                            },
                            "&:hover": { backgroundColor: "rgba(142,124,195,0.07)" },
                        }}
                    >
                        <Typography sx={{ fontSize: "1.1rem", lineHeight: 1 }}>
                            {lang.flag}
                        </Typography>
                        <Typography
                            sx={{
                                color: "#7E6BB5",
                                fontWeight: lang.value === language ? 600 : 400,
                                fontSize: "0.875rem",
                            }}
                        >
                            {lang.label}
                        </Typography>
                    </MenuItem>
                ))}
            </Menu>

            <Container maxWidth="md">
                <Stack
                    spacing={{ xs: 3, sm: 4, md: 5 }}
                    alignItems="center"
                    justifyContent="center"
                >
                    {/* Title */}
                    <Typography
                        sx={{
                            fontWeight: 600,
                            color: "#7E6BB5",
                            fontSize: {
                                xs: "1.5rem",
                                sm: "1.8rem",
                                md: "2.2rem",
                                lg: "2.4rem",
                            },
                            lineHeight: 1.3,
                        }}
                    >
                        {t("landing.title")}
                    </Typography>

                    {/* Logo */}
                    <Box
                        component="img"
                        src="/veliora-logo.svg"
                        alt="Veliora Logo"
                        sx={{
                            width: {
                                xs: 120,
                                sm: 150,
                                md: 180,
                                lg: 200,
                            },
                            height: "auto",
                        }}
                    />

                    {/* Description */}
                    <Typography
                        sx={{
                            maxWidth: 640,
                            color: "#7E6BB5",
                            opacity: 0.9,
                            fontSize: {
                                xs: "0.95rem",
                                sm: "1rem",
                                md: "1.05rem",
                            },
                            lineHeight: 1.6,
                            px: {
                                xs: 1,
                                sm: 0,
                            },
                        }}
                    >
                        {t("landing.description")}
                    </Typography>

                    {/* Buttons */}
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={{ xs: 2, sm: 3 }}
                        mt={{ xs: 1, md: 2 }}
                        width="100%"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={() => router.push("/sign-up")}
                            sx={{
                                maxWidth: {
                                    xs: "100%",
                                    sm: 200,
                                },
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                backgroundColor: "#8E7CC3",
                                textTransform: "none",
                                fontWeight: 600,
                                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                                '&:hover': {
                                    backgroundColor: "#7B69B1",
                                },
                            }}
                        >
                            {t("landing.getStarted")}
                        </Button>

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={() => router.push("/sign-in")}
                            sx={{
                                maxWidth: {
                                    xs: "100%",
                                    sm: 200,
                                },
                                px: 4,
                                py: 1.5,
                                borderRadius: 3,
                                backgroundColor: "#E6E1F2",
                                color: "#7E6BB5",
                                textTransform: "none",
                                fontWeight: 600,
                                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                                '&:hover': {
                                    backgroundColor: "#DDD6EE",
                                },
                            }}
                        >
                            {t("landing.logIn")}
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
