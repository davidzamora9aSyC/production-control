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
            const API_BASE = "https://smartindustries.org";
            const resDia = await fetch(`${API_BASE}/produccion/diaria/mes-actual?areaId=${proceso}`);
            const dataDia = await resDia.json();

            const resTotalDia = await fetch(`${API_BASE}/produccion/diaria/ultimos-30-dias?areaId=${proceso}`);
            const dataTotalDia = await resTotalDia.json();

            const resMes = await fetch(`${API_BASE}/produccion/tiempo-muerto/mes-actual?areaId=${proceso}`);
            const dataMes = await resMes.json();

            const hoy = new Date().toISOString().split("T")[0];
            const hoyData = dataDia.find(d => d.fecha === hoy);
            const piezasHoy = hoyData?.piezas || 0;
            const pedaleadasHoy = hoyData?.pedaleadas || 0;

            setStats([
                { label: "Producción total diaria", value: piezasHoy },
                { label: "Producción total ultimos 30 dias", value: dataTotalDia.reduce((acc, d) => acc + d.piezas, 0) },
                { label: "Tiempo muerto total del día", value: 0 },
                { label: "Piezas no conformes totales del día", value: pedaleadasHoy - piezasHoy },
                { label: "Tiempo muerto total del mes", value: dataMes.total || 0 },
            ]);
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
