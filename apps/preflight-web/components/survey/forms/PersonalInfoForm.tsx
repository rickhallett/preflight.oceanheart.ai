"use client";

import React, { useEffect, useState } from "react";
import { useSurveyStore } from "@/lib/stores/survey-store";

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
}

export function PersonalInfoForm() {
  const { getFormData, updateFormData } = useSurveyStore();
  const formId = "personal-info";
  
  const [data, setData] = useState<PersonalInfoData>(() => ({
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

  const handleChange = (field: keyof PersonalInfoData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 mb-1">Personal Information</h2>
        <p className="text-sm text-zinc-400">Tell us about yourself to get started.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            First Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150"
            placeholder="Enter your first name"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150"
            placeholder="Enter your last name"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150"
            placeholder="your.email@company.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Company
          </label>
          <input
            type="text"
            value={data.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150"
            placeholder="Your company name"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Job Title
          </label>
          <input
            type="text"
            value={data.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150"
            placeholder="Your current role"
          />
        </div>
      </div>
    </div>
  );
}