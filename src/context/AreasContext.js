import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../api";
import { useAuth } from "./AuthContext";

const AreasContext = createContext(null);

export function AreasProvider({ children }) {
  const { token } = useAuth();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAreas = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/areas`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("No se pudieron cargar las áreas");
      const data = await res.json();
      setAreas(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error al cargar áreas");
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (areas.length === 0) {
      fetchAreas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, areas.length]);

  const value = useMemo(() => ({ areas, loading, error, reload: fetchAreas }), [areas, loading, error]);
  return <AreasContext.Provider value={value}>{children}</AreasContext.Provider>;
}

export function useAreas() {
  const ctx = useContext(AreasContext);
  if (!ctx) throw new Error("useAreas debe usarse dentro de AreasProvider");
  return ctx;
}
