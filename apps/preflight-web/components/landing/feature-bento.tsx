"use client";

import { useState } from "react";
import { 
  FileText, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  Settings,
  ArrowRight
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  className: string;
}

const features: Feature[] = [
  {
    id: "assessment",
    title: "AI Readiness Assessment",
    description: "Comprehensive evaluation of your organization's AI maturity level with actionable insights.",
    icon: FileText,
    className: "col-span-2 row-span-2"
  },
  {
    id: "coaching",
    title: "Conversational Coaching",
    description: "Get personalized guidance through AI-powered conversations.",
    icon: Zap,
    className: "col-span-1 row-span-1"
  },
  {
    id: "security",
    title: "Security First",
    description: "Enterprise-grade security with SOC2 compliance.",
    icon: Shield,
    className: "col-span-1 row-span-1"
  },
  {
    id: "collaboration",
    title: "Team Collaboration",
    description: "Work together on assessments and share insights across your organization.",
    icon: Users,
    className: "col-span-1 row-span-2"
  },
  {
    id: "analytics",
    title: "Advanced Analytics",
    description: "Track progress and identify improvement areas with detailed analytics.",
    icon: BarChart3,
    className: "col-span-1 row-span-1"
  },
  {
    id: "customization",
    title: "Fully Customizable",
    description: "Tailor assessments to your industry and specific needs.",
    icon: Settings,
    className: "col-span-1 row-span-1"
  }
];

export function FeatureBento() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-4">
            Everything You Need
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Powerful features designed to accelerate your AI transformation journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isHovered = hoveredId === feature.id;
            
            return (
              <div
                key={feature.id}
                className={`${feature.className} relative bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-5 cursor-pointer transition-all duration-200 hover:bg-zinc-800/50 hover:border-zinc-700 group`}
                onMouseEnter={() => setHoveredId(feature.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Gradient border on hover */}
                <div className={`absolute inset-0 rounded-md bg-gradient-to-br from-zinc-700 to-zinc-800 opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
                    {isHovered && (
                      <ArrowRight className="w-4 h-4 text-zinc-500 animate-in slide-in-from-left-1 duration-200" />
                    )}
                  </div>
                  
                  <h3 className="text-base font-semibold text-zinc-100 mb-2">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}