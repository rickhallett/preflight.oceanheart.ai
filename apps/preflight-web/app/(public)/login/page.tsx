"use client";

import React from "react";
import { Button } from "@/components/ui/tailwindcss-buttons";
import { SparklesCore } from "@/components/ui/sparkles";

export default function LoginPage() {
  const handleLogin = () => {
    const isDev = process.env.NODE_ENV === "development";
    const returnTo = isDev 
      ? "http://localhost:3000/app"
      : "https://watson.oceanheart.ai/app";
    
    window.location.href = `https://passport.oceanheart.ai/auth?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="login-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>
      
      <div className="relative z-10 max-w-md w-full space-y-8 p-8 bg-black/50 backdrop-blur-sm rounded-lg border border-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            Sign in to Preflight AI
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Access your AI preflight dashboard
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            Sign in with Oceanheart
          </Button>
          
          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}