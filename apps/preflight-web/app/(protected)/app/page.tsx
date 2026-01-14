"use client";

import React from "react";
import { CompactCard } from "@/components/ui/compact-card";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSurveyStore } from "@/lib/stores/survey-store";
import { SurveyContainer } from "@/components/survey/SurveyContainer";
import { 
  FileText, 
  Play, 
  Zap, 
  Clock, 
  BarChart3, 
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { isActive, startSurvey } = useSurveyStore();

  // If survey is active, show the survey container instead of dashboard
  if (isActive) {
    return <SurveyContainer />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your AI preflight assessments and track progress
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 auto-rows-auto">
        {/* Survey CTA - Large Card */}
        <div className="col-span-full md:col-span-2 md:row-span-2">
          <div className="h-full bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-4">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <FileText className="w-5 h-5 text-zinc-400" />
                <span className="text-xs text-zinc-500">5 min</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-zinc-100 mb-1">
                  Share Your Feedback
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Help us improve with a quick survey about your experience
                </p>
              </div>
              <button
                onClick={startSurvey}
                className="flex items-center justify-center space-x-2 w-full py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-medium rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Survey</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <CompactCard
          title="Assessments"
          description="12 completed"
          icon={<CheckCircle className="w-4 h-4" />}
        />

        <CompactCard
          title="Score"
          description="78% ready"
          icon={<TrendingUp className="w-4 h-4" />}
        />

        <CompactCard
          title="Actions"
          description="5 pending"
          icon={<AlertCircle className="w-4 h-4" />}
        />

        <CompactCard
          title="Team"
          description="3 members"
          icon={<Users className="w-4 h-4" />}
        />

        {/* Recent Activity - Wide Card */}
        <div className="col-span-full md:col-span-3">
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-100">Recent Activity</h3>
              <Clock className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="space-y-2">
              {[
                { time: "2h ago", action: "Completed infrastructure assessment", status: "success" },
                { time: "5h ago", action: "Started data governance review", status: "progress" },
                { time: "1d ago", action: "Team member joined workspace", status: "info" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.status === "success" ? "bg-green-500" :
                      item.status === "progress" ? "bg-yellow-500" : "bg-zinc-500"
                    }`} />
                    <span className="text-xs text-zinc-300">{item.action}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Preview */}
        <div className="col-span-full md:col-span-1">
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-500">This week</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-end space-x-1 h-16">
                {[40, 65, 45, 80, 55, 70, 45].map((height, i) => (
                  <div key={i} className="flex-1 bg-zinc-700 rounded-t" style={{ height: `${height}%` }} />
                ))}
              </div>
              <p className="text-xs text-zinc-400">Activity trend</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="col-span-full">
          <h3 className="text-sm font-semibold text-zinc-100 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-md hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors group">
              <Zap className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300 mb-1" />
              <span className="text-xs text-zinc-300 block">New Assessment</span>
            </button>
            <button className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-md hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors group">
              <Activity className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300 mb-1" />
              <span className="text-xs text-zinc-300 block">View Reports</span>
            </button>
            <button className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-md hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors group">
              <Users className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300 mb-1" />
              <span className="text-xs text-zinc-300 block">Invite Team</span>
            </button>
            <button className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-md hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors group">
              <FileText className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300 mb-1" />
              <span className="text-xs text-zinc-300 block">Templates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}