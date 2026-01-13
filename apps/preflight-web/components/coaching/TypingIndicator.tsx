"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -4 },
  };

  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-primary/10">
            AI
          </div>
          <span className="text-xs opacity-70">Thinking...</span>
        </div>
        <div className="flex items-center gap-1 h-5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-muted-foreground/50 rounded-full"
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 0.4,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
