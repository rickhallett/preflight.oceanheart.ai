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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 mb-1.5">Preferences & Background</h2>
        <p className="text-zinc-400">Help us understand your professional background and interests.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Primary Role <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleChange("role", role)}
                className={`p-2.5 rounded-md border text-sm transition-colors ${
                  data.role === role
                    ? "bg-zinc-600 border-zinc-600 text-zinc-100"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Years of Experience <span className="text-red-400">*</span>
          </label>
          <select
            value={data.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:border-zinc-600"
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
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
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
                  className="w-4 h-4 text-zinc-600"
                />
                <span className="text-zinc-400 text-sm">{size}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Areas of Interest (Select multiple)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {interests.map((interest) => (
              <button
                key={interest}
                onClick={() => handleMultiSelect("interests", interest)}
                className={`p-2 rounded-md border text-xs transition-colors ${
                  data.interests.includes(interest)
                    ? "bg-zinc-600 border-zinc-600 text-zinc-100"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Preferred Work Style
          </label>
          <textarea
            value={data.workStyle}
            onChange={(e) => handleChange("workStyle", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            placeholder="Describe your preferred work environment and style..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Availability (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2.5">
            {availability.map((time) => (
              <label key={time} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={time}
                  checked={data.availability.includes(time)}
                  onChange={() => handleMultiSelect("availability", time)}
                  className="w-4 h-4 text-zinc-600 rounded"
                />
                <span className="text-zinc-400 text-sm">{time}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}