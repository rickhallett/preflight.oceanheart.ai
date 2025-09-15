"use client";

import React, { useEffect, useState } from "react";
import { useSurveyStore } from "@/lib/stores/survey-store";

export function TechnicalForm() {
  const { getFormData, updateFormData } = useSurveyStore();
  const formId = "technical";
  
  const [data, setData] = useState(() => ({
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    cloudPlatforms: [],
    skillLevel: {},
    certifications: "",
    githubProfile: "",
    ...getFormData(formId)
  }));

  useEffect(() => {
    updateFormData(formId, data);
  }, [data, updateFormData]);

  const handleMultiSelect = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSkillLevel = (skill: string, level: string) => {
    setData(prev => ({
      ...prev,
      skillLevel: {
        ...prev.skillLevel,
        [skill]: level
      }
    }));
  };

  const languages = [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "Go", 
    "Rust", "PHP", "Ruby", "Swift", "Kotlin", "C++", "SQL"
  ];

  const frameworks = [
    "React", "Vue.js", "Angular", "Next.js", "Svelte", "Express.js",
    "Django", "Flask", "Spring Boot", "Laravel", ".NET", "Ruby on Rails"
  ];

  const databases = [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
    "SQLite", "DynamoDB", "Firebase", "Supabase"
  ];

  const tools = [
    "Git", "Docker", "Kubernetes", "Jenkins", "GitHub Actions",
    "Terraform", "AWS CLI", "Webpack", "Vite", "Jest", "Cypress"
  ];

  const cloudPlatforms = ["AWS", "Google Cloud", "Azure", "Vercel", "Netlify", "Heroku"];

  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Technical Skills</h2>
        <p className="text-gray-400">Share your technical expertise and experience.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Programming Languages <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleMultiSelect("languages", lang)}
                className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                  data.languages.includes(lang)
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Frameworks & Libraries <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {frameworks.map((framework) => (
              <button
                key={framework}
                onClick={() => handleMultiSelect("frameworks", framework)}
                className={`p-2 rounded-lg border text-xs transition-colors ${
                  data.frameworks.includes(framework)
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                {framework}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Databases
          </label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {databases.map((db) => (
              <button
                key={db}
                onClick={() => handleMultiSelect("databases", db)}
                className={`p-2 rounded-lg border text-xs transition-colors ${
                  data.databases.includes(db)
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                {db}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Development Tools
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tools.map((tool) => (
              <button
                key={tool}
                onClick={() => handleMultiSelect("tools", tool)}
                className={`p-2 rounded-lg border text-xs transition-colors ${
                  data.tools.includes(tool)
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Cloud Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {cloudPlatforms.map((platform) => (
              <button
                key={platform}
                onClick={() => handleMultiSelect("cloudPlatforms", platform)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  data.cloudPlatforms.includes(platform)
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {data.languages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Skill Levels for Selected Languages
            </label>
            <div className="space-y-3">
              {data.languages.slice(0, 3).map((lang) => (
                <div key={lang} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                  <span className="text-white font-medium">{lang}</span>
                  <div className="flex space-x-2">
                    {skillLevels.map((level) => (
                      <button
                        key={level}
                        onClick={() => handleSkillLevel(lang, level)}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          data.skillLevel[lang] === level
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Profile
            </label>
            <input
              type="url"
              value={data.githubProfile}
              onChange={(e) => setData(prev => ({ ...prev, githubProfile: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="https://github.com/username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Certifications
            </label>
            <input
              type="text"
              value={data.certifications}
              onChange={(e) => setData(prev => ({ ...prev, certifications: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="AWS, Google Cloud, etc."
            />
          </div>
        </div>
      </div>
    </div>
  );
}