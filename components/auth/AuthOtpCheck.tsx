"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import AuthLayout from "./shared/AuthLayout";
import AuthPrimaryButton from "./shared/AuthPrimaryButton";
import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/store/authStore";

export default function AuthOtpCheck() {
    const router = useRouter();
    const { t } = useTranslation();
    const { otpContext, pendingEmail, setUser } = useAuthStore();

    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resent, setResent] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!otpContext || !pendingEmail) router.replace("/");
    }, [otpContext, pendingEmail, router]);

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...otp];
        next[index] = digit;
        setOtp(next);
        if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const next = [...otp];
        pasted.split("").forEach((char, i) => { next[i] = char; });
        setOtp(next);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = async () => {
        const code = otp.join("");
        if (code.length < 6) { setError(t("auth.errors.enterCode")); return; }
        setError("");
        setLoading(true);
        try {
            const result = await authApi.verifyOtp({ email: pendingEmail, otp: code, context: otpContext! });
            if (otpContext === "signup" && result.user && result.accessToken) {
                setUser(result.user, result.accessToken);
                router.push("/dashboard");
            } else {
                router.push("/");
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : t("auth.errors.verificationFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setResent(false);
        try {
            await authApi.resendOtp(pendingEmail, otpContext ?? "signup");
            setResent(true);
        } catch {
            setError(t("auth.errors.resendFailed"));
        }
    };

    return (
        <AuthLayout>
            <Typography
                align="center"
                sx={{ color: "#8E7CC3", fontSize: { xs: "0.9rem", sm: "1rem" }, fontWeight: 500, maxWidth: 360 }}
            >
                {t("auth.otpInstruction")}
            </Typography>

            <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <Box
                        key={index}
                        component="input"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                        sx={{
                            width: { xs: 44, sm: 52 }, height: { xs: 52, sm: 60 },
                            borderRadius: 2, border: "none", backgroundColor: "#F3F0FA",
                            boxShadow: "0 6px 10px rgba(0,0,0,0.15)", textAlign: "center",
                            fontSize: { xs: "1.3rem", sm: "1.5rem" }, fontWeight: 600, color: "#7E6BB5",
                            outline: "none", cursor: "text", fontFamily: "inherit",
                            "&:focus": { boxShadow: "0 0 0 2px #8E7CC3" },
                        }}
                    />
                ))}
            </Stack>

            {error && <Typography sx={{ color: "error.main", fontSize: "0.85rem" }}>{error}</Typography>}
            {resent && <Typography sx={{ color: "#8E7CC3", fontSize: "0.85rem" }}>{t("auth.codeSent")}</Typography>}

            <Typography
                sx={{ color: "#8E7CC3", fontSize: "0.85rem", cursor: "pointer", fontWeight: 500, "&:hover": { textDecoration: "underline" } }}
                onClick={handleResend}
            >
                {t("auth.resendCode")}
            </Typography>

            <AuthPrimaryButton sx={{ width: "auto", px: 6 }} onClick={handleSubmit} disabled={loading}>
                {loading ? t("auth.submit_loading") : t("auth.submit")}
            </AuthPrimaryButton>
        </AuthLayout>
    );
}
