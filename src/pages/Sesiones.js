import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import { FaInfoCircle } from "react-icons/fa";

const ITEMS_POR_PAGINA = 8;

export default function Sesiones() {
    const [pagina, setPagina] = useState(1);
    const [datos, setDatos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_BASE_URL}/sesiones-trabajo/actuales`)
            .then(res => res.json())
            .then(setDatos)
            .catch(err => console.error("Error al obtener sesiones:", err));
    }, []);

    const totalPaginas = Math.ceil(datos.length / ITEMS_POR_PAGINA);
    const mostrar = datos.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);

    function generarCSV() {
        const headers = [
            "Máquina", "Último Trabajador", "Grupo", "Inicio (hora)",
            "Vel. sin NPT", "Vel. con NPT (sesión)", "Vel. sin NPT (10min)",
            "NPT (Min)", "NPT por inactividad (Min)", "% NPT",
            "Defectos", "Producción total"
        ];
        const rows = mostrar.map(item => [
            item.maquina.nombre,
            item.trabajador.nombre,
            item.grupo,
            new Date(item.fechaInicio).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false }),
            item.avgSpeed.toFixed(2),
            item.avgSpeedSesion.toFixed(2),
            item.velocidadActual.toFixed(2),
            item.nptMin,
            item.nptPorInactividad,
            Number(item.porcentajeNPT).toFixed(2) + "%",
            item.defectos,
            item.produccionTotal
        ]);
        const csvContent = [headers, ...rows]
            .map(e => e.map(a => `"${String(a).replace(/"/g, '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_pagina_${pagina}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="bg-white h-screen overflow-hidden animate-slideLeft">


            <div className="px-20 pt-10">
                <button
                    onClick={() => navigate("/dashboard", { state: { entradaReturn: true } })}
                    className="text-blue-600 text-xl mb-4 hover:underline"
                >
                    &larr; Volver
                </button>

                <div className="text-3xl font-semibold mb-6">Sesiones Actuales</div>

                <div className="flex justify-end mb-2">
                    <button onClick={generarCSV} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Generar reporte
                    </button>
                </div>

                <div className="overflow-x-auto border rounded-xl shadow-md">
                    <table className="min-w-max w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="sticky left-0 z-10 bg-gray-100 px-4 py-2 border-r">Máquina</th>
                                <th className="sticky left-16 z-10 bg-gray-100 px-4 py-2 border-r">Último Trabajador</th>
                                <th className="px-4 py-2 border-r">Grupo</th>
                                <th className="px-4 py-2 border-r relative group">
                                  <span className="inline-flex items-center gap-1">Inicio (hora)<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible">Hora local de Bogotá del inicio de la sesión.</span>
                                </th>
                                <th className="px-4 py-2 border-r relative group">
                                  <span className="inline-flex items-center gap-1">Vel. sin NPT <FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible">Piezas por hora excluyendo NPT (total de piezas de sesión/(minutos de sesión - NPT)  * 60). Se mide en (piezas/hora)</span>
                                </th>
                                <th className="px-4 py-2 border-r relative group">
                                  <span className="inline-flex items-center gap-1">Vel. con NPT (sesión)<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible">Piezas por hora incluyendo tiempos no productivos (total de piezas de sesión / minutos totales de sesión * 60). Se mide en (piezas/hora)</span>
                                </th>
                                <th className="px-4 py-2 border-r relative group">
                                  <span className="inline-flex items-center gap-1">Vel. sin NPT (10min)<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible">Piezas por hora en los últimos 10 minutos excluyendo NPT (piezas contadas en la ventana / (minutos de ventana - NPT de ventana) * 60). Se mide en (piezas/hora)</span>
                                </th>
                                <th className="px-4 py-2 border-r relative group">
                                  <span className="inline-flex items-center gap-1">NPT (Min)<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible">Minutos sin producción: no hubo pedaleo y no se contaron piezas.</span>
                                </th>
                                <th className="px-4 py-2 border-r relative group">
                                  <span className="inline-flex items-center gap-1">NPT por inactividad (Min)<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible">Minutos sin actividad detectada durante periodos mayores a 3 minutos en la sesión.</span>
                                </th>
                                <th className="px-4 py-2 border-r relative group">
                                  <span className="inline-flex items-center gap-1">% NPT<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible">(NPT (Min) / minutos totales de la sesión) * 100.</span>
                                </th>
                                <th className="px-4 py-2 border-r relative group">
                                  <span className="inline-flex items-center gap-1">Defectos<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible">Pedaleadas menos piezas en toda la sesión.</span>
                                </th>
                                <th className="px-4 py-2 border-r relative group">
                                  <span className="inline-flex items-center gap-1">Producción total<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible">Suma de piezas contadas en la sesión.</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostrar.map((item, i) => (
                                <tr key={i} className="border-b cursor-pointer" onClick={() => navigate(`/sesion/${item.id}`)}>
                                    <td className="sticky left-0 bg-white px-4 py-2 border-r z-0">{item.maquina.nombre}</td>
                                    <td className="sticky left-16 bg-white px-4 py-2 border-r z-0">{item.trabajador.nombre}</td>
                                    <td className="px-4 py-2 border-r">{item.grupo}</td>
                                    <td className="px-4 py-2 border-r">{new Date(item.fechaInicio).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                                    <td className="px-4 py-2 border-r">{item.avgSpeed.toFixed(2)}</td>
                                    <td className="px-4 py-2 border-r">{item.avgSpeedSesion.toFixed(2)}</td>
                                    <td className="px-4 py-2 border-r">{item.velocidadActual.toFixed(2)}</td>
                                    <td className="px-4 py-2 border-r">{item.nptMin}</td>
                                    <td className="px-4 py-2 border-r">{item.nptPorInactividad}</td>
                                    <td className="px-4 py-2 border-r">{Number(item.porcentajeNPT).toFixed(2)}%</td>
                                    <td className="px-4 py-2 border-r">{item.defectos}</td>
                                    <td className="px-4 py-2">{item.produccionTotal}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-center gap-2">
                    <button onClick={() => setPagina(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Anterior</button>
                    <span className="px-3 py-1">{pagina} / {totalPaginas}</span>
                    <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} className="px-3 py-1 border rounded">Siguiente</button>
                </div>
            </div>
        </div>
    );
}
