import Navbar from "../components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Alertas() {
    const navigate = useNavigate();
    
    const alertas = [
        {
            tipo: "Máquina detenida",
            fecha: "29/11/2024 9:00 AM",
            detalle: "La máquina 2 en la sección de troqueladoras ha estado detenida más de 15 minutos"
        },
        {
            tipo: "Mantenimiento",
            fecha: "28/11/2024 10:00 AM",
            detalle: "Una prensa ha tenido un uso extensivo sin recibir mantenimiento. Mantenimiento preventivo necesario"
        },
        {
            tipo: "Orden atrasada",
            fecha: "02/11/2024 4:30 AM",
            detalle: "La orden de producción 4IHD1WSZ9X ha entrado en estado Demorado."
        },
        {
            tipo: "Descanso excedido",
            fecha: "29/11/2024 9:00 AM",
            detalle: "El operario Carlos Pérez ha excedido el límite de 60 minutos de descanso."
        },
        {
            tipo: "Máquina detenida",
            fecha: "29/11/2024 9:00 AM",
            detalle: "La máquina 4 en la sección de troqueladoras ha estado detenida más de 15 minutos"
        },
        {
            tipo: "Máquina detenida",
            fecha: "29/11/2024 9:00 AM",
            detalle: "La máquina 2 en la sección de troqueladoras ha estado detenida más de 15 minutos"
        },
        {
            tipo: "Mantenimiento",
            fecha: "28/11/2024 10:00 AM",
            detalle: "Una prensa ha tenido un uso extensivo sin recibir mantenimiento. Mantenimiento preventivo necesario"
        },
        {
            tipo: "Orden atrasada",
            fecha: "02/11/2024 4:30 AM",
            detalle: "La orden de producción 4IHD1WSZ9X ha entrado en estado Demorado."
        },
        {
            tipo: "Descanso excedido",
            fecha: "29/11/2024 9:00 AM",
            detalle: "El operario Carlos Pérez ha excedido el límite de 60 minutos de descanso."
        },
        {
            tipo: "Máquina detenida",
            fecha: "29/11/2024 9:00 AM",
            detalle: "La máquina 4 en la sección de troqueladoras ha estado detenida más de 15 minutos"
        },
    ];
    
    const [tipoSeleccionado, setTipoSeleccionado] = useState("Todos");
    
    const tipos = ["Todos", ...new Set(alertas.map(a => a.tipo))];
    const alertasFiltradas = tipoSeleccionado === "Todos" ? alertas : alertas.filter(a => a.tipo === tipoSeleccionado);

    const generarCSV = () => {
        const headers = ["Tipo de alerta", "Fecha de alerta", "Detalles"];
        const rows = alertasFiltradas.map(a => [a.tipo, a.fecha, a.detalle]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.map(field => `"${field.replace(/"/g, '""')}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "alertas_reporte.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white min-h-screen animate-slideLeft">

            <div className="px-20 pt-10">
                <button
                    onClick={() => navigate("/dashboard", { state: { entradaReturn: true } })}
                    className="text-blue-600 text-xl mb-4 hover:underline"
                >
                    &larr; Volver
                </button>
                <div className="text-3xl font-semibold mb-6">Alertas</div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <label className="font-medium mr-2">Tipo de alertas</label>
                        <select
                            className="border border-gray-300 px-2 py-1 rounded"
                            value={tipoSeleccionado}
                            onChange={(e) => setTipoSeleccionado(e.target.value)}
                        >
                            {tipos.map((tipo, idx) => (
                                <option key={idx} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span>De</span>
                        <input type="date" className="border px-2 py-1 rounded" defaultValue="2024-01-01" />
                        <span>A</span>
                        <input type="date" className="border px-2 py-1 rounded" defaultValue="2024-12-01" />
                        <button
                            onClick={generarCSV}
                            className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                            Generar reporte
                        </button>
                    </div>
                </div>
                <table className="w-full text-left text-sm border-t border-b border-black">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2 text-blue-800">Tipo de alerta</th>
                            <th className="py-2">Fecha de alerta</th>
                            <th className="py-2">Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alertasFiltradas.map((a, i) => (
                            <tr 
                                key={i} 
                                className="border-t cursor-pointer" 
                                onClick={() => a.tipo === "Máquina detenida" && navigate(`/maquina/${i}`)} // Aquí navegamos a la máquina cuando la alerta sea de tipo "Máquina detenida"
                            >
                                <td className="text-blue-800 py-2">{a.tipo}</td>
                                <td className="py-2">{a.fecha}</td>
                                <td className="py-2">{a.detalle}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default Alertas;