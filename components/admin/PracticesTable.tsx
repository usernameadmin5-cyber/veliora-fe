"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControlLabel, MenuItem, Select, Stack, Switch, Table,
    TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import {
    AddRounded, DeleteOutline, EditOutlined, PowerSettingsNewOutlined, VisibilityOffOutlined,
} from "@mui/icons-material";
import { adminApi, type AdminPractice, type PracticePayload } from "@/lib/api/adminApi";

const CATEGORIES = ["Anxiety Relief", "Meditation", "Sleep", "Emotional health"];
const GRADIENTS = [
    "linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)",
    "linear-gradient(135deg, #93C5FD 0%, #6366F1 100%)",
    "linear-gradient(135deg, #818CF8 0%, #4338CA 100%)",
    "linear-gradient(135deg, #F9A8D4 0%, #C084FC 100%)",
    "linear-gradient(135deg, #9B87D8 0%, #7E6BB5 100%)",
];
const headSx = { fontWeight: 700, color: "#555", fontSize: "0.78rem", textTransform: "uppercase" as const };
const cellSx = { fontSize: "0.875rem", py: 1.2 };
const EMPTY: PracticePayload = {
    title: "", titleUk: "", durationMin: 10, category: "Meditation",
    gradient: GRADIENTS[0], thumbnailUrl: null, videoUrl: null, active: true,
};

