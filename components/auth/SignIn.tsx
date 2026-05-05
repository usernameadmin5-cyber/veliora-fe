"use client";

import React, { useEffect, useState } from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AuthLayout from "./shared/AuthLayout";
import AuthTextField from "./shared/AuthTextField";
import AuthPrimaryButton from "./shared/AuthPrimaryButton";
import AuthGoogleButton from "./shared/AuthGoogleButton";
import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/store/authStore";

export default function SignIn() {
    const router = useRouter();
    const { t } = useTranslation();
    const { isAuthenticated, setUser } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isAuthenticated) router.replace("/dashboard");
    }, [isAuthenticated, router]);

    const handleSubmit = async () => {
        setError("");
        if (!email || !password) { setError(t("auth.errors.fillAll")); return; }
        setLoading(true);
        try {
            const { user, accessToken } = await authApi.signIn({ email, password });
            setUser(user, accessToken);
            router.push("/dashboard");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : t("auth.errors.signInFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Typography
                align="center"
                sx={{ color: "#8E7CC3", fontSize: { xs: "0.9rem", sm: "1rem" }, maxWidth: 320 }}
            >
                {t("tagline")}
            </Typography>

            <Stack spacing={2.2} width="100%" mt={1}>
                <AuthTextField
                    placeholder={t("auth.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <AuthTextField
                    type="password"
                    placeholder={t("auth.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />

                {error && (
                    <Typography sx={{ color: "error.main", fontSize: "0.85rem" }}>{error}</Typography>
                )}

                <AuthPrimaryButton onClick={handleSubmit} disabled={loading}>
                    {loading ? t("auth.logIn_loading") : t("auth.logIn")}
                </AuthPrimaryButton>

                <Stack direction="row" alignItems="center" spacing={2} justifyContent="center">
                    <Divider sx={{ flex: 1 }} />
                    <Typography sx={{ color: "#8E7CC3" }}>or</Typography>
                    <Divider sx={{ flex: 1 }} />
                </Stack>

                <AuthGoogleButton
                    disabled={loading}
                    onClick={() => {
                        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/v1";
                        window.location.href = `${apiBase}/auth/google`;
                    }}
                >
                    {t("auth.signInWithGoogle")}
                </AuthGoogleButton>

                <Typography
                    align="center"
                    sx={{ mt: 1, color: "#8E7CC3", fontSize: "0.85rem", cursor: "pointer" }}
                    onClick={() => router.push("/forgot-password")}
                >
                    {t("auth.forgotPassword")}
                </Typography>

                <Typography align="center" sx={{ color: "#8E7CC3", fontSize: "0.85rem" }}>
                    {t("auth.noAccount")}{" "}
                    <Box
                        component="span"
                        sx={{ cursor: "pointer", fontWeight: 600 }}
                        onClick={() => router.push("/sign-up")}
                    >
                        {t("auth.signUpLink")}
                    </Box>
                </Typography>
            </Stack>
        </AuthLayout>
    );
}
