import { apiClient } from "./client";

export interface SurveyAnswers {
    stress: string;   // "1"–"10"
    emotion: string;  // Calm|Anxious|Tired|Motivated|Overwhelmed|Neutral
    sleep: string;    // Poor|Okay|Good  (mapped to sleepQuality on submit)
    activity: string; // "1"–"10"
}

export interface SurveyRecommendation {
    tier: "low" | "medium" | "high";
    text: string;
    practiceId: string | null;
}

export interface SubmitSurveyResponse {
    id: string;
    submittedAt: string;
    recommendation: SurveyRecommendation;
}

export const surveyApi = {
    async submitSurvey(answers: SurveyAnswers): Promise<SubmitSurveyResponse> {
        const { data } = await apiClient.post<SubmitSurveyResponse>("/survey/submit", {
            stress: Number(answers.stress),
            emotion: answers.emotion,
            sleepQuality: answers.sleep,
            activity: Number(answers.activity),
        });
        return data;
    },
};
