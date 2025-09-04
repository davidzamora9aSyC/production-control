import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";

export default function AreaRealtimeSpeed({ defaultMode = "sum" }) {
  const { token } = useAuth();
  const [areas, setAreas] = useState([]);
  const [areaId, setAreaId] = useState("");
  const [mode, setMode] = useState(defaultMode);
  const [data, setData] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/areas`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const arr = await res.json();
        setAreas(Array.isArray(arr) ? arr : []);
      } catch {
        setAreas([]);
      }
    };
    loadAreas();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (mode && mode !== "sum") params.append("mode", mode);
      if (areaId) params.append("areaId", areaId);
      const url = `${API_BASE_URL}/indicadores/realtime/area-velocidad${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("No se pudo cargar la velocidad en tiempo real");
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json ? [json] : []);
      const mapName = (id) => areas.find((a) => String(a.id) === String(id))?.nombre || id;
      setData(list.map((r) => ({ ...r, name: mapName(r.areaId) })));
      const stamp = list[0]?.minuto || new Date().toISOString();
      setUpdatedAt(stamp);
    } catch (e) {
      setError(e.message || "Error al cargar");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId, mode]);

  const description = useMemo(() => (
    mode === "sum"
      ? "Suma de velocidades de ventana (10 min) de sesiones activas por área."
      : "Promedio simple de velocidades de ventana (10 min) de sesiones activas por área."
  ), [mode]);

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
          <label className="text-sm">Modo</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="border-b border-black focus:outline-none">
            <option value="sum">Suma</option>
            <option value="avg">Promedio</option>
          </select>
        </div>
      </div>

      <div className="border rounded-2xl shadow-md px-4 py-3">
        <div className="text-xs text-gray-500 mb-2">Último minuto: {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}</div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => `${Number(v).toFixed(2)}`} />
              <Bar dataKey="velocidad" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {loading && <div className="text-sm text-gray-600 mt-2">Actualizando…</div>}
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}

