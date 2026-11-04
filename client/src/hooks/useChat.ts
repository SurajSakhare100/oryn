"use client";

import { useState, useCallback, useEffect } from "react";
import { Message, Conversation, ThinkingStep } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-errors";

const API_BASE_URL = "";

const THINKING_STEPS: ThinkingStep[] = [
  "Searching web...",
  "Reading sources...",
  "Generating answer...",
];

export function useChat(token: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
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
      setHistoryError(null);
      setIsLoadingHistory(false);
      return;
    }
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, "Couldn't load your saved searches."));
      }

      const data: unknown = await res.json();
      if (!Array.isArray(data)) throw new Error("Oryn returned an invalid conversation history response.");

      const conversations = (data as Array<{
        id: string;
        title: string;
        timestamp: string;
        messages?: Array<{
          id: string;
          role: string;
          content: string;
          sources?: Message["sources"] | null;
          relatedQuestions?: Message["relatedQuestions"] | null;
          thinking?: Message["thinking"] | null;
          timestamp: string;
        }>;
      }>).map((conversation) => ({
        id: conversation.id,
        title: conversation.title || "Untitled search",
        timestamp: new Date(conversation.timestamp),
        messages: (Array.isArray(conversation.messages) ? conversation.messages : []).map((message) => ({
          id: message.id,
          role: message.role === "user" ? "user" as const : "assistant" as const,
          content: message.content,
          sources: Array.isArray(message.sources) ? message.sources : undefined,
          relatedQuestions: Array.isArray(message.relatedQuestions) ? message.relatedQuestions : undefined,
          thinking: Array.isArray(message.thinking) ? message.thinking : undefined,
          timestamp: new Date(message.timestamp),
        })),
      }));

      setConversations(conversations);
    } catch (error) {
      const message = error instanceof TypeError
        ? "Could not connect to Oryn. Check your connection and try again."
        : error instanceof Error
          ? error.message
          : "Couldn't load your saved searches.";
      setHistoryError(message);
      console.error("Could not load saved conversations.", error);
    } finally {
      setIsLoadingHistory(false);
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
    if (!response.ok) throw new Error(await getApiErrorMessage(response, "Could not delete this conversation."));
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
          throw new Error(await getApiErrorMessage(response, "Oryn couldn't answer this question."));
        }
      } catch (err) {
        console.error("Backend error, falling back to mock response", err);
        setThinkingStep(null);

        const message = err instanceof TypeError
          ? "Could not connect to Oryn. Check your connection and try again."
          : err instanceof Error
            ? err.message
            : "Oryn couldn't complete this request. Please try again.";
        const fallbackMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: `### Couldn't complete your request\n\n${message}`,
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
    isLoadingHistory,
    historyError,
    refreshConversations: fetchConversations,
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
