"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, Typography,
} from "@mui/material";
import { AddRounded, DeleteOutline, EditOutlined } from "@mui/icons-material";
import { adminApi, type AdminResetTip, type ResetPayload } from "@/lib/api/adminApi";

const headSx = { fontWeight: 700, color: "#555", fontSize: "0.78rem", textTransform: "uppercase" as const };
const cellSx = { fontSize: "0.875rem", py: 1.2 };
const textCellSx = {
    ...cellSx,
    maxWidth: 360,
    whiteSpace: "normal" as const,
    wordBreak: "break-word" as const,
};
const EMPTY: ResetPayload = { en: "", uk: "" };

export default function ResetsTable() {
    const [tips, setTips] = useState<AdminResetTip[]>([]);
    const [loading, setLoading] = useState(true);
    const [editTarget, setEditTarget] = useState<AdminResetTip | null>(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState<ResetPayload>(EMPTY);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try { setTips(await adminApi.getResetTips()); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setForm(EMPTY); setCreating(true); };
    const openEdit = (t: AdminResetTip) => { setForm({ en: t.en, uk: t.uk }); setEditTarget(t); };
    const closeDialog = () => { setCreating(false); setEditTarget(null); };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editTarget) {
                await adminApi.updateResetTip(editTarget._id, form);
            } else {
                await adminApi.createResetTip(form);
            }
            closeDialog();
            await load();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        await adminApi.deleteResetTip(id);
        await load();
    };

    const dialogOpen = creating || !!editTarget;

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: "1rem" }}>
                    Reset Tips <Chip label={tips.length} size="small" sx={{ ml: 1, fontWeight: 600 }} />
                </Typography>
                <Button variant="contained" size="small" startIcon={<AddRounded />}
                    onClick={openCreate}
                    sx={{ textTransform: "none", backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#2d2d4e" } }}>
                    New Tip
                </Button>
            </Stack>

            {loading ? (
                <Stack alignItems="center" py={6}><CircularProgress /></Stack>
            ) : (
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f8f8f8" }}>
                                <TableCell sx={{ ...headSx, width: "45%", maxWidth: 360 }}>English</TableCell>
                                <TableCell sx={{ ...headSx, width: "45%", maxWidth: 360 }}>Ukrainian</TableCell>
                                <TableCell sx={headSx} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tips.map((t) => (
                                <TableRow key={t._id} hover>
                                    <TableCell sx={textCellSx}>{t.en}</TableCell>
                                    <TableCell sx={textCellSx}>{t.uk}</TableCell>
                                    <TableCell sx={cellSx} align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Button size="small" variant="outlined"
                                                startIcon={<EditOutlined sx={{ fontSize: 14 }} />}
                                                onClick={() => openEdit(t)}
                                                sx={{ textTransform: "none", fontSize: "0.78rem", py: 0.3 }}>
                                                Edit
                                            </Button>
                                            <Button size="small" variant="outlined" color="error"
                                                startIcon={<DeleteOutline sx={{ fontSize: 14 }} />}
                                                onClick={() => handleDelete(t._id)}
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
                    {editTarget ? "Edit Reset Tip" : "New Reset Tip"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} pt={0.5}>
                        <TextField label="English" value={form.en}
                            onChange={(e) => setForm((f) => ({ ...f, en: e.target.value }))}
                            size="small" fullWidth multiline rows={2} required />
                        <TextField label="Ukrainian" value={form.uk}
                            onChange={(e) => setForm((f) => ({ ...f, uk: e.target.value }))}
                            size="small" fullWidth multiline rows={2} required />
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
