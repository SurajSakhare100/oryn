"use client";

import { useState, useEffect, useCallback } from "react";
import { getCookie, setCookie, deleteCookie } from "@/lib/cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: string;
  email: string;
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists in cookies on mount and fetch user profile
  useEffect(() => {
    async function fetchUser() {
      const savedToken = getCookie("oryn_token");
      if (savedToken) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              "Authorization": `Bearer ${savedToken}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser({ id: data.id, email: data.email, username: data.username });
            setToken(savedToken);
          } else {
            // Token is invalid or expired
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

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Authentication failed");
    }

    const data = await res.json();
    const newUser = { id: data.userId, email: data.email, username: data.username };
    
    // Set secure cookie
    setCookie("oryn_token", data.accessToken);
    
    setToken(data.accessToken);
    setUser(newUser);
    return newUser;
  }, []);

  const signup = useCallback(async (email: string, username: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Registration failed");
    }

    const data = await res.json();
    const newUser = { id: data.userId, email: data.email, username: data.username };

    // Set secure cookie
    setCookie("oryn_token", data.accessToken);

    setToken(data.accessToken);
    setUser(newUser);
    return newUser;
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
    login,
    signup,
    logout,
  };
}


