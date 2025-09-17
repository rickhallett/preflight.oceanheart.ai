"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };
  
  return (
    <section className="py-20 px-4 border-t border-zinc-800" id="contact">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-4">
            Contact Us
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            We're here to help you navigate your AI journey. Reach out to learn more about how Preflight AI can transform your organization.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-6">
                Get in Touch
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-zinc-300 font-medium">Email</p>
                    <a href="mailto:hello@preflight.ai" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                      hello@preflight.ai
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-zinc-300 font-medium">Phone</p>
                    <a href="tel:+1-800-PREFLIGHT" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                      1-800-PREFLIGHT
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-zinc-300 font-medium">Office</p>
                    <p className="text-zinc-400">
                      San Francisco, CA<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map Placeholder */}
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">San Francisco, CA</p>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-6">
            <h3 className="text-lg font-semibold text-zinc-100 mb-6">
              Send us a Message
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                  placeholder="john@company.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                  placeholder="Acme Inc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors resize-none"
                  placeholder="Tell us about your AI readiness goals..."
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}