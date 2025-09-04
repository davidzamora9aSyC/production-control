import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";

export default function SesionesVelocidadNormalizada() {
  const { token } = useAuth();
  const [areas, setAreas] = useState([]);
  const [areaId, setAreaId] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [points, setPoints] = useState(50);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 7);
    setInicio(start.toISOString().slice(0, 16)); // yyyy-MM-ddTHH:mm
    setFin(today.toISOString().slice(0, 16));
  }, []);

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
    if (!inicio || !fin) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("inicio", new Date(inicio).toISOString());
      params.append("fin", new Date(fin).toISOString());
      if (areaId) params.append("areaId", areaId);
      if (points) params.append("points", String(points));
      const url = `${API_BASE_URL}/indicadores/sesiones/velocidad-normalizada?${params.toString()}`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("No se pudo cargar la curva normalizada");
      const json = await res.json();
      const mean = Array.isArray(json?.mean) ? json.mean : [];
      const chart = mean.map((y, idx) => ({ pct: Math.round((idx / Math.max(1, mean.length - 1)) * 100), value: y }));
      setData(chart);
      setMeta(json);
    } catch (e) {
      setError(e.message || "Error al cargar");
      setData([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch when defaults are set
    if (inicio && fin) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId, points]);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="font-semibold text-2xl">Velocidad normalizada de sesiones</div>
          <div className="text-xs text-gray-600">Promedio de la velocidad de ventana a lo largo del progreso normalizado (0–100%) del conjunto de sesiones en el rango.</div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <label className="text-sm">Área</label>
            <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="border-b border-black focus:outline-none">
              <option value="">Todas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Puntos</label>
            <input type="number" min={10} max={200} value={points} onChange={(e) => setPoints(Number(e.target.value))} className="border-b border-black w-20 text-right focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Inicio</label>
            <input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Fin</label>
            <input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <button onClick={fetchData} className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Actualizar</button>
        </div>
      </div>

      <div className="border rounded-2xl shadow-md px-4 py-3">
        {meta && (
          <div className="text-xs text-gray-600 mb-2">
            Sesiones usadas: <span className="font-semibold">{meta.sesiones ?? 0}</span>
          </div>
        )}
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pct" domain={[0, 100]} type="number" tickFormatter={(v) => `${v}%`} />
              <YAxis />
              <Tooltip formatter={(v) => `${Number(v).toFixed(2)}`} labelFormatter={(l) => `${l}%`} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {loading && <div className="text-sm text-gray-600 mt-2">Cargando…</div>}
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}

