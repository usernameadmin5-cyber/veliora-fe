"use client";

import React, { useEffect, useState } from "react";
import {
    Box, Button, Divider, Grid, MenuItem, Select, Stack, TextField, Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/store/profileStore";
import { useAuthStore } from "@/store/authStore";
import { profileApi } from "@/lib/api/profileApi";
import ChangeEmailDialog from "./ChangeEmailDialog";
import SetPasswordDialog from "./SetPasswordDialog";

const LANGUAGES = [
    { value: "en", label: "English" },
    { value: "uk", label: "Українська" },
];

export default function PersonalInfo() {
    const { t, i18n } = useTranslation();
    const { name, email, age, timeZone, language, setProfile } = useProfileStore();
    const hasPassword = useAuthStore((s) => s.hasPassword);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [setPasswordOpen, setSetPasswordOpen] = useState(false);
    const [form, setForm] = useState({ name, email, age, timeZone, language });

    // Sync form when store updates (e.g., after initial profile fetch)
    useEffect(() => {
        if (!editing) {
            setForm({ name, email, age, timeZone, language });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, email, age, timeZone, language]);

    const handleEdit = () => {
        setForm({ name, email, age, timeZone, language });
        setEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await profileApi.updateProfile({
                name: form.name,
                age: form.age ?? undefined,
                timeZone: form.timeZone,
                language: form.language,
            });
            setProfile({
                name: updated.name,
                email: updated.email,
                age: updated.age,
                timeZone: updated.timeZone,
                language: updated.language,
            });
            i18n.changeLanguage(updated.language);
        } finally {
            setSaving(false);
            setEditing(false);
        }
    };

    const fieldSx = {
        backgroundColor: "rgba(142,124,195,0.08)",
        borderRadius: 2,
        p: 1.5,
    };

    const labelSx = {
        color: "#A899CF",
        fontSize: "0.72rem",
        fontWeight: 600,
        textTransform: "uppercase" as const,
        letterSpacing: 0.5,
        mb: 0.3,
    };

    const valueSx = { color: "#5B4D8E", fontWeight: 500, fontSize: "0.95rem" };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "rgba(142,124,195,0.06)",
            "& fieldset": { borderColor: "rgba(142,124,195,0.3)" },
            "&:hover fieldset": { borderColor: "#8E7CC3" },
            "&.Mui-focused fieldset": { borderColor: "#8E7CC3" },
        },
        "& .MuiInputLabel-root.Mui-focused": { color: "#8E7CC3" },
    };

    const currentLangLabel = LANGUAGES.find((l) => l.value === language)?.label ?? language;

    return (
        <Box
            sx={{
                backgroundColor: "#fff", borderRadius: 4,
                boxShadow: "0 4px 24px rgba(142,124,195,0.1)",
                p: { xs: 2.5, sm: 3.5 },
            }}
        >
            <Typography sx={{ fontWeight: 700, color: "#8E7CC3", fontSize: "1.05rem", mb: 1.5 }}>
                {t("profile.personalInfo.title")}
            </Typography>
            <Divider sx={{ borderColor: "rgba(142,124,195,0.18)", mb: 2.5 }} />

            {editing ? (
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label={t("profile.personalInfo.name")}
                            value={form.name}
                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            fullWidth size="small" sx={inputSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={fieldSx}>
                            <Typography sx={labelSx}>{t("profile.personalInfo.email")}</Typography>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                <Typography sx={{ ...valueSx, overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {form.email || "—"}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => {
                                        if (hasPassword) {
                                            setEmailDialogOpen(true);
                                        } else {
                                            setSetPasswordOpen(true);
                                        }
                                    }}
                                    sx={{
                                        textTransform: "none",
                                        color: "#8E7CC3",
                                        fontWeight: 600,
                                        "&:hover": { backgroundColor: "rgba(142,124,195,0.08)" },
                                    }}
                                >
                                    {t("profile.personalInfo.changeEmail")}
                                </Button>
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label={t("profile.personalInfo.age")}
                            value={form.age ?? ""}
                            onChange={(e) => setForm((p) => ({ ...p, age: e.target.value ? Number(e.target.value) : null }))}
                            fullWidth size="small" type="number" sx={inputSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label={t("profile.personalInfo.timeZone")}
                            value={form.timeZone}
                            onChange={(e) => setForm((p) => ({ ...p, timeZone: e.target.value }))}
                            fullWidth size="small" sx={inputSx}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ ...labelSx, mb: 0.8 }}>
                            {t("profile.personalInfo.language")}
                        </Typography>
                        <Select
                            value={form.language}
                            onChange={(e) => setForm((p) => ({ ...p, language: e.target.value as "en" | "uk" }))}
                            size="small"
                            fullWidth
                            sx={{
                                borderRadius: 2,
                                backgroundColor: "rgba(142,124,195,0.06)",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(142,124,195,0.3)" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#8E7CC3" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8E7CC3" },
                            }}
                        >
                            {LANGUAGES.map((l) => (
                                <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                            ))}
                        </Select>
                    </Grid>
                </Grid>
            ) : (
                <Grid container spacing={2}>
                    {[
                        { key: "name", label: t("profile.personalInfo.name"), value: name },
                        { key: "email", label: t("profile.personalInfo.email"), value: email },
                        { key: "age", label: t("profile.personalInfo.age"), value: age },
                        { key: "timeZone", label: t("profile.personalInfo.timeZone"), value: timeZone },
                        { key: "language", label: t("profile.personalInfo.language"), value: currentLangLabel },
                    ].map((f) => (
                        <Grid key={f.key} size={{ xs: 12, sm: 6 }}>
                            <Box sx={fieldSx}>
                                <Typography sx={labelSx}>{f.label}</Typography>
                                <Typography sx={valueSx}>{f.value || "—"}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Stack direction="row" justifyContent="flex-end" mt={3}>
                {editing ? (
                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setEditing(false)}
                            sx={{
                                borderRadius: 3, px: 2.5, textTransform: "none",
                                borderColor: "rgba(142,124,195,0.4)", color: "#8E7CC3",
                                "&:hover": { borderColor: "#8E7CC3", backgroundColor: "rgba(142,124,195,0.05)" },
                            }}
                        >
                            {t("survey.back")}
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleSave}
                            disabled={saving}
                            sx={{
                                borderRadius: 3, px: 2.5, textTransform: "none", fontWeight: 600,
                                backgroundColor: "#8E7CC3", "&:hover": { backgroundColor: "#7B69B1" },
                                boxShadow: "0 4px 12px rgba(126,107,181,0.3)",
                                "&.Mui-disabled": { backgroundColor: "#C5B8E8", color: "#fff" },
                            }}
                        >
                            {saving ? t("dashboard.checkIn.saving") : t("profile.personalInfo.saveProfile")}
                        </Button>
                    </Stack>
                ) : (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleEdit}
                        sx={{
                            borderRadius: 3, px: 2.5, textTransform: "none", fontWeight: 600,
                            borderColor: "#8E7CC3", color: "#8E7CC3",
                            "&:hover": { backgroundColor: "rgba(142,124,195,0.07)", borderColor: "#7B69B1" },
                        }}
                    >
                        {t("profile.personalInfo.editProfile")}
                    </Button>
                )}
            </Stack>

            <ChangeEmailDialog
                open={emailDialogOpen}
                onClose={() => setEmailDialogOpen(false)}
            />

            <SetPasswordDialog
                open={setPasswordOpen}
                onClose={() => setSetPasswordOpen(false)}
                onSuccess={() => {
                    setSetPasswordOpen(false);
                    setEmailDialogOpen(true);
                }}
                title={t("profile.personalInfo.setPasswordFirst")}
                description={t("profile.personalInfo.setPasswordForEmailDesc")}
                submitLabel={t("profile.personalInfo.setAndContinue")}
                savingLabel={t("profile.connectedAccounts.setting")}
            />
        </Box>
    );
}
