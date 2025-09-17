"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("");
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveItem(href);
      }
    }
  };
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-zinc-50">
              Preflight<span className="text-zinc-400">AI</span>
            </Link>
          </div>
          
          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="relative py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors group"
              >
                <span>{item.label}</span>
                <span 
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-zinc-400 transition-transform duration-300 origin-left ${
                    activeItem === item.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </a>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 text-sm font-medium text-zinc-100 border border-zinc-700 rounded-md hover:bg-zinc-800 hover:border-zinc-600 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}