"use client";

import { useEffect, useState } from "react";

export function SkewedBackground() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -inset-[100%] opacity-5">
        <div 
          className="absolute top-20 left-10 w-96 h-96 bg-zinc-700 transform skew-y-12 rotate-12 transition-transform duration-1000"
          style={{
            transform: `translateY(${scrollY * 0.3}px) skewY(12deg) rotate(12deg)`
          }}
        />
        <div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-zinc-800 transform -skew-y-12 -rotate-12 transition-transform duration-1000"
          style={{
            transform: `translateY(${scrollY * 0.5}px) skewY(-12deg) rotate(-12deg)`
          }}
        />
        <div 
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-zinc-600 transform skew-x-12 rotate-6 transition-transform duration-1000"
          style={{
            transform: `translateY(${scrollY * 0.7}px) skewX(12deg) rotate(6deg)`
          }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-80 h-80 bg-zinc-700 transform -skew-x-6 -rotate-3 transition-transform duration-1000"
          style={{
            transform: `translateY(${scrollY * 0.4}px) skewX(-6deg) rotate(-3deg)`
          }}
        />
      </div>
    </div>
  );
}