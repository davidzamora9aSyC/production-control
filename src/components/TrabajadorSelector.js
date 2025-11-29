import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";

/**
 * Selector liviano para buscar trabajadores por nombre o identificación.
 * Se usa en la vista pública de minutas para iniciar sesiones rápidamente.
 */
export default function TrabajadorSelector({ selected, onSelect = () => {}, className = "" }) {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError("");
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("q", query.trim());
      params.set("limit", "15");
      fetch(`${API_BASE_URL}/trabajadores/buscar?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error("No se pudo buscar trabajadores");
          return res.json();
        })
        .then((data) => {
          if (cancelled) return;
          setResults(Array.isArray(data) ? data : []);
          setError("");
        })
        .catch((err) => {
          if (cancelled || err.name === "AbortError") return;
          setResults([]);
          setError(err.message || "Error al buscar trabajadores");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, token]);

  const handleSelect = (trabajador) => {
    onSelect(trabajador);
    setQuery(trabajador?.nombre ?? "");
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError("");
    onSelect(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block font-medium">Buscar trabajador</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre o ID del trabajador"
          className="w-full border rounded-full px-4 py-2"
        />
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 rounded-full border bg-white hover:bg-gray-100 text-sm"
        >
          Limpiar
        </button>
      </div>
      {(loading || error || results.length > 0) && (
        <div className="border rounded-lg bg-white max-h-56 overflow-auto divide-y">
          {loading && <div className="px-3 py-2 text-sm text-gray-600">Buscando…</div>}
          {error && !loading && (
            <div className="px-3 py-2 text-sm text-red-600">{error}</div>
          )}
          {!loading && !error && results.length > 0 && (
            <ul>
              {results.map((trabajador) => (
                <li key={trabajador.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(trabajador)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                      selected?.id === trabajador.id ? "bg-gray-100" : ""
                    }`}
                  >
                    <div className="font-medium">{trabajador.nombre}</div>
                    <div className="text-xs text-gray-600">
                      {trabajador.identificacion ? `ID: ${trabajador.identificacion}` : ""}
                      {trabajador.grupo ? ` · Grupo: ${trabajador.grupo}` : ""}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && !error && results.length === 0 && query.trim() && (
            <div className="px-3 py-2 text-sm text-gray-600">Sin coincidencias.</div>
          )}
        </div>
      )}
      {selected && (
        <div className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2 text-sm">
          <div>
            <div className="font-medium">{selected.nombre}</div>
            <div className="text-gray-600">
              {selected.identificacion ? `ID: ${selected.identificacion}` : ""}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-blue-600 text-xs hover:underline"
          >
            Cambiar
          </button>
        </div>
      )}
    </div>
  );
}
