"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Database, KeyRound, Shield, Trash2, UserRound } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { getCookie } from "@/lib/cookies";
import { getApiErrorMessage } from "@/lib/api-errors";

const API_BASE_URL = "";
const MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];
const MODEL_PREFERENCE_EVENT = "oryn-model-preference-change";

function getSavedModel() {
  if (typeof window === "undefined") return MODELS[0];
  const savedModel = localStorage.getItem("oryn_selected_model");
  return savedModel && MODELS.includes(savedModel) ? savedModel : MODELS[0];
}

function subscribeToModelPreference(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(MODEL_PREFERENCE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(MODEL_PREFERENCE_EVENT, onChange);
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const modelPref = useSyncExternalStore(subscribeToModelPreference, getSavedModel, () => MODELS[0]);
  const [isClearing, setIsClearing] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!getCookie("oryn_token")) {
      router.replace("/login");
      return;
    }
  }, [router]);

  const handleClearHistory = async () => {
    if (!window.confirm("Delete all saved conversations? This cannot be undone.")) return;
    setIsClearing(true);
    setNotice("");
    try {
      const token = getCookie("oryn_token");
      const response = await fetch(`${API_BASE_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(await getApiErrorMessage(response, "Could not load your conversations."));
      const conversations = await response.json();
      const results = await Promise.all(conversations.map((conversation: { id: string }) =>
        fetch(`${API_BASE_URL}/api/conversations/${encodeURIComponent(conversation.id)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      ));
      const failedResponse = results.find((result) => !result.ok);
      if (failedResponse) throw new Error(await getApiErrorMessage(failedResponse, "Some conversations could not be deleted."));
      setNotice("All conversations deleted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not clear your history.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AppLayout>
      <main className="flex-1 overflow-y-auto bg-[#fbfcf9] px-5 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-8">
          <header className="border-b border-stone-200 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587b3f]">Your workspace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#17211a]">Settings</h1>
            <p className="mt-1 text-sm text-stone-500">Manage your account, answer preferences, and saved searches.</p>
          </header>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef5e7] text-[#466536]"><UserRound size={17} /></span>
              <div>
                <h2 className="text-sm font-semibold text-stone-800">Account</h2>
                <p className="text-xs text-stone-500">Your signed-in profile</p>
              </div>
            </div>
            <div className="grid gap-4 border-t border-stone-100 pt-4 sm:grid-cols-2">
              <div><p className="text-xs text-stone-400">Name</p><p className="mt-1 text-sm font-medium text-stone-700">{user?.username || "—"}</p></div>
              <div><p className="text-xs text-stone-400">Email</p><p className="mt-1 text-sm font-medium text-stone-700">{user?.email || "—"}</p></div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef5e7] text-[#466536]"><KeyRound size={17} /></span>
              <div>
                <h2 className="text-sm font-semibold text-stone-800">Search preferences</h2>
                <p className="text-xs text-stone-500">Choose the model used to summarize search results.</p>
              </div>
            </div>
            <label className="block max-w-lg border-t border-stone-100 pt-4">
              <span className="mb-2 block text-xs font-medium text-stone-600">Default synthesis model</span>
              <select
                value={modelPref}
                onChange={(event) => {
                  localStorage.setItem("oryn_selected_model", event.target.value);
                  window.dispatchEvent(new Event(MODEL_PREFERENCE_EVENT));
                }}
                className="w-full rounded-xl border border-stone-200 bg-[#fbfcf9] px-3 py-2.5 text-sm text-stone-700 outline-none transition focus:border-[#8aa574] focus:ring-2 focus:ring-[#eef5e7]"
              >
                {MODELS.map((model) => <option key={model} value={model}>{model}</option>)}
              </select>
            </label>
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef5e7] text-[#466536]"><Shield size={17} /></span>
              <div>
                <h2 className="text-sm font-semibold text-stone-800">Privacy and data</h2>
                <p className="text-xs text-stone-500">Manage your saved conversation history.</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-medium text-stone-700">Clear conversation history</h3>
                <p className="mt-1 text-xs text-stone-500">Permanently delete all saved conversations and messages.</p>
              </div>
              <button
                type="button"
                disabled={isClearing}
                onClick={handleClearHistory}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-wait disabled:opacity-60"
              >
                <Trash2 size={14} />{isClearing ? "Deleting…" : "Clear all"}
              </button>
            </div>
            {notice && <p role="status" className="mt-4 text-sm text-stone-600">{notice}</p>}
            <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4 text-xs text-stone-500">
              <Database size={14} className="text-[#587b3f]" /> Conversations are stored securely with your account.
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
