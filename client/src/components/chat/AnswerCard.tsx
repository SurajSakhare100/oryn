"use client";

import { motion } from "framer-motion";
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Share2, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { Message } from "@/lib/types";
import Sources from "@/components/sources/Sources";
import { cn } from "@/lib/utils";

interface AnswerCardProps {
  message: Message;
}

export default function AnswerCard({ message }: AnswerCardProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format inline citations [1] -> [[1]](url) so ReactMarkdown renders them as links
  let formattedContent = message.content;
  if (message.sources && message.sources.length > 0) {
    formattedContent = formattedContent.replace(/\[([0-9]+)\]/g, (match, numStr) => {
      const num = parseInt(numStr, 10);
      const source = message.sources?.find((s) => s.id === num);
      if (source) {
        return `[${num}](${source.url})`;
      }
      return match;
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Answer header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
          <Bot size={14} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-zinc-300">Answer</span>
      </div>

      {/* Markdown content */}
      <div className="prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            code({ inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-xl !text-sm !my-3"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            // Custom link renderer for citations
            a({ href, children, ...props }: any) {
              const text = String(children);
              const isCitation = /^\d+$/.test(text);
              if (isCitation) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-3.5 h-3.5 text-[9px] font-bold font-mono rounded-full bg-teal-500/10 hover:bg-teal-500/25 text-teal-400 border border-teal-500/25 hover:border-teal-500/50 transition-all mx-0.5 align-middle select-none"
                    style={{ textDecoration: 'none' }}
                    title={href}
                    {...props}
                  >
                    {text}
                  </a>
                );
              }
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 hover:underline transition-colors"
                  {...props}
                >
                  {children}
                </a>
              );
            }
          }}
        >
          {formattedContent}
        </ReactMarkdown>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            copied
              ? "bg-teal-500/20 text-teal-400"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
          )}
        >
          <Copy size={12} />
          {copied ? "Copied!" : "Copy"}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
          <RefreshCw size={12} />
          Regenerate
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setLiked(liked === "up" ? null : "up")}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              liked === "up" ? "text-teal-400 bg-teal-500/10" : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800"
            )}
          >
            <ThumbsUp size={13} />
          </button>
          <button
            onClick={() => setLiked(liked === "down" ? null : "down")}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              liked === "down" ? "text-rose-400 bg-rose-500/10" : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800"
            )}
          >
            <ThumbsDown size={13} />
          </button>
          <button className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
            <Share2 size={13} />
          </button>
        </div>
      </div>

      {/* Sources */}
      {message.sources && message.sources.length > 0 && (
        <Sources sources={message.sources} />
      )}

      {/* Related questions */}
      {message.relatedQuestions && message.relatedQuestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Related Questions
          </h3>
          <div className="space-y-1.5">
            {message.relatedQuestions.map((q) => (
              <button
                key={q.id}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all group"
              >
                <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                  {q.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
