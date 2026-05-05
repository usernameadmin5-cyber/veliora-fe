"use client";

import React, { useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/adminApi";
import { useAdminStore } from "@/store/adminStore";

export default function AdminLogin() {
    const router = useRouter();
    const { setAdminToken } = useAdminStore();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { accessToken } = await adminApi.login(username, password);
            setAdminToken(accessToken);
            router.push("/admin/dashboard");
        } catch {
            setError("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "#fff",
            "& fieldset": { borderColor: "rgba(0,0,0,0.15)" },
            "&:hover fieldset": { borderColor: "#555" },
            "&.Mui-focused fieldset": { borderColor: "#333" },
        },
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Box
                component="form"
                onSubmit={handleLogin}
                sx={{
                    width: 360,
                    backgroundColor: "#fff",
                    borderRadius: 3,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                    p: 4,
                }}
            >
                <Stack alignItems="center" spacing={1} mb={3}>
                    <Box
                        sx={{
                            width: 48, height: 48, borderRadius: "50%",
                            backgroundColor: "#1a1a2e",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <LockOutlined sx={{ color: "#fff", fontSize: 22 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: "#1a1a2e" }}>
                        Admin Panel
                    </Typography>
                    <Typography sx={{ color: "#888", fontSize: "0.85rem" }}>
                        Veliora · Internal
                    </Typography>
                </Stack>

                <Stack spacing={2}>
                    <TextField
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth size="small" sx={inputSx} required
                        autoComplete="username"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth size="small" sx={inputSx} required
                        autoComplete="current-password"
                    />
                    {error && (
                        <Typography sx={{ color: "#d32f2f", fontSize: "0.82rem", textAlign: "center" }}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                            mt: 1, borderRadius: 2, py: 1.2, textTransform: "none",
                            fontWeight: 700, backgroundColor: "#1a1a2e",
                            "&:hover": { backgroundColor: "#2d2d4e" },
                            "&.Mui-disabled": { backgroundColor: "#999", color: "#fff" },
                        }}
                    >
                        {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Sign in"}
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
