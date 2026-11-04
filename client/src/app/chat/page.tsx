"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";

export default function ChatPage() {
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, router, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500/80 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <AppLayout />;
}
