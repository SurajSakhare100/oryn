"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { SUGGESTED_PROMPTS } from "@/lib/dummy-data";

interface EmptyStateProps {
  onPrompt: (text: string) => void;
}

export default function EmptyState({ onPrompt }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
      {/* Logo mark */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20"
      >
        <span className="text-white font-bold text-2xl">P</span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-3xl font-bold text-white mb-2 tracking-tight"
      >
        Ask anything
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-zinc-500 text-sm max-w-sm leading-relaxed"
      >
        Search the web, understand complex topics, and get AI-powered answers.
      </motion.p>

      {/* Suggested prompts */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 w-full max-w-xl"
      >
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <motion.button
            key={prompt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
            onClick={() => onPrompt(prompt.title)}
            className="group flex items-start gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all text-left"
          >
            <span className="text-xl leading-none shrink-0">{prompt.icon}</span>
            <div>
              <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                {prompt.title}
              </p>
              <p className="text-xs text-zinc-600 mt-0.5 leading-snug">{prompt.subtitle}</p>
            </div>
            <Search size={13} className="ml-auto text-zinc-700 group-hover:text-teal-500 transition-colors shrink-0 mt-0.5" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
