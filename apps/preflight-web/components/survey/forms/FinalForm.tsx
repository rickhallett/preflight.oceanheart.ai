"use client";

import React, { useEffect, useState } from "react";
import { useSurveyStore } from "@/lib/stores/survey-store";
import { Check, Mail, Bell, Shield } from "lucide-react";

interface FinalFormData {
  newsletter: boolean;
  updates: boolean;
  privacy: boolean;
  terms: boolean;
  marketing: boolean;
  surveyType: string;
  referralSource: string;
  futureParticipation: boolean;
  dataRetention: string;
}

export function FinalForm() {
  const { getFormData, updateFormData } = useSurveyStore();
  const formId = "final";
  
  const [data, setData] = useState<FinalFormData>(() => ({
    newsletter: false,
    updates: false,
    privacy: false,
    terms: false,
    marketing: false,
    surveyType: "",
    referralSource: "",
    futureParticipation: false,
    dataRetention: "1-year",
    ...getFormData(formId)
  }));

  useEffect(() => {
    updateFormData(formId, data);
  }, [data, updateFormData]);

  const handleChange = (field: keyof FinalFormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const surveyTypes = [
    "Product Feedback",
    "User Experience Research", 
    "Market Research",
    "Beta Testing Feedback",
    "General Inquiry",
    "Other"
  ];

  const referralSources = [
    "Search Engine",
    "Social Media",
    "Friend/Colleague",
    "Email Newsletter",
    "Advertisement",
    "Company Website",
    "Conference/Event",
    "Other"
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 mb-1.5">Final Details</h2>
        <p className="text-zinc-400">Just a few more details to complete your submission.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-green-900/20 border border-green-900/50 rounded-md p-3">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-green-400 font-semibold mb-1.5">Almost Complete!</h3>
              <p className="text-zinc-400 text-sm">
                Thank you for taking the time to provide detailed information. 
                Your responses will help us improve our services and better understand our users.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            What type of survey is this for you?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {surveyTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleChange("surveyType", type)}
                className={`p-2.5 rounded-md border text-sm transition-colors ${
                  data.surveyType === type
                    ? "bg-zinc-600 border-zinc-600 text-zinc-100"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            How did you hear about us?
          </label>
          <select
            value={data.referralSource}
            onChange={(e) => handleChange("referralSource", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:border-zinc-600"
          >
            <option value="">Please select...</option>
            {referralSources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        <div className="bg-zinc-800/50 rounded-md p-4 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Communication Preferences</span>
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.newsletter}
                onChange={(e) => handleChange("newsletter", e.target.checked)}
                className="w-4 h-4 text-zinc-600 bg-zinc-800 border-gray-600 rounded mt-1"
              />
              <div>
                <span className="text-zinc-400 text-xs font-medium">
                  Subscribe to newsletter <span className="text-red-400">*</span>
                </span>
                <p className="text-zinc-500 text-xs mt-1">
                  Stay updated with our latest features and improvements
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.updates}
                onChange={(e) => handleChange("updates", e.target.checked)}
                className="w-4 h-4 text-zinc-600 bg-zinc-800 border-gray-600 rounded mt-1"
              />
              <div>
                <span className="text-zinc-400 text-sm">Product updates</span>
                <p className="text-zinc-500 text-xs mt-1">
                  Notifications about new features and releases
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.marketing}
                onChange={(e) => handleChange("marketing", e.target.checked)}
                className="w-4 h-4 text-zinc-600 bg-zinc-800 border-gray-600 rounded mt-1"
              />
              <div>
                <span className="text-zinc-400 text-sm">Marketing communications</span>
                <p className="text-zinc-500 text-xs mt-1">
                  Special offers, events, and promotional content
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.futureParticipation}
                onChange={(e) => handleChange("futureParticipation", e.target.checked)}
                className="w-4 h-4 text-zinc-600 bg-zinc-800 border-gray-600 rounded mt-1"
              />
              <div>
                <span className="text-zinc-400 text-sm">Future survey participation</span>
                <p className="text-zinc-500 text-xs mt-1">
                  Invite me to participate in future research studies
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-md p-4 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacy & Data</span>
          </h3>
          
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Data Retention Preference
            </label>
            <div className="flex space-x-4">
              {[
                { value: "6-months", label: "6 Months" },
                { value: "1-year", label: "1 Year" },
                { value: "2-years", label: "2 Years" },
                { value: "indefinite", label: "No Limit" }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dataRetention"
                    value={option.value}
                    checked={data.dataRetention === option.value}
                    onChange={(e) => handleChange("dataRetention", e.target.value)}
                    className="w-4 h-4 text-zinc-600"
                  />
                  <span className="text-zinc-400 text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            <p className="text-zinc-500 text-xs mt-2">
              How long should we keep your survey responses?
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-700">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.privacy}
                onChange={(e) => handleChange("privacy", e.target.checked)}
                className="w-4 h-4 text-zinc-600 bg-zinc-800 border-gray-600 rounded mt-1"
              />
              <div>
                <span className="text-zinc-400 text-sm">
                  I agree to the Privacy Policy
                </span>
                <p className="text-zinc-500 text-xs mt-1">
                  Read our <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
                </p>
              </div>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.terms}
                onChange={(e) => handleChange("terms", e.target.checked)}
                className="w-4 h-4 text-zinc-600 bg-zinc-800 border-gray-600 rounded mt-1"
              />
              <div>
                <span className="text-zinc-400 text-sm">
                  I accept the Terms of Service
                </span>
                <p className="text-zinc-500 text-xs mt-1">
                  Read our <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a>
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}