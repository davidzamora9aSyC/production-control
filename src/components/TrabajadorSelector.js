import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../api";

// Simple selector por nombre que retorna la identificación
export default function TrabajadorSelector({ value, onChange, className = "" }) {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/trabajadores`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
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

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value || "")}
      className={className || "border px-2 py-1 rounded"}
    >
      <option value="">Seleccionar…</option>
      {loading && <option value="" disabled>Cargando…</option>}
      {!loading && list.map((t) => (
        <option key={t.id} value={t.identificacion || ""}>
          {t.nombre}{t.identificacion ? ` — ${t.identificacion}` : ""}
        </option>
      ))}
    </select>
  );
}

