"use client";

import { motion } from "framer-motion";
import { Conversation } from "@/lib/types";
import ChatMessage from "./Message";
import ChatInput from "./ChatInput";
import EmptyState from "@/components/empty/EmptyState";
import { ThinkingStep } from "@/lib/types";

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
  return (
    <div className="flex flex-col h-full bg-[#fafafa]">
      {/* Messages area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!conversation || conversation.messages.length === 0 ? (
          <EmptyState onPrompt={onSend} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-8">
            {conversation.messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                index={i}
                onRelatedQuestion={onSend}
              />
            ))}

            {/* Loading placeholder */}
            {isLoading && !thinkingStep && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#466536]">
                  <span className="text-white text-xs font-bold">O</span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-stone-300 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input composer */}
      <div className="border-t border-stone-200/60 shrink-0 bg-white/50 backdrop-blur-sm">
        <ChatInput
          onSend={onSend}
          isLoading={isLoading}
          thinkingStep={thinkingStep}
          availableModels={availableModels}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          webSearchEnabled={webSearchEnabled}
          setWebSearchEnabled={setWebSearchEnabled}
        />
      </div>
    </div>
  );
}
