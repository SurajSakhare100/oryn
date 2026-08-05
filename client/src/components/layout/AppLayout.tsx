"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/sidebar/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";

export default function AppLayout() {
  const { user, token, login, signup, logout } = useAuth();
  const {
    conversations,
    activeConversation,
    activeId,
    isLoading,
    thinkingStep,
    newChat,
    selectConversation,
    sendMessage,
    availableModels,
    selectedModel,
    setSelectedModel,
    webSearchEnabled,
    setWebSearchEnabled,
  } = useChat(token);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNewChat={newChat}
          user={user}
          onLogout={logout}
          onLoginClick={() => setAuthModalOpen(true)}
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
                activeId={activeId}
                onSelect={(id) => { selectConversation(id); setMobileOpen(false); }}
                onNewChat={() => { newChat(); setMobileOpen(false); }}
                user={user}
                onLogout={logout}
                onLoginClick={() => { setAuthModalOpen(true); setMobileOpen(false); }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Menu size={18} />
            </button>
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">O</span>
            </div>
            <span className="text-sm font-semibold text-white">Oryn</span>
          </div>

          {!user && (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-teal-500 text-zinc-950 hover:bg-teal-400 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

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
      </div>

      {/* Authentication Modal Popup */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          login={login}
          signup={signup}
        />
      )}
    </div>
  );
}
