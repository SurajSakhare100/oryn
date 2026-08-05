"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Conversation } from "@/lib/types";
import { AI_MODELS } from "@/lib/dummy-data";
import ChatMessage from "./Message";
import ChatInput from "./ChatInput";
import EmptyState from "@/components/empty/EmptyState";
import { ThinkingStep } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  conversation: Conversation | null;
  isLoading: boolean;
  thinkingStep: ThinkingStep | null;
  onSend: (message: string) => void;
  availableModels: string[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
}

export default function ChatWindow({
  conversation,
  isLoading,
  thinkingStep,
  onSend,
  availableModels,
  selectedModel,
  setSelectedModel,
  webSearchEnabled,
  setWebSearchEnabled,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [modelOpen, setModelOpen] = useState(false);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
        <h2 className="text-sm font-medium text-zinc-400 truncate max-w-[60%]">
          {conversation ? conversation.title : "New Thread"}
        </h2>

        {/* Model selector */}
        <div className="relative">
          <button
            onClick={() => setModelOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 transition-colors"
          >
            <span className="text-teal-400 text-xs font-medium">AI</span>
            <span>{selectedModel || "Select Model"}</span>
            <ChevronDown size={13} className={cn("text-zinc-500 transition-transform", modelOpen && "rotate-180")} />
          </button>
          <AnimatePresence>
            {modelOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 w-48 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl z-20"
              >
                {availableModels.map((m) => (
                  <li key={m}>
                    <button
                      onClick={() => { setSelectedModel(m); setModelOpen(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-xs transition-colors truncate",
                        m === selectedModel
                          ? "text-teal-400 bg-teal-500/10"
                          : "text-zinc-300 hover:bg-zinc-800"
                      )}
                    >
                      {m}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {!conversation || conversation.messages.length === 0 ? (
          <EmptyState onPrompt={onSend} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-8">
            {conversation.messages.map((msg, i) => (
              <ChatMessage key={msg.id} message={msg} index={i} />
            ))}

            {/* Loading placeholder */}
            {isLoading && !thinkingStep && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input composer */}
      <div className="border-t border-zinc-800 shrink-0">
        <ChatInput
          onSend={onSend}
          isLoading={isLoading}
          thinkingStep={thinkingStep}
          webSearchEnabled={webSearchEnabled}
          setWebSearchEnabled={setWebSearchEnabled}
        />
      </div>
    </div>
  );
}
