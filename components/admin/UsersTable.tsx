"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
    Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Stack, Table, TableBody, TableCell,
    TableHead, TableRow, Typography,
} from "@mui/material";
import { CheckCircleOutline, DeleteOutline, VerifiedUser } from "@mui/icons-material";
import { adminApi, type AdminUser } from "@/lib/api/adminApi";

const headSx = { fontWeight: 700, color: "#555", fontSize: "0.78rem", textTransform: "uppercase" as const };
const cellSx = { fontSize: "0.875rem", py: 1.2 };

export default function UsersTable() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers();
            setUsers(res.items);
            setTotal(res.total);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleVerify = async (id: string) => {
        const updated = await adminApi.verifyUser(id);
        setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, isVerified: updated.isVerified } : u)));
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await adminApi.deleteUser(deleteTarget._id);
        setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
        setTotal((t) => t - 1);
        setDeleteTarget(null);
    };

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography sx={{ fontWeight: 700, color: "#1a1a2e", fontSize: "1rem" }}>
                    Users <Chip label={total} size="small" sx={{ ml: 1, fontWeight: 600 }} />
                </Typography>
            </Stack>

            {loading ? (
                <Stack alignItems="center" py={6}><CircularProgress /></Stack>
            ) : (
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f8f8f8" }}>
                                <TableCell sx={headSx}>Name</TableCell>
                                <TableCell sx={headSx}>Email</TableCell>
                                <TableCell sx={headSx}>Lang</TableCell>
                                <TableCell sx={headSx}>Verified</TableCell>
                                <TableCell sx={headSx}>Joined</TableCell>
                                <TableCell sx={headSx} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u._id} hover>
                                    <TableCell sx={cellSx}>{u.name}</TableCell>
                                    <TableCell sx={cellSx}>{u.email}</TableCell>
                                    <TableCell sx={cellSx}>{u.language?.toUpperCase()}</TableCell>
                                    <TableCell sx={cellSx}>
                                        {u.isVerified ? (
                                            <Chip icon={<CheckCircleOutline sx={{ fontSize: "14px !important" }} />}
                                                label="Verified" size="small" color="success" variant="outlined" />
                                        ) : (
                                            <Chip label="Pending" size="small" color="warning" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell sx={cellSx}>
                                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                                    </TableCell>
                                    <TableCell sx={cellSx} align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            {!u.isVerified && (
                                                <Button size="small" variant="outlined" color="success"
                                                    startIcon={<VerifiedUser sx={{ fontSize: 14 }} />}
                                                    onClick={() => handleVerify(u._id)}
                                                    sx={{ textTransform: "none", fontSize: "0.78rem", py: 0.3 }}>
                                                    Approve
                                                </Button>
                                            )}
                                            <Button size="small" variant="outlined" color="error"
                                                startIcon={<DeleteOutline sx={{ fontSize: 14 }} />}
                                                onClick={() => setDeleteTarget(u)}
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

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Delete user?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Permanently delete <strong>{deleteTarget?.email}</strong>? This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained"
                        sx={{ textTransform: "none" }}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
