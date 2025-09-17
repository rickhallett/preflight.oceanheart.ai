"use client";

import React, { useEffect, useState } from "react";
import { useSurveyStore } from "@/lib/stores/survey-store";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

export function FeedbackForm() {
  const { getFormData, updateFormData } = useSurveyStore();
  const formId = "feedback";
  
  const [data, setData] = useState(() => ({
    rating: 0,
    satisfaction: "",
    improvement: "",
    features: [],
    recommend: "",
    additionalComments: "",
    contactConsent: false,
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

  const features = [
    "Better UI/UX Design",
    "More Integrations", 
    "Advanced Analytics",
    "Mobile App",
    "API Documentation",
    "Video Tutorials",
    "Community Forum",
    "Live Chat Support"
  ];

  const renderStarRating = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleChange("rating", star)}
            className={`p-1 transition-colors ${
              star <= data.rating ? "text-yellow-400" : "text-zinc-600 hover:text-yellow-300"
            }`}
          >
            <Star className="w-8 h-8 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 mb-1.5">Feedback & Experience</h2>
        <p className="text-zinc-400">Help us improve by sharing your thoughts and suggestions.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Overall Rating <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center space-x-4">
            {renderStarRating()}
            <span className="text-zinc-400 text-sm ml-4">
              {data.rating > 0 && `${data.rating}/5 stars`}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            How satisfied are you with our service?
          </label>
          <div className="flex space-x-4">
            {[
              { value: "very-satisfied", label: "Very Satisfied", icon: "😊" },
              { value: "satisfied", label: "Satisfied", icon: "🙂" },
              { value: "neutral", label: "Neutral", icon: "😐" },
              { value: "dissatisfied", label: "Dissatisfied", icon: "😞" },
              { value: "very-dissatisfied", label: "Very Dissatisfied", icon: "😤" }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleChange("satisfaction", option.value)}
                className={`flex flex-col items-center p-2.5 rounded-md border transition-colors ${
                  data.satisfaction === option.value
                    ? "bg-zinc-600 border-zinc-600 text-zinc-100"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                <span className="text-xl mb-1">{option.icon}</span>
                <span className="text-xs text-center">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            What could we improve? <span className="text-red-400">*</span>
          </label>
          <textarea
            value={data.improvement}
            onChange={(e) => handleChange("improvement", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            placeholder="Tell us what features or improvements would make this better for you..."
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            What features would you like to see? (Select multiple)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {features.map((feature) => (
              <button
                key={feature}
                onClick={() => handleMultiSelect("features", feature)}
                className={`p-2.5 rounded-md border text-sm transition-colors ${
                  data.features.includes(feature)
                    ? "bg-zinc-600 border-zinc-600 text-zinc-100"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {feature}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">
            Would you recommend us to others?
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => handleChange("recommend", "yes")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md border transition-colors ${
                data.recommend === "yes"
                  ? "bg-zinc-600 border-green-500 text-zinc-100"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span>Yes, definitely</span>
            </button>
            <button
              onClick={() => handleChange("recommend", "maybe")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md border transition-colors ${
                data.recommend === "maybe"
                  ? "bg-yellow-600 border-yellow-500 text-zinc-100"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <span>Maybe</span>
            </button>
            <button
              onClick={() => handleChange("recommend", "no")}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md border transition-colors ${
                data.recommend === "no"
                  ? "bg-red-600 border-red-500 text-zinc-100"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <ThumbsDown className="w-5 h-5" />
              <span>No</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Additional Comments
          </label>
          <textarea
            value={data.additionalComments}
            onChange={(e) => handleChange("additionalComments", e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            placeholder="Any other feedback or suggestions..."
            rows={3}
          />
        </div>

        <div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.contactConsent}
              onChange={(e) => handleChange("contactConsent", e.target.checked)}
              className="w-4 h-4 text-zinc-600 bg-zinc-800 border-gray-600 rounded mt-1"
            />
            <div>
              <span className="text-zinc-400 text-sm">
                I consent to being contacted for follow-up feedback
              </span>
              <p className="text-zinc-500 text-xs mt-1">
                We may reach out to discuss your feedback in more detail
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}