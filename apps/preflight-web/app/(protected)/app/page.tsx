"use client";

import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSurveyStore } from "@/lib/stores/survey-store";
import { SurveyContainer } from "@/components/survey/SurveyContainer";
import {
  FileText,
  Play,
  MessageCircle,
  Info
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { isActive, startSurvey } = useSurveyStore();

  // If survey is active, show the survey container instead of dashboard
  if (isActive) {
    return <SurveyContainer />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-50">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          AI Readiness Assessment for Clinical & Well-being Professionals
        </p>
      </div>

      {/* Main CTA - AI Readiness Survey */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-zinc-800 rounded-md">
            <FileText className="w-6 h-6 text-zinc-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">
              AI Readiness Questionnaire
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Complete a brief 10-15 question survey to assess your AI familiarity
              and confidence. Takes about 5-10 minutes.
            </p>
            <button
              onClick={startSurvey}
              className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-medium rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Start Survey</span>
            </button>
          </div>
        </div>
      </div>

      {/* LLM Coaching - Coming Soon */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-6 opacity-60">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-zinc-800 rounded-md">
            <MessageCircle className="w-6 h-6 text-zinc-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-lg font-semibold text-zinc-300">
                AI Coaching Session
              </h2>
              <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">Coming Soon</span>
            </div>
            <p className="text-sm text-zinc-500">
              After completing the survey, engage in a brief collaborative dialogue
              with an AI coach to explore your responses and next steps.
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start space-x-3 p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-md">
        <Info className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-zinc-500">
          This is a research and demonstration platform by Oceanheart.ai.
          Your responses help inform our understanding of AI readiness in clinical
          and well-being contexts. Participation is anonymous by default.
        </p>
      </div>
    </div>
  );
}