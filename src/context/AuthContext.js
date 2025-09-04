import { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_BASE = "https://smartindustries.org";
const TOKEN_KEY = "auth:token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Bootstrap: carga token y valida con backend
  useEffect(() => {
    const init = async () => {
      try {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (stored) {
          setToken(stored);
          const ok = await validateToken(stored);
          setIsAuthenticated(ok);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateToken = async (tkn) => {
    try {
      const res = await fetch(`${API_BASE}/auth/validate`, {
        method: "GET",
        headers: { Authorization: `Bearer ${tkn}` },
      });
      if (!res.ok) return false;
      const data = await res.json().catch(() => ({}));
      return !!data?.valid;
    } catch {
      return false;
    }
  };

  const login = async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      let msg = "Credenciales inválidas";
      try { const j = await res.json(); if (j?.message) msg = j.message; } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    const accessToken = data?.access_token || data?.accessToken;
    if (!accessToken) throw new Error("Respuesta de login sin token");
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setIsAuthenticated(false);
  };

  const revalidate = async () => {
    setIsChecking(true);
    const ok = token ? await validateToken(token) : false;
    setIsAuthenticated(ok);
    setIsChecking(false);
    return ok;
  };

  const value = useMemo(
    () => ({ token, isAuthenticated, isChecking, login, logout, revalidate }),
    [token, isAuthenticated, isChecking]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
