"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiGet, apiPost } from "@/lib/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const data = await apiGet(
        `${API_URL}/api/auth/me`,
        {
          credentials: "include",
        }
      );

      setUser(data);

      return data;
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
        return null;
      }
      console.error("Failed to refresh user:", error);

      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await apiPost(
      `${API_URL}/api/auth/login`,
      {
        email,
        password,
      },
      {
        showErrorToast: false,
      }
    );

    const data = await response;

    setUser(data);

    return data;
  }

  async function logout() {
    try {
      await apiPost(
        `${API_URL}/api/auth/logout`
      );
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
