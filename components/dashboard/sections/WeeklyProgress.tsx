"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import { ChevronLeft, ChevronRight, LockOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import dayjs, { Dayjs } from "dayjs";
import { dashboardApi, type WeeklyProgressResponse } from "@/lib/api/dashboardApi";
import { usePremiumStore } from "@/store/premiumStore";
import { useProfileStore } from "@/store/profileStore";
import { formatWeekRange, isSameWeek, mondayOf, toISODate } from "@/lib/utils/week";

// ─── Chart constants ──────────────────────────────────────────────────────────

const SVG_W = 280;
const SVG_H = 150;
const PAD_L = 26;
const PAD_R = 8;
const PAD_T = 10;
const PAD_B = 22;
const DRAW_W = SVG_W - PAD_L - PAD_R;
const DRAW_H = SVG_H - PAD_T - PAD_B;
const MAX_VAL = 10;
const Y_TICKS = [0, 5, 10];

const xPos = (i: number, n: number) => PAD_L + (n > 1 ? (i / (n - 1)) * DRAW_W : DRAW_W / 2);
const yPos = (val: number) => PAD_T + (1 - val / MAX_VAL) * DRAW_H;

// ─── Shared grid ──────────────────────────────────────────────────────────────

function ChartGrid({ days }: { days: string[] }) {
    const n = days.length;
    return (
        <>
            {Y_TICKS.map((tick) => {
                const y = yPos(tick);
                return (
                    <g key={tick}>
                        <line x1={PAD_L} y1={y} x2={PAD_L + DRAW_W} y2={y}
                            stroke="rgba(142,124,195,0.14)" strokeWidth={1} strokeDasharray="4 3" />
                        <text x={PAD_L - 5} y={y + 3.5} textAnchor="end"
                            fontSize="9" fill="#C4B5F4" fontFamily="inherit">{tick}</text>
                    </g>
                );
            })}
            {days.map((day, i) => (
                <text key={i} x={xPos(i, n)} y={SVG_H - 4} textAnchor="middle"
                    fontSize="10" fill="#A899CF" fontFamily="inherit">{day}</text>
            ))}
        </>
    );
}

// ─── Stress line chart ────────────────────────────────────────────────────────

function StressLineChart({ data }: { data: { day: string; stress: number | null }[] }) {
    const n = data.length;
    const pts = data.map((d, i) => ({
        x: xPos(i, n),
        y: d.stress !== null ? yPos(d.stress) : null,
        day: d.day,
    }));

    // Build path: M to first non-null, L for subsequent, M again after a gap
    let d = "";
    let lastWasNull = true;
    for (const p of pts) {
        if (p.y === null) { lastWasNull = true; continue; }
        d += lastWasNull ? `M ${p.x},${p.y} ` : `L ${p.x},${p.y} `;
        lastWasNull = false;
    }

    // Area fill from first to last non-null
    const nonNull = pts.filter((p) => p.y !== null);
    let areaPath = "";
    if (nonNull.length >= 2) {
        areaPath =
            `M ${nonNull[0].x},${nonNull[0].y!} ` +
            nonNull.slice(1).map((p) => `L ${p.x},${p.y!}`).join(" ") +
            ` L ${nonNull[nonNull.length - 1].x},${PAD_T + DRAW_H} L ${nonNull[0].x},${PAD_T + DRAW_H} Z`;
    }

    return (
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
            <defs>
                <linearGradient id="stressAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9B87D8" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#9B87D8" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <ChartGrid days={data.map((d) => d.day)} />
            {areaPath && <path d={areaPath} fill="url(#stressAreaGrad)" />}
            {d && <path d={d} fill="none" stroke="#9B87D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
            {pts.filter((p) => p.y !== null).map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y!} r={3.5} fill="#9B87D8" stroke="#fff" strokeWidth="1.5" />
            ))}
        </svg>
    );
}

// ─── Activity bar chart ───────────────────────────────────────────────────────

const BAR_W = 18;

function ActivityBarChart({ data }: { data: { day: string; activity: number | null }[] }) {
    const n = data.length;
    return (
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
            <defs>
                <linearGradient id="activityBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C084FC" stopOpacity="1" />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.7" />
                </linearGradient>
            </defs>
            <ChartGrid days={data.map((d) => d.day)} />
            {data.map((d, i) => {
                if (d.activity === null) return null;
                const cx = xPos(i, n);
                const barH = (d.activity / MAX_VAL) * DRAW_H;
                const barY = PAD_T + DRAW_H - barH;
                return (
                    <rect key={i} x={cx - BAR_W / 2} y={barY}
                        width={BAR_W} height={Math.max(barH, 2)} rx={4} ry={4}
                        fill="url(#activityBarGrad)" />
                );
            })}
        </svg>
    );
}

