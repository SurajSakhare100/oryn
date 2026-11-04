"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "@/lib/cookies";
import { getApiErrorMessage } from "@/lib/api-errors";

const API_BASE_URL = "";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode: "popup";
        auto_select: boolean;
      }) => void;
      renderButton: (element: HTMLElement, options: {
        type: "standard";
        theme: "outline";
        size: "large";
        text: "continue_with";
        shape: "rectangular";
        logo_alignment: "left";
        width: number;
      }) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityApi;
  }
}

export default function GoogleSignInButton() {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    const initializeGoogleButton = () => {
      if (cancelled || !clientId || !buttonRef.current || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: "popup",
        auto_select: false,
        callback: async ({ credential }) => {
          setIsSigningIn(true);
          setError("");
          try {
            const response = await fetch(`${API_BASE_URL}/api/auth/google/credential`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential }),
            });
            if (!response.ok) {
              throw new Error(await getApiErrorMessage(response, "Google sign-in failed. Please try again."));
            }
            const data = await response.json();
            if (typeof data.token !== "string") throw new Error("Google sign-in returned an invalid response. Please try again.");
            setCookie("oryn_token", data.token);
            router.replace("/chat");
            router.refresh();
          } catch (signInError) {
            setIsSigningIn(false);
            setError(signInError instanceof Error ? signInError.message : "Google sign-in failed. Please try again.");
          }
        },
      });
      buttonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: Math.max(240, Math.min(buttonRef.current.clientWidth, 400)),
      });
    };

    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleButton();
        return;
      }
      const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener("load", initializeGoogleButton, { once: true });
        return;
      }
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleButton;
      script.onerror = () => setError("Could not load Google sign-in. Check your connection and try again.");
      document.head.appendChild(script);
    };

    fetch(`${API_BASE_URL}/api/auth/google/client-config`)
      .then(async (response) => {
        if (!response.ok) throw new Error(await getApiErrorMessage(response, "Google sign-in is unavailable."));
        const data = await response.json();
        if (typeof data.clientId !== "string") throw new Error("Google sign-in is not configured.");
        if (!cancelled) setClientId(data.clientId);
      })
      .catch((configError: unknown) => {
        if (!cancelled) setError(configError instanceof Error ? configError.message : "Google sign-in is unavailable.");
      });
    loadGoogleScript();

    return () => {
      cancelled = true;
      if (script) script.onload = null;
    };
  }, [clientId, router]);

  return (
    <div className="w-full">
      <div ref={buttonRef} className="min-h-10 w-full" aria-label="Continue with Google" />
      {isSigningIn && <p className="mt-2 text-center text-xs text-stone-500">Signing you in…</p>}
      {error && <p role="alert" className="mt-2 text-center text-xs text-rose-600">{error}</p>}
    </div>
  );
}
