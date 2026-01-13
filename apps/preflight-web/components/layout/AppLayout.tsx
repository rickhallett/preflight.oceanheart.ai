// @ts-nocheck
"use client";

import React from "react";

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
      {/* Fixed header navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <a href="/" className="text-xl font-bold text-white">
                Preflight AI
              </a>
              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <a
                    key={item.link}
                    href={item.link}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 pt-20 pb-8 md:pt-24">
        <div className="relative rounded-lg overflow-hidden bg-gray-900/20 backdrop-blur-sm border border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
          <div className="relative z-10 p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-6 text-center">
        <p className="text-sm text-gray-400">
          © 2024 Preflight AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}