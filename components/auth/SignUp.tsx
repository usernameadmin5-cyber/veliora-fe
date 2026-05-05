"use client";

import React, { useEffect, useState } from "react";
import { Box, Checkbox, Divider, FormControlLabel, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AuthLayout from "./shared/AuthLayout";
import AuthTextField from "./shared/AuthTextField";
import AuthPrimaryButton from "./shared/AuthPrimaryButton";
import AuthGoogleButton from "./shared/AuthGoogleButton";
import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/store/authStore";

export default function SignUp() {
    const router = useRouter();
    const { t } = useTranslation();
    const { isAuthenticated, setOtpContext, setPendingSignUp } = useAuthStore();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isAuthenticated) router.replace("/dashboard");
    }, [isAuthenticated, router]);

    const handleSubmit = async () => {
        setError("");
        if (!name || !email || !password || !confirmPassword) {
            setError(t("auth.errors.fillAll")); return;
        }
        if (password !== confirmPassword) {
            setError(t("auth.errors.passwordsMismatch")); return;
        }
        if (!agreed) {
            setError(t("auth.errors.agreeTerms")); return;
        }
        setLoading(true);
        try {
            await authApi.signUp({ name, email, password });
            setPendingSignUp({ name, email, password });
            setOtpContext("signup", email);
            router.push("/verify");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : t("auth.errors.signUpFailed"));
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
                <AuthTextField placeholder={t("auth.name")} value={name} onChange={(e) => setName(e.target.value)} />
                <AuthTextField placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
                <AuthTextField type="password" placeholder={t("auth.password")} value={password} onChange={(e) => setPassword(e.target.value)} />
                <AuthTextField type="password" placeholder={t("auth.confirmPassword")} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                <FormControlLabel
                    control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
                    label={
                        <Typography sx={{ fontSize: "0.8rem", color: "#8E7CC3" }}>
                            {t("auth.agreeTerms")}
                        </Typography>
                    }
                />

                {error && (
                    <Typography sx={{ color: "error.main", fontSize: "0.85rem" }}>{error}</Typography>
                )}

                <AuthPrimaryButton onClick={handleSubmit} disabled={loading}>
                    {loading ? t("auth.signUp_loading") : t("auth.signUp")}
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
                    {t("auth.signUpWithGoogle")}
                </AuthGoogleButton>

                <Typography align="center" sx={{ mt: 1, color: "#8E7CC3", fontSize: "0.85rem" }}>
                    {t("auth.hasAccount")}{" "}
                    <Box
                        component="span"
                        sx={{ cursor: "pointer", fontWeight: 600 }}
                        onClick={() => router.push("/")}
                    >
                        {t("auth.logInLink")}
                    </Box>
                </Typography>
            </Stack>
        </AuthLayout>
    );
}
