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
          <div className="space-y-6">
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
              <p className="text-gray-400">Manage your account information and preferences</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 space-y-4 hover:bg-gray-800/60 transition-all duration-200 ease-out opacity-0 animate-[fadeInUp_500ms_ease-out_200ms_forwards]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-transform duration-200 ease-out">
                    JD
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">John Doe</h3>
                    <p className="text-gray-400 text-sm">john.doe@example.com</p>
                  </div>
                </div>
                <button className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors duration-150 ease-out">
                  Change Photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 animate-[fadeInUp_600ms_ease-out_300ms_forwards]">
              <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/60 transition-all duration-200 ease-out">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  defaultValue="John"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-all duration-150 ease-out hover:border-gray-600"
                />
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/60 transition-all duration-200 ease-out">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  defaultValue="Doe"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-all duration-150 ease-out hover:border-gray-600"
                />
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/60 transition-all duration-200 ease-out">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="john.doe@example.com"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-all duration-150 ease-out hover:border-gray-600"
                />
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/60 transition-all duration-200 ease-out">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-all duration-150 ease-out hover:border-gray-600"
                />
              </div>
            </div>

            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
              <h3 className="text-red-400 font-semibold mb-2">Danger Zone</h3>
              <p className="text-gray-400 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-150 ease-out">
                Delete Account
              </button>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="opacity-0 animate-[fadeInUp_400ms_ease-out_100ms_forwards]">
              <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
              <p className="text-gray-400">Choose how you want to be notified</p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_200ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
                <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
                <div className="space-y-3">
                  {Object.entries({
                    email: "All email notifications",
                    weekly: "Weekly digest",
                    product: "Product updates",
                    security: "Security alerts"
                  }).map(([key, label], index) => (
                    <div key={key} className={`flex items-center justify-between py-2 opacity-0 animate-[fadeInUp_300ms_ease-out_${300 + (index * 100)}ms_forwards]`}>
                      <span className="text-gray-300">{label}</span>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-out ${
                          notifications[key] ? 'bg-indigo-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-150 ease-out ${
                            notifications[key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_400ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
                <h3 className="text-lg font-semibold text-white mb-4">Push Notifications</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300">Browser notifications</p>
                    <p className="text-sm text-gray-500">Get notifications in your browser</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-150 ease-out ${
                      notifications.push ? 'bg-indigo-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-150 ease-out ${
                        notifications.push ? 'translate-x-6' : 'translate-x-1'
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
          <div className="space-y-6">
            <div className="opacity-0 animate-[fadeInUp_400ms_ease-out_100ms_forwards]">
              <h2 className="text-2xl font-bold text-white mb-2">Privacy & Security</h2>
              <p className="text-gray-400">Manage your security settings and privacy preferences</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_200ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-400">Add an extra layer of security</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">Enabled</span>
                </div>
              </div>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-150 ease-out">
                Manage 2FA
              </button>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_300ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
              <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-700 opacity-0 animate-[fadeInUp_300ms_ease-out_400ms_forwards]">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white">MacBook Pro</p>
                      <p className="text-sm text-gray-400">San Francisco, CA • Now</p>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm">Current</span>
                </div>
                <div className="flex items-center justify-between py-3 opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white">iPhone 14 Pro</p>
                      <p className="text-sm text-gray-400">San Francisco, CA • 2 hours ago</p>
                    </div>
                  </div>
                  <button className="text-red-400 hover:text-red-300 text-sm transition-colors duration-150 ease-out">
                    Revoke
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_400ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
              <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Current password"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-all duration-150 ease-out hover:border-gray-600 opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]"
                />
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-all duration-150 ease-out hover:border-gray-600 opacity-0 animate-[fadeInUp_300ms_ease-out_600ms_forwards]"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-all duration-150 ease-out hover:border-gray-600 opacity-0 animate-[fadeInUp_300ms_ease-out_700ms_forwards]"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-150 ease-out opacity-0 animate-[fadeInUp_300ms_ease-out_800ms_forwards]">
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
              <h2 className="text-2xl font-bold text-white mb-2">Appearance</h2>
              <p className="text-gray-400">Customize how Preflight AI looks for you</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_200ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
              <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                <button className="relative p-4 bg-gray-900 border-2 border-indigo-600 rounded-lg transition-all duration-150 ease-out hover:shadow-md opacity-0 animate-[fadeInUp_300ms_ease-out_300ms_forwards]">
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-white font-medium">Dark</div>
                  <div className="text-xs text-gray-400 mt-1">Default</div>
                </button>
                <button className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all duration-150 ease-out opacity-0 animate-[fadeInUp_300ms_ease-out_400ms_forwards]">
                  <div className="text-white font-medium">Light</div>
                  <div className="text-xs text-gray-400 mt-1">Coming soon</div>
                </button>
                <button className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all duration-150 ease-out opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]">
                  <div className="text-white font-medium">System</div>
                  <div className="text-xs text-gray-400 mt-1">Auto</div>
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_300ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
              <h3 className="text-lg font-semibold text-white mb-4">Accent Color</h3>
              <div className="flex space-x-4">
                <button className="w-12 h-12 bg-indigo-600 rounded-full border-2 border-white transition-all duration-150 ease-out opacity-0 animate-[fadeInUp_300ms_ease-out_400ms_forwards]"></button>
                <button className="w-12 h-12 bg-purple-600 rounded-full hover:border-2 hover:border-white transition-all duration-150 ease-out opacity-0 animate-[fadeInUp_300ms_ease-out_450ms_forwards]"></button>
                <button className="w-12 h-12 bg-green-600 rounded-full hover:border-2 hover:border-white transition-all duration-150 ease-out opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]"></button>
                <button className="w-12 h-12 bg-orange-600 rounded-full hover:border-2 hover:border-white transition-all duration-150 ease-out opacity-0 animate-[fadeInUp_300ms_ease-out_550ms_forwards]"></button>
                <button className="w-12 h-12 bg-pink-600 rounded-full hover:border-2 hover:border-white transition-all duration-150 ease-out opacity-0 animate-[fadeInUp_300ms_ease-out_600ms_forwards]"></button>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_400ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
              <h3 className="text-lg font-semibold text-white mb-4">Display</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]">
                  <div>
                    <p className="text-gray-300">Compact mode</p>
                    <p className="text-sm text-gray-500">Reduce spacing and padding</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-all duration-150 ease-out">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition-all duration-150 ease-out" />
                  </button>
                </div>
                <div className="flex items-center justify-between opacity-0 animate-[fadeInUp_300ms_ease-out_600ms_forwards]">
                  <div>
                    <p className="text-gray-300">Animations</p>
                    <p className="text-sm text-gray-500">Enable interface animations</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-all duration-150 ease-out">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-all duration-150 ease-out" />
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
              <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
              <p className="text-gray-400">Manage your subscription and payment methods</p>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 hover:shadow-lg transition-all duration-200 ease-out opacity-0 animate-[fadeInUp_500ms_ease-out_200ms_forwards]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Premium Plan</h3>
                  <p className="text-white/80">$19/month</p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">Next billing date</p>
                  <p className="text-white font-semibold">Feb 15, 2024</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_300ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
              <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-white">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-400">Expires 12/24</p>
                  </div>
                </div>
                <button className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150 ease-out">
                  Update
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_400ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
              <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]">
                  <div>
                    <p className="text-white">January 2024</p>
                    <p className="text-sm text-gray-400">Premium Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">$19.00</p>
                    <p className="text-sm text-green-400">Paid</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 opacity-0 animate-[fadeInUp_300ms_ease-out_600ms_forwards]">
                  <div>
                    <p className="text-white">December 2023</p>
                    <p className="text-sm text-gray-400">Premium Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">$19.00</p>
                    <p className="text-sm text-green-400">Paid</p>
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
              <h2 className="text-2xl font-bold text-white mb-2">Help & Support</h2>
              <p className="text-gray-400">Get help with Preflight AI</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-gray-800/50 rounded-lg p-6 text-left hover:bg-gray-800/70 transition-all duration-200 ease-out group opacity-0 animate-[fadeInUp_500ms_ease-out_200ms_forwards]">
                <HelpCircle className="w-8 h-8 text-indigo-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
                <p className="text-sm text-gray-400">Browse our comprehensive guides</p>
              </button>

              <button className="bg-gray-800/50 rounded-lg p-6 text-left hover:bg-gray-800/70 transition-all duration-200 ease-out group opacity-0 animate-[fadeInUp_500ms_ease-out_300ms_forwards]">
                <Globe className="w-8 h-8 text-indigo-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
                <p className="text-sm text-gray-400">Connect with other users</p>
              </button>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 opacity-0 animate-[fadeInUp_500ms_ease-out_400ms_forwards] hover:bg-gray-800/60 transition-all duration-200 ease-out">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Support</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-all duration-150 ease-out hover:border-gray-600 opacity-0 animate-[fadeInUp_300ms_ease-out_500ms_forwards]"
                />
                <textarea
                  placeholder="Describe your issue..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-all duration-150 ease-out hover:border-gray-600 opacity-0 animate-[fadeInUp_300ms_ease-out_600ms_forwards]"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-150 ease-out opacity-0 animate-[fadeInUp_300ms_ease-out_700ms_forwards]">
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your application preferences</p>
      </div>
      
      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-out ${
                    activeSection === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800/30 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  <ChevronRight className={`w-4 h-4 ml-auto transition-all duration-200 ${
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