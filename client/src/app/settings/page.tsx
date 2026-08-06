"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Key, Database, Trash2, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { getCookie } from "@/lib/cookies";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [modelPref, setModelPref] = useState("llama-3.3-70b-versatile");

  useEffect(() => {
    const token = getCookie("oryn_token");
    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }

    const savedModel = localStorage.getItem("oryn_selected_model");
    if (savedModel) {
      setModelPref(savedModel);
    }
  }, [router]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setModelPref(model);
    localStorage.setItem("oryn_selected_model", model);
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear all conversation threads? This action cannot be undone.")) {
      try {
        const token = getCookie("oryn_token");
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          alert("All conversations cleared successfully.");
          router.push("/chat");
        } else {
          alert("Failed to clear history. Please try again.");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500/80 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30 selection:text-teal-200">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-6 mb-10">
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Manage your Oryn engine preferences and account details</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-all duration-200"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Menu / Info Panel */}
          <div className="md:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-zinc-950 text-sm font-bold uppercase">
                  {user?.username ? user.username[0] : "U"}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm truncate">{user?.username}</h3>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 space-y-1">
                <div>Status: <span className="text-teal-400 font-semibold">Active Member</span></div>
                <div>Database: <span className="text-zinc-400 font-semibold">Supabase (Connected)</span></div>
              </div>
            </div>
          </div>

          {/* Right Content / Options Panel */}
          <div className="md:col-span-2 space-y-8">
            {/* Preferences */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
                <Key size={14} className="text-teal-400" />
                <span>Search Preferences</span>
              </h2>

              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Default Synthesis Model</label>
                  <select
                    value={modelPref}
                    onChange={handleModelChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 outline-none focus:border-teal-500/50 transition-colors"
                  >
                    <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile - Default)</option>
                    <option value="mixtral-8x7b-32768">Mixtral 8x7B (Capable)</option>
                    <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</option>
                  </select>
                  <p className="text-[11px] text-zinc-600">
                    This model compiles and formats the final summary answer using RAG references.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy and Account Actions */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
                <Shield size={14} className="text-rose-400" />
                <span>Security & Danger Zone</span>
              </h2>

              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Clear Search History</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Delete all saved conversation threads permanently</p>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 text-xs font-bold transition-all duration-200"
                  >
                    <Trash2 size={13} />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="pt-5 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Prisma Database Push Status</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Synchronize local schemas dynamically with Supabase instance</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 bg-teal-950/30 border border-teal-800/30 px-3 py-1.5 rounded-lg">
                    <Database size={12} />
                    <span>Synched</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
