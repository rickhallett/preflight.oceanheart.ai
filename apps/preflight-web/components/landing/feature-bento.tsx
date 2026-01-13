"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
} as const;

const headingVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
} as const;

export function FeatureBento() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headingVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-4">
            Everything You Need
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Powerful features designed to accelerate your AI transformation journey.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const isHovered = hoveredId === feature.id;

            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className={`${feature.className} relative bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-5 cursor-pointer group overflow-hidden`}
                onMouseEnter={() => setHoveredId(feature.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Animated gradient border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-md bg-gradient-to-br from-zinc-700/50 via-transparent to-zinc-700/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 0.15 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Glow effect */}
                <motion.div
                  className="absolute -inset-px rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06), transparent 40%)",
                  }}
                />

                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <motion.div
                      animate={{
                        scale: isHovered ? 1.1 : 1,
                        rotate: isHovered ? 5 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {React.createElement(Icon, {
                        className: "w-5 h-5 text-zinc-400 group-hover:text-zinc-200 transition-colors duration-300"
                      })}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isHovered ? 1 : 0,
                        x: isHovered ? 0 : -10
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-4 h-4 text-zinc-500" />
                    </motion.div>
                  </div>

                  <h3 className="text-base font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
