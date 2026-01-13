"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SkewedBackground } from "@/components/ui/skewed-background";
import { Spotlight } from "@/components/ui/spotlight-new";

export function HeroSection() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.3;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-zinc-950 bg-grid-white/[0.02]">
      <SkewedBackground />

      {/* Spotlight effect - subtle monochrome version */}
      <Spotlight
        gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, rgba(255, 255, 255, 0.04) 0, rgba(255, 255, 255, 0.02) 50%, transparent 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.03) 0, rgba(255, 255, 255, 0.01) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.02) 0, rgba(255, 255, 255, 0.01) 80%, transparent 100%)"
        translateY={-250}
        duration={10}
        xOffset={150}
      />

      {/* Hero Content with Parallax */}
      <div
        className="relative z-10 text-center px-4 transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${-parallaxOffset}px)`,
        }}
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-zinc-50 to-zinc-400 mb-4">
          <span className="text-yellow-400">Preflight</span> <span className="text-zinc-500">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-8">
          Your intelligent preflight assessment platform. Streamline your AI readiness
          journey with conversational coaching and actionable insights.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push("/login")}
          className="group relative px-8 py-3 bg-transparent border border-zinc-700 text-zinc-50 font-medium rounded-md overflow-hidden transition-all duration-300 hover:border-zinc-600"
        >
          <span className="relative z-10">Get Started</span>
          <div className="absolute inset-0 bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 z-20 animate-bounce"
        style={{
          transform: `translateY(${parallaxOffset * 0.5}px)`,
        }}
      >
        <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}