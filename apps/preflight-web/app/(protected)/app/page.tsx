"use client";

import React from "react";
import { CardHoverEffect } from "@/components/ui/card-hover-effect";
import { GlowingStars } from "@/components/ui/glowing-stars";

export default function DashboardPage() {
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

  return (
    <div className="relative min-h-[60vh]">
      <div className="absolute inset-0">
        <GlowingStars />
      </div>
      
      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to your Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your AI preflight checks and workflows
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardHoverEffect items={features} />
        </div>
        
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