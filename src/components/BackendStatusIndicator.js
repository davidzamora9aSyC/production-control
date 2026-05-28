import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../api";
import { apiFetch } from "../api";

export default function BackendStatusIndicator({ className = "" }) {
  const [connected, setConnected] = useState(null);

  const checkConnection = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/validate`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      // 401/403 still means backend is reachable.
      setConnected(res.status >= 100);
    } catch {
      setConnected(false);
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const intervalId = setInterval(checkConnection, 10000);
    return () => clearInterval(intervalId);
  }, [checkConnection]);

  const isConnected = connected === true;
  const isChecking = connected === null;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
        isConnected
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      } ${className}`}
      title={`Backend: ${isConnected ? "conectado" : isChecking ? "verificando" : "desconectado"}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isConnected ? "bg-green-500" : isChecking ? "bg-yellow-500" : "bg-red-500"
        }`}
      />
      {isConnected ? "Conectado" : isChecking ? "Verificando..." : "Desconectado"}
    </span>
  );
}