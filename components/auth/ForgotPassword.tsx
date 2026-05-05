"use client";

import React, { useEffect, useState } from "react";
import { Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AuthLayout from "./shared/AuthLayout";
import AuthTextField from "./shared/AuthTextField";
import AuthPrimaryButton from "./shared/AuthPrimaryButton";
import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/store/authStore";

export default function ForgotPassword() {
    const router = useRouter();
    const { t } = useTranslation();
    const { isAuthenticated, setOtpContext } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isAuthenticated) router.replace("/dashboard");
    }, [isAuthenticated, router]);

    const handleSubmit = async () => {
        setError("");
        if (!email || !password || !confirmPassword) { setError(t("auth.errors.fillAll")); return; }
        if (password !== confirmPassword) { setError(t("auth.errors.passwordsMismatch")); return; }
        setLoading(true);
        try {
            await authApi.forgotPassword({ email, password, confirmPassword });
            setOtpContext("forgot-password", email);
            router.push("/verify");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : t("auth.errors.requestFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Stack spacing={0.5} alignItems="center">
                <Typography
                    align="center"
                    sx={{ color: "#8E7CC3", fontSize: { xs: "1.1rem", sm: "1.25rem" }, fontWeight: 600 }}
                >
                    {t("auth.checkEmail")}
                </Typography>
                <Typography
                    align="center"
                    sx={{ color: "#8E7CC3", fontSize: { xs: "0.8rem", sm: "0.875rem" }, maxWidth: 360 }}
                >
                    {t("auth.checkEmailSub")}
                </Typography>
            </Stack>

            <Stack spacing={2.2} width="100%" mt={1}>
                <Typography
                    align="center"
                    sx={{ color: "#8E7CC3", fontSize: { xs: "1rem", sm: "1.1rem" }, fontWeight: 600 }}
                >
                    {t("auth.changePassword")}
                </Typography>

                <AuthTextField placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
                <AuthTextField type="password" placeholder={t("auth.password")} value={password} onChange={(e) => setPassword(e.target.value)} />
                <AuthTextField type="password" placeholder={t("auth.confirmPassword")} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                {error && <Typography sx={{ color: "error.main", fontSize: "0.85rem" }}>{error}</Typography>}

                <AuthPrimaryButton onClick={handleSubmit} disabled={loading}>
                    {loading ? t("auth.changePassword_loading") : t("auth.changePasswordBtn")}
                </AuthPrimaryButton>
            </Stack>
        </AuthLayout>
    );
}
