import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect, useMemo, useContext } from "react";
import { ExpandButton, ExpandContext } from "./ExpandableCard";

const API_BASE = "https://smartindustries.org";

export default function IndicadorChart({ metricKey, title }) {
  const [proceso, setProceso] = useState("");
  const [periodo, setPeriodo] = useState("Meses");
  const [rango, setRango] = useState("Ultimos 12 meses");
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const { expanded } = useContext(ExpandContext);

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const res = await fetch(`${API_BASE}/areas`);
        const list = await res.json();
        const arr = Array.isArray(list) ? list : [];
        setAreas(arr);
        if (proceso && !arr.some(x => x.id === proceso)) setProceso(arr[0]?.id || "");
        if (!proceso && arr.length > 0) setProceso(arr[0].id);
      } catch (e) {
        setAreas([]);
      }
    };
    loadAreas();
  }, []);

  useEffect(() => {
    if (periodo === "Meses" && (rango !== "Ultimos 12 meses" && rango !== "Año actual")) setRango("Ultimos 12 meses");
    if (periodo === "Días" && (rango !== "Ultimos 30 días" && rango !== "Mes actual")) setRango("Ultimos 30 días");
  }, [periodo]);

  const endpoint = useMemo(() => {
    if (periodo === "Meses") return rango === "Año actual" ? "/indicadores/mensual/ano-actual" : "/indicadores/mensual/ultimos-12-meses";
    return rango === "Mes actual" ? "/indicadores/diaria/mes-actual" : "/indicadores/diaria/ultimos-30-dias";
  }, [periodo, rango]);

  useEffect(() => {
    const load = async () => {
      if (!proceso) return;
      setLoading(true);
      try {
        const needsAreaParam = endpoint.endsWith("ano-actual") || endpoint.endsWith("mes-actual");
        const url = needsAreaParam ? `${API_BASE}${endpoint}?areaId=${encodeURIComponent(proceso)}` : `${API_BASE}${endpoint}`;
        const res = await fetch(url);
        const json = await res.json();
        const arr = Array.isArray(json) ? json : [];
        // filtrar por area cuando el endpoint trae varias areas
        const filtered = needsAreaParam ? arr : arr.filter(r => r.areaId === proceso);
        setRaw(filtered);
      } catch (e) {
        setRaw([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [endpoint, proceso]);

  const data = useMemo(() => {
    const dataMap = {};
    raw.forEach(r => {
      const d = new Date(periodo === "Meses" ? r.mes : r.fecha);
      const label = periodo === "Meses"
        ? `${["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][d.getUTCMonth()]} ${d.getUTCFullYear()}`
        : `${d.getUTCDate().toString().padStart(2,"0")}/${(d.getUTCMonth()+1).toString().padStart(2,"0")}`;
      if (!dataMap[label]) dataMap[label] = 0;
      dataMap[label] += Number(r[metricKey]) || 0;
    });
    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  }, [raw, periodo, metricKey]);

  // Dominio dinámico para soportar valores negativos (p.ej. -5%)
  const yDomain = useMemo(() => {
    if (!data.length) return [0, 100];
    let min = Math.min(...data.map(d => Number(d.value) || 0));
    let max = Math.max(...data.map(d => Number(d.value) || 0));

    // Si todos los valores están en [0, 100], fija el dominio a [0, 100]
    if (min >= 0 && max <= 100) {
      return [0, 100];
    }

    if (min === max) {
      if (min === 0) {
        min = -5; max = 5;
      } else {
        const padSame = Math.max(1, Math.ceil(Math.abs(min) * 0.1));
        min -= padSame; max += padSame;
      }
    }

    const pad = Math.max(1, Math.ceil((max - min) * 0.05));
    min = Math.floor((min - pad) / 5) * 5;
    max = Math.ceil((max + pad) / 5) * 5;
    return [min, max];
  }, [data]);

  const isDiario = periodo === "Días";
  const tickStep = useMemo(() => isDiario ? Math.max(1, Math.ceil(data.length / 6)) : 1, [isDiario, data.length]);
  const opcionesRango = periodo === "Meses" ? ["Ultimos 12 meses", "Año actual"] : ["Ultimos 30 días", "Mes actual"];

  return (
    <div className={`w-full ${expanded ? "h-full flex flex-col" : "max-h-[40%] mb-16"}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="font-semibold text-2xl mr-4">{title}</span>
          <select value={proceso} onChange={e => setProceso(e.target.value)} className="border-b border-black focus:outline-none">
            {areas.map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="bg-gray-200 px-4 py-1 rounded-full text-md">
            <option>Meses</option>
            <option>Días</option>
          </select>
          <select value={rango} onChange={e => setRango(e.target.value)} className="bg-gray-200 px-4 py-1 rounded-full text-md">
            {opcionesRango.map(op => (
              <option key={op}>{op}</option>
            ))}
          </select>
          <ExpandButton />
        </div>
      </div>
      <div className={`border rounded-2xl shadow-md pl-1 pr-5 pb-4 pt-6 ${expanded ? "flex-1 min-h-0" : ""}`}>
        <ResponsiveContainer width="100%" height={expanded ? "100%" : 223}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            {isDiario ? (
              <XAxis dataKey="name" interval={0} tickMargin={8} tickFormatter={(v, i) => (i % tickStep === 0) ? v : ""} />
            ) : (
              <XAxis dataKey="name" />
            )}
            <YAxis domain={yDomain} tickFormatter={(v) => `${Number(v).toFixed(0)}%`} />
            <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
        {loading && <div className="px-4 py-2 text-sm">Cargando…</div>}
      </div>
    </div>
  );
}
