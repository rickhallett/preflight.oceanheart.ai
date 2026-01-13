"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";

const headingVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
} as const;

const contactItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
} as const;

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Form submitted:", formData);
    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset after showing success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", company: "", message: "" });
    }, 3000);
  };

  return (
    <section className="py-20 px-4 border-t border-zinc-800" id="contact">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={headingVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-50 mb-4">
            Contact Us
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            We're here to help you navigate your AI journey. Reach out to learn more about how Preflight AI can transform your organization.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={cardVariants}
          >
            <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-6">
                Get in Touch
              </h3>

              <motion.div
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
              >
                <motion.div
                  className="flex items-start space-x-3 group"
                  variants={contactItemVariants}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mail className="w-5 h-5 text-zinc-400 mt-0.5 group-hover:text-zinc-300 transition-colors" />
                  </motion.div>
                  <div>
                    <p className="text-zinc-300 font-medium">Email</p>
                    <a href="mailto:hello@preflight.ai" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                      hello@preflight.ai
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-3 group"
                  variants={contactItemVariants}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Phone className="w-5 h-5 text-zinc-400 mt-0.5 group-hover:text-zinc-300 transition-colors" />
                  </motion.div>
                  <div>
                    <p className="text-zinc-300 font-medium">Phone</p>
                    <a href="tel:+1-800-PREFLIGHT" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                      1-800-PREFLIGHT
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start space-x-3 group"
                  variants={contactItemVariants}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MapPin className="w-5 h-5 text-zinc-400 mt-0.5 group-hover:text-zinc-300 transition-colors" />
                  </motion.div>
                  <div>
                    <p className="text-zinc-300 font-medium">Office</p>
                    <p className="text-zinc-400">
                      San Francisco, CA<br />
                      United States
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Map Placeholder */}
            <motion.div
              className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md h-64 flex items-center justify-center overflow-hidden relative group"
              whileHover={{ borderColor: "rgb(63, 63, 70)" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="text-center relative z-10">
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <MapPin className="w-8 h-8 text-zinc-600 mx-auto mb-2 group-hover:text-zinc-500 transition-colors" />
                </motion.div>
                <p className="text-zinc-500 text-sm">San Francisco, CA</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={cardVariants}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-zinc-100 mb-6">
              Send us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200"
                  placeholder="John Doe"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200"
                  placeholder="john@company.com"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200"
                  placeholder="Acme Inc."
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all duration-200 resize-none"
                  placeholder="Tell us about your AI readiness goals..."
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium rounded-md hover:bg-zinc-700 hover:border-zinc-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
                whileHover={{ scale: isSubmitting || isSubmitted ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting || isSubmitted ? 1 : 0.99 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                {isSubmitted ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Check className="w-4 h-4 text-green-400" />
                    </motion.div>
                    <span className="text-green-400">Message Sent!</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear"
                      }}
                      className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full"
                    />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