// ─── Week selector ────────────────────────────────────────────────────────────

function WeekSelector({
    monday,
    onChange,
    earliestMonday,
    thisWeekLabel,
}: {
    monday: Dayjs;
    onChange: (next: Dayjs) => void;
    earliestMonday: Dayjs | null;
    thisWeekLabel: string;
}) {
    const currentMonday = mondayOf(dayjs());
    const disableNext = isSameWeek(monday, currentMonday);
    const disablePrev = !!earliestMonday && !monday.isAfter(earliestMonday, "day");
    const label = isSameWeek(monday, currentMonday) ? thisWeekLabel : formatWeekRange(monday);

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
                px: 0.6,
                py: 0.2,
                borderRadius: 2,
                backgroundColor: "rgba(142,124,195,0.08)",
                border: "1px solid rgba(142,124,195,0.18)",
            }}
        >
            <IconButton
                size="small"
                onClick={() => onChange(monday.subtract(7, "day"))}
                disabled={disablePrev}
                sx={{ color: "#8E7CC3", p: 0.3, "&.Mui-disabled": { color: "rgba(142,124,195,0.35)" } }}
                aria-label="Previous week"
            >
                <ChevronLeft fontSize="small" />
            </IconButton>
            <Typography sx={{ color: "#8E7CC3", fontSize: "0.78rem", fontWeight: 600, minWidth: 78, textAlign: "center" }}>
                {label}
            </Typography>
            <IconButton
                size="small"
                onClick={() => onChange(monday.add(7, "day"))}
                disabled={disableNext}
                sx={{ color: "#8E7CC3", p: 0.3, "&.Mui-disabled": { color: "rgba(142,124,195,0.35)" } }}
                aria-label="Next week"
            >
                <ChevronRight fontSize="small" />
            </IconButton>
        </Stack>
    );
}

// ─── Locked (free) view ───────────────────────────────────────────────────────

const PLACEHOLDER_VALUES = [4, 6, 5, 7, 5, 8, 6];

function LockedView({ data, onGetPremium, title, getPremiumLabel, dayLabels, selector }: {
    data: { dayIndex: number; value: number | null }[];
    onGetPremium?: () => void;
    title: string;
    getPremiumLabel: string;
    dayLabels: string[];
    selector: React.ReactNode;
}) {
    // Use placeholder values so real data is never exposed to non-premium users
    const stressData = data.map((d, i) => ({ day: dayLabels[d.dayIndex] ?? "", stress: PLACEHOLDER_VALUES[i] ?? null }));
    return (
        <Box sx={{ position: "relative", overflow: "hidden" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} spacing={1}>
                <Typography sx={{ fontWeight: 700, color: "#8E7CC3", fontSize: "1.1rem" }}>{title}</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                    {selector}
                    <LockOutlined sx={{ color: "#C4B5F4", fontSize: 20 }} />
                </Stack>
            </Stack>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
                <StressLineChart data={stressData} />
            </Box>
            <Box
                sx={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "65%",
                    background: "linear-gradient(to top, rgba(255,255,255,1) 40%, rgba(255,255,255,0.7) 70%, transparent 100%)",
                    display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                    p: { xs: 2, sm: 3 },
                }}
            >
                <Button
                    variant="contained" onClick={onGetPremium}
                    sx={{
                        borderRadius: 3, px: 3, py: 1, backgroundColor: "#8E7CC3",
                        textTransform: "none", fontWeight: 600, fontSize: "0.875rem",
                        boxShadow: "0 4px 12px rgba(126,107,181,0.3)",
                        "&:hover": { backgroundColor: "#7B69B1" },
                    }}
                >
                    {getPremiumLabel}
                </Button>
            </Box>
        </Box>
    );
}

// ─── Premium view ─────────────────────────────────────────────────────────────

