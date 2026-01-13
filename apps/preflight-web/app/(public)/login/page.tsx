"use client";

import React, { useState } from "react";
import { SkewedBackground } from "@/components/ui/skewed-background";
import { signIn, setStubCookie } from "@/lib/auth/stub";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("john.doe@example.com");
  const [password, setPassword] = useState("");
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
      ? "http://localhost:3002/app"
      : "https://watson.oceanheart.ai/app";
    const authUrl = isDev
      ? "http://passport.lvh.me:8004"
      : "https://passport.oceanheart.ai";
    
    window.location.href = `${authUrl}/auth?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <SkewedBackground />
      
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-md border border-zinc-800 p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-zinc-50 mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-zinc-400">
              Sign in to access your AI preflight dashboard
            </p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                  required
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors text-sm"
                />
              </div>
            </div>
            
            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-xs text-zinc-400">
                <input type="checkbox" className="mr-2 rounded border-zinc-700 bg-zinc-800" />
                Remember me
              </label>
              <a href="#" className="text-xs text-zinc-400 hover:text-zinc-300 transition-colors">
                Forgot password?
              </a>
            </div>
            
            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-all duration-200 text-sm group"
            >
              <span>Sign in (Test Mode)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-zinc-900/50 text-zinc-500">Or continue with</span>
              </div>
            </div>
            
            {/* Oceanheart Login */}
            <button
              type="button"
              onClick={handleOceanheartLogin}
              className="w-full py-2.5 bg-transparent border border-zinc-700 text-zinc-100 font-medium rounded-md hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 text-sm"
            >
              Sign in with Oceanheart
            </button>
            
            {/* Terms */}
            <p className="text-center text-xs text-zinc-500 mt-6">
              By signing in, you agree to our{" "}
              <a href="#" className="underline hover:text-zinc-400">Terms</a>
              {" "}and{" "}
              <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>
            </p>
          </form>
        </div>
        
        {/* Sign Up Link */}
        <p className="text-center text-sm text-zinc-400 mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-zinc-100 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
