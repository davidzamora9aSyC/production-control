import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { useAuth } from "../context/AuthContext";
import { FaInfoCircle } from "react-icons/fa";
import INDICADOR_DESCRIPTIONS from "../utils/indicadorDescriptions";
import Tooltip from "./Tooltip";

const API_BASE = "https://smartindustries.org";

const METRIC_DEFS = [
  { key: "velocidadActual", label: "Velocidad 10min", color: "#3b82f6" },
  { key: "avgSpeed", label: "Vel. efectiva (sin NPT)", color: "#10b981" },
  { key: "avgSpeedSesion", label: "Vel. sesión (con todo)", color: "#8b5cf6" },
  { key: "produccionTotal", label: "Producción acumulada", color: "#f59e0b" },
  { key: "defectos", label: "Defectos", color: "#ef4444" },
  { key: "porcentajeDefectos", label: "% Defectos", color: "#06b6d4" },
  { key: "nptMin", label: "NPT (min)", color: "#f97316" },
  { key: "nptPorInactividad", label: "NPT por inactividad (min)", color: "#22c55e" },
  { key: "porcentajeNPT", label: "% NPT", color: "#e11d48" },
  { key: "pausasCount", label: "# Pausas", color: "#0ea5e9" },
  { key: "pausasMin", label: "Min pausas", color: "#a3e635" },
  { key: "porcentajePausa", label: "% Pausa", color: "#84cc16" },
  { key: "duracionSesionMin", label: "Min sesión", color: "#64748b" },
];

const isPercentKey = (k) => ["porcentajeDefectos", "porcentajeNPT", "porcentajePausa"].includes(k);

export default function SesionIndicadoresModal({ sesionId, onClose }) {
  const { token } = useAuth();
  const [serie, setSerie] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [selected, setSelected] = useState(["velocidadActual", "avgSpeed"]);

  useEffect(() => {
    const load = async () => {
      if (!sesionId) return;
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (inicio) params.append("inicio", new Date(inicio).toISOString());
        if (fin) params.append("fin", new Date(fin).toISOString());
        const url = `${API_BASE}/sesiones-trabajo/${encodeURIComponent(sesionId)}/serie-minuto${params.toString() ? `?${params.toString()}` : ""}`;
        const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) throw new Error("No se pudo cargar la serie");
        const json = await res.json();
        setSerie(Array.isArray(json) ? json : []);
      } catch (e) {
        setError(e.message || "Error al cargar la serie");
        setSerie([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionId]);

  const data = useMemo(() => {
    return (serie || []).map((r) => ({
      ...r,
      name: (() => {
        try {
          const d = new Date(r.minuto);
          return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        } catch {
          return r.minuto;
        }
      })(),
    }));
  }, [serie]);

  const toggleMetric = (key) => {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 4) return prev; // máximo 4
      return [...prev, key];
    });
  };

  const yAxes = useMemo(() => {
    // Asigna hasta 4 ejes: 2 izquierdos, 2 derechos, alternando
    const defs = METRIC_DEFS.filter((m) => selected.includes(m.key));
    return defs.map((m, idx) => ({ ...m, yAxisId: m.key, orientation: idx % 2 === 0 ? "left" : "right" }));
  }, [selected]);

  const lines = yAxes; // una línea por eje/metric

  const legendPayload = lines.map((l) => ({ value: METRIC_DEFS.find((m) => m.key === l.key)?.label || l.key, type: "line", color: l.color, id: l.key }));

  const applyRange = async () => {
    // refetch con inicio/fin
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (inicio) params.append("inicio", new Date(inicio).toISOString());
      if (fin) params.append("fin", new Date(fin).toISOString());
      const url = `${API_BASE}/sesiones-trabajo/${encodeURIComponent(sesionId)}/serie-minuto${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("No se pudo cargar la serie");
      const json = await res.json();
      setSerie(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e.message || "Error al cargar la serie");
      setSerie([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTick = (key) => (v) => (isPercentKey(key) ? `${Number(v).toFixed(0)}%` : `${Number(v).toFixed(0)}`);
  const formatTooltipVal = (key, val) => (isPercentKey(key) ? `${Number(val).toFixed(2)}%` : `${Number(val).toFixed(2)}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-[98vw] h-[92vh] max-w-[92rem] p-5 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">Indicadores de la sesión</h3>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">Cerrar</button>
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Inicio</label>
            <input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Fin</label>
            <input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <button onClick={applyRange} className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Aplicar rango</button>
          <div className="ml-auto text-xs text-gray-600">Selecciona hasta 4 métricas</div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4 lg:col-span-3 border rounded-lg p-3 overflow-y-auto">
            <div className="columns-[220px] sm:columns-[240px] md:columns-[260px] lg:columns-[280px] gap-3">
              {METRIC_DEFS.map((m) => {
                const checked = selected.includes(m.key);
                const disabled = !checked && selected.length >= 4;
                return (
                  <label key={m.key} className={`break-inside-avoid flex items-center gap-2 text-sm my-1.5 px-1 ${disabled ? "opacity-50" : ""}`}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleMetric(m.key)} />
                    <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: m.color }} />
                    <span className="inline-flex items-center gap-1">
                      {m.label}
                      {INDICADOR_DESCRIPTIONS[m.key] && (
                        <Tooltip content={INDICADOR_DESCRIPTIONS[m.key]}>
                          <FaInfoCircle className="text-gray-500 cursor-help" size={12} />
                        </Tooltip>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 md:col-span-8 lg:col-span-9 border rounded-lg p-3">
          <div className="w-full h-[70vh]">
              <ResponsiveContainer width="100%" height={"100%"}>
                <LineChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" minTickGap={24} />
                  {yAxes.map((a, idx) => (
                    <YAxis
                      key={a.key}
                      yAxisId={a.yAxisId}
                      orientation={a.orientation}
                      stroke={a.color}
                      tick={{ fill: a.color, fontSize: 12 }}
                      axisLine={{ stroke: a.color }}
                      width={48}
                      domain={["auto", "auto"]}
                      tickFormatter={formatTick(a.key)}
                    />
                  ))}
                  <RechartsTooltip
                    formatter={(value, name) => {
                      const def = METRIC_DEFS.find((m) => m.key === name);
                      return [formatTooltipVal(name, value), def?.label || name];
                    }}
                  />
                  <Legend payload={legendPayload} />
                  {lines.map((l) => (
                    <Line
                      key={l.key}
                      type="monotone"
                      dataKey={l.key}
                      yAxisId={l.yAxisId}
                      stroke={l.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              {loading && <div className="text-sm text-gray-600 mt-2">Cargando…</div>}
              {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
