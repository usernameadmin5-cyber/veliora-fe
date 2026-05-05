"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { usePremiumStore } from "@/store/premiumStore";
import { dashboardApi, type TodayCheckInResponse } from "@/lib/api/dashboardApi";
import { authApi } from "@/lib/api/authApi";
import { profileApi } from "@/lib/api/profileApi";
import i18n from "@/i18n/config";

import GoogleOAuthHandler from "@/components/auth/GoogleOAuthHandler";
import DashboardHeader from "./DashboardHeader";
import DashboardFooter from "./DashboardFooter";
import HeroSection from "./sections/HeroSection";
import TodaysCheckIn from "./sections/TodaysCheckIn";
import WhoWeAre from "./sections/WhoWeAre";
import DailyCalm from "./sections/DailyCalm";
import WeeklyProgress from "./sections/WeeklyProgress";
import AiChatCard from "./sections/AiChatCard";
import SurveyModal from "@/components/survey/SurveyModal";
import GetPremiumModal from "@/components/premium/GetPremiumModal";

export default function Dashboard() {
    const router = useRouter();
    const { user, isAuthenticated, signOut, setGoogleConnected, setHasPassword } = useAuthStore();
    const { setProfile } = useProfileStore();
    const { setSubscription } = usePremiumStore();

    // True when the page was loaded with ?token= (Google OAuth callback).
    // We use a ref so it stays stable even after router.replace() strips the
    // param from the URL — the flag is only cleared once isAuthenticated flips.
    const oauthCallbackRef = useRef(
        typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).has("token"),
    );

    const [surveyOpen, setSurveyOpen] = useState(false);
    const [premiumOpen, setPremiumOpen] = useState(false);
    // null = loading, object = server response
    const [todayCheckIn, setTodayCheckIn] = useState<TodayCheckInResponse | null>(null);


    useEffect(() => {
        if (!isAuthenticated) {
            // If the page was loaded during a Google OAuth callback, do NOT redirect.
            // GoogleOAuthHandler (always rendered when !isAuthenticated) will call
            // setUser(), which re-triggers this effect with isAuthenticated=true.
            // We check the ref rather than window.location.search because
            // useGoogleOAuthToken calls router.replace() to strip ?token= before
            // the refresh() promise resolves — the URL is already clean by the time
            // this effect might run a second time.
            if (oauthCallbackRef.current) return;
            router.replace("/");
            return;
        }
        // OAuth callback complete — clear the flag
        oauthCallbackRef.current = false;

        // Load today's check-in — this is the single source of truth for the
        // survey prompt. We never rely on the localStorage `completed` flag
        // because it doesn't exist on a new device. The server tells us whether
        // the user has already submitted a survey today.
        dashboardApi.getTodayCheckIn()
            .then((checkIn) => {
                setTodayCheckIn(checkIn);
                // Only prompt if the user hasn't checked in today
                if (!checkIn.hasCheckIn) {
                    setSurveyOpen(true);
                }
            })
            .catch(() => setTodayCheckIn({ hasCheckIn: false }));

        // Sync full profile from server
        profileApi.getProfile().then((profile) => {
            setProfile({
                name: profile.name,
                email: profile.email,
                age: profile.age,
                timeZone: profile.timeZone,
                language: profile.language,
                avatarUrl: profile.avatarUrl,
                practices: profile.practicePreferences,
                moodThisWeek: profile.moodThisWeek,
                stressAvg: profile.stressAvg,
                isPremium: profile.isPremium,
                createdAt: profile.createdAt,
            });
            setSubscription({
                isPremium: profile.isPremium,
                plan: null,
                status: profile.isPremium ? "active" : null,
                currentPeriodEnd: null,
            });
            if (profile.language && profile.language !== i18n.language) {
                i18n.changeLanguage(profile.language);
            }
            setGoogleConnected(!!profile.googleConnected);
            setHasPassword(!!profile.hasPassword);
        }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const handleSurveyComplete = () => {
        dashboardApi.getTodayCheckIn()
            .then(setTodayCheckIn)
            .catch(() => {});
        setSurveyOpen(false);
    };

    const handleTakeSurvey = () => {
        setSurveyOpen(true);
    };

    const handleSignOut = async () => {
        try { await authApi.signOut(); } catch { /* ignore */ }
        signOut();
        router.push("/");
    };

    // While the OAuth callback is being processed, render only the handler so it
    // can extract the ?token= param and call setUser(). Once isAuthenticated
    // becomes true the component re-renders and shows the full dashboard.
    if (!isAuthenticated) {
        return <GoogleOAuthHandler />;
    }

    const hasCheckInToday = todayCheckIn?.hasCheckIn === true;
    const stressLevel = todayCheckIn?.stressLevel ?? 5;
    const mood = todayCheckIn?.mood ?? "Neutral";

    return (
        <>
            <Box
                sx={{
                    minHeight: "100vh",
                    background: "linear-gradient(180deg, #EDE8F9 0%, #F5F2FC 100%)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <GoogleOAuthHandler />
                <DashboardHeader onSignOut={handleSignOut} onGetPremium={() => setPremiumOpen(true)} />

                <Box component="main" sx={{ flex: 1 }}>
                    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 } }}>
                        <Stack spacing={{ xs: 3, sm: 4 }}>
                            <HeroSection
                                userName={user?.name ?? ""}
                                stressLevel={hasCheckInToday ? stressLevel : 0}
                            />
                            <TodaysCheckIn
                                mood={mood}
                                stressLevel={stressLevel}
                                hasCheckIn={hasCheckInToday}
                                onTakeSurvey={handleTakeSurvey}
                            />
                            <WhoWeAre />
                            <DailyCalm hasCheckIn={hasCheckInToday} />
                            <WeeklyProgress onGetPremium={() => setPremiumOpen(true)} />
                            <AiChatCard />
                        </Stack>
                    </Container>
                </Box>

                <DashboardFooter />
            </Box>

            <SurveyModal
                open={surveyOpen}
                onClose={() => setSurveyOpen(false)}
                onComplete={handleSurveyComplete}
            />
            <GetPremiumModal
                open={premiumOpen}
                onClose={() => setPremiumOpen(false)}
            />
        </>
    );
}
