"use client";

import Link from "next/link";
import { Search, Compass, Shield, Zap, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/cookies";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = getCookie("oryn_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
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

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Ambient Decorative Blurs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-teal-400 text-xs font-semibold tracking-wide">
            <Sparkles size={12} className="animate-pulse" />
            Next-Gen AI Answer Engine
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Search anything.<br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent">
              Understand instantly.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Oryn is a fast, citation-focused search engine that crawls the live web to synthesize structured, verified answers using advanced LLMs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href={isLoggedIn ? "/chat" : "/signup"}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-teal-400 to-cyan-500 text-zinc-950 hover:from-teal-300 hover:to-cyan-400 shadow-xl shadow-teal-500/10 hover:shadow-teal-400/30 transition-all duration-300 hover:scale-[1.03] text-center"
            >
              Start Searching for Free
            </Link>
            <Link
              href={isLoggedIn ? "/chat" : "/login"}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-zinc-200 border border-zinc-800 hover:bg-zinc-900/60 transition-all duration-300 text-center"
            >
              Try Demo
            </Link>
          </div>
        </div>

        {/* Feature Preview Card */}
        <div className="max-w-5xl mx-auto mt-20 w-full relative z-10">
          <div className="p-1 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 shadow-2xl shadow-black/80">
            <div className="bg-zinc-900/90 rounded-[14px] overflow-hidden border border-zinc-800/50 p-6 md:p-8 text-left space-y-6">
              {/* Fake UI Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-800" />
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-800" />
                  <div className="w-3.5 h-3.5 rounded-full bg-zinc-800" />
                </div>
                <div className="px-4 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-500 w-1/3 text-center">
                  oryn.ai/search
                </div>
                <div className="w-10" />
              </div>

              {/* Fake UI Search Query */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-lg font-semibold text-white">
                  <div className="w-6 h-6 rounded-md bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-sm">Q</div>
                  What are the latest breakthroughs in fusion energy for 2026?
                </div>

                <div className="border-t border-zinc-800/50 pt-4 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-950/20 border border-teal-800/30 px-3 py-1.5 rounded-lg w-max">
                    <Search size={12} className="animate-spin" />
                    Searching Web and synthesizing citations...
                  </div>

                  <div className="text-sm text-zinc-400 space-y-3 leading-relaxed">
                    <p>
                      In early 2026, researchers achieved a record net energy gain of Q=1.8 at the National Ignition Facility using an upgraded target design <span className="text-teal-400 font-semibold text-xs bg-teal-950/40 border border-teal-800/40 px-1.5 py-0.5 rounded ml-1">[1]</span>. Concurrently, commercial magnet advancements have enabled compact tokamaks to maintain stable plasma temperatures exceeding 150 million degrees Celsius <span className="text-teal-400 font-semibold text-xs bg-teal-950/40 border border-teal-800/40 px-1.5 py-0.5 rounded ml-1">[2]</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 w-full">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-left hover:border-zinc-700/80 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-teal-950/50 border border-teal-800/50 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
              <Compass size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Web RAG Search</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Fetches up-to-the-minute reports from search engines and parses source pages directly to compile comprehensive responses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-left hover:border-zinc-700/80 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-teal-950/50 border border-teal-800/50 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
              <Zap size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Diverse Model Suite</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Switch seamlessly between model powerhouses like Llama-3.3 70B, Mixtral 8x7B, and fast real-time search models.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-left hover:border-zinc-700/80 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-teal-950/50 border border-teal-800/50 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Private & Secure</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              All messages are private, authenticated securely with JWT, and safely stored in your personal Supabase project database.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 bg-zinc-950 text-center text-xs text-zinc-600">
        <p>© 2026 Oryn. Powered by Groq, Next.js, and Supabase. Built with precision.</p>
      </footer>
    </div>
  );
}
