"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogContent, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { surveyApi, SurveyAnswers } from "@/lib/api/surveyApi";
import { useSurveyStore } from "@/store/surveyStore";
import { useProfileStore } from "@/store/profileStore";
import { profileApi } from "@/lib/api/profileApi";

type AppLanguage = "en" | "uk";

const SURVEY_LANGUAGES: { value: AppLanguage; flag: string; label: string }[] = [
    { value: "en", flag: "🇬🇧", label: "EN" },
    { value: "uk", flag: "🇺🇦", label: "UA" },
];

// ─── Step definitions ────────────────────────────────────────────────────────

type StepId = keyof SurveyAnswers;

interface SurveyStep {
    id: StepId;
    questionKey: string;
    // For numeric steps (stress), options is a plain string array.
    // For translated steps, options are the English value-keys.
    options: string[];
    translateOptions: boolean;
}

const STEPS: SurveyStep[] = [
    {
        id: "stress",
        questionKey: "survey.steps.stress.question",
        options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        translateOptions: false,
    },
    {
        id: "emotion",
        questionKey: "survey.steps.emotion.question",
        options: ["Calm", "Anxious", "Tired", "Motivated", "Overwhelmed", "Neutral"],
        translateOptions: true,
    },
    {
        id: "sleep",
        questionKey: "survey.steps.sleep.question",
        options: ["Poor", "Okay", "Good"],
        translateOptions: true,
    },
    {
        id: "activity",
        questionKey: "survey.steps.activity.question",
        options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        translateOptions: true,
    },
];

const TOTAL = STEPS.length;

// ─── Radio option ─────────────────────────────────────────────────────────────

function RadioOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <Box
            onClick={onClick}
            sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", py: 0.4, userSelect: "none" }}
        >
            <Box
                sx={{
                    width: { xs: 22, sm: 26 }, height: { xs: 22, sm: 26 }, borderRadius: "50%", flexShrink: 0,
                    backgroundColor: selected ? "#7E6BB5" : "#F3F0FA",
                    boxShadow: selected ? "0 4px 10px rgba(126,107,181,0.4)" : "0 4px 8px rgba(0,0,0,0.12)",
                    transition: "all 0.15s ease",
                }}
            />
            <Typography
                sx={{
                    color: selected ? "#7E6BB5" : "#8E7CC3",
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    fontWeight: selected ? 600 : 400,
                    transition: "all 0.15s ease",
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ current }: { current: number }) {
    return (
        <Stack direction="row" spacing={1} justifyContent="center">
            {Array.from({ length: TOTAL }).map((_, i) => (
                <Box
                    key={i}
                    sx={{
                        width: 10, height: 10, borderRadius: "50%",
                        backgroundColor: i === current ? "#8E7CC3" : "transparent",
                        border: "2px solid",
                        borderColor: i === current ? "#8E7CC3" : "rgba(142,124,195,0.45)",
                        transition: "all 0.2s ease",
                    }}
                />
            ))}
        </Stack>
    );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface SurveyModalProps {
    open: boolean;
    onClose: () => void;
    onComplete?: (recommendation?: import("@/lib/api/surveyApi").SurveyRecommendation) => void;
}

export default function SurveyModal({ open, onClose, onComplete }: SurveyModalProps) {
    const { t, i18n } = useTranslation();
    const { setAnswers } = useSurveyStore();
    const { language, setProfile } = useProfileStore();

    const activeLanguage: AppLanguage = (language ?? (i18n.language as AppLanguage) ?? "en") as AppLanguage;

    const handleLanguageChange = (lang: AppLanguage) => {
        if (lang === activeLanguage) return;
        setProfile({ language: lang });
        i18n.changeLanguage(lang);
        profileApi.updateProfile({ language: lang }).catch(() => {});
    };

    const [step, setStep] = useState(0);
    const [answers, setLocalAnswers] = useState<Partial<SurveyAnswers>>({});
    const [loading, setLoading] = useState(false);

    // Reset to step 0 with empty answers every time the modal opens
    useEffect(() => {
        if (open) {
            setStep(0);
            setLocalAnswers({});
        }
    }, [open]);

    const isCompletion = step === TOTAL;
    const current = STEPS[step];
    const currentAnswer = current ? answers[current.id] : undefined;
    const canContinue = isCompletion || Boolean(currentAnswer);

    const optionLabel = (stepDef: SurveyStep, value: string): string => {
        if (!stepDef.translateOptions) return value;
        return t(`survey.steps.${stepDef.id}.options.${value}`, value);
    };

    const handleSelect = (value: string) => {
        if (!current) return;
        setLocalAnswers((prev) => ({ ...prev, [current.id]: value }));
    };

    const handleContinue = async () => {
        if (!isCompletion) { setStep((s) => s + 1); return; }
        setLoading(true);
        try {
            const result = await surveyApi.submitSurvey(answers as SurveyAnswers);
            setAnswers(answers);
            onComplete?.(result.recommendation);
            onClose();
        } catch {
            // Store answers locally even if API fails
            setAnswers(answers);
            onComplete?.();
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 0) { onClose(); return; }
        setStep((s) => s - 1);
    };

    const handleClose = () => {
        setStep(0);
        setLocalAnswers({});
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                elevation: 8,
                sx: {
                    borderRadius: 4, backdropFilter: "blur(6px)",
                    backgroundColor: "rgba(242,238,252,0.92)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    m: { xs: 2, sm: 3 }, overflow: "visible",
                },
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundImage: "url('/veliora-bg.png')",
                        backgroundSize: "cover", backgroundPosition: "center",
                        backgroundColor: "transparent",
                    },
                },
            }}
        >
            <DialogContent sx={{ p: { xs: 3, sm: 4, md: 5 }, position: "relative" }}>
                {/* Language switcher */}
                <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                        position: "absolute",
                        top: { xs: 12, sm: 16 },
                        right: { xs: 12, sm: 16 },
                        zIndex: 1,
                    }}
                >
                    {SURVEY_LANGUAGES.map((lang) => {
                        const selected = lang.value === activeLanguage;
                        return (
                            <Box
                                key={lang.value}
                                component="button"
                                type="button"
                                onClick={() => handleLanguageChange(lang.value)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    px: 1.1,
                                    py: 0.4,
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    border: "1px solid",
                                    borderColor: selected ? "#8E7CC3" : "rgba(142,124,195,0.25)",
                                    backgroundColor: selected ? "rgba(142,124,195,0.12)" : "transparent",
                                    transition: "background 0.15s, border-color 0.15s",
                                    outline: "none",
                                    "&:hover": { backgroundColor: "rgba(142,124,195,0.1)" },
                                }}
                            >
                                <Typography sx={{ fontSize: "0.95rem", lineHeight: 1 }}>{lang.flag}</Typography>
                                <Typography
                                    sx={{
                                        color: "#7E6BB5",
                                        fontWeight: selected ? 600 : 500,
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    {lang.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Stack>

                <Stack spacing={{ xs: 2.5, sm: 3 }} alignItems="center">
                    <Box component="img" src="/veliora-logo.svg" alt="Veliora" sx={{ scale: 2, width: { xs: 60, sm: 70 } }} />
                    <Typography sx={{ fontWeight: 600, color: "#7E6BB5", fontSize: { xs: "1.3rem", sm: "1.5rem" } }}>
                        Veliora
                    </Typography>

                    {isCompletion ? (
                        <Typography
                            align="center"
                            sx={{ color: "#8E7CC3", fontSize: { xs: "1rem", sm: "1.1rem" }, fontWeight: 500, py: { xs: 3, sm: 5 } }}
                        >
                            {t("survey.completion")}
                        </Typography>
                    ) : (
                        <Stack spacing={1.5} width="100%">
                            <Typography sx={{ color: "#8E7CC3", fontSize: { xs: "0.95rem", sm: "1rem" }, fontWeight: 500, mb: 0.5 }}>
                                {t(current.questionKey)}
                            </Typography>
                            {current.options.map((option) => (
                                <RadioOption
                                    key={option}
                                    label={optionLabel(current, option)}
                                    selected={currentAnswer === option}
                                    onClick={() => handleSelect(option)}
                                />
                            ))}
                        </Stack>
                    )}

                    <Stack direction="row" justifyContent="space-between" width="100%" mt={1}>
                        <Button
                            onClick={handleBack}
                            sx={{
                                borderRadius: 3, px: { xs: 2.5, sm: 3.5 }, py: 1,
                                backgroundColor: "#F3F0FA", color: "#8E7CC3", textTransform: "none", fontWeight: 500,
                                boxShadow: "0 4px 8px rgba(0,0,0,0.1)", "&:hover": { backgroundColor: "#E8E2F6" },
                            }}
                        >
                            {t("survey.back")}
                        </Button>
                        <Button
                            onClick={handleContinue}
                            disabled={!canContinue || loading}
                            sx={{
                                borderRadius: 3, px: { xs: 2.5, sm: 3.5 }, py: 1,
                                backgroundColor: "#8E7CC3", color: "#fff", textTransform: "none", fontWeight: 600,
                                boxShadow: "0 6px 12px rgba(0,0,0,0.15)", "&:hover": { backgroundColor: "#7B69B1" },
                                "&.Mui-disabled": { backgroundColor: "#C5B8E8", color: "#fff" },
                            }}
                        >
                            {loading ? t("survey.saving") : t("survey.continue")}
                        </Button>
                    </Stack>

                    {!isCompletion && <ProgressDots current={step} />}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