export default function PracticesTable() {
    const [practices, setPractices] = useState<AdminPractice[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState<AdminPractice | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<PracticePayload>(EMPTY);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.getPractices();
            setPractices(res.items);
            setTotal(res.total);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setForm(EMPTY); setCreating(true); };
    const openEdit = (p: AdminPractice) => {
        setForm({
            title: p.title, titleUk: p.titleUk, durationMin: p.durationMin,
            category: p.category, gradient: p.gradient,
            thumbnailUrl: p.thumbnailUrl, videoUrl: p.videoUrl, active: p.active,
        });
        setEditTarget(p);
    };
    const closeDialog = () => { setCreating(false); setEditTarget(null); };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editTarget) {
                await adminApi.updatePractice(editTarget._id, form);
            } else {
                await adminApi.createPractice(form);
            }
            closeDialog();
            await load();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        await adminApi.deletePractice(id);
        await load();
    };

    const handleToggleActive = async (p: AdminPractice) => {
        await adminApi.updatePractice(p._id, {
            title: p.title, titleUk: p.titleUk, durationMin: p.durationMin,
            category: p.category, gradient: p.gradient,
            thumbnailUrl: p.thumbnailUrl, videoUrl: p.videoUrl,
            active: !p.active,
        });
        await load();
    };

    const set = (field: keyof PracticePayload, value: unknown) =>
        setForm((f) => ({ ...f, [field]: value }));

    const dialogOpen = creating || !!editTarget;

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: "1rem" }}>
                    Practices <Chip label={total} size="small" sx={{ ml: 1, fontWeight: 600 }} />
                </Typography>
                <Button variant="contained" size="small" startIcon={<AddRounded />}
                    onClick={openCreate}
                    sx={{ textTransform: "none", backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#2d2d4e" } }}>
                    New Practice
                </Button>
            </Stack>

            {loading ? (
                <Stack alignItems="center" py={6}><CircularProgress /></Stack>
            ) : (
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f8f8f8" }}>
                                <TableCell sx={headSx}>Title</TableCell>
                                <TableCell sx={headSx}>Title (UA)</TableCell>
                                <TableCell sx={headSx}>Category</TableCell>
                                <TableCell sx={headSx}>Duration</TableCell>
                                <TableCell sx={headSx}>Gradient</TableCell>
                                <TableCell sx={headSx}>Status</TableCell>
                                <TableCell sx={headSx} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {practices.map((p) => (
                                <TableRow key={p._id} hover>
                                    <TableCell sx={cellSx}>{p.title}</TableCell>
                                    <TableCell sx={cellSx}>{p.titleUk}</TableCell>
                                    <TableCell sx={cellSx}>{p.category}</TableCell>
                                    <TableCell sx={cellSx}>{p.durationMin} min</TableCell>
                                    <TableCell sx={cellSx}>
                                        <Box sx={{ width: 32, height: 16, borderRadius: 1, background: p.gradient }} />
                                    </TableCell>
                                    <TableCell sx={cellSx}>
                                        <Chip label={p.active ? "Active" : "Inactive"} size="small"
                                            color={p.active ? "success" : "default"} variant="outlined" />
                                    </TableCell>
                                    <TableCell sx={cellSx} align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Button size="small" variant="outlined"
                                                startIcon={<EditOutlined sx={{ fontSize: 14 }} />}
                                                onClick={() => openEdit(p)}
                                                sx={{ textTransform: "none", fontSize: "0.78rem", py: 0.3 }}>
                                                Edit
                                            </Button>
                                            {p.active ? (
                                                <Button size="small" variant="outlined" color="warning"
                                                    startIcon={<VisibilityOffOutlined sx={{ fontSize: 14 }} />}
                                                    onClick={() => handleToggleActive(p)}
                                                    sx={{ textTransform: "none", fontSize: "0.78rem", py: 0.3 }}>
                                                    Deactivate
                                                </Button>
                                            ) : (
                                                <Button size="small" variant="outlined" color="success"
                                                    startIcon={<PowerSettingsNewOutlined sx={{ fontSize: 14 }} />}
                                                    onClick={() => handleToggleActive(p)}
                                                    sx={{ textTransform: "none", fontSize: "0.78rem", py: 0.3 }}>
                                                    Activate
                                                </Button>
                                            )}
                                            <Button size="small" variant="outlined" color="error"
                                                startIcon={<DeleteOutline sx={{ fontSize: 14 }} />}
                                                onClick={() => handleDelete(p._id)}
                                                sx={{ textTransform: "none", fontSize: "0.78rem", py: 0.3 }}>
                                                Delete
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}

            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    {editTarget ? "Edit Practice" : "New Practice"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} pt={0.5}>
                        <Stack direction="row" spacing={1.5}>
                            <TextField label="Title (EN)" value={form.title} onChange={(e) => set("title", e.target.value)}
                                size="small" fullWidth required />
                            <TextField label="Title (UA)" value={form.titleUk} onChange={(e) => set("titleUk", e.target.value)}
                                size="small" fullWidth required />
                        </Stack>
                        <Stack direction="row" spacing={1.5}>
                            <TextField label="Duration (min)" type="number" value={form.durationMin}
                                onChange={(e) => set("durationMin", Number(e.target.value))}
                                size="small" sx={{ width: 160 }} required />
                            <Select value={form.category} onChange={(e) => set("category", e.target.value)}
                                size="small" fullWidth>
                                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                        </Stack>
                        <Box>
                            <Typography sx={{ fontSize: "0.78rem", color: "#555", mb: 0.8 }}>Gradient</Typography>
                            <Stack direction="row" spacing={1}>
                                {GRADIENTS.map((g) => (
                                    <Box key={g} onClick={() => set("gradient", g)}
                                        sx={{
                                            width: 32, height: 32, borderRadius: 1, background: g, cursor: "pointer",
                                            border: form.gradient === g ? "2px solid #1a1a2e" : "2px solid transparent",
                                        }} />
                                ))}
                            </Stack>
                        </Box>
                        <TextField label="Thumbnail URL" value={form.thumbnailUrl ?? ""}
                            onChange={(e) => set("thumbnailUrl", e.target.value || null)}
                            size="small" fullWidth />
                        <TextField label="Video URL" value={form.videoUrl ?? ""}
                            onChange={(e) => set("videoUrl", e.target.value || null)}
                            size="small" fullWidth />
                        <FormControlLabel
                            control={<Switch checked={form.active ?? true} onChange={(e) => set("active", e.target.checked)} />}
                            label="Active" />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={closeDialog} sx={{ textTransform: "none" }}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving}
                        sx={{ textTransform: "none", backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#2d2d4e" } }}>
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
