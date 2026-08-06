"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";

import { getCookie } from "@/lib/cookies";

export default function ChatPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCookie("oryn_token");
    if (!token) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500/80 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <AppLayout />;
}
