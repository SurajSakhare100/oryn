"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Paperclip, Globe, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThinkingStep } from "@/lib/types";

type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string; isFinal: boolean }>>;
};
type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  thinkingStep: ThinkingStep | null;
  placeholder?: string;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (enabled: boolean) => void;
  availableModels: string[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export default function ChatInput({
  onSend,
  isLoading,
  thinkingStep,
  placeholder = "Ask anything...",
  webSearchEnabled,
  setWebSearchEnabled,
  availableModels,
  selectedModel,
  setSelectedModel,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

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

  const toggleSpeech = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionAPI = (window as SpeechWindow).SpeechRecognition
      || (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechError("Speech input isn’t supported by this browser.");
      return;
    }

    setSpeechError("");
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .filter((result) => result[0]?.isFinal)
        .map((result) => result[0]?.transcript ?? "")
        .join("");
      if (!transcript) return;
      setValue((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}${transcript}`);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setSpeechError("Microphone access was blocked or speech could not be recognized.");
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
    textareaRef.current?.focus();
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
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-lime-500"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-[#587b3f]">{thinkingStep}</span>
        </div>
      )}

      {/* Input box */}
      <div
        className={cn(
          "relative rounded-2xl border bg-white transition-all duration-200 shadow-sm",
          isLoading
            ? "border-stone-200"
            : "border-stone-200 hover:border-stone-300 focus-within:border-lime-500 focus-within:ring-2 focus-within:ring-lime-100"
        )}
      >
        {/* Textarea */}
        <div className="flex items-end gap-2 px-4 pt-3 pb-2">
          <button className="p-1.5 text-stone-400 hover:text-stone-600 transition-colors shrink-0 mb-0.5">
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
            className="flex-1 bg-transparent resize-none text-sm text-stone-800 placeholder:text-stone-400 outline-none leading-relaxed py-1 max-h-40 disabled:opacity-50"
          />
          <div className="flex items-center gap-1 shrink-0 mb-0.5">
            <button
              type="button"
              onClick={toggleSpeech}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              title={isListening ? "Stop voice input" : "Voice input"}
              className={cn("p-1.5 transition-colors", isListening ? "text-[#466536]" : "text-stone-400 hover:text-stone-600")}
            >
              <Mic size={16} />
            </button>
            <button
              onClick={handleSend}
              disabled={!value.trim() || isLoading}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                value.trim() && !isLoading
                  ? "bg-[#466536] text-white hover:bg-[#3d5b30]"
                  : "bg-stone-100 text-stone-400 cursor-not-allowed"
              )}
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center gap-2 px-4 pb-3 border-t border-stone-100 pt-2">
          <label className="flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-600">
            <span className="font-medium text-[#587b3f]">AI</span>
            <select
              aria-label="AI model"
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              className="max-w-36 bg-transparent outline-none"
            >
              {availableModels.map((model) => <option key={model} value={model}>{model}</option>)}
            </select>
          </label>
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
              webSearchEnabled
                  ? "border-[#dce8d1] bg-[#eef5e7] text-[#466536]"
                : "text-stone-400 border-stone-200 hover:border-stone-300 hover:text-stone-600"
            )}
          >
            <Globe size={11} />
            Web Search
          </button>
          {speechError && <span role="status" className="text-xs text-rose-600">{speechError}</span>}
          <span className="text-xs text-stone-400 ml-auto">
            Shift+Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
}
