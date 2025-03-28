import { useState } from "react";
import { useNavigate } from "react-router-dom";

const alertas = [
    { tipo: "Máquina detenida", entidad: "Troqueladora", fecha: "29/11/2024", hora: "9:00 AM" },
    { tipo: "Mantenimiento", entidad: "Troqueladora", fecha: "28/11/2024", hora: "10:00 AM" },
    { tipo: "Orden atrasada", entidad: "CódigoOrden", fecha: "02/11/2024", hora: "4:30 AM" },
    { tipo: "Descanso excedido", entidad: "Nombre", fecha: "29/11/2024", hora: "9:00 AM" },
    { tipo: "Máquina detenida", entidad: "Troqueladora", fecha: "29/11/2024", hora: "9:00 AM" },
    { tipo: "Mantenimiento", entidad: "Prensa", fecha: "20/11/2024", hora: "11:00 AM" },
    { tipo: "Orden atrasada", entidad: "CódigoOrden2", fecha: "19/11/2024", hora: "2:15 PM" },
    { tipo: "Descanso excedido", entidad: "Empleado A", fecha: "18/11/2024", hora: "3:45 PM" },
    { tipo: "Máquina detenida", entidad: "Troqueladora", fecha: "17/11/2024", hora: "8:30 AM" },
    { tipo: "Mantenimiento", entidad: "Cortadora", fecha: "16/11/2024", hora: "9:00 AM" },
    { tipo: "Orden atrasada", entidad: "CódigoOrden3", fecha: "15/11/2024", hora: "10:45 AM" },
    { tipo: "Descanso excedido", entidad: "Empleado B", fecha: "14/11/2024", hora: "1:30 PM" },
    { tipo: "Máquina detenida", entidad: "Cortadora", fecha: "13/11/2024", hora: "7:50 AM" },
];

export default function Alertas() {
    const [desde, setDesde] = useState("2024-01-01");
    const [hasta, setHasta] = useState("2024-12-01");
    const navigate = useNavigate();

    return (
        <div>
            <h2 className="text-2xl font-semibold pb-10">Alertas</h2>
            <section className="border rounded-xl px-4 bg-white h-[320px] shadow-md flex flex-col">
                <div className="flex gap-4 mb-4 text-base py-4">
                    <label>De <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="ml-1 border px-2 py-1 rounded" /></label>
                    <label>A <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="ml-1 border px-2 py-1 rounded" /></label>
                    <div className="ml-auto">
                        <button
                            onClick={() => navigate("/alertas")}
                            className="bg-blue-600 text-white px-4 py-1 rounded-2xl hover:bg-blue-700 transition-colors duration-300"
                        >
                            Ver detalle
                        </button>
                    </div>
                </div>

                <div className="text-base pr-2 pb-2 overflow-y-auto grow">
                    <div className="grid grid-cols-4 font-semibold border-b pb-2">
                        <span>Tipo</span>
                        <span>Entidad</span>
                        <span>Fecha</span>
                        <span>Hora</span>
                    </div>
                    {alertas.map((a, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-4 py-2 border-b last:border-b-0 cursor-pointer"
                            onClick={() => a.tipo === "Máquina detenida" && navigate(`/maquina/${i}`)}
                        >
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
