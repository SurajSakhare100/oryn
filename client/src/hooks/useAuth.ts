"use client";

import { useState, useEffect, useCallback } from "react";
import { getCookie, setCookie, deleteCookie } from "@/lib/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const savedToken = getCookie("oryn_token");
      if (savedToken) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/me`, {
            headers: {
              "Authorization": `Bearer ${savedToken}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser({ id: data.id, email: data.email, username: data.username, avatarUrl: data.avatarUrl });
            setToken(savedToken);
          } else {
            deleteCookie("oryn_token");
          }
        } catch (e) {
          console.error("Failed to fetch user on mount:", e);
        }
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const logout = useCallback(() => {
    deleteCookie("oryn_token");
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    loading,
    logout,
  };
}
