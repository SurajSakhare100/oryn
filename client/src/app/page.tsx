"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Compass, Shield, Zap, Sparkles, Check, ChevronDown,
  ArrowRight, Globe, Database, Layers, Code, Cpu, Terminal
} from "lucide-react";
import { getCookie } from "@/lib/cookies";

// FAQ Data
const FAQS = [
  {
    q: "How does Oryn get fresh data?",
    a: "Unlike traditional LLMs with knowledge cutoff dates, Oryn crawls the live web in real time using high-performance crawling agents. It fetches search results from duckduckgo and directly parses relevant source web pages to answer your questions with current information."
  },
  {
    q: "What are the inline citations?",
    a: "Every key claim in Oryn's answers is backed by a numbered citation. Hovering or clicking on a citation links you directly to the original web page where the fact was crawled, allowing you to easily verify the accuracy."
  },
  {
    q: "Is my search history private?",
    a: "Yes. All conversations are private and secured using JWT. Your chat history is saved to a PostgreSQL database hosted securely with Supabase, and it is never shared with third parties or used to train public LLMs."
  },
  {
    q: "Can I customize the LLM model used?",
    a: "Absolutely. Oryn is built with a flexible model routing system. You can switch between top-performing LLMs like Llama 3.3 (70B), Llama 3.1 (8B) for fast responses, and other supported open-weights models."
  }
];

