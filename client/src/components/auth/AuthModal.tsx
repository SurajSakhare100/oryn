"use client";

import { X } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="px-6 pt-8 pb-6 border-b border-zinc-800/80 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-xl">O</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Welcome to Oryn
          </h2>
          <p className="text-sm text-zinc-400">
            Sign in to start saving your chat history
          </p>
        </div>

        <div className="p-6">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
