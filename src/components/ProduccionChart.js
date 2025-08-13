import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect, useMemo } from "react";

const API_BASE = "https://smartindustries.org";

export default function ProduccionChart() {
    const [proceso, setProceso] = useState("");
    const [periodo, setPeriodo] = useState("Meses");
    const [rango, setRango] = useState("Ultimos 12 meses");
    const [raw, setRaw] = useState([]);
    const [loading, setLoading] = useState(false);
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        const loadAreas = async () => {
            try {
                const res = await fetch(`${API_BASE}/areas`);
                const list = await res.json();
                const arr = Array.isArray(list) ? list : [];
                setAreas(arr);
                // if (!proceso && arr.length > 0) setProceso(arr[0].id);
                if (proceso && !arr.some(x => x.id === proceso)) setProceso(arr[0]?.id || "");
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
        if (periodo === "Meses") return rango === "Año actual" ? "/produccion/mensual/ano-actual" : "/produccion/mensual/ultimos-12-meses";
        return rango === "Mes actual" ? "/produccion/diaria/mes-actual" : "/produccion/diaria/ultimos-30-dias";
    }, [periodo, rango]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const url = proceso ? `${API_BASE}${endpoint}?areaId=${encodeURIComponent(proceso)}` : `${API_BASE}${endpoint}`;
                const res = await fetch(url);
                const json = await res.json();
                setRaw(Array.isArray(json) ? json : []);
            } catch (e) {
                setRaw([]);
            } finally {
                setLoading(false);
            }
        };
        if (proceso === undefined) return;
        load();
    }, [endpoint, proceso]);

    const data = useMemo(() => {
        const dataMap = {};

        raw.forEach(r => {
            const d = new Date(periodo === "Meses" ? r.mes : r.fecha);
            const label = periodo === "Meses"
                ? `${["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][d.getUTCMonth()]} ${d.getUTCFullYear()}`
                : `${d.getUTCDate().toString().padStart(2,"0")}/${(d.getUTCMonth()+1).toString().padStart(2,"0")}`;

            if (!dataMap[label]) {
                dataMap[label] = 0;
            }

            dataMap[label] += Number(r.piezas) || 0;
        });

        return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
    }, [raw, periodo]);

    const isDiario = periodo === "Días";
    const tickStep = useMemo(() => isDiario ? Math.max(1, Math.ceil(data.length / 6)) : 1, [isDiario, data.length]);

    const opcionesRango = periodo === "Meses"
        ? ["Ultimos 12 meses", "Año actual"]
        : ["Ultimos 30 días", "Mes actual"];

    return (
        <div className="w-full max-h-[40%] mb-16">
            <div className="flex justify-between items-center mb-6 ">
                <div>
                    <span className="font-semibold text-2xl mr-4 ">Producción por</span>
                    <select value={proceso} onChange={e => setProceso(e.target.value)} className="border-b border-black focus:outline-none">
                        <option value="">Todos</option>
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
                </div>
            </div>

            <div className="border rounded-2xl shadow-md pl-1 pr-5 pb-4 pt-6">
                <ResponsiveContainer width="100%" height={223}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        {isDiario ? (
                          <XAxis dataKey="name" interval={0} tickMargin={8} tickFormatter={(v, i) => (i % tickStep === 0) ? v : ""} />
                        ) : (
                          <XAxis dataKey="name" />
                        )}
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot />
                    </LineChart>
                </ResponsiveContainer>
                {loading && <div className="px-4 py-2 text-sm">Cargando…</div>}
            </div>
        </div>
    );
}
