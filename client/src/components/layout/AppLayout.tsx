"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout({ children, requireAuth = false }: { children?: ReactNode; requireAuth?: boolean }) {
  const router = useRouter();
  const { user, token, loading: authLoading, logout } = useAuth();
  const {
    conversations,
    isLoadingHistory,
    historyError,
    refreshConversations,
    activeConversation,
    activeId,
    isLoading,
    thinkingStep,
    newChat,
    selectConversation,
    deleteConversation,
    sendMessage,
    availableModels,
    selectedModel,
    setSelectedModel,
    webSearchEnabled,
    setWebSearchEnabled,
  } = useChat(token);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (requireAuth && !authLoading && !token) router.replace("/login");
  }, [authLoading, requireAuth, router, token]);

  if (requireAuth && (authLoading || !token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfcf9]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#466536] border-t-transparent" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbfcf9] font-sans text-[#15201b]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          conversations={conversations}
          isLoadingHistory={isLoadingHistory}
          historyError={historyError}
          onRefreshHistory={refreshConversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNewChat={newChat}
          onDelete={deleteConversation}
          user={user}
          onLogout={handleLogout}
          onLoginClick={() => router.push("/login")}
        />
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed left-0 top-0 bottom-0 z-40 md:hidden w-[280px]"
            >
              <Sidebar
                conversations={conversations}
                isLoadingHistory={isLoadingHistory}
                historyError={historyError}
                onRefreshHistory={refreshConversations}
                activeId={activeId}
                onSelect={(id) => { selectConversation(id); setMobileOpen(false); }}
                onNewChat={() => { newChat(); setMobileOpen(false); }}
                onDelete={deleteConversation}
                user={user}
                onLogout={handleLogout}
                onLoginClick={() => { router.push("/login"); setMobileOpen(false); }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              <Menu size={18} />
            </button>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#466536]">
              <span className="text-xs font-bold text-white">O</span>
            </div>
            <span className="text-sm font-semibold text-[#17211a]">Oryn</span>
          </div>

          {!user && (
            <button
              onClick={() => router.push("/login")}
              className="rounded-lg bg-lime-300 px-3 py-1 text-xs font-semibold text-[#26351e] transition-colors hover:bg-lime-400"
            >
              Sign In
            </button>
          )}
        </div>

        {children ?? (
          <ChatWindow
            conversation={activeConversation}
            isLoading={isLoading}
            thinkingStep={thinkingStep}
            onSend={sendMessage}
            availableModels={availableModels}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            webSearchEnabled={webSearchEnabled}
            setWebSearchEnabled={setWebSearchEnabled}
          />
        )}
      </div>
    </div>
  );
}

