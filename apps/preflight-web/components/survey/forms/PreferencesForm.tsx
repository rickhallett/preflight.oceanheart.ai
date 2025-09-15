"use client";

import React, { useEffect, useState } from "react";
import { useSurveyStore } from "@/lib/stores/survey-store";

export function PreferencesForm() {
  const { getFormData, updateFormData } = useSurveyStore();
  const formId = "preferences";
  
  const [data, setData] = useState(() => ({
    role: "",
    experience: "",
    teamSize: "",
    interests: [],
    workStyle: "",
    availability: [],
    ...getFormData(formId)
  }));

  useEffect(() => {
    updateFormData(formId, data);
  }, [data, updateFormData]);

  const handleChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Product Manager",
    "Designer",
    "QA Engineer",
    "Data Scientist",
    "Other"
  ];

  const interests = [
    "Web Development",
    "Mobile Development",
    "Machine Learning",
    "Cloud Computing",
    "Blockchain",
    "IoT",
    "Cybersecurity",
    "Game Development"
  ];

  const availability = ["Mornings", "Afternoons", "Evenings", "Weekends"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Preferences & Background</h2>
        <p className="text-gray-400">Help us understand your professional background and interests.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Primary Role <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleChange("role", role)}
                className={`p-3 rounded-lg border text-sm transition-colors ${
                  data.role === role
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Years of Experience <span className="text-red-400">*</span>
          </label>
          <select
            value={data.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            required
          >
            <option value="">Select experience level</option>
            <option value="0-1">0-1 years (Entry level)</option>
            <option value="2-3">2-3 years (Junior)</option>
            <option value="4-6">4-6 years (Mid level)</option>
            <option value="7-10">7-10 years (Senior)</option>
            <option value="10+">10+ years (Expert/Lead)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Team Size
          </label>
          <div className="flex space-x-4">
            {["Solo", "2-5", "6-10", "11-20", "20+"].map((size) => (
              <label key={size} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="teamSize"
                  value={size}
                  checked={data.teamSize === size}
                  onChange={(e) => handleChange("teamSize", e.target.value)}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-gray-300 text-sm">{size}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Areas of Interest (Select multiple)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {interests.map((interest) => (
              <button
                key={interest}
                onClick={() => handleMultiSelect("interests", interest)}
                className={`p-2 rounded-lg border text-xs transition-colors ${
                  data.interests.includes(interest)
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preferred Work Style
          </label>
          <textarea
            value={data.workStyle}
            onChange={(e) => handleChange("workStyle", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Describe your preferred work environment and style..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Availability (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-3">
            {availability.map((time) => (
              <label key={time} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={time}
                  checked={data.availability.includes(time)}
                  onChange={() => handleMultiSelect("availability", time)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-gray-300 text-sm">{time}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}