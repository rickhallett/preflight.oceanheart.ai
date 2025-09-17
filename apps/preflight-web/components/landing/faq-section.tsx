"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "What is Preflight AI?",
    answer: "Preflight AI is an intelligent assessment platform that helps organizations evaluate their readiness for AI adoption. Through conversational coaching and comprehensive assessments, we provide actionable insights to guide your AI transformation journey."
  },
  {
    id: "2",
    question: "How does the assessment process work?",
    answer: "Our assessment process begins with a series of targeted questions about your organization's current capabilities, goals, and challenges. The AI-powered coach then provides personalized recommendations and creates a roadmap for successful AI implementation."
  },
  {
    id: "3",
    question: "Is my data secure?",
    answer: "Yes, we take security seriously. Preflight AI is SOC2 compliant and uses enterprise-grade encryption for all data transmission and storage. Your assessment data is never shared with third parties and remains completely confidential."
  },
  {
    id: "4",
    question: "Can I customize the assessment for my industry?",
    answer: "Absolutely! Preflight AI allows you to customize assessments based on your specific industry, company size, and unique requirements. Our platform adapts to provide the most relevant insights for your context."
  },
  {
    id: "5",
    question: "How long does an assessment take?",
    answer: "A typical assessment takes 30-45 minutes to complete. However, you can save your progress and return at any time. The conversational nature of our platform makes the process engaging and efficient."
  },
  {
    id: "6",
    question: "What kind of support is available?",
    answer: "We offer comprehensive support including documentation, video tutorials, and direct access to our support team. Enterprise customers also have access to dedicated customer success managers."
  },
  {
    id: "7",
    question: "Can multiple team members collaborate on assessments?",
    answer: "Yes! Preflight AI supports team collaboration, allowing multiple stakeholders to contribute to assessments, share insights, and work together on implementation planning."
  }
];

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  
  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };
  
  return (
    <section className="py-20 px-4" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400">
            Everything you need to know about Preflight AI.
          </p>
        </div>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openItems.has(faq.id);
            
            return (
              <div
                key={faq.id}
                className="border border-zinc-800 rounded-md overflow-hidden transition-all duration-200 hover:border-zinc-700"
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="text-zinc-100 font-medium">
                    {faq.question}
                  </span>
                  <span className="text-zinc-400 ml-4">
                    {isOpen ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </span>
                </button>
                
                {isOpen && (
                  <div className="px-5 py-4 bg-zinc-900/30 border-t border-zinc-800">
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}