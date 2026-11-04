"use client";

import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/chat");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col relative">
      {/* Header */}
      <div className="p-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-900 font-medium text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <Link
              href="/"
              className="flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 mb-6 shadow-lg shadow-teal-600/10"
            >
              <span className="text-white font-bold text-2xl">O</span>
            </Link>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Welcome to Oryn</h1>
            <p className="text-stone-500 text-center text-sm">
              Sign in to save your search history and personalized settings.
            </p>
          </div>

          <GoogleSignInButton />

          <div className="mt-8 pt-6 border-t border-stone-200/60 text-center">
            <p className="text-xs text-stone-400">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
