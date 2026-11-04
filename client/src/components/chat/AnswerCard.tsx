"use client";

import { motion } from "framer-motion";
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Share2, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { Message } from "@/lib/types";
import Sources from "@/components/sources/Sources";
import { cn } from "@/lib/utils";

interface AnswerCardProps {
  message: Message;
  onRelatedQuestion: (question: string) => void;
}

export default function AnswerCard({ message, onRelatedQuestion }: AnswerCardProps) {
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
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#466536]">
          <Bot size={14} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-stone-600">Answer</span>
      </div>

      {/* Markdown content */}
      <div className="prose prose-stone max-w-none text-sm leading-7 prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#587b3f] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#243126] prose-code:rounded prose-code:border prose-code:border-stone-200 prose-code:bg-stone-50 prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-[#466536] prose-pre:rounded-xl prose-pre:border prose-pre:border-stone-200 prose-blockquote:border-[#cbd9bf] prose-blockquote:text-stone-500">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            code({ inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneLight}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-xl !text-sm !my-3 !border !border-stone-200"
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
            a({ href, children, ...props }) {
              const text = String(children);
              const isCitation = /^\d+$/.test(text);
              if (isCitation) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-0.5 inline-flex h-3.5 w-3.5 select-none items-center justify-center rounded-full border border-[#dce8d1] bg-[#eef5e7] align-middle font-mono text-[9px] font-bold text-[#466536] transition-all hover:border-[#cbd9bf] hover:bg-[#e5efd9]"
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
                    className="text-[#587b3f] transition-colors hover:text-[#3f5e32] hover:underline"
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
      <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            copied
              ? "bg-[#eef5e7] text-[#466536]"
              : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
          )}
        >
          <Copy size={12} />
          {copied ? "Copied!" : "Copy"}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors">
          <RefreshCw size={12} />
          Regenerate
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setLiked(liked === "up" ? null : "up")}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              liked === "up" ? "bg-[#eef5e7] text-[#466536]" : "text-stone-400 hover:bg-stone-50 hover:text-stone-600"
            )}
          >
            <ThumbsUp size={13} />
          </button>
          <button
            onClick={() => setLiked(liked === "down" ? null : "down")}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              liked === "down" ? "text-rose-500 bg-rose-50" : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
            )}
          >
            <ThumbsDown size={13} />
          </button>
          <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors">
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
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Related Questions
          </h3>
          <div className="space-y-1.5">
            {message.relatedQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => onRelatedQuestion(q.text)}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all group"
              >
                <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
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
