"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Source } from "@/lib/types";

interface SourcesProps {
  sources: Source[];
}

export default function Sources({ sources }: SourcesProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  // By default (closed), show up to 2 sources
  const visibleSources = isOpen ? sources : sources.slice(0, 2);
  const remainingCount = sources.length - visibleSources.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Sources ({sources.length})
        </h3>
        
        {sources.length > 2 && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors"
          >
            {isOpen ? (
              <>
                <span>Show Less</span>
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                <span>Open All ({remainingCount} more)</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {visibleSources.map((source) => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all group"
          >
            {/* Favicon badge */}
            <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0 group-hover:border-teal-500/40 transition-colors">
              {source.favicon && source.favicon.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={source.favicon} alt="" className="w-3.5 h-3.5 object-contain" onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }} />
              ) : (
                source.favicon || "🌐"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium text-zinc-300 truncate group-hover:text-teal-400 transition-colors">
                  {source.title}
                </p>
                <ExternalLink size={8} className="text-zinc-600 shrink-0 group-hover:text-teal-500" />
              </div>
              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{source.description}</p>
            </div>
            <span className="text-[10px] text-zinc-600 shrink-0 font-mono">[{source.id}]</span>
          </a>
        ))}
      </div>
    </div>
  );
}
