"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MessageSquare,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Clock,
  LogIn,
} from "lucide-react";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  user: { id: string; email: string } | null;
  onLogout: () => void;
  onLoginClick: () => void;
}

function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  user,
  onLogout,
  onLoginClick,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(true);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 280 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-zinc-950 border-r border-zinc-800 overflow-hidden shrink-0"
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">O</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-white font-semibold text-base tracking-tight whitespace-nowrap"
            >
              Oryn
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* New chat button */}
      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg px-3 py-2.5 text-sm font-medium",
            "bg-teal-500/10 text-teal-400 border border-teal-500/20",
            "hover:bg-teal-500/20 transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <Plus size={16} className="shrink-0" />
          {!collapsed && <span>New Search</span>}
        </button>
      </div>

      {/* Search */}
      {!collapsed && user && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
            <Search size={14} className="text-zinc-500 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threads..."
              className="bg-transparent text-sm text-zinc-300 placeholder:text-zinc-600 outline-none w-full"
            />
          </div>
        </div>
      )}

      {/* History */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {!collapsed && (
          <p className="text-xs text-zinc-600 uppercase tracking-wider px-2 py-2 font-medium">
            Recent
          </p>
        )}
        {user ? (
          filtered.length === 0 ? (
            !collapsed && <p className="text-xs text-zinc-600 px-2 py-4 italic">No threads found</p>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors group",
                  activeId === conv.id
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <MessageSquare
                  size={14}
                  className={cn(
                    "shrink-0",
                    activeId === conv.id ? "text-teal-400" : "text-zinc-600 group-hover:text-zinc-400"
                  )}
                />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{conv.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="text-zinc-600" />
                      <span className="text-xs text-zinc-600">{timeAgo(conv.timestamp)}</span>
                    </div>
                  </div>
                )}
              </button>
            ))
          )
        ) : (
          !collapsed && (
            <div className="px-3 py-6 text-center border border-dashed border-zinc-800/80 rounded-xl m-2 bg-zinc-900/20">
              <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                Sign in to save and view your search history.
              </p>
              <button
                onClick={onLoginClick}
                className="w-full py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-teal-400 transition-colors"
              >
                Sign In
              </button>
            </div>
          )
        )}
      </div>

      {/* User profile */}
      <div className="border-t border-zinc-800 px-3 py-3 flex items-center gap-3">
        {user ? (
          <>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 text-white text-xs font-bold uppercase">
              {user.email[0]}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {user.email.split("@")[0]}
                </p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Log Out"
              >
                <LogIn size={14} className="rotate-180" />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className={cn(
              "flex items-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors justify-center",
              collapsed && "px-0"
            )}
          >
            <LogIn size={14} className="shrink-0" />
            {!collapsed && <span>Sign In</span>}
          </button>
        )}
      </div>
    </motion.aside>
  );
}
