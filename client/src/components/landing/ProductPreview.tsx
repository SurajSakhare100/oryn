"use client";

import { useState } from "react";
import { Globe2, LockKeyhole, Search, ArrowUp } from "lucide-react";

export default function ProductPreview({ onAsk }: { onAsk: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const submit = () => { if (query.trim()) onAsk(query.trim()); };

  return (
    <section id="demo" className="bg-[#fbfcf9] px-4 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
        <span className="text-[10px] font-bold tracking-[0.16em] text-[#718266]">A LOOK INSIDE ORYN</span>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#17211a] sm:text-4xl">A calm place to find your answer.</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-stone-500">One clear workspace for your question, the answer, and the sources behind it.</p>
      </div>
      <div className="mx-auto grid min-h-[410px] max-w-5xl overflow-hidden rounded-2xl border border-[#e3e8e1] bg-white shadow-[0_25px_70px_rgba(28,53,35,0.13)] md:min-h-[460px] md:grid-cols-[190px_1fr]">
        <aside className="relative hidden border-r border-[#edf0eb] bg-[#f8faf7] p-5 md:block">
          <div className="pb-8 text-sm font-bold tracking-tight text-[#17211a]">oryn <span className="text-lime-600"></span></div>
          <div className="mb-1 flex h-9 items-center gap-2 rounded-lg bg-[#eaf2e4] px-3 text-xs font-medium text-[#344b34]"><Search size={13} /> Search</div>
          <div className="flex h-9 items-center gap-2 rounded-lg px-3 text-xs text-[#7a857e]"><Globe2 size={13} /> Sources</div>
          <div className="flex h-9 items-center gap-2 rounded-lg px-3 text-xs text-[#7a857e]"><LockKeyhole size={13} /> Private history</div>
          <div className="absolute inset-x-4 bottom-4 flex items-center gap-2 border-t border-[#e6ebe4] pt-4 text-[10px] text-[#69756b]"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#d9efae] font-bold text-[#486034]">O</span> Your workspace</div>
        </aside>
        <div className="p-5 sm:p-8 md:p-10">
          <div className="flex items-center justify-between text-[9px] tracking-[0.12em] text-[#89938b]"><span>NEW SEARCH</span><span className="rounded border border-[#e6eae4] px-2 py-1 normal-case tracking-normal">⌘ K</span></div>
          <h3 className="mt-8 text-xl font-medium tracking-tight text-[#1d2a21] sm:text-2xl">What would you like to understand?</h3>
          <div className="mt-4 flex h-13 items-center gap-3 rounded-xl border border-[#dfe6dc] bg-white p-1.5 pl-4 shadow-sm focus-within:border-lime-400 focus-within:ring-4 focus-within:ring-lime-100/70">
            <input aria-label="Try a search" placeholder="Ask a question or explore a topic…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} className="min-w-0 flex-1 bg-transparent text-xs text-[#18231b] outline-none placeholder:text-[#a2aaa3]" />
            <button aria-label="Search" onClick={submit} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-lime-300 text-[#28351e] transition hover:bg-lime-400"><ArrowUp size={16} /></button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2"><span className="mr-1 text-[9px] text-[#9aa39b]">Try asking</span>
            <button onClick={() => setQuery("What are some easy dinners I can make this week?")} className="rounded-full border border-[#edf0eb] px-3 py-1.5 text-[9px] text-[#667168] transition hover:bg-[#f8faf6]">Easy dinners for this week</button>
            <button onClick={() => setQuery("What should I see on a first trip to Kyoto?")} className="rounded-full border border-[#edf0eb] px-3 py-1.5 text-[9px] text-[#667168] transition hover:bg-[#f8faf6]">A first trip to Kyoto</button>
          </div>
          <div className="mt-7 border-t border-[#edf0eb] pt-5">
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-[#61705d]"><span className="text-base text-lime-600">✳</span> ORYN ANSWER <span className="ml-auto font-normal normal-case tracking-normal text-[#8c978e]">3 sources checked</span></div>
            <p className="mt-3 max-w-2xl font-serif text-sm leading-6 text-[#424c44]">Good research begins with the sources. Oryn looks across current pages, then connects the useful details into one answer you can follow up on.</p>
            <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[#f8faf6] px-3 py-1.5 text-[9px] text-[#667168]">↗ Helpful guide</span><span className="rounded-full bg-[#f8faf6] px-3 py-1.5 text-[9px] text-[#667168]">↗ Trusted source</span><span className="rounded-full bg-[#f8faf6] px-3 py-1.5 text-[9px] text-[#667168]">↗ More to explore</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
