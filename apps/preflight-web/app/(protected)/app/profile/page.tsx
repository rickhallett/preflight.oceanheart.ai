"use client";

import React from "react";
import { LogOut, User, Mail, Calendar, Shield, Edit2 } from "lucide-react";
import { signOut, clearStubCookie } from "@/lib/auth/stub";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isStubAuth } = useAuth();

  const handleSignOut = () => {
    // Clear auth
    signOut();
    clearStubCookie();

    // Clear real token cookie too
    document.cookie = 'oh_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

    // Redirect to login
    router.push("/login");
  };

  // Get user display info
  const userEmail = user?.email || "Not available";
  const userName = user?.email?.split("@")[0] || "User";
  const userInitials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">Profile</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your account information</p>
      </div>

      {/* Profile Card - Compact */}
      <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-4">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-14 h-14 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-100 font-bold text-lg border border-zinc-700">
            {userInitials}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-base font-semibold text-zinc-100">{userName}</h2>
            <p className="text-sm text-zinc-400">{userEmail}</p>
          </div>

          {/* Edit Button */}
          <button className="p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Account Details - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Account Type */}
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-3">
          <div className="flex items-start space-x-3">
            <User className="w-4 h-4 text-zinc-500 mt-0.5" />
            <div>
              <p className="text-xs text-zinc-400">Account Type</p>
              <p className="text-sm font-medium text-zinc-100">
                {isStubAuth ? "Development" : "Standard"}
              </p>
            </div>
          </div>
        </div>

        {/* Auth Provider */}
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-3">
          <div className="flex items-start space-x-3">
            <Calendar className="w-4 h-4 text-zinc-500 mt-0.5" />
            <div>
              <p className="text-xs text-zinc-400">Auth Provider</p>
              <p className="text-sm font-medium text-zinc-100">
                {isStubAuth ? "Local (Dev)" : "Oceanheart Passport"}
              </p>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-3">
          <div className="flex items-start space-x-3">
            <Mail className="w-4 h-4 text-zinc-500 mt-0.5" />
            <div>
              <p className="text-xs text-zinc-400">Email Address</p>
              <p className="text-sm font-medium text-zinc-100">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-3">
          <div className="flex items-start space-x-3">
            <Shield className="w-4 h-4 text-zinc-500 mt-0.5" />
            <div>
              <p className="text-xs text-zinc-400">Account Status</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm font-medium text-zinc-100">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-100">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 text-zinc-100 text-sm font-medium rounded-md hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors">
            Edit Profile
          </button>

          <button className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 text-zinc-100 text-sm font-medium rounded-md hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors">
            Change Password
          </button>

          <button className="px-3 py-2 bg-zinc-900/50 border border-zinc-800 text-zinc-100 text-sm font-medium rounded-md hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors">
            Download Data
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="border border-zinc-800 rounded-md p-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Sign Out</h3>
            <p className="text-xs text-zinc-400 mt-0.5">End your current session</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-medium rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
