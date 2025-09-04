import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import { FaInfoCircle } from "react-icons/fa";
import SesionIndicadoresModal from "../components/SesionIndicadoresModal";

const ITEMS_POR_PAGINA = 8;

export default function Sesiones() {
    const [pagina, setPagina] = useState(1);
    const [datos, setDatos] = useState([]);
    const [orden, setOrden] = useState({ columna: null, ascendente: true });
    const [modalSesionId, setModalSesionId] = useState(null);
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

    function ordenarPor(columna) {
        const esAscendente = orden.columna === columna ? !orden.ascendente : true;
        const sorted = [...datos].sort((a, b) => {
            const aVal = columna.includes('.') ? columna.split('.').reduce((o, k) => o?.[k], a) : a[columna];
            const bVal = columna.includes('.') ? columna.split('.').reduce((o, k) => o?.[k], b) : b[columna];

            if (!isNaN(parseFloat(aVal)) && !isNaN(parseFloat(bVal))) {
                return esAscendente ? aVal - bVal : bVal - aVal;
            } else {
                return esAscendente ? String(aVal).localeCompare(bVal) : String(bVal).localeCompare(aVal);
            }
        });
        setOrden({ columna, ascendente: esAscendente });
        setDatos(sorted);
    }

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
                                <th onClick={() => ordenarPor("maquina.nombre")} className="bg-gray-100 p-2 md:p-3 lg:p-4 border-r whitespace-normal">Máquina</th>
                                <th onClick={() => ordenarPor("trabajador.nombre")} className="bg-gray-100 p-2 md:p-3 lg:p-4 border-r whitespace-normal">Último Trabajador</th>
                                <th onClick={() => ordenarPor("estadoSesion")} className="bg-gray-100 p-2 md:p-3 lg:p-4 border-r whitespace-normal">Estado</th>
                                <th onClick={() => ordenarPor("grupo")} className="p-2 md:p-3 lg:p-4 border-r whitespace-normal">Grupo</th>
                                <th onClick={() => ordenarPor("fechaInicio")} className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative inline-flex items-center gap-1">
                                    <span>Inicio (hora)</span>
                                    {orden.columna === "fechaInicio" && (
                                      <span>{orden.ascendente ? "▲" : "▼"}</span>
                                    )}
                                    <span className="relative group inline-block">
                                      <FaInfoCircle className="text-gray-500" size={14} />
                                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 w-max min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">
                                        Hora local de Bogotá del inicio de la sesión.
                                      </span>
                                    </span>
                                  </div>
                                </th>
                                <th onClick={() => ordenarPor("avgSpeed")} className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative inline-flex items-center gap-1">
                                    <span>Vel. sin NPT</span>
                                    {orden.columna === "avgSpeed" && (
                                      <span>{orden.ascendente ? "▲" : "▼"}</span>
                                    )}
                                    <span className="relative group inline-block">
                                      <FaInfoCircle className="text-gray-500" size={14} />
                                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 w-max min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">
                                        Piezas por hora excluyendo NPT (total de piezas de sesión/(minutos de sesión - NPT)  * 60). Se mide en (piezas/hora)
                                      </span>
                                    </span>
                                  </div>
                                </th>
                                <th onClick={() => ordenarPor("avgSpeedSesion")} className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative inline-flex items-center gap-1">
                                    <span>Vel. con NPT (sesión)</span>
                                    {orden.columna === "avgSpeedSesion" && (
                                      <span>{orden.ascendente ? "▲" : "▼"}</span>
                                    )}
                                    <span className="relative group inline-block">
                                      <FaInfoCircle className="text-gray-500" size={14} />
                                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 w-max min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">
                                        Piezas por hora incluyendo tiempos no productivos (total de piezas de sesión / minutos totales de sesión * 60). Se mide en (piezas/hora)
                                      </span>
                                    </span>
                                  </div>
                                </th>
                                <th onClick={() => ordenarPor("velocidadActual")} className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative inline-flex items-center gap-1">
                                    <span>Vel. sin NPT (10min)</span>
                                    {orden.columna === "velocidadActual" && (
                                      <span>{orden.ascendente ? "▲" : "▼"}</span>
                                    )}
                                    <span className="relative group inline-block">
                                      <FaInfoCircle className="text-gray-500" size={14} />
                                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 w-max min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">
                                        Piezas por hora en los últimos 10 minutos excluyendo NPT (piezas contadas en la ventana / (minutos de ventana - NPT de ventana) * 60). Se mide en (piezas/hora)
                                      </span>
                                    </span>
                                  </div>
                                </th>
                                <th onClick={() => ordenarPor("nptMin")} className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative inline-flex items-center gap-1">
                                    <span>Tiempo no productivo total (minutos)</span>
                                    {orden.columna === "nptMin" && (
                                      <span>{orden.ascendente ? "▲" : "▼"}</span>
                                    )}
                                    <span className="relative group inline-block">
                                      <FaInfoCircle className="text-gray-500" size={14} />
                                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 w-max min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">
                                        Minutos sin producción: no hubo pedaleo y no se contaron piezas.
                                      </span>
                                    </span>
                                  </div>
                                </th>
                                <th onClick={() => ordenarPor("nptPorInactividad")} className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative inline-flex items-center gap-1">
                                    <span>NPT por inactividad (Min)</span>
                                    {orden.columna === "nptPorInactividad" && (
                                      <span>{orden.ascendente ? "▲" : "▼"}</span>
                                    )}
                                    <span className="relative group inline-block">
                                      <FaInfoCircle className="text-gray-500" size={14} />
                                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 w-max min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">
                                        Minutos sin actividad detectada durante periodos mayores a 3 minutos en la sesión.
                                      </span>
                                    </span>
                                  </div>
                                </th>
                                <th onClick={() => ordenarPor("porcentajeNPT")} className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative inline-flex items-center gap-1">
                                    <span>% NPT</span>
                                    {orden.columna === "porcentajeNPT" && (
                                      <span>{orden.ascendente ? "▲" : "▼"}</span>
                                    )}
                                    <span className="relative group inline-block">
                                      <FaInfoCircle className="text-gray-500" size={14} />
                                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 w-max min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">
                                        (tiempo no productivo total / minutos totales de la sesión) * 100.
                                      </span>
                                    </span>
                                  </div>
                                </th>
                                <th onClick={() => ordenarPor("defectos")} className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative inline-flex items-center gap-1">
                                    <span>Defectos</span>
                                    {orden.columna === "defectos" && (
                                      <span>{orden.ascendente ? "▲" : "▼"}</span>
                                    )}
                                    <span className="relative group inline-block">
                                      <FaInfoCircle className="text-gray-500" size={14} />
                                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 w-max min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">
                                        Pedaleadas menos piezas en toda la sesión.
                                      </span>
                                    </span>
                                  </div>
                                </th>
                                <th onClick={() => ordenarPor("produccionTotal")} className="p-2 md:p-3 lg:p-4 break-words max-w-[8rem] md:max-w-[12rem] lg:max-w-[16rem]">
                                  <div className="relative inline-flex items-center gap-1">
                                    <span>Producción total</span>
                                    {orden.columna === "produccionTotal" && (
                                      <span>{orden.ascendente ? "▲" : "▼"}</span>
                                    )}
                                    <span className="relative group inline-block">
                                      <FaInfoCircle className="text-gray-500" size={14} />
                                      <span className="absolute right-0 top-full mt-1 hidden group-hover:block rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg z-20 !z-50 w-max min-w-[16rem] md:min-w-[20rem] lg:min-w-[24rem]">
                                        Suma de piezas contadas en la sesión.
                                      </span>
                                    </span>
                                  </div>
                                </th>
                                <th className="p-2 md:p-3 lg:p-4">Indicadores</th>
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
                                    <td className="p-2 md:p-3 lg:p-4">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setModalSesionId(item.id); }}
                                        className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                                      >
                                        Ver indicadores
                                      </button>
                                    </td>
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
            {modalSesionId && (
              <SesionIndicadoresModal sesionId={modalSesionId} onClose={() => setModalSesionId(null)} />
            )}
        </div>
    );
}
