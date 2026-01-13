"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChatInterface } from "@/components/coaching";
import { motion } from "framer-motion";

export default function CoachingPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = () => {
    setIsComplete(true);
  };

  const handleContinue = () => {
    router.push("/app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">AI Coaching Session</h1>
          <p className="text-muted-foreground">
            Explore your professional challenges through collaborative dialogue
          </p>
        </motion.div>

        {/* Introduction Card */}
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border p-6 mb-6"
          >
            <h2 className="font-semibold mb-2">How This Works</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">1.</span>
                <span>
                  Your AI coach will ask thoughtful questions based on your survey responses
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">2.</span>
                <span>
                  Share your thoughts openly - this is a safe space for exploration
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">3.</span>
                <span>
                  You have up to 4 rounds of conversation to explore your challenges
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">4.</span>
                <span>
                  Remember: This is coaching, not medical advice. Your coach helps you
                  explore, not diagnose.
                </span>
              </li>
            </ul>
          </motion.div>
        )}

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ChatInterface
            runId={runId}
            onComplete={handleComplete}
            onError={(error) => console.error("Coaching error:", error)}
          />
        </motion.div>

        {/* Completion Card */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border p-6 mt-6 text-center"
          >
            <h2 className="font-semibold mb-2">Session Complete</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Thank you for participating in this coaching session. We hope the
              conversation helped you explore your professional challenges.
            </p>
            <button
              onClick={handleContinue}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Return to Dashboard
            </button>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-xs text-muted-foreground"
        >
          <p>
            This AI coaching experience is for educational and research purposes.
            It does not provide medical advice or diagnosis.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
