"use client";

import React from "react";
import {
    Box,
    Card,
    CardContent,
    Container,
    Stack,
    Typography,
} from "@mui/material";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: "url('/veliora-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                px: { xs: 2, sm: 3 },
                py: { xs: 4, sm: 6 },
            }}
        >
            <Container maxWidth="sm">
                <Card
                    elevation={8}
                    sx={{
                        borderRadius: 4,
                        backdropFilter: "blur(6px)",
                        backgroundColor: "rgba(255,255,255,0.85)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    }}
                >
                    <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                        <Stack spacing={{ xs: 2.5, sm: 3 }} alignItems="center">
                            <Box
                                component="img"
                                src="/veliora-logo.svg"
                                alt="Veliora"
                                sx={{
                                    scale: 2,
                                    width: { xs: 60, sm: 70 },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    color: "#7E6BB5",
                                    fontSize: { xs: "1.3rem", sm: "1.5rem" },
                                }}
                            >
                                Veliora
                            </Typography>
                            {children}
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}