function PremiumView({
    data,
    avgStress,
    avgActivity,
    t,
    dayLabels,
    selector,
}: {
    data: { dayIndex: number; stress: number | null; activity: number | null }[];
    avgStress: number | null;
    avgActivity: number | null;
    t: (k: string) => string;
    dayLabels: string[];
    selector: React.ReactNode;
}) {
    const labeled = data.map((d) => ({ ...d, day: dayLabels[d.dayIndex] ?? "" }));
    return (
        <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
                <Typography sx={{ fontWeight: 700, color: "#8E7CC3", fontSize: "1.1rem" }}>
                    {t("dashboard.weeklyProgress.title")}
                </Typography>
                {selector}
            </Stack>

            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 3, sm: 2 }}
                divider={
                    <Box sx={{
                        width: { xs: "100%", sm: "1px" },
                        height: { xs: "1px", sm: "auto" },
                        backgroundColor: "rgba(142,124,195,0.12)",
                        flexShrink: 0,
                    }} />
                }
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#9B87D8" }} />
                            <Typography sx={{ color: "#7E6BB5", fontWeight: 600, fontSize: "0.85rem" }}>
                                {t("dashboard.weeklyProgress.stressLevel")}
                            </Typography>
                        </Stack>
                        <Typography sx={{ color: "#A899CF", fontSize: "0.78rem" }}>
                            {t("dashboard.weeklyProgress.avg")}{" "}
                            <strong style={{ color: "#7E6BB5" }}>
                                {avgStress !== null ? avgStress : "—"}
                            </strong>/10
                        </Typography>
                    </Stack>
                    <StressLineChart data={labeled.map((d) => ({ day: d.day, stress: d.stress }))} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                        <Stack direction="row" alignItems="center" spacing={0.8}>
                            <Box sx={{ width: 10, height: 10, borderRadius: 1, backgroundColor: "#C084FC" }} />
                            <Typography sx={{ color: "#7E6BB5", fontWeight: 600, fontSize: "0.85rem" }}>
                                {t("dashboard.weeklyProgress.physicalActivity")}
                            </Typography>
                        </Stack>
                        <Typography sx={{ color: "#A899CF", fontSize: "0.78rem" }}>
                            {t("dashboard.weeklyProgress.avg")}{" "}
                            <strong style={{ color: "#7E6BB5" }}>
                                {avgActivity !== null ? avgActivity : "—"}
                            </strong>/10
                        </Typography>
                    </Stack>
                    <ActivityBarChart data={labeled.map((d) => ({ day: d.day, activity: d.activity }))} />
                </Box>
            </Stack>
        </>
    );
}

// ─── Export ───────────────────────────────────────────────────────────────────

interface WeeklyProgressProps {
    onGetPremium?: () => void;
}

export default function WeeklyProgress({ onGetPremium }: WeeklyProgressProps) {
    const { t } = useTranslation();
    const { isPremium } = usePremiumStore();
    const createdAt = useProfileStore((s) => s.createdAt);
    const [monday, setMonday] = useState<Dayjs>(() => mondayOf(dayjs()));
    const [progress, setProgress] = useState<WeeklyProgressResponse | null>(null);
    const dayLabels = t("dashboard.weeklyProgress.dayAbbr", { returnObjects: true }) as string[];

    const earliestMonday = useMemo(
        () => (createdAt ? mondayOf(dayjs(createdAt)) : null),
        [createdAt],
    );

    const weekStart = toISODate(monday);
    useEffect(() => {
        setProgress(null);
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        dashboardApi.getWeeklyProgress(tz, weekStart)
            .then(setProgress)
            .catch(() => { /* show nothing on error */ });
    }, [isPremium, weekStart]);

    const selector = (
        <WeekSelector
            monday={monday}
            onChange={setMonday}
            earliestMonday={earliestMonday}
            thisWeekLabel={t("dashboard.weeklyProgress.thisWeek")}
        />
    );

    return (
        <Box
            sx={{
                backgroundColor: "#fff", borderRadius: 4,
                boxShadow: "0 4px 24px rgba(142,124,195,0.1)",
                p: { xs: 2.5, sm: 3.5 },
                position: "relative", overflow: "hidden",
            }}
        >
            {!progress ? (
                <Stack alignItems="center" py={4}>
                    <CircularProgress size={28} sx={{ color: "#9B87D8" }} />
                </Stack>
            ) : progress.tier === "premium" ? (
                <PremiumView
                    data={progress.data}
                    avgStress={progress.avgStress}
                    avgActivity={progress.avgActivity}
                    t={t}
                    dayLabels={dayLabels}
                    selector={selector}
                />
            ) : (
                <LockedView
                    data={progress.data}
                    onGetPremium={onGetPremium}
                    title={t("dashboard.weeklyProgress.title")}
                    getPremiumLabel={t("dashboard.weeklyProgress.getPremium")}
                    dayLabels={dayLabels}
                    selector={selector}
                />
            )}
        </Box>
    );
}
