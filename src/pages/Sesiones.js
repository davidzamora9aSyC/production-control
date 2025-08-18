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
            .then(data => {
                console.log("Datos recibidos:", data);
                setDatos(data);
            })
            .catch(err => console.error("Error al obtener sesiones:", err));
    }, []);

    const totalPaginas = Math.ceil(datos.length / ITEMS_POR_PAGINA);
    const mostrar = datos.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);

    function generarCSV() {
        const headers = [
            "Máquina", "Último Trabajador", "Estado", "Grupo", "Inicio (hora)",
            "Vel. sin NPT", "Vel. con NPT (sesión)", "Vel. sin NPT (10min)",
            "Tiempo no productivo total (minutos)", "NPT por inactividad (Min)", "% NPT",
            "Defectos", "Producción total"
        ];
        const rows = mostrar.map(item => [
            item.maquina.nombre,
            item.trabajador.nombre,
            item.estadoSesion,
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
                    <table className="min-w-max table-auto w-full text-[11px] md:text-xs lg:text-sm">
                        <colgroup>
                          <col className="w-32 md:w-40 lg:w-48" />
                          <col className="w-40 md:w-48 lg:w-32" />
                          <col className="w-24 md:w-28 lg:w-32" />
                          <col className="w-24 md:w-28 lg:w-32" />
                          <col className="w-28 md:w-20 lg:w-32" />
                          <col className="w-28 md:w-20 lg:w-32" />
                          <col className="w-28 md:w-32 lg:w-40" />
                          <col className="w-28 md:w-32 lg:w-40" />
                          <col className="w-36 md:w-40 lg:w-48" />
                          <col className="w-36 md:w-24 lg:w-32" />
                          <col className="w-24 md:w-28 lg:w-32" />
                          <col className="w-20 md:w-24 lg:w-28" />
                          <col className="w-28 md:w-32 lg:w-40" />
                        </colgroup>
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="bg-gray-100 p-2 md:p-3 lg:p-4 border-r whitespace-normal">Máquina</th>
                                <th className="bg-gray-100 p-2 md:p-3 lg:p-4 border-r whitespace-normal">Último Trabajador</th>
                                <th className="bg-gray-100 p-2 md:p-3 lg:p-4 border-r whitespace-normal">Estado</th>
                                <th className="p-2 md:p-3 lg:p-4 border-r whitespace-normal">Grupo</th>
                                <th className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative group inline-block">
                                    <span className="inline-flex items-center gap-1 whitespace-normal">Inicio (hora)<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">Hora local de Bogotá del inicio de la sesión.</span>
                                  </div>
                                </th>
                                <th className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative group inline-block">
                                    <span className="inline-flex items-center gap-1 whitespace-normal">Vel. sin NPT <FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">Piezas por hora excluyendo NPT (total de piezas de sesión/(minutos de sesión - NPT)  * 60). Se mide en (piezas/hora)</span>
                                  </div>
                                </th>
                                <th className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative group inline-block">
                                    <span className="inline-flex items-center gap-1 whitespace-normal">Vel. con NPT (sesión)<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">Piezas por hora incluyendo tiempos no productivos (total de piezas de sesión / minutos totales de sesión * 60). Se mide en (piezas/hora)</span>
                                  </div>
                                </th>
                                <th className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative group inline-block">
                                    <span className="inline-flex items-center gap-1 whitespace-normal">Vel. sin NPT (10min)<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">Piezas por hora en los últimos 10 minutos excluyendo NPT (piezas contadas en la ventana / (minutos de ventana - NPT de ventana) * 60). Se mide en (piezas/hora)</span>
                                  </div>
                                </th>
                                <th className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative group inline-block">
                                    <span className="inline-flex items-center gap-1 whitespace-normal">Tiempo no productivo total (minutos)<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">Minutos sin producción: no hubo pedaleo y no se contaron piezas.</span>
                                  </div>
                                </th>
                                <th className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative group inline-block">
                                    <span className="inline-flex items-center gap-1 whitespace-normal">NPT por inactividad (Min)<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">Minutos sin actividad detectada durante periodos mayores a 3 minutos en la sesión.</span>
                                  </div>
                                </th>
                                <th className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative group inline-block">
                                    <span className="inline-flex items-center gap-1 whitespace-normal">% NPT<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">(tiempo no productivo total / minutos totales de la sesión) * 100.</span>
                                  </div>
                                </th>
                                <th className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative group inline-block">
                                    <span className="inline-flex items-center gap-1 whitespace-normal">Defectos<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">Pedaleadas menos piezas en toda la sesión.</span>
                                  </div>
                                </th>
                                <th className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative group inline-block">
                                    <span className="inline-flex items-center gap-1 whitespace-normal">Producción total<FaInfoCircle className="inline text-gray-500 ml-1" /></span>
                                    <span className="absolute right-0 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">Suma de piezas contadas en la sesión.</span>
                                  </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostrar.map((item, i) => {
                                console.log("Item:", item);
                                return (
                                <tr key={i} className="border-b cursor-pointer" onClick={() => navigate(`/sesion/${item.id}`)}>
                                    <td className="bg-white p-2 md:p-3 lg:p-4 border-r">{item.maquina.nombre}</td>
                                    <td className="bg-white p-2 md:p-3 lg:p-4 border-r">{item.trabajador.nombre}</td>
                                    <td className="p-2 md:p-3 lg:p-4 border-r break-words flex items-center gap-2 bg-white">
                                        {item.estadoSesion}
                                        <span className={`inline-block w-2 h-2 rounded-full ${
                                            item.estadoSesion === 'produccion' ? 'bg-green-500' :
                                            item.estadoSesion === 'inactivo' ? 'bg-red-500' :
                                            item.estadoSesion === 'descanso' ? 'bg-yellow-400' :
                                            item.estadoSesion?.includes('mantenimiento') ? 'bg-blue-500' :
                                            'bg-gray-400'
                                        }`}></span>
                                    </td>
                                    <td className="p-2 md:p-3 lg:p-4 border-r break-words">{item.grupo}</td>
                                    <td className="p-2 md:p-3 lg:p-4 border-r break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">{new Date(item.fechaInicio).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                                    <td className="p-2 md:p-3 lg:p-4 border-r break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">{item.avgSpeed.toFixed(2)}</td>
                                    <td className="p-2 md:p-3 lg:p-4 border-r break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">{item.avgSpeedSesion.toFixed(2)}</td>
                                    <td className="p-2 md:p-3 lg:p-4 border-r break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">{item.velocidadActual.toFixed(2)}</td>
                                    <td className="p-2 md:p-3 lg:p-4 border-r break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">{item.nptMin}</td>
                                    <td className="p-2 md:p-3 lg:p-4 border-r break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">{item.nptPorInactividad}</td>
                                    <td className="p-2 md:p-3 lg:p-4 border-r break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">{Number(item.porcentajeNPT).toFixed(2)}%</td>
                                    <td className="p-2 md:p-3 lg:p-4 border-r break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">{item.defectos}</td>
                                    <td className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">{item.produccionTotal}</td>
                                </tr>
                                );
                            })}
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
