"use client";

import React, { useState } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { signIn, setStubCookie } from "@/lib/auth/stub";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("john.doe@example.com");
  const router = useRouter();
  
  const handleLogin = () => {
    // Use stub auth for testing
    signIn(email);
    setStubCookie();
    
    // Redirect to app after a brief delay to allow cookie to be set
    setTimeout(() => {
      router.push("/app");
    }, 100);
  };
  
  const handleOceanheartLogin = () => {
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
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email for testing"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            Sign in (Test Mode)
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">Or</span>
            </div>
          </div>
          
          <button
            onClick={handleOceanheartLogin}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            Sign in with Oceanheart
          </button>
          
          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}