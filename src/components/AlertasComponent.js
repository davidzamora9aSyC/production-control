import { useState } from "react";

const alertas = [
    { tipo: "Máquina detenida", entidad: "Troqueladora", fecha: "29/11/2024", hora: "9:00 AM" },
    { tipo: "Mantenimiento", entidad: "Troqueladora", fecha: "28/11/2024", hora: "10:00 AM" },
    { tipo: "Orden atrasada", entidad: "CódigoOrden", fecha: "02/11/2024", hora: "4:30 AM" },
    { tipo: "Descanso excedido", entidad: "Nombre", fecha: "29/11/2024", hora: "9:00 AM" },
    { tipo: "Máquina detenida", entidad: "Troqueladora", fecha: "29/11/2024", hora: "9:00 AM" },
];

export default function Alertas() {
    const [desde, setDesde] = useState("2024-01-01");
    const [hasta, setHasta] = useState("2024-12-01");

    return (
        <div>
            <h2 className="text-2xl font-semibold pb-10">Alertas</h2>
            <section className="border rounded-xl px-4 bg-white h-[320px] shadow-md">
                <div className="flex gap-4 mb-4 text-sm py-4">
                    <label>De <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="ml-1 border px-2 py-1 rounded" /></label>
                    <label>A <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="ml-1 border px-2 py-1 rounded" /></label>
                </div>

                <div className=" overflow-y-auto text-sm pr-2 pb-2">
                    {alertas.map((a, i) => (
                        <div key={i} className="flex justify-between py-2 border-b last:border-b-0">
                            <span className="text-blue-600 cursor-pointer hover:underline">{a.tipo}</span>
                            <span>{a.entidad}</span>
                            <span>{a.fecha}</span>
                            <span>{a.hora}</span>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