// Interactive Sandbox Demo tabs
const DEMO_TABS = [
  {
    id: "fusion",
    label: "Fusion Energy",
    query: "What is the latest net energy gain in fusion (Q=1.8)?",
    steps: ["Analyzing intent...", "Searching web for 'fusion energy breakthroughs 2026'...", "Crawling NIF and plasma physics journals...", "Synthesizing answer with sources..."],
    answer: "In early 2026, researchers achieved a record net energy gain of Q=1.8 at the National Ignition Facility using an upgraded hohlraum target design [1]. Concurrently, commercial magnet advancements have enabled compact tokamaks to maintain stable plasma temperatures exceeding 150 million degrees Celsius [2]."
  },
  {
    id: "stocks",
    label: "NVIDIA (NVDA) Stock",
    query: "NVIDIA stock performance today and target overview?",
    steps: ["Analyzing financial query...", "Searching web for 'NVDA stock today analysis 2026'...", "Extracting live market data tickers...", "Synthesizing consensus report..."],
    answer: "NVIDIA (NVDA) is trading up 2.4% following robust forward-guidance on the Blackwell B300 chip lineup [1]. Consensus price target stands at $168.50, backed by a strong demand outlook across hyperscaler datacenters [2]."
  },
  {
    id: "code",
    label: "Next.js 16 Routing",
    query: "How to configure Next.js 16 proxy routing?",
    steps: ["Analyzing dev query...", "Retrieving Next.js 16 official release notes...", "Reading documentation on 'middleware-to-proxy'...", "Synthesizing code snippets..."],
    answer: "Next.js 16 introduced the 'proxy.ts' export file standard (replacing legacy middleware). To define, export a default or named 'proxy' function from your src/proxy.ts file: \n\nexport default function proxy(req: NextRequest) { ... } [1]"
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("fusion");
  const [demoStepIndex, setDemoStepIndex] = useState(3);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const token = getCookie("oryn_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setDemoLoading(true);
    setDemoStepIndex(0);

    // Simulate query execution steps
    const timer = setInterval(() => {
      setDemoStepIndex((prev) => {
        if (prev >= 3) {
          clearInterval(timer);
          setDemoLoading(false);
          return 3;
        }
        return prev + 1;
      });
    }, 600);
  };

  const currentDemo = DEMO_TABS.find((t) => t.id === activeTab) || DEMO_TABS[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200 overflow-y-auto">
      {/* Navbar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="text-white font-extrabold text-sm">O</span>
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Oryn</span>
          </div>

          <nav className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/chat"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 text-zinc-950 hover:from-teal-400 hover:to-cyan-500 transition-all duration-200 shadow-md shadow-teal-500/10 hover:shadow-teal-400/20 hover:scale-[1.02]"
              >
                Go to Chat
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-600 text-zinc-950 hover:from-teal-400 hover:to-cyan-500 transition-all duration-200 shadow-md shadow-teal-500/10 hover:shadow-teal-400/20 hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Wrap */}
      <main className="flex-1 flex flex-col items-center">

        {/* HERO SECTION */}
        <section className="w-full max-w-7xl px-6 pt-24 pb-16 text-center relative overflow-hidden flex flex-col items-center">
          {/* Ambient Decorative Blurs */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-4xl mx-auto space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-teal-400 text-xs font-semibold tracking-wide">
              <Sparkles size={12} className="animate-pulse" />
              Next-Generation AI Search Engine
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Search the live web.<br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
                Synthesize answers.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
              Oryn is an open-source, citation-first search assistant that crawls references dynamically, routing requests to powerful LLMs for clear, verified answers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={isLoggedIn ? "/chat" : "/signup"}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-teal-400 to-cyan-500 text-zinc-950 hover:from-teal-300 hover:to-cyan-400 shadow-xl shadow-teal-500/15 hover:shadow-teal-400/35 transition-all duration-300 hover:scale-[1.03] text-center"
              >
                Start Searching Free
              </Link>
              <Link
                href={isLoggedIn ? "/chat" : "/login"}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-zinc-200 border border-zinc-800 hover:bg-zinc-900/60 transition-all duration-300 text-center"
              >
                Try Live Sandbox
              </Link>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEMO SANDBOX */}
        <section className="w-full max-w-5xl px-6 py-12 z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Experience Real-Time Web RAG</h2>
            <p className="text-sm text-zinc-400 mt-2">Select a question to inspect Oryn's background crawling and synthesis pipeline</p>
          </div>

          <div className="flex justify-center gap-3 mb-6 overflow-x-auto pb-2">
            {DEMO_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                  ? "bg-teal-500/10 border-teal-500/50 text-teal-400"
                  : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-0.5 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-2xl">
            <div className="bg-zinc-900/95 rounded-[14px] overflow-hidden border border-zinc-800/50 p-6 md:p-8 space-y-6">

              {/* Fake UI Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
                <div className="px-4 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-600 font-mono w-1/2 sm:w-1/3 text-center truncate">
                  oryn.ai/search?q={currentDemo.id}
                </div>
                <div className="w-12" />
              </div>

              {/* Sandbox Input Area */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-teal-400 text-xs font-mono font-bold mt-0.5">
                    Q
                  </div>
                  <div className="text-base md:text-lg font-semibold text-zinc-100">
                    {currentDemo.query}
                  </div>
                </div>

                {/* Progress Pipeline */}
                <div className="bg-zinc-950/80 border border-zinc-800/60 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-2 mb-2">
                    Execution Steps
                  </div>
                  {currentDemo.steps.map((step, idx) => {
                    const isPassed = idx <= demoStepIndex;
                    const isActive = idx === demoStepIndex && demoLoading;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 text-xs font-mono transition-opacity duration-300 ${isPassed ? "text-teal-400 opacity-100" : "text-zinc-600 opacity-40"
                          }`}
                      >
                        {isActive ? (
                          <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                        ) : isPassed ? (
                          <Check size={10} className="text-teal-500 stroke-[3]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        )}
                        <span>{step}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Response Pane */}
                <div className="border-t border-zinc-800/40 pt-4 space-y-3">
                  <div className="text-xs font-semibold text-teal-400 flex items-center gap-2">
                    <Terminal size={12} />
                    Synthesized Response
                  </div>
                  <div className="text-sm md:text-base text-zinc-300 leading-relaxed min-h-[60px] whitespace-pre-line">
                    {demoLoading ? (
                      <div className="flex items-center gap-2 text-zinc-500 text-xs italic">
                        <span className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Oryn is thinking...
                      </div>
                    ) : (
                      currentDemo.answer
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CORE FEATURES GRID */}
        <section className="w-full max-w-7xl px-6 py-20 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Engineered for Accuracy</h2>
            <p className="text-zinc-400 mt-3 text-base">We combine deep indexing algorithms with rapid inference pipelines for verified knowledge generation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-teal-950/50 border border-teal-800/50 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                <Globe size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Live Web Crawling</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Queries search engines dynamically, fetches target pages, and parses DOM trees instantly to pull latest context.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-teal-950/50 border border-teal-800/50 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                <Database size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Supabase Sync</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Connects directly to your own Supabase PostgreSQL database for persistent, encrypted message storing and query caching.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-teal-950/50 border border-teal-800/50 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                <Cpu size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Multi-Model Routing</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Routes queries to Groq-hosted open-weights models like Llama 3.3 for high-speed, cost-effective inference.
              </p>
            </div>
          </div>
        </section>

        {/* TIMELINE: HOW IT WORKS */}
        <section className="w-full max-w-5xl px-6 py-16 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">How Oryn Answers Questions</h2>
            <p className="text-sm text-zinc-400 mt-2">A four-step pipeline structured to avoid LLM hallucinations</p>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 sm:before:left-1/2 before:w-0.5 before:bg-zinc-800/60">

            {/* Step 1 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:justify-between group">
              <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-900 border-2 border-teal-500/80 flex items-center justify-center text-xs font-bold text-teal-400 z-10">
                1
              </div>
              <div className="pl-12 sm:pl-0 sm:w-[45%] text-left sm:text-right">
                <h4 className="text-lg font-bold text-white">Query Analysis</h4>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  The engine identifies query intent, extracts keywords, determines whether it needs web search, and reformulates query variations.
                </p>
              </div>
              <div className="hidden sm:block w-[45%]" />
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:justify-between group">
              <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-900 border-2 border-teal-500/80 flex items-center justify-center text-xs font-bold text-teal-400 z-10">
                2
              </div>
              <div className="hidden sm:block w-[45%]" />
              <div className="pl-12 sm:pl-0 sm:w-[45%] text-left">
                <h4 className="text-lg font-bold text-white">Parallel Crawling</h4>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  Fetches direct search links. We spin up asynchronous page parsers to download raw text and meta structures from the top-ranking web domains.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:justify-between group">
              <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-900 border-2 border-teal-500/80 flex items-center justify-center text-xs font-bold text-teal-400 z-10">
                3
              </div>
              <div className="pl-12 sm:pl-0 sm:w-[45%] text-left sm:text-right">
                <h4 className="text-lg font-bold text-white">Context Compacting</h4>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  Parsed documents are ranked. Only relevant text fragments are packed into the LLM system prompt context, discarding useless markup and ads.
                </p>
              </div>
              <div className="hidden sm:block w-[45%]" />
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col sm:flex-row items-start sm:justify-between group">
              <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-900 border-2 border-teal-500/80 flex items-center justify-center text-xs font-bold text-teal-400 z-10">
                4
              </div>
              <div className="hidden sm:block w-[45%]" />
              <div className="pl-12 sm:pl-0 sm:w-[45%] text-left">
                <h4 className="text-lg font-bold text-white">Synthesized Output</h4>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                  The LLM crafts the answer while forcing strict inline referencing. The result is a readable response backed by clickable references.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* WHY ORYN COMPARISON */}
        <section className="w-full max-w-5xl px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Why Choose Oryn?</h2>
            <p className="text-sm text-zinc-400 mt-2">How we compare to traditional search engines and static LLMs</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-md">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 font-semibold text-zinc-200">
                  <th className="p-5">Feature</th>
                  <th className="p-5 text-teal-400">Oryn AI</th>
                  <th className="p-5 text-zinc-400">Traditional Search</th>
                  <th className="p-5 text-zinc-400">Static LLM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-400">
                <tr>
                  <td className="p-5 font-bold text-zinc-300">Answers Complex Queries</td>
                  <td className="p-5 text-teal-400 font-medium">Yes (Synthesized)</td>
                  <td className="p-5">No (List of links)</td>
                  <td className="p-5">Yes (But cuts off)</td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-zinc-300">Live Web Access</td>
                  <td className="p-5 text-teal-400 font-medium">Yes (Real-time crawling)</td>
                  <td className="p-5">Yes (Indexed sites)</td>
                  <td className="p-5">No (Static cutoff)</td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-zinc-300">Inline Citations</td>
                  <td className="p-5 text-teal-400 font-medium">Yes (Clickable sources)</td>
                  <td className="p-5">No</td>
                  <td className="p-5">Rarely (Unreliable)</td>
                </tr>
                <tr>
                  <td className="p-5 font-bold text-zinc-300">Privacy Control</td>
                  <td className="p-5 text-teal-400 font-medium">Yes (Own DB config)</td>
                  <td className="p-5">No (Ad-tracked profiles)</td>
                  <td className="p-5">No (Data training)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ACCESS / PRICING TIERS */}
        <section className="w-full max-w-6xl px-6 py-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Flexible Access Tiers</h2>
            <p className="text-sm text-zinc-400 mt-2">Get started for free or upgrade for professional search limits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-md flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-white">Hobby</h4>
                  <p className="text-xs text-zinc-500 mt-1">For casual everyday queries</p>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  $0 <span className="text-xs font-normal text-zinc-500">/ forever</span>
                </div>
                <ul className="space-y-3.5 text-xs text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-400" />
                    Llama 3.1 Inference models
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-400" />
                    Standard Live Web Search
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-400" />
                    100 Queries per day
                  </li>
                </ul>
              </div>
              <Link
                href={isLoggedIn ? "/chat" : "/signup"}
                className="mt-8 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold text-xs text-center hover:bg-zinc-850 hover:text-white transition-colors"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Creator Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-teal-950/20 to-zinc-900/60 border-2 border-teal-500/50 backdrop-blur-md flex flex-col justify-between relative hover:scale-[1.02] transition-transform">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-zinc-950 text-[10px] font-extrabold uppercase tracking-wider shadow-lg">
                Most Popular
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-white">Creator</h4>
                  <p className="text-xs text-zinc-400 mt-1">For power users and developers</p>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  $12 <span className="text-xs font-normal text-zinc-400">/ month</span>
                </div>
                <ul className="space-y-3.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-400" />
                    Access to Llama 3.3 70B models
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-400" />
                    Deep multi-page site crawling
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-400" />
                    Unlimited chat history storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-400" />
                    Priority Groq API bandwidth
                  </li>
                </ul>
              </div>
              <Link
                href={isLoggedIn ? "/chat" : "/signup"}
                className="mt-8 py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 text-zinc-950 font-bold text-xs text-center hover:from-teal-300 hover:to-cyan-400 shadow-md shadow-teal-500/10 transition-all"
              >
                Go Creator
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-md flex flex-col justify-between hover:scale-[1.01] transition-transform">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-white">Enterprise</h4>
                  <p className="text-xs text-zinc-500 mt-1">For corporate internal query lines</p>
                </div>
                <div className="text-3xl font-extrabold text-white">
                  Custom
                </div>
                <ul className="space-y-3.5 text-xs text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-400" />
                    Self-hosted Docker configurations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-400" />
                    Dedicated API key integrations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-teal-400" />
                    SLA response uptime metrics
                  </li>
                </ul>
              </div>
              <Link
                href="mailto:support@oryn.ai"
                className="mt-8 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold text-xs text-center hover:bg-zinc-850 hover:text-white transition-colors"
              >
                Contact Sales
              </Link>
            </div>

          </div>
        </section>

        {/* FAQ ACCORDION SECTION */}
        <section className="w-full max-w-4xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-sm text-zinc-400 mt-2">Everything you need to know about the engine operations</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 flex items-center justify-between text-left text-zinc-200 hover:text-white hover:bg-zinc-900/30 transition-colors"
                  >
                    <span className="font-bold text-sm md:text-base">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-teal-400" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-5 border-t border-zinc-900 text-sm text-zinc-400 leading-relaxed bg-zinc-950/20">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 bg-zinc-950 text-center text-xs text-zinc-600">
        <p>© 2026 Oryn. Powered by Groq, Next.js, and Supabase. Built with precision.</p>
      </footer>
    </div>
  );
}
