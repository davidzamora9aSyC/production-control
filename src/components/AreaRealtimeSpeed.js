import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import { useAreas } from "../context/AreasContext";

export default function AreaRealtimeSpeed() {
  const { token } = useAuth();
  const { areas } = useAreas();
  const [areaId, setAreaId] = useState("");
  const [data, setData] = useState([]); // [{ minuto, name, [areaName]: meanNorm }]
  const [seriesKeys, setSeriesKeys] = useState([]); // area display names used as dataKeys
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // áreas compartidas via contexto (se cargan una sola vez)

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (areaId) params.append("areaId", areaId);
      const url = `${API_BASE_URL}/indicadores/realtime/area-velocidad${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("No se pudo cargar la velocidad en tiempo real");
      const json = await res.json();

      const mapName = (id) => areas.find((a) => String(a.id) === String(id))?.nombre || id;

      // Normaliza a lista de series { areaId, puntos: [{minuto, meanNorm}], inicio, fin }
      const series = Array.isArray(json) ? json : (json ? [json] : []);

      // Construir conjunto de todos los minutos presentes
      const minutosSet = new Set();
      series.forEach((s) => (s.puntos || []).forEach((p) => minutosSet.add(p.minuto)));
      const minutos = Array.from(minutosSet).sort();

      // Mapa de valores por área y minuto
      const areaKeys = series.map((s) => mapName(s.areaId));
      const byAreaAndMinute = {};
      series.forEach((s) => {
        const display = mapName(s.areaId);
        if (!byAreaAndMinute[display]) byAreaAndMinute[display] = {};
        (s.puntos || []).forEach((p) => {
          byAreaAndMinute[display][p.minuto] = Number(p.meanNorm);
        });
      });

      // Serie para el gráfico, una fila por minuto con campos por área
      const rows = minutos.map((m) => {
        const d = new Date(m);
        const name = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        const row = { minuto: m, name };
        areaKeys.forEach((k) => {
          row[k] = byAreaAndMinute[k]?.[m] ?? null;
        });
        return row;
      });

      setData(rows);
      setSeriesKeys(areaKeys);
      const lastMin = minutos[minutos.length - 1];
      setUpdatedAt(lastMin || new Date().toISOString());
    } catch (e) {
      setError(e.message || "Error al cargar");
      setData([]);
      setSeriesKeys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId]);

  // Cuando llegan los nombres de áreas por primera vez, rehacer el mapeo para usar nombres en la leyenda
  useEffect(() => {
    if (areas.length) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areas.length]);

  // Si las áreas llegan después del primer fetch, actualizar los labels del eje X
  useEffect(() => {
    if (!areas.length || !data.length) return;
    const mapName = (id) => areas.find((a) => String(a.id) === String(id))?.nombre || id;
    setData((prev) => prev.map((r) => ({ ...r, name: mapName(r.areaId) })));
  }, [areas]);

  const description = useMemo(() => (
    "Serie por minuto de la velocidad de ventana normalizada (10 min) por área del día de hoy. Cada sesión se normaliza por su propio promedio diario, de modo que todas las máquinas pesen igual; el valor es adimensional (≈1.0 equivale al promedio de su sesión)."
  ), []);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="font-semibold text-2xl">Velocidad por área (tiempo real)</div>
          <div className="text-xs text-gray-600">{description}</div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">Área</label>
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="border-b border-black focus:outline-none">
            <option value="">Todas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border rounded-2xl shadow-md px-4 py-3">
        <div className="text-xs text-gray-500 mb-2">Último minuto: {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}</div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(2)}`} />
              <Legend />
              {seriesKeys.map((k, idx) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={PALETTE[idx % PALETTE.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {loading && <div className="text-sm text-gray-600 mt-2">Actualizando…</div>}
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}

// Paleta simple y consistente entre renders
const PALETTE = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
  "#a78bfa", // violet-400
];
