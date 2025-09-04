import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";

function Stat({ label, value, suffix = "", desc }) {
  return (
    <div className="p-3 border rounded-lg">
      <div className="text-xs text-gray-500" title={desc}>{label}</div>
      <div className="text-xl font-semibold">{value}{suffix}</div>
    </div>
  );
}

export default function ResumenMaquina() {
  const { token } = useAuth();
  const [maquinas, setMaquinas] = useState([]);
  const [id, setId] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [includeVentana, setIncludeVentana] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 7);
    setInicio(start.toISOString().slice(0, 10));
    setFin(today.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/maquinas`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((arr) => setMaquinas(Array.isArray(arr) ? arr : []))
      .catch(() => setMaquinas([]));
  }, [token]);

  const fetchData = async () => {
    if (!id || !inicio || !fin) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("inicio", new Date(inicio).toISOString());
      params.append("fin", new Date(fin).toISOString());
      if (includeVentana) params.append("includeVentana", "true");
      const url = `${API_BASE_URL}/indicadores/maquinas/${encodeURIComponent(id)}/resumen?${params.toString()}`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("No se pudo cargar el resumen");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || "Error al cargar");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="font-semibold text-2xl">Resumen por máquina</div>
          <div className="text-xs text-gray-600">Agregado de producción, calidad y tiempos en el rango seleccionado.</div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <label className="text-sm">Máquina</label>
            <select value={id} onChange={(e) => setId(e.target.value)} className="border-b border-black focus:outline-none">
              <option value="">Seleccionar…</option>
              {maquinas.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Inicio</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Fin</label>
            <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeVentana} onChange={(e) => setIncludeVentana(e.target.checked)} /> Incluir velocidad de ventana
          </label>
          <button onClick={fetchData} className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Actualizar</button>
        </div>
      </div>

      <div className="border rounded-2xl shadow-md p-4">
        {!data && <div className="text-sm text-gray-600">Selecciona una máquina y rango, luego pulsa Actualizar.</div>}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <Stat label="Producción total" value={data.produccionTotal ?? 0} desc="Suma de piezas contadas en el rango" />
            <Stat label="Defectos" value={data.defectos ?? 0} desc="Total de piezas no conformes" />
            <Stat label="% Defectos" value={(data.porcentajeDefectos ?? 0).toFixed(2)} suffix="%" desc="Defectos/(Producción+Defectos) * 100" />
            <Stat label="NPT (min)" value={data.nptMin ?? 0} desc="Minutos no productivos totales" />
            <Stat label="NPT por inactividad" value={data.nptPorInactividad ?? 0} desc="Minutos inactivos continuos > 3 min" />
            <Stat label="% NPT" value={(data.porcentajeNPT ?? 0).toFixed(2)} suffix="%" desc="NPT/Minutos totales * 100" />
            <Stat label="Pausas (min)" value={data.pausasMin ?? 0} desc="Minutos etiquetados como pausa" />
            <Stat label="% Pausa" value={(data.porcentajePausa ?? 0).toFixed(2)} suffix="%" desc="Pausa/Minutos totales * 100" />
            <Stat label="Sesiones" value={data.sesionesCerradas ?? 0} desc="Sesiones cerradas en el rango" />
            <Stat label="Vel. sin NPT" value={(data.avgSpeed ?? 0).toFixed(1)} desc="Piezas/hora excluyendo NPT" />
            <Stat label="Vel. con NPT (sesión)" value={(data.avgSpeedSesion ?? 0).toFixed(1)} desc="Piezas/hora incluyendo todo" />
            {includeVentana && (
              <Stat label="Vel. ventana prom." value={(data.velocidadVentanaPromedio ?? 0).toFixed(1)} desc="Promedio de la velocidad de ventana (10 min)" />
            )}
          </div>
        )}
        {loading && <div className="text-sm text-gray-600 mt-2">Cargando…</div>}
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}

