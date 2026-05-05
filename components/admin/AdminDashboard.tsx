"use client";

import React, { useState } from "react";
import {
    AppBar, Box, Button, Divider, Stack, Tab, Tabs, Toolbar, Typography,
} from "@mui/material";
import { LogoutRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import UsersTable from "./UsersTable";
import PracticesTable from "./PracticesTable";
import ResetsTable from "./ResetsTable";
import SurveysTable from "./SurveysTable";

const TABS = ["Users", "Practices", "Reset Tips", "Surveys"];

export default function AdminDashboard() {
    const router = useRouter();
    const { clearAdminToken } = useAdminStore();
    const [tab, setTab] = useState(0);

    const handleSignOut = () => {
        clearAdminToken();
        router.push("/admin");
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
            <AppBar position="sticky" elevation={0} sx={{ backgroundColor: "#1a1a2e", borderBottom: "1px solid #2d2d4e" }}>
                <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                            sx={{
                                width: 30, height: 30, borderRadius: 1,
                                backgroundColor: "rgba(255,255,255,0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.75rem" }}>V</Typography>
                        </Box>
                        <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                            Veliora Admin
                        </Typography>
                        <Box sx={{ px: 1, py: 0.2, borderRadius: 1, backgroundColor: "rgba(255,255,255,0.1)" }}>
                            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.72rem", fontWeight: 600 }}>
                                INTERNAL
                            </Typography>
                        </Box>
                    </Stack>
                    <Button onClick={handleSignOut} size="small" startIcon={<LogoutRounded sx={{ fontSize: 16 }} />}
                        sx={{ color: "rgba(255,255,255,0.7)", textTransform: "none", "&:hover": { color: "#fff" } }}>
                        Sign out
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
                <Box sx={{ backgroundColor: "#fff", borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                    <Box sx={{ borderBottom: "1px solid #eee", px: 2 }}>
                        <Tabs
                            value={tab}
                            onChange={(_, v) => setTab(v)}
                            TabIndicatorProps={{ sx: { backgroundColor: "#1a1a2e" } }}
                        >
                            {TABS.map((label, i) => (
                                <Tab key={label} label={label} value={i}
                                    sx={{
                                        textTransform: "none", fontWeight: 600, fontSize: "0.875rem",
                                        color: "#888",
                                        "&.Mui-selected": { color: "#1a1a2e" },
                                    }} />
                            ))}
                        </Tabs>
                    </Box>

                    <Divider />

                    <Box sx={{ p: { xs: 2, sm: 3 } }}>
                        {tab === 0 && <UsersTable />}
                        {tab === 1 && <PracticesTable />}
                        {tab === 2 && <ResetsTable />}
                        {tab === 3 && <SurveysTable />}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
