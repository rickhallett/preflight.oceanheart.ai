"use client";

import React, { useEffect, useState } from "react";
import { useSurveyStore } from "@/lib/stores/survey-store";

export function PersonalInfoForm() {
  const { getFormData, updateFormData } = useSurveyStore();
  const formId = "personal-info";
  
  const [data, setData] = useState(() => ({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    ...getFormData(formId)
  }));

  useEffect(() => {
    updateFormData(formId, data);
  }, [data, updateFormData]);

  const handleChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-gray-400">Tell us about yourself to get started.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Enter your first name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Enter your last name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="your.email@company.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Company
          </label>
          <input
            type="text"
            value={data.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Your company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={data.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Your current role"
          />
        </div>
      </div>
    </div>
  );
}