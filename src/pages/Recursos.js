import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

const ITEMS_POR_PAGINA = 8;

export default function Recursos() {
    const [pagina, setPagina] = useState(1);
    const [datos, setDatos] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_BASE_URL}/recursos/actuales`)
            .then(res => res.json())
            .then(setDatos)
            .catch(err => console.error("Error al obtener recursos:", err));
    }, []);

    const totalPaginas = Math.ceil(datos.length / ITEMS_POR_PAGINA);
    const mostrar = datos.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);

    function generarCSV() {
        const headers = ["Máquina", "Último Trabajador", "Grupo", "Estado", "AVG. speed (parts/hr)", "NPT (Min)", "Defectos", "NPT (Min/day)", "Producción total"];
        const rows = mostrar.map(item => [
            item.maquina,
            item.trabajador,
            item.grupo,
            item.estado,
            item.avg,
            item.npt,
            item.defectos,
            item.nptDia,
            item.total
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

                <div className="text-3xl font-semibold mb-6">Recursos Actuales</div>

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
                                <th className="px-4 py-2 border-r">Estado</th>
                                <th className="px-4 py-2 border-r">AVG. speed (parts/hr)</th>
                                <th className="px-4 py-2 border-r">NPT (Min)</th>
                                <th className="px-4 py-2 border-r">Defectos</th>
                                <th className="px-4 py-2 border-r">NPT (Min/day)</th>
                                <th className="px-4 py-2">Producción total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostrar.map((item, i) => (
                                <tr key={i} className="border-b cursor-pointer" onClick={() => navigate(`/maquina/${item.maquina}`)}>
                                    <td className="sticky left-0 bg-white px-4 py-2 border-r z-0">{item.maquina}</td>
                                    <td className="sticky left-16 bg-white px-4 py-2 border-r z-0">{item.trabajador}</td>
                                    <td className="px-4 py-2 border-r">{item.grupo}</td>
                                    <td className="px-4 py-2 border-r">{item.estado}</td>
                                    <td className="px-4 py-2 border-r">{item.avg}</td>
                                    <td className="px-4 py-2 border-r">{item.npt}</td>
                                    <td className="px-4 py-2 border-r">{item.defectos}</td>
                                    <td className="px-4 py-2 border-r">{item.nptDia}</td>
                                    <td className="px-4 py-2">{item.total}</td>
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
