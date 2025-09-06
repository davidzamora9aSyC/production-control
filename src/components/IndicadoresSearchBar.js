import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../api";
import ElementoIndicadoresModal from "./ElementoIndicadoresModal";
import { useAreas } from "../context/AreasContext";

// tipo: "trabajadores" | "maquinas"
export default function IndicadoresSearchBar({ tipo = "trabajadores" }) {
  const { token } = useAuth();
  const [q, setQ] = useState("");
  const [areaId, setAreaId] = useState("");
  const { areas } = useAreas();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isMaquinas = tipo === "maquinas";

  // Áreas provistas por contexto para evitar fetches duplicados

  const endpoint = useMemo(() => (isMaquinas ? "/maquinas/buscar" : "/trabajadores/buscar"), [isMaquinas]);

  // Búsqueda con debounce por q y por areaId (en máquinas)
  useEffect(() => {
    const handler = setTimeout(() => {
      const doFetch = async () => {
        setLoading(true);
        setError("");
        try {
          const params = new URLSearchParams();
          if (q) params.append("q", q);
          if (isMaquinas && areaId) params.append("areaId", areaId);
          params.append("limit", "20");
          const url = `${API_BASE_URL}${endpoint}${params.toString() ? `?${params.toString()}` : ""}`;
          const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
          if (!res.ok) throw new Error("No se pudo buscar");
          const arr = await res.json();
          setResults(Array.isArray(arr) ? arr : []);
        } catch (e) {
          setResults([]);
          setError(e.message || "Error en la búsqueda");
        } finally {
          setLoading(false);
        }
      };

      // Ejecutar si hay algún filtro (en máquinas puede ser solo área)
      if (q || (isMaquinas && areaId)) doFetch();
      else setResults([]);
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, areaId, endpoint]);

  const clearAll = () => {
    setQ("");
    setAreaId("");
    setResults([]);
    setSelected(null);
    setError("");
  };

  const title = isMaquinas ? "máquina" : "trabajador";

  return (
    <div className="border rounded-2xl shadow-md p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-3 flex-wrap">
          {isMaquinas && (
            <div className="flex items-center gap-2">
              <label className="text-sm">Área</label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="border rounded px-2 py-1 text-sm min-w-[12rem]"
              >
                <option value="">Todas</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2 flex-1 min-w-[16rem]">
            <label className="text-sm">Buscar</label>
            <input
              type="text"
              placeholder={isMaquinas ? "Nombre o código" : "Nombre o identificación"}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border rounded px-2 py-1 text-sm w-full"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              onClick={clearAll}
            >
              Limpiar
            </button>
            <button
              className="px-3 py-1 rounded bg-indigo-600 text-white text-sm disabled:opacity-50"
              disabled={!selected}
              onClick={() => setShowModal(true)}
              title={selected ? `Ver histórico de ${title}` : `Selecciona un ${title}`}
            >
              Ver histórico
            </button>
          </div>
        </div>

        {(loading || error || results.length > 0) && (
          <div className="border rounded-lg p-2 bg-white">
            {loading && <div className="text-sm text-gray-600">Buscando…</div>}
            {error && !loading && <div className="text-sm text-red-600">{error}</div>}
            {!loading && !error && results.length > 0 && (
              <ul className="divide-y max-h-64 overflow-auto">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelected(r)}
                      className={`w-full text-left px-2 py-2 hover:bg-gray-50 ${selected?.id === r.id ? "bg-gray-100" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate">
                          <div className="font-medium truncate">{r.nombre}</div>
                          <div className="text-xs text-gray-600 truncate">
                            {isMaquinas ? (
                              <>
                                {r.codigo ? `Código: ${r.codigo}` : ""}
                                {r.areaNombre ? `  ·  Área: ${r.areaNombre}` : ""}
                              </>
                            ) : (
                              <>
                                {r.identificacion ? `Identificación: ${r.identificacion}` : ""}
                                {r.grupo ? `  ·  Grupo: ${r.grupo}` : ""}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700">
                          <span className="inline-block rounded-full px-2 py-0.5 border">
                            {r.estado ?? "-"}
                          </span>
                          <span className="text-indigo-700">Seleccionar</span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!loading && !error && results.length === 0 && (q || (isMaquinas && areaId)) && (
              <div className="text-sm text-gray-600">Sin resultados con los filtros actuales.</div>
            )}
          </div>
        )}

        {selected && (
          <div className="flex items-center justify-between text-sm bg-gray-50 border rounded p-2">
            <div className="truncate">
              <span className="text-gray-600 mr-1">Seleccionado:</span>
              <span className="font-medium">{selected.nombre}</span>
              <span className="text-gray-600">
                {isMaquinas
                  ? (selected.codigo ? ` · Código: ${selected.codigo}` : "")
                  : (selected.identificacion ? ` · ID: ${selected.identificacion}` : "")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full border">{selected.estado ?? "-"}</span>
              <button className="text-xs text-blue-700 hover:underline" onClick={() => setSelected(null)}>Cambiar</button>
            </div>
          </div>
        )}

        {showModal && selected && (
          <ElementoIndicadoresModal
            tipo={isMaquinas ? "maquinas" : "trabajadores"}
            id={selected.id}
            nombre={selected.nombre}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
}
