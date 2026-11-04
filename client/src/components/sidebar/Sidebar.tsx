import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search, Plus, MessageSquare,
  Clock, LogIn, Settings as SettingsIcon, Trash2,
} from "lucide-react";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => Promise<void>;
  user: { id: string; email: string; username: string } | null;
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
  onDelete,
  user,
  onLogout,
  onLoginClick,
}: SidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.aside
      className="relative flex h-full w-[280px] shrink-0 flex-col overflow-hidden border-r border-stone-200/80 bg-white font-sans"
    >


      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-4 py-5 border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#466536]">
          <span className="text-white font-bold text-sm">O</span>
        </div>
        <span className="whitespace-nowrap text-base font-semibold tracking-tight text-stone-900">Oryn</span>
      </Link>

      {/* New chat button */}
      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className={cn(
            "flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm font-medium",
            "border border-[#dce8d1] bg-[#eef5e7] text-[#466536]",
            "transition-colors hover:bg-[#e5efd9]",
          )}
        >
          <Plus size={16} className="shrink-0" />
          <span>New Search</span>
        </button>
      </div>

      {/* Search */}
      {user && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-2">
            <Search size={14} className="text-stone-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threads..."
              className="bg-transparent text-sm text-stone-700 placeholder:text-stone-400 outline-none w-full"
            />
          </div>
        </div>
      )}

      {/* History */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        <p className="px-2 py-2 text-xs font-medium uppercase tracking-wider text-stone-400">Recent</p>
        {user ? (
          filtered.length === 0 ? (
            <p className="px-2 py-4 text-xs italic text-stone-400">No threads found</p>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-1 rounded-xl transition-colors",
                  activeId === conv.id
                    ? "bg-[#eef5e7] text-[#26351e]"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                )}
              >
                <button
                  onClick={() => onSelect(conv.id)}
                  aria-label={`Open ${conv.title}`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2.5 text-left"
                >
                  <MessageSquare
                    size={14}
                    className={cn(
                      "shrink-0",
                      activeId === conv.id ? "text-[#587b3f]" : "text-stone-400 group-hover:text-stone-500"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{conv.title}</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <Clock size={10} className="text-stone-400" />
                      <span className="text-xs text-stone-400">{timeAgo(conv.timestamp)}</span>
                    </div>
                  </div>
                </button>
                <button
                    type="button"
                    aria-label={`Delete ${conv.title}`}
                    title="Delete conversation"
                    onClick={async (event) => {
                      event.stopPropagation();
                      if (!window.confirm(`Delete “${conv.title}”? This cannot be undone.`)) return;
                      try {
                        await onDelete(conv.id);
                      } catch (error) {
                        window.alert(error instanceof Error ? error.message : "Could not delete this conversation.");
                      }
                    }}
                    className="mr-1 rounded-lg p-2 text-stone-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 focus:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                </button>
              </div>
            ))
          )
        ) : (
          (
            <div className="px-3 py-6 text-center border border-dashed border-stone-200 rounded-xl m-2 bg-stone-50/50">
              <p className="text-xs text-stone-400 leading-relaxed mb-3">
                Sign in to save and view your search history.
              </p>
              <button
                onClick={onLoginClick}
                className="w-full rounded-lg border border-stone-200 bg-white py-2 text-xs font-semibold text-[#587b3f] transition-colors hover:bg-stone-50"
              >
                Sign In
              </button>
            </div>
          )
        )}
      </div>

      {/* Settings Navigation */}
      {user && (
        <div className="px-3 py-1">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm font-medium",
              "text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors",
            )}
          >
            <SettingsIcon size={16} className="shrink-0" />
            <span>Settings</span>
          </Link>
        </div>
      )}

      {/* User profile */}
      <div className="border-t border-stone-100 px-3 py-3 flex items-center gap-3">
        {user ? (
          <>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#466536] text-xs font-bold uppercase text-white">
              {user.username ? user.username[0] : user.email[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-900">
                {user.username || user.email.split("@")[0]}
              </p>
              <p className="truncate text-xs text-stone-400">{user.email}</p>
            </div>
            <button
                onClick={onLogout}
                className="p-1.5 rounded-md text-stone-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                title="Log Out"
              >
                <LogIn size={14} className="rotate-180" />
            </button>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className={cn(
              "flex items-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-stone-500 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 transition-colors justify-center",
            )}
          >
            <LogIn size={14} className="shrink-0" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </motion.aside>
  );
}
