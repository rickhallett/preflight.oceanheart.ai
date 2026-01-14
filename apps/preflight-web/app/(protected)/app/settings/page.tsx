"use client";

import React, { useState } from "react";
import {
  Bell,
  Shield,
  Palette,
  User,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Lock,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("account");

  // Get user display info from Clerk
  const userName = user?.firstName || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "Not available";
  const userFirstName = user?.firstName || "";
  const userLastName = user?.lastName || "";
  const userInitials = userName.slice(0, 2).toUpperCase();

  const menuItems = [
    { id: "account", label: "Account", icon: User, available: true },
    { id: "notifications", label: "Notifications", icon: Bell, available: false },
    { id: "privacy", label: "Privacy & Security", icon: Shield, available: false },
    { id: "appearance", label: "Appearance", icon: Palette, available: false },
    { id: "billing", label: "Billing", icon: CreditCard, available: false },
    { id: "help", label: "Help & Support", icon: HelpCircle, available: true },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Account Settings</h2>
              <p className="text-sm text-zinc-400">View your account information (managed via Clerk)</p>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 space-y-3 border border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={userName}
                      className="w-12 h-12 rounded-full border border-zinc-700"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-100 text-lg font-bold border border-zinc-700">
                      {userInitials}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100">{userName}</h3>
                    <p className="text-zinc-400 text-sm">{userEmail}</p>
                  </div>
                </div>
                <span className="text-zinc-500 text-xs">Managed by Clerk</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 rounded-md p-3 border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={userFirstName}
                  disabled
                  className="w-full px-2.5 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-md text-sm text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div className="bg-zinc-900/50 rounded-md p-3 border border-zinc-800">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={userLastName}
                  disabled
                  className="w-full px-2.5 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-md text-sm text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div className="bg-zinc-900/50 rounded-md p-3 border border-zinc-800 md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full px-2.5 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-md text-sm text-zinc-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-md p-3">
              <p className="text-xs text-zinc-500">
                Account details are managed through Clerk authentication.
                To update your profile information, please use your identity provider (Google, GitHub, etc.).
              </p>
            </div>
          </div>
        );

      case "notifications":
      case "privacy":
      case "appearance":
      case "billing":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">
                {activeSection === "notifications" && "Notification Preferences"}
                {activeSection === "privacy" && "Privacy & Security"}
                {activeSection === "appearance" && "Appearance"}
                {activeSection === "billing" && "Billing & Subscription"}
              </h2>
              <p className="text-sm text-zinc-400">This feature is not yet available</p>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-6 border border-zinc-800 text-center">
              <Lock className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-zinc-300 mb-1">Coming Soon</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                {activeSection === "notifications" && "Notification preferences will be available in a future update."}
                {activeSection === "privacy" && "Privacy and security settings will be available in a future update."}
                {activeSection === "appearance" && "Theme and appearance customization will be available in a future update."}
                {activeSection === "billing" && "Billing and subscription management will be available in a future update."}
              </p>
            </div>
          </div>
        );

      case "help":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Help & Support</h2>
              <p className="text-sm text-zinc-400">Get help with Preflight</p>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 border border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 mb-3">Contact</h3>
              <div className="space-y-2">
                <a
                  href="mailto:hello@oceanheart.ai"
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-md hover:bg-zinc-800 transition-colors"
                >
                  <div>
                    <p className="text-sm text-zinc-100">Email Support</p>
                    <p className="text-xs text-zinc-400">hello@oceanheart.ai</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                </a>
                <a
                  href="https://www.oceanheart.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-md hover:bg-zinc-800 transition-colors"
                >
                  <div>
                    <p className="text-sm text-zinc-100">Website</p>
                    <p className="text-xs text-zinc-400">www.oceanheart.ai</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                </a>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-md p-3">
              <p className="text-xs text-zinc-500">
                Preflight is a research and demonstration platform by Oceanheart.ai.
                For questions or feedback, please reach out via email.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">Settings</h1>
        <p className="text-sm text-zinc-400">Manage your application preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm flex-1 text-left">{item.label}</span>
                  {!item.available && (
                    <span className="text-[10px] text-zinc-600">Soon</span>
                  )}
                  {item.available && activeSection === item.id && (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
