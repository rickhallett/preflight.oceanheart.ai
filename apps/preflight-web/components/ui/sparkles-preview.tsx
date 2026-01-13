// @ts-nocheck
"use client";
import Image from "next/image";
import { SparklesCore } from "./sparkles";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SparklesPreview() {
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
    <div className="min-h-[100vh] w-full bg-black flex flex-col items-center justify-center overflow-hidden relative">
      <div className="h-[40rem] w-full flex flex-col items-center justify-center">
        <h1 className="md:text-7xl text-5xl lg:text-9xl font-bold text-center text-white relative z-20">
          Preflight <span className="text-primary-500">AI</span>{" "}
          <span className="text-primary-500 font-normal text-4xl">v1.0</span>
        </h1>
        <div className="w-[40rem] h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
        </div>
      </div>
      </div>
      
      {/* Login button with parallax effect */}
      <div 
        className="absolute bottom-20 z-30 transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
        }}
      >
        <button
          onClick={() => router.push("/login")}
          className="group relative px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
        >
          <span className="relative z-10">Get Started</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
        </button>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 z-20 animate-bounce">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}
