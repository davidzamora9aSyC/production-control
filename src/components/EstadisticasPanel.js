import { useState } from "react";

export default function EstadisticasPanel() {
    const [proceso, setProceso] = useState("Troquelado");

    const stats = [
        { label: "Producción total diaria", value: 2000 },
        { label: "Producción total mes", value: 20000 },
        { label: "Tiempo muerto total del día", value: 20000 },
        { label: "Piezas no conformes totales del día", value: 20000 },
    ];

    return (
        <div className="mb-20">
            <div className="flex justify-between mb-6 max-h-[40%]">
                <h3 className="font-semibold text-2xl">Algunas estadísticas</h3>
                <select
                    value={proceso}
                    onChange={e => setProceso(e.target.value)}
                    className="border-b border-black focus:outline-none"
                >
                    <option>Troquelado</option>
                    <option>Inyección</option>
                    <option>Ensamble</option>
                </select>

            </div>

            <div className="flex flex-col gap-2">
                {stats.map((item, i) => (
                    <div key={i} className="bg-gray-200 rounded-full px-4 py-3 flex justify-between">
                        <span>{item.label}</span>
                        <span>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
