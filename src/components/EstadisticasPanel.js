import { useState, useEffect } from "react";

export default function EstadisticasPanel() {
    const [proceso, setProceso] = useState("8f56484e-8717-43f1-ae33-4ddf1bc7ac35");
    const [areas, setAreas] = useState([]);

    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchAreas = async () => {
            const API_BASE = "https://smartindustries.org";
            const res = await fetch(`${API_BASE}/areas`);
            const data = await res.json();
            setAreas(data);
            if (data.length > 0) setProceso(data[0].id);
        };

        fetchAreas();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const API_BASE = "https://smartindustries.org";
                const hoy = new Date().toISOString().split("T")[0];

                // Endpoints nuevos de indicadores
                const [ult30Res, resumenDiaRes, resumenMesRes] = await Promise.all([
                    fetch(`${API_BASE}/indicadores/diaria/ultimos-30-dias`),
                    fetch(`${API_BASE}/indicadores/resumen/dia?fecha=${hoy}`),
                    fetch(`${API_BASE}/indicadores/resumen/mes-actual`),
                ]);

                const ult30All = await ult30Res.json();      // array de varias áreas
                const resumenDiaAll = await resumenDiaRes.json(); // array por área
                const resumenMesAll = await resumenMesRes.json(); // array por área

                const hoyArea = Array.isArray(resumenDiaAll)
                    ? resumenDiaAll.find(r => r.areaId === proceso)
                    : null;
                const mesArea = Array.isArray(resumenMesAll)
                    ? resumenMesAll.find(r => r.areaId === proceso)
                    : null;

                const produccionHoy = Number(hoyArea?.produccionTotal || 0);
                const defectosHoy = Number(hoyArea?.defectos || 0);
                const nptHoy = Number(hoyArea?.nptMin || 0);
                const pausasHoy = Number(hoyArea?.pausasMin || 0);
                const pctDefectosHoy = Number(hoyArea?.porcentajeDefectos || 0);
                const pctNPTHoy = Number(hoyArea?.porcentajeNPT || 0);

                const ult30Area = Array.isArray(ult30All)
                    ? ult30All.filter(r => r.areaId === proceso)
                    : [];
                const produccionUlt30 = ult30Area.reduce((acc, d) => acc + (Number(d.produccionTotal) || 0), 0);

                const produccionMes = Number(mesArea?.produccionTotal || 0);
                const defectosMes = Number(mesArea?.defectos || 0);
                const nptMes = Number(mesArea?.nptMin || 0);
                const pausasMes = Number(mesArea?.pausasMin || 0);
                const pctDefectosMes = Number(mesArea?.porcentajeDefectos || 0);
                const pctNPTMes = Number(mesArea?.porcentajeNPT || 0);

                const avgSpeedHoy = Number(hoyArea?.avgSpeed || 0);
                const avgSpeedSesionHoy = Number(hoyArea?.avgSpeedSesion || 0);
                const avgSpeedMes = Number(mesArea?.avgSpeed || 0);
                const avgSpeedSesionMes = Number(mesArea?.avgSpeedSesion || 0);

                setStats([
                    { label: "Producción total de hoy", value: produccionHoy },
                    { label: "Producción últimos 30 días (área)", value: produccionUlt30 },
                    { label: "Producción total mes actual", value: produccionMes },
                    { label: "Tiempo muerto total del día (NPT)", value: nptHoy },
                    { label: "% NPT del día", value: `${pctNPTHoy}%` },
                    { label: "Pausas del día (min)", value: pausasHoy },
                    { label: "Piezas no conformes del día", value: defectosHoy },
                    { label: "% no conformes del día", value: `${pctDefectosHoy}%` },
                    { label: "Tiempo muerto total del mes (NPT)", value: nptMes },
                    { label: "% NPT del mes", value: `${pctNPTMes}%` },
                    { label: "Pausas del mes (min)", value: pausasMes },
                    { label: "% no conformes del mes", value: `${pctDefectosMes}%` },
                    { label: "Velocidad promedio hoy", value: avgSpeedHoy },
                    { label: "Velocidad promedio hoy (sesión)", value: avgSpeedSesionHoy },
                    { label: "Velocidad promedio mes", value: avgSpeedMes },
                    { label: "Velocidad promedio mes (sesión)", value: avgSpeedSesionMes },
                ]);
            } catch (e) {
                setStats([]);
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
