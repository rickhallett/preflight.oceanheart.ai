"use client";

import React from "react";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { Illustration } from "@/components/ui/glowing-stars";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSurveyStore } from "@/lib/stores/survey-store";
import { SurveyContainer } from "@/components/survey/SurveyContainer";
import { FileText, Play } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { isActive, startSurvey } = useSurveyStore();
  const features = [
    {
      title: "Quick Actions",
      description: "Access your most used features and workflows",
      link: "#",
    },
    {
      title: "Recent Activity",
      description: "View your latest preflight checks and results",
      link: "#",
    },
    {
      title: "Analytics",
      description: "Track your usage patterns and insights",
      link: "#",
    },
    {
      title: "Team Collaboration",
      description: "Work together on shared preflight checklists",
      link: "#",
    },
  ];

  // If survey is active, show the survey container instead of dashboard
  if (isActive) {
    return <SurveyContainer />;
  }

  return (
    <div className="relative min-h-[60vh]">
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <Illustration mouseEnter={true} />
      </div>
      
      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-gray-400">
            Manage your AI preflight checks and workflows
          </p>
        </div>

        {/* Survey CTA Banner */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Share Your Feedback</h3>
                <p className="text-gray-300 text-sm">
                  Help us improve by completing our 5-minute user survey
                </p>
              </div>
            </div>
            <button
              onClick={startSurvey}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Start Survey</span>
            </button>
          </div>
        </div>
        
        <HoverEffect items={features} className="grid-cols-1 md:grid-cols-2" />
        
        <div className="mt-12 p-6 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Getting Started
          </h2>
          <ul className="space-y-2 text-gray-400">
            <li>• Create your first preflight checklist</li>
            <li>• Configure AI assistance settings</li>
            <li>• Invite team members to collaborate</li>
            <li>• Explore templates and best practices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}