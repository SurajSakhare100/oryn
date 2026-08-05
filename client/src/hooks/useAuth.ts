"use client";

import { useState, useEffect, useCallback } from "react";

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

  // Check if token exists in localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("oryn_token");
    const savedUser = localStorage.getItem("oryn_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("oryn_token");
        localStorage.removeItem("oryn_user");
      }
    }
    setLoading(false);
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
    
    localStorage.setItem("oryn_token", data.accessToken);
    localStorage.setItem("oryn_user", JSON.stringify(newUser));
    
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

    localStorage.setItem("oryn_token", data.accessToken);
    localStorage.setItem("oryn_user", JSON.stringify(newUser));

    setToken(data.accessToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("oryn_token");
    localStorage.removeItem("oryn_user");
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

