// @ts-nocheck
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { Menu, X, Home, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  link: string;
  icon?: React.ReactNode;
}

export function MainNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: "Home", link: "/", icon: <Home className="w-4 h-4" /> },
    { name: "Dashboard", link: "/app", icon: <Home className="w-4 h-4" /> },
    { name: "Profile", link: "/app/profile", icon: <User className="w-4 h-4" /> },
    { name: "Settings", link: "/app/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const isActive = (link: string) => {
    if (link === "/" && pathname === "/") return true;
    if (link !== "/" && pathname.startsWith(link)) return true;
    return false;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.link}
            href={item.link}
            className={cn(
              "flex items-center space-x-2 text-sm font-medium transition-colors",
              isActive(item.link)
                ? "text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Mobile Sidebar */}
      <Sidebar open={isOpen} setOpen={setIsOpen}>
        <div className="flex flex-col space-y-4 p-6">
          {navItems.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center space-x-3 text-base font-medium transition-colors p-3 rounded-lg",
                isActive(item.link)
                  ? "text-white bg-gray-800"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </Sidebar>
    </>
  );
}