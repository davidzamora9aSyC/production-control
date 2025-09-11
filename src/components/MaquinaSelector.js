import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../api";

// Selector de máquina. Muestra nombre y código; puedes elegir qué valor entregar
// vía prop `valueKey`: "id" | "nombre" | "codigo" (default "id").
export default function MaquinaSelector({ value, onChange, valueKey = "id", className = "" }) {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/maquinas`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const arr = await res.json().catch(() => []);
        if (!cancelled) setList(Array.isArray(arr) ? arr : []);
      } catch {
        if (!cancelled) setList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [token]);

  // Deriva el valor a partir de la máquina y de valueKey
  const getVal = (m) => {
    if (!m) return "";
    if (valueKey === "nombre") return m.nombre || "";
    if (valueKey === "codigo") return m.codigo || "";
    return m.id || "";
  };

  const handleChange = (e) => {
    const v = e.target.value;
    onChange?.(v);
  };

  return (
    <select value={value || ""} onChange={handleChange} className={className || "border px-2 py-1 rounded"}>
      <option value="">Seleccionar…</option>
      {loading && <option value="" disabled>Cargando…</option>}
      {!loading && list.map((m) => (
        <option key={m.id} value={getVal(m)}>
          {m.nombre || m.codigo || m.id}
          {m.codigo ? ` — ${m.codigo}` : ""}
        </option>
      ))}
    </select>
  );
}

