"use client";

import React, { createContext, useContext } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

// User type that matches what components expect
export interface AuthUser {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  // Map Clerk user to our app's user type
  const user: AuthUser | null = clerkUser
    ? {
        userId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      }
    : null;

  const signOut = async () => {
    await clerkSignOut({ redirectUrl: "/login" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: !isLoaded,
        isAuthenticated: !!isSignedIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
