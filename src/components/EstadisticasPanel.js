import { useState, useEffect } from "react";
import { useAreas } from "../context/AreasContext";

export default function EstadisticasPanel() {
    const [proceso, setProceso] = useState("8f56484e-8717-43f1-ae33-4ddf1bc7ac35");
    const { areas } = useAreas();

    const [stats, setStats] = useState([]);

    useEffect(() => {
        if (areas.length > 0) setProceso((p) => p || areas[0].id);
    }, [areas]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const API_BASE = "https://smartindustries.org";
                const hoy = new Date().toISOString().split("T")[0];

                const [ult30Res, resumenDiaRes, resumenMesRes] = await Promise.all([
                    fetch(`${API_BASE}/indicadores/diaria/ultimos-30-dias`),
                    fetch(`${API_BASE}/indicadores/resumen/dia?fecha=${hoy}`),
                    fetch(`${API_BASE}/indicadores/resumen/mes-actual`),
                ]);

                const ult30All = await ult30Res.json();
                const resumenDiaAll = await resumenDiaRes.json();
                const resumenMesAll = await resumenMesRes.json();

                const hoyArea = Array.isArray(resumenDiaAll) ? resumenDiaAll.find(r => r.areaId === proceso) : null;
                const mesArea = Array.isArray(resumenMesAll) ? resumenMesAll.find(r => r.areaId === proceso) : null;

                const produccionHoy = Number(hoyArea?.produccionTotal || 0);
                const defectosHoy = Number(hoyArea?.defectos || 0);
                const nptHoy = Number(hoyArea?.nptMin || 0);

                const ult30Area = Array.isArray(ult30All) ? ult30All.filter(r => r.areaId === proceso) : [];
                const produccionUlt30 = ult30Area.reduce((acc, d) => acc + (Number(d.produccionTotal) || 0), 0);

                const nptMes = Number(mesArea?.nptMin || 0);

                setStats([
                    { label: "Producción total diaria", value: produccionHoy },
                    { label: "Producción total últimos 30 días", value: produccionUlt30 },
                    { label: "Tiempo muerto total del día", value: nptHoy },
                    { label: "Piezas no conformes totales del día", value: defectosHoy },
                    { label: "Tiempo muerto total del mes", value: nptMes },
                ]);
            } catch (e) {
                setStats([
                    { label: "Producción total diaria", value: 0 },
                    { label: "Producción total últimos 30 días", value: 0 },
                    { label: "Tiempo muerto total del día", value: 0 },
                    { label: "Piezas no conformes totales del día", value: 0 },
                    { label: "Tiempo muerto total del mes", value: 0 },
                ]);
            }
        };

        fetchData();
    }, [proceso]);

    return (
        <div className="mb-20">
            <div className="flex justify-between mb-6 max-h-[40%]">
                <h3 className="font-semibold text-2xl">Algunas estadísticas</h3>
                <select
                    value={proceso}
                    onChange={e => setProceso(e.target.value)}
                    className="border-b border-black text-2xl focus:outline-none"
                >
                    {areas.map(area => (
                        <option key={area.id} value={area.id}>{area.nombre}</option>
                    ))}
                </select>

            </div>

            <div className="flex flex-col gap-2 border rounded-2xl shadow-md p-4">
                {stats.map((item, i) => (
                    <div key={i} className="bg-gray-200 rounded-2xl px-4 py-3 flex justify-between">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
