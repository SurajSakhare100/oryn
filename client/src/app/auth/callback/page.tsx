"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie } from "@/lib/cookies";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setCookie("oryn_token", token);
      router.replace("/chat");
    } else {
      router.push("/?error=auth_failed");
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      <p>Authenticating...</p>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
      <Suspense fallback={
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
