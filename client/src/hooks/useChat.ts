"use client";

import { useState, useCallback, useEffect } from "react";
import { Message, Conversation, ThinkingStep } from "@/lib/types";
import { generateId } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const THINKING_STEPS: ThinkingStep[] = [
  "Searching web...",
  "Reading sources...",
  "Generating answer...",
];

export function useChat(token: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<ThinkingStep | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModelState] = useState<string>("");
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(true);

  const setSelectedModel = useCallback((model: string) => {
    setSelectedModelState(model);
    if (typeof window !== "undefined") {
      localStorage.setItem("oryn_selected_model", model);
      window.dispatchEvent(new Event("oryn-model-preference-change"));
    }
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  // Fetch available models on load
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/models`);
        if (res.ok) {
          const models = await res.json();
          setAvailableModels(models);
          const savedModel = localStorage.getItem("oryn_selected_model");
          if (savedModel && models.includes(savedModel)) {
            setSelectedModel(savedModel);
          } else if (models.includes("openai/gpt-oss-120b")) {
            setSelectedModel("openai/gpt-oss-120b");
          } else if (models.length > 0) {
            setSelectedModel(models[0]);
          }
        }
      } catch (e) {
        console.warn("Could not fetch models from server", e);
      }
    }
    fetchModels();
  }, [setSelectedModel]);

  // 1. Fetch conversations on load
  const fetchConversations = useCallback(async () => {
    if (!token) {
      setConversations([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Standardize date strings to Date objects if needed, but strings are fine
        setConversations(data);
      }
    } catch (e) {
      console.warn("Could not load saved conversations from the Oryn API.", e);
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => { void fetchConversations(); });
  }, [fetchConversations]);

  const newChat = useCallback(() => {
    setActiveId(null);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    if (!token) throw new Error("Sign in to delete saved conversations.");
    const response = await fetch(`${API_BASE_URL}/api/conversations/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Could not delete this conversation. Please try again.");
    setConversations((current) => current.filter((conversation) => conversation.id !== id));
    setActiveId((current) => current === id ? null : current);
  }, [token]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      // Pessimistic or optimistic UI: let's update frontend local state first
      let targetId = activeId;
      const originalConvs = [...conversations];

      if (!targetId) {
        const tempId = generateId();
        const newConv: Conversation = {
          id: tempId,
          title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
          timestamp: new Date(),
          messages: [userMsg],
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveId(tempId);
        targetId = tempId;
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? { ...c, messages: [...c.messages, userMsg] }
              : c
          )
        );
      }

      setIsLoading(true);

      // Simulate thinking steps
      for (const step of THINKING_STEPS) {
        setThinkingStep(step);
        await new Promise((r) => setTimeout(r, 600));
      }

      try {
        // Form history context for the LLM
        const currentConv = originalConvs.find((c) => c.id === targetId);
        const historyPayload = currentConv
          ? currentConv.messages.map((m) => ({
            role: m.role,
            content: m.content,
          }))
          : [];

        const requestBody = {
          query: content.trim(),
          conversationId: targetId.includes("-") && targetId.length > 20 ? targetId : undefined, // only pass real backend UUIDs
          history: historyPayload,
          model: selectedModel || undefined,
          webSearch: webSearchEnabled,
        };

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        });

        setThinkingStep(null);

        if (response.ok) {
          const responseData = await response.json();

          const assistantMsg: Message = {
            id: generateId(),
            role: "assistant",
            content: responseData.answer,
            sources: responseData.sources,
            relatedQuestions: responseData.relatedQuestions,
            thinking: responseData.thinking,
            timestamp: new Date(),
          };

          // Update active ID and conversation lists with the server response
          const returnedId = responseData.conversationId;
          setActiveId(returnedId);

          setConversations((prev) => {
            // Remove the temporary conversation if we started a new one
            const filtered = prev.filter((c) => c.id !== targetId);

            // Look for existing thread
            const existing = prev.find((c) => c.id === returnedId);
            if (existing) {
              return prev.map((c) =>
                c.id === returnedId
                  ? { ...c, messages: [...c.messages.filter(m => m.role === 'user' || m.content !== assistantMsg.content), assistantMsg] }
                  : c
              );
            } else {
              // Add new one from server data
              return [
                {
                  id: returnedId,
                  title: responseData.title,
                  timestamp: new Date(),
                  messages: [userMsg, assistantMsg],
                },
                ...filtered.filter((c) => c.id !== returnedId),
              ];
            }
          });
        } else {
          throw new Error("Server returned non-200 status");
        }
      } catch (err) {
        console.error("Backend error, falling back to mock response", err);
        setThinkingStep(null);

        const fallbackMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: "### Connection Error\n\nI was unable to reach the Oryn server at http://localhost:8000. Please make sure the FastAPI server is running.",
          timestamp: new Date(),
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetId
              ? { ...c, messages: [...c.messages, fallbackMsg] }
              : c
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeId, conversations, isLoading, token, selectedModel, webSearchEnabled]
  );

  return {
    conversations,
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
  };
}
