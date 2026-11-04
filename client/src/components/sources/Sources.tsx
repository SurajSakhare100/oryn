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
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Sources ({sources.length})
        </h3>
        
        {sources.length > 2 && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 text-xs font-medium text-[#587b3f] transition-colors hover:text-[#3f5e32]"
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
            className="group flex items-start gap-2.5 rounded-xl border border-stone-200 bg-white p-2.5 transition-all hover:border-[#cbd9bf] hover:bg-[#fbfcf9]"
          >
            {/* Favicon badge */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-stone-200 bg-[#f4f7f0] text-[10px] font-bold text-stone-500 transition-colors group-hover:border-[#cbd9bf]">
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
                <p className="truncate text-xs font-medium text-stone-700 transition-colors group-hover:text-[#466536]">
                  {source.title}
                </p>
                <ExternalLink size={8} className="shrink-0 text-stone-400 group-hover:text-[#587b3f]" />
              </div>
              <p className="mt-0.5 truncate text-[10px] text-stone-500">{source.description}</p>
            </div>
            <span className="shrink-0 font-mono text-[10px] text-stone-400">[{source.id}]</span>
          </a>
        ))}
      </div>
    </div>
  );
}
