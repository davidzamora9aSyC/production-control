import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../api";
import { useAreas } from "../context/AreasContext";
import { useAuth } from "../context/AuthContext";

/**
 * Selector para buscar máquinas por nombre y opcionalmente filtrar por área.
 * Pensado para la vista pública de minutas donde se requiere iniciar sesión rápido.
 */
export default function MaquinaSelector({ selected, onSelect = () => {}, className = "" }) {
  const { areas } = useAreas();
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [areaId, setAreaId] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const options = useMemo(() => [{ id: "", nombre: "Todas" }, ...areas], [areas]);

  useEffect(() => {
    if (!query.trim() && !areaId) {
      setResults([]);
      setError("");
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (areaId) params.set("areaId", areaId);
      params.set("limit", "12");
      fetch(`${API_BASE_URL}/maquinas/buscar?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error("No se pudo buscar máquinas");
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
          setError(err.message || "Error al buscar máquinas");
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
  }, [query, areaId, token]);

  const handleSelect = (maquina) => {
    onSelect(maquina);
    setQuery(maquina?.nombre ?? "");
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    setAreaId("");
    setResults([]);
    setError("");
    onSelect(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block font-medium">Buscar máquina</label>
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[12rem]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre o código de la máquina"
            className="w-full border rounded-full px-4 py-2"
          />
        </div>
        <div>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="border rounded-full px-3 py-2 text-sm"
          >
            {options.map((a) => (
              <option key={a.id || "all"} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>
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
              {results.map((maquina) => (
                <li key={maquina.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(maquina)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                      selected?.id === maquina.id ? "bg-gray-100" : ""
                    }`}
                  >
                    <div className="font-medium">{maquina.nombre}</div>
                    <div className="text-xs text-gray-600">
                      {maquina.codigo ? `Código: ${maquina.codigo}` : ""}
                      {maquina.area?.nombre ? ` · Área: ${maquina.area.nombre}` : ""}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && !error && results.length === 0 && (query.trim() || areaId) && (
            <div className="px-3 py-2 text-sm text-gray-600">Sin coincidencias.</div>
          )}
        </div>
      )}
      {selected && (
        <div className="flex items-center justify-between bg-gray-50 border rounded px-3 py-2 text-sm">
          <div>
            <div className="font-medium">{selected.nombre}</div>
            <div className="text-gray-600">
              {selected.codigo ? `Código: ${selected.codigo}` : ""}
              {selected.area?.nombre ? ` · Área: ${selected.area.nombre}` : ""}
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
