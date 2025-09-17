"use client";

import React, { useState } from "react";
import { 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  User, 
  Lock, 
  Smartphone,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Check,
  X
} from "lucide-react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
    product: false,
    security: true
  });

  const menuItems = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Account Settings</h2>
              <p className="text-sm text-zinc-400">Manage your account information and preferences</p>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 space-y-3 border border-zinc-800 hover:bg-zinc-800/50 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-100 text-lg font-bold border border-zinc-700">
                    JD
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100">John Doe</h3>
                    <p className="text-zinc-400 text-sm">john.doe@example.com</p>
                  </div>
                </div>
                <button className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors duration-150">
                  Change Photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 rounded-md p-3 border border-zinc-800 hover:bg-zinc-800/50 transition-all duration-200">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="John"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-all duration-150 hover:border-zinc-600"
                />
              </div>

              <div className="bg-zinc-900/50 rounded-md p-3 border border-zinc-800 hover:bg-zinc-800/50 transition-all duration-200">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue="Doe"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-all duration-150 hover:border-zinc-600"
                />
              </div>

              <div className="bg-zinc-900/50 rounded-md p-3 border border-zinc-800 hover:bg-zinc-800/50 transition-all duration-200">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-all duration-150 hover:border-zinc-600"
                />
              </div>

              <div className="bg-zinc-900/50 rounded-md p-3 border border-zinc-800 hover:bg-zinc-800/50 transition-all duration-200">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150 hover:border-zinc-600"
                />
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-md p-3">
              <h3 className="text-red-500 font-semibold text-sm mb-1.5">Danger Zone</h3>
              <p className="text-zinc-400 text-xs mb-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-red-500 px-3 py-1.5 rounded-md text-sm transition-colors duration-150">
                Delete Account
              </button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Notification Preferences</h2>
              <p className="text-sm text-zinc-400">Choose how you want to be notified</p>
            </div>

            <div className="space-y-3">
              <div className="bg-zinc-900/50 rounded-md p-4 border border-zinc-800 hover:bg-zinc-800/50 transition-all duration-200">
                <h3 className="text-base font-semibold text-zinc-100 mb-3">Email Notifications</h3>
                <div className="space-y-3">
                  {Object.entries({
                    email: "All email notifications",
                    weekly: "Weekly digest",
                    product: "Product updates",
                    security: "Security alerts"
                  }).map(([key, label], index) => (
                    <div key={key} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-zinc-300">{label}</span>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-150 ${
                          notifications[key] ? 'bg-zinc-600' : 'bg-zinc-800'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-zinc-100 transition-all duration-150 ${
                            notifications[key] ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-md p-4 border border-zinc-800 hover:bg-zinc-800/50 transition-all duration-200">
                <h3 className="text-base font-semibold text-zinc-100 mb-3">Push Notifications</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-300">Browser notifications</p>
                    <p className="text-xs text-zinc-500">Get notifications in your browser</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-150 ${
                      notifications.push ? 'bg-zinc-600' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-zinc-100 transition-all duration-150 ${
                        notifications.push ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 mb-1">Privacy & Security</h2>
              <p className="text-sm text-zinc-400">Manage your security settings and privacy preferences</p>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 border border-zinc-800 hover:bg-zinc-800/50 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">Two-Factor Authentication</h3>
                  <p className="text-xs text-zinc-400">Add an extra layer of security</p>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-500 text-xs">Enabled</span>
                </div>
              </div>
              <button className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 px-3 py-1.5 rounded-md text-sm transition-colors duration-150">
                Manage 2FA
              </button>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 border border-zinc-800 hover:bg-zinc-800/50 transition-all duration-200">
              <h3 className="text-base font-semibold text-zinc-100 mb-3">Active Sessions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <div className="flex items-center space-x-2.5">
                    <Smartphone className="w-4 h-4 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-100">MacBook Pro</p>
                      <p className="text-xs text-zinc-400">San Francisco, CA • Now</p>
                    </div>
                  </div>
                  <span className="text-green-500 text-xs">Current</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2.5">
                    <Smartphone className="w-4 h-4 text-zinc-500" />
                    <div>
                      <p className="text-sm text-zinc-100">iPhone 14 Pro</p>
                      <p className="text-xs text-zinc-400">San Francisco, CA • 2 hours ago</p>
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-400 text-xs transition-colors duration-150">
                    Revoke
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 opacity-0 animate-[fadeInUp_400ms_ease-out_400ms_forwards] hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 mb-3">Change Password</h3>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current password"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150 hover:border-zinc-600 opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]"
                />
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150 hover:border-zinc-600 opacity-0 animate-[fadeInUp_300ms_ease-out_600ms_forwards]"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150 hover:border-zinc-600 opacity-0 animate-[fadeInUp_300ms_ease-out_700ms_forwards]"
                />
                <button className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1.5 rounded-md text-sm transition-colors duration-150 opacity-0 animate-[fadeInUp_300ms_ease-out_800ms_forwards]">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div className="opacity-0 animate-[fadeInUp_400ms_ease-out_100ms_forwards]">
              <h2 className="text-xl font-bold text-zinc-100 mb-1.5">Appearance</h2>
              <p className="text-sm text-zinc-400">Customize how Preflight AI looks for you</p>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 opacity-0 animate-[fadeInUp_400ms_ease-out_200ms_forwards] hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-3">
                <button className="relative p-3 bg-zinc-800 border-2 border-zinc-600 rounded-md transition-all duration-150 hover:shadow-md opacity-0 animate-[fadeInUp_300ms_ease-out_300ms_forwards]">
                  <div className="absolute top-1 right-1">
                    <Check className="w-3 h-3 text-zinc-400" />
                  </div>
                  <div className="text-sm font-medium text-zinc-100">Dark</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Default</div>
                </button>
                <button className="p-3 bg-zinc-900 border border-zinc-700 rounded-md hover:border-zinc-600 transition-all duration-150 opacity-0 animate-[fadeInUp_300ms_ease-out_400ms_forwards]">
                  <div className="text-sm font-medium text-zinc-100">Light</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Coming soon</div>
                </button>
                <button className="p-3 bg-zinc-900 border border-zinc-700 rounded-md hover:border-zinc-600 transition-all duration-150 opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]">
                  <div className="text-sm font-medium text-zinc-100">System</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Auto</div>
                </button>
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 opacity-0 animate-[fadeInUp_400ms_ease-out_300ms_forwards] hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 mb-3">Accent Color</h3>
              <div className="flex space-x-3">
                <button className="w-10 h-10 bg-zinc-600 rounded-full border-2 border-zinc-100 transition-all duration-150 opacity-0 animate-[fadeInUp_300ms_ease-out_400ms_forwards]"></button>
                <button className="w-10 h-10 bg-zinc-700 rounded-full hover:border-2 hover:border-zinc-100 transition-all duration-150 opacity-0 animate-[fadeInUp_300ms_ease-out_450ms_forwards]"></button>
                <button className="w-10 h-10 bg-zinc-500 rounded-full hover:border-2 hover:border-zinc-100 transition-all duration-150 opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]"></button>
                <button className="w-10 h-10 bg-zinc-800 rounded-full hover:border-2 hover:border-zinc-100 transition-all duration-150 opacity-0 animate-[fadeInUp_300ms_ease-out_550ms_forwards]"></button>
                <button className="w-10 h-10 bg-zinc-400 rounded-full hover:border-2 hover:border-zinc-100 transition-all duration-150 opacity-0 animate-[fadeInUp_300ms_ease-out_600ms_forwards]"></button>
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 opacity-0 animate-[fadeInUp_400ms_ease-out_400ms_forwards] hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 mb-3">Display</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]">
                  <div>
                    <p className="text-sm text-zinc-300">Compact mode</p>
                    <p className="text-xs text-zinc-500">Reduce spacing and padding</p>
                  </div>
                  <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-zinc-700 transition-all duration-150">
                    <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-zinc-100 translate-x-1 transition-all duration-150" />
                  </button>
                </div>
                <div className="flex items-center justify-between opacity-0 animate-[fadeInUp_300ms_ease-out_600ms_forwards]">
                  <div>
                    <p className="text-sm text-zinc-300">Animations</p>
                    <p className="text-xs text-zinc-500">Enable interface animations</p>
                  </div>
                  <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-zinc-600 transition-all duration-150">
                    <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-zinc-100 translate-x-5 transition-all duration-150" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            <div className="opacity-0 animate-[fadeInUp_400ms_ease-out_100ms_forwards]">
              <h2 className="text-xl font-bold text-zinc-100 mb-1.5">Billing & Subscription</h2>
              <p className="text-sm text-zinc-400">Manage your subscription and payment methods</p>
            </div>

            <div className="bg-zinc-800 rounded-md p-4 border border-zinc-700 hover:shadow-md transition-all duration-200 opacity-0 animate-[fadeInUp_400ms_ease-out_200ms_forwards]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Premium Plan</h3>
                  <p className="text-sm text-zinc-400">$19/month</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">Next billing date</p>
                  <p className="text-sm font-semibold text-zinc-100">Feb 15, 2024</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 opacity-0 animate-[fadeInUp_400ms_ease-out_300ms_forwards] hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 mb-3">Payment Method</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="w-6 h-6 text-zinc-500" />
                  <div>
                    <p className="text-sm text-zinc-100">•••• •••• •••• 4242</p>
                    <p className="text-xs text-zinc-400">Expires 12/24</p>
                  </div>
                </div>
                <button className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors duration-150">
                  Update
                </button>
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 opacity-0 animate-[fadeInUp_400ms_ease-out_400ms_forwards] hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 mb-3">Billing History</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1.5 opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]">
                  <div>
                    <p className="text-sm text-zinc-100">January 2024</p>
                    <p className="text-xs text-zinc-400">Premium Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-100">$19.00</p>
                    <p className="text-xs text-green-500">Paid</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5 opacity-0 animate-[fadeInUp_300ms_ease-out_600ms_forwards]">
                  <div>
                    <p className="text-sm text-zinc-100">December 2023</p>
                    <p className="text-xs text-zinc-400">Premium Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-100">$19.00</p>
                    <p className="text-xs text-green-500">Paid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "help":
        return (
          <div className="space-y-6">
            <div className="opacity-0 animate-[fadeInUp_400ms_ease-out_100ms_forwards]">
              <h2 className="text-xl font-bold text-zinc-100 mb-1.5">Help & Support</h2>
              <p className="text-sm text-zinc-400">Get help with Preflight AI</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button className="bg-zinc-900/50 rounded-md p-4 text-left hover:bg-zinc-800/50 transition-all duration-200 group opacity-0 animate-[fadeInUp_400ms_ease-out_200ms_forwards] border border-zinc-800">
                <HelpCircle className="w-6 h-6 text-zinc-500 mb-2" />
                <h3 className="text-base font-semibold text-zinc-100 mb-1">Documentation</h3>
                <p className="text-xs text-zinc-400">Browse our comprehensive guides</p>
              </button>

              <button className="bg-zinc-900/50 rounded-md p-4 text-left hover:bg-zinc-800/50 transition-all duration-200 group opacity-0 animate-[fadeInUp_400ms_ease-out_300ms_forwards] border border-zinc-800">
                <Globe className="w-6 h-6 text-zinc-500 mb-2" />
                <h3 className="text-base font-semibold text-zinc-100 mb-1">Community</h3>
                <p className="text-xs text-zinc-400">Connect with other users</p>
              </button>
            </div>

            <div className="bg-zinc-900/50 rounded-md p-4 opacity-0 animate-[fadeInUp_400ms_ease-out_400ms_forwards] hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 mb-3">Contact Support</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150 hover:border-zinc-600 opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]"
                />
                <textarea
                  placeholder="Describe your issue..."
                  rows={4}
                  className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150 hover:border-zinc-600 opacity-0 animate-[fadeInUp_300ms_ease-out_600ms_forwards]"
                />
                <button className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1.5 rounded-md text-sm transition-colors duration-150 opacity-0 animate-[fadeInUp_300ms_ease-out_700ms_forwards]">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-100 mb-1">Settings</h1>
        <p className="text-sm text-zinc-400">Manage your application preferences</p>
      </div>
      
      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-56 flex-shrink-0">
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
                  <span className="text-sm">{item.label}</span>
                  <ChevronRight className={`w-3 h-3 ml-auto transition-all duration-150 ${
                    activeSection === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                  }`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-[600px]">
          <div className="opacity-0 translate-x-4 animate-[fadeInRight_400ms_ease-out_150ms_forwards]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}