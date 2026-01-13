"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getCurrentUser, type StubUser } from "@/lib/auth/stub";

interface AuthContextType {
  isAuthenticated: boolean;
  user: StubUser | null;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  checkAuth: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null as StubUser | null,
  });
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = () => {
    const authenticated = isAuthenticated();
    const user = getCurrentUser();
    setAuthState({ isAuthenticated: authenticated, user });
    
    // Redirect logic
    const protectedRoutes = ["/app", "/app/profile", "/app/settings"];
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (isProtectedRoute && !authenticated) {
      router.push("/login");
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ ...authState, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}