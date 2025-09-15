// @ts-nocheck
"use client";

import React from "react";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { AuroraBackground } from "@/components/ui/aurora-background";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Dashboard", link: "/app" },
    { name: "Profile", link: "/app/profile" },
    { name: "Settings", link: "/app/settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <FloatingNavbar navItems={navItems} />
      
      <main className="flex-1 container mx-auto px-4 py-20 md:py-24">
        <AuroraBackground className="rounded-lg">
          <div className="relative z-10 p-6 md:p-8">
            {children}
          </div>
        </AuroraBackground>
      </main>
      
      <footer className="border-t border-gray-800 py-6 text-center">
        <p className="text-sm text-gray-400">
          © 2024 Preflight AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}