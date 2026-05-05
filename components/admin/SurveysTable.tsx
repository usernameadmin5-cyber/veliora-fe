"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem,
    Select, Stack, Table, TableBody, TableCell, TableHead, TableRow,
    TextField, Typography,
} from "@mui/material";
import { AddRounded, DeleteOutline, EditOutlined } from "@mui/icons-material";
import { adminApi, type AdminSurvey, type AdminUser, type SurveyPayload } from "@/lib/api/adminApi";

// ── Constants ─────────────────────────────────────────────────────────────────

const EMOTIONS = ["Calm", "Anxious", "Tired", "Motivated", "Overwhelmed", "Neutral"];
const SLEEP = ["Poor", "Okay", "Good"];
const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const headSx = { fontWeight: 700, color: "#555", fontSize: "0.78rem", textTransform: "uppercase" as const };
const cellSx = { fontSize: "0.875rem", py: 1.2 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string) {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function emptyPayload(): SurveyPayload {
    return { stress: 5, emotion: "Calm", sleepQuality: "Okay", activity: 5, submittedAt: "" };
}

// ── Survey form dialog ────────────────────────────────────────────────────────

interface SurveyDialogProps {
    open: boolean;
    initial: SurveyPayload;
    title: string;
    saving: boolean;
    onClose: () => void;
    onSave: (p: SurveyPayload) => void;
}

function SurveyDialog({ open, initial, title, saving, onClose, onSave }: SurveyDialogProps) {
    const [form, setForm] = useState<SurveyPayload>(initial);
    useEffect(() => { setForm(initial); }, [initial, open]);

    const set = (k: keyof SurveyPayload, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

    const selectSx = {
        "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
        "& .MuiInputLabel-root.Mui-focused": { color: "#1a1a2e" },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1a1a2e" },
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
            <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>{title}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={0.5}>
                    {/* Stress */}
                    <FormControl fullWidth size="small" sx={selectSx}>
                        <InputLabel>Stress (1–10)</InputLabel>
                        <Select label="Stress (1–10)" value={form.stress} onChange={(e) => set("stress", Number(e.target.value))}>
                            {SCALE.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                        </Select>
                    </FormControl>

                    {/* Emotion */}
                    <FormControl fullWidth size="small" sx={selectSx}>
                        <InputLabel>Emotion</InputLabel>
                        <Select label="Emotion" value={form.emotion} onChange={(e) => set("emotion", e.target.value)}>
                            {EMOTIONS.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                        </Select>
                    </FormControl>

                    {/* Sleep quality */}
                    <FormControl fullWidth size="small" sx={selectSx}>
                        <InputLabel>Sleep quality</InputLabel>
                        <Select label="Sleep quality" value={form.sleepQuality} onChange={(e) => set("sleepQuality", e.target.value)}>
                            {SLEEP.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>

                    {/* Activity */}
                    <FormControl fullWidth size="small" sx={selectSx}>
                        <InputLabel>Activity (1–10)</InputLabel>
                        <Select label="Activity (1–10)" value={form.activity} onChange={(e) => set("activity", Number(e.target.value))}>
                            {SCALE.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                        </Select>
                    </FormControl>

                    {/* Date override (optional) */}
                    <TextField
                        label="Date (optional)"
                        type="datetime-local"
                        size="small"
                        value={form.submittedAt ?? ""}
                        onChange={(e) => set("submittedAt", e.target.value)}
                        fullWidth
                        sx={selectSx}
                        slotProps={{ inputLabel: { shrink: true } }}
                        helperText="Leave blank to use current time"
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" size="small"
                    sx={{ borderRadius: 2, textTransform: "none", borderColor: "#ccc", color: "#555" }}>
                    Cancel
                </Button>
                <Button onClick={() => onSave(form)} disabled={saving} variant="contained" size="small"
                    sx={{ borderRadius: 2, textTransform: "none", backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#2d2d4e" } }}>
                    {saving ? "Saving…" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SurveysTable() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [surveys, setSurveys] = useState<AdminSurvey[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingSurveys, setLoadingSurveys] = useState(false);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AdminSurvey | null>(null);
    const [formInitial, setFormInitial] = useState<SurveyPayload>(emptyPayload());
    const [saving, setSaving] = useState(false);

    // Delete dialog
    const [deleteTarget, setDeleteTarget] = useState<AdminSurvey | null>(null);

    // Load users once
    useEffect(() => {
        adminApi.getUsers().then((res) => {
            setUsers(res.items);
        }).finally(() => setLoadingUsers(false));
    }, []);

    // Load surveys when user selected
    const loadSurveys = useCallback(async (uid: string) => {
        setLoadingSurveys(true);
        setSurveys([]);
        try {
            const items = await adminApi.getUserSurveys(uid);
            setSurveys(items);
        } finally {
            setLoadingSurveys(false);
        }
    }, []);

    const handleUserChange = (uid: string) => {
        setSelectedUserId(uid);
        if (uid) loadSurveys(uid);
        else setSurveys([]);
    };

    // Open add dialog
    const handleAdd = () => {
        setEditTarget(null);
        setFormInitial(emptyPayload());
        setDialogOpen(true);
    };

    // Open edit dialog
    const handleEdit = (s: AdminSurvey) => {
        setEditTarget(s);
        // Format date for datetime-local input (strip seconds/ms)
        const dt = new Date(s.submittedAt).toISOString().slice(0, 16);
        setFormInitial({
            stress: s.stress,
            emotion: s.emotion,
            sleepQuality: s.sleepQuality,
            activity: s.activity,
            submittedAt: dt,
        });
        setDialogOpen(true);
    };

    const handleSave = async (payload: SurveyPayload) => {
        if (!selectedUserId) return;
        setSaving(true);
        try {
            if (editTarget) {
                const updated = await adminApi.updateSurvey(editTarget._id, payload);
                setSurveys((prev) => prev.map((s) => s._id === updated._id ? updated : s));
            } else {
                const created = await adminApi.createSurvey(selectedUserId, payload);
                setSurveys((prev) => [created, ...prev]);
            }
            setDialogOpen(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await adminApi.deleteSurvey(deleteTarget._id);
        setSurveys((prev) => prev.filter((s) => s._id !== deleteTarget._id));
        setDeleteTarget(null);
    };

    const selectedUser = users.find((u) => u._id === selectedUserId);

    return (
        <Box>
            {/* User selector */}
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} spacing={2} mb={3}>
                <FormControl size="small" sx={{ minWidth: 280 }}>
                    <InputLabel>Select user</InputLabel>
                    <Select
                        label="Select user"
                        value={selectedUserId}
                        onChange={(e) => handleUserChange(e.target.value)}
                        disabled={loadingUsers}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value=""><em>— choose a user —</em></MenuItem>
                        {users.map((u) => (
                            <MenuItem key={u._id} value={u._id}>
                                {u.name} ({u.email})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedUserId && (
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddRounded />}
                        onClick={handleAdd}
                        sx={{
                            borderRadius: 2, textTransform: "none", fontWeight: 600,
                            backgroundColor: "#1a1a2e", "&:hover": { backgroundColor: "#2d2d4e" },
                        }}
                    >
                        Add survey
                    </Button>
                )}
            </Stack>

            {/* Empty / loading states */}
            {!selectedUserId && (
                <Typography sx={{ color: "#aaa", fontSize: "0.875rem" }}>
                    Select a user above to view and manage their survey submissions.
                </Typography>
            )}

            {loadingSurveys && (
                <Stack alignItems="center" py={4}><CircularProgress size={28} /></Stack>
            )}

            {selectedUserId && !loadingSurveys && surveys.length === 0 && (
                <Typography sx={{ color: "#aaa", fontSize: "0.875rem" }}>
                    No surveys found for {selectedUser?.name ?? "this user"}.
                </Typography>
            )}

            {/* Table */}
            {surveys.length > 0 && (
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#fafafa" }}>
                                <TableCell sx={headSx}>Date</TableCell>
                                <TableCell sx={headSx}>Stress</TableCell>
                                <TableCell sx={headSx}>Emotion</TableCell>
                                <TableCell sx={headSx}>Sleep</TableCell>
                                <TableCell sx={headSx}>Activity</TableCell>
                                <TableCell sx={headSx} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {surveys.map((s) => (
                                <TableRow key={s._id} hover>
                                    <TableCell sx={cellSx}>{fmt(s.submittedAt)}</TableCell>
                                    <TableCell sx={cellSx}>{s.stress}/10</TableCell>
                                    <TableCell sx={cellSx}>{s.emotion}</TableCell>
                                    <TableCell sx={cellSx}>{s.sleepQuality}</TableCell>
                                    <TableCell sx={cellSx}>{s.activity}/10</TableCell>
                                    <TableCell sx={cellSx} align="right">
                                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                            <Button size="small" onClick={() => handleEdit(s)}
                                                startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
                                                sx={{ textTransform: "none", fontSize: "0.78rem", color: "#555" }}>
                                                Edit
                                            </Button>
                                            <Button size="small" onClick={() => setDeleteTarget(s)}
                                                startIcon={<DeleteOutline sx={{ fontSize: 15 }} />}
                                                sx={{ textTransform: "none", fontSize: "0.78rem", color: "#EF4444" }}>
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

            {/* Add / Edit dialog */}
            <SurveyDialog
                open={dialogOpen}
                initial={formInitial}
                title={editTarget ? "Edit survey" : "Add survey"}
                saving={saving}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}
            />

            {/* Delete confirm dialog */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>Delete survey?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: "0.875rem" }}>
                        This will permanently delete the submission
                        from {deleteTarget ? fmt(deleteTarget.submittedAt) : ""}.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setDeleteTarget(null)} variant="outlined" size="small"
                        sx={{ borderRadius: 2, textTransform: "none", borderColor: "#ccc", color: "#555" }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} variant="contained" size="small"
                        sx={{ borderRadius: 2, textTransform: "none", backgroundColor: "#EF4444", "&:hover": { backgroundColor: "#DC2626" } }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
