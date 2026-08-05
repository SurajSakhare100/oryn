"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Paperclip, Globe, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThinkingStep } from "@/lib/types";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  thinkingStep: ThinkingStep | null;
  placeholder?: string;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
}

export default function ChatInput({
  onSend,
  isLoading,
  thinkingStep,
  placeholder = "Ask anything...",
  webSearchEnabled,
  setWebSearchEnabled,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    onSend(value);
    setValue("");
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-3">
      {/* Thinking indicator */}
      {thinkingStep && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-xs text-teal-400 font-medium">{thinkingStep}</span>
        </div>
      )}

      {/* Input box */}
      <div
        className={cn(
          "relative rounded-2xl border bg-zinc-900 transition-all duration-200",
          isLoading
            ? "border-zinc-700"
            : "border-zinc-700 hover:border-zinc-600 focus-within:border-teal-500/60 focus-within:ring-1 focus-within:ring-teal-500/20"
        )}
      >
        {/* Textarea */}
        <div className="flex items-end gap-2 px-4 pt-3 pb-2">
          <button className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 mb-0.5">
            <Paperclip size={16} />
          </button>
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            disabled={isLoading}
            placeholder={placeholder}
            className="flex-1 bg-transparent resize-none text-sm text-zinc-100 placeholder:text-zinc-600 outline-none leading-relaxed py-1 max-h-40 disabled:opacity-50"
          />
          <div className="flex items-center gap-1 shrink-0 mb-0.5">
            <button className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
              <Mic size={16} />
            </button>
            <button
              onClick={handleSend}
              disabled={!value.trim() || isLoading}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                value.trim() && !isLoading
                  ? "bg-teal-500 hover:bg-teal-400 text-white"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              )}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center gap-2 px-4 pb-3 border-t border-zinc-800 pt-2">
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
              webSearchEnabled
                ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                : "text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
            )}
          >
            <Globe size={11} />
            Web Search
          </button>
          <span className="text-xs text-zinc-700 ml-auto">
            Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}
