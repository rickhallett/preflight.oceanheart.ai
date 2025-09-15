"use client";

import React from "react";
import { Button } from "@/components/ui/tailwindcss-buttons";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { LogOut, User, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
  const handleSignOut = () => {
    // Clear session and redirect to login
    document.cookie = "oh_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

  const profileData = [
    {
      id: 1,
      name: "John Doe",
      designation: "Premium User",
      image: "https://via.placeholder.com/150",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </div>
      
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="flex">
            <AnimatedTooltip items={profileData} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white">John Doe</h2>
            <p className="text-gray-400">john.doe@example.com</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <User className="w-4 h-4" />
                <span className="text-sm">Account Type</span>
              </div>
              <p className="text-white font-medium">Premium</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <p className="text-white font-medium">john.doe@example.com</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Member Since</span>
              </div>
              <p className="text-white font-medium">January 2024</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400">
                <span className="text-sm">Status</span>
              </div>
              <p className="text-green-400 font-medium">Active</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
              
              <Button
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Edit Profile
              </Button>
              
              <Button
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}