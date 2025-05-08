import Navbar from "../components/Navbar";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ModalCargarCSV from "../components/ModalCargarCSV";


const datos = Array(20).fill().map((_, i) => ({
    id: i + 1,
    nombre: `Máquina ${i + 1}`,
    tipo: "Industrial",
    estado: i % 2 === 0 ? "Operativa" : "En mantenimiento",
    ubicacion: "Planta 1",
    fechaInstalacion: "2020-01-01",
    usoHoras: Math.floor(Math.random() * 10000),
    ultimaMantencion: "2024-01-01"
}));

const ITEMS_POR_PAGINA = 8;

export default function Equipos() {
    const [pagina, setPagina] = useState(1);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [mostrarCargarCSV, setMostrarCargarCSV] = useState(false);
    const navigate = useNavigate();
    const totalPaginas = Math.ceil(datos.length / ITEMS_POR_PAGINA);
    const mostrar = datos.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const generarCSV = () => {
        const headers = ["ID", "Nombre", "Tipo", "Estado", "Ubicación", "Fecha instalación", "Horas de uso", "Último mantenimiento"];
        const rows = mostrar.map(item => [
            item.id,
            item.nombre,
            item.tipo,
            item.estado,
            item.ubicacion,
            item.fechaInstalacion,
            item.usoHoras,
            item.ultimaMantencion
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_equipos_pagina_${pagina}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white h-screen overflow-hidden animate-slideLeft">
            <div className="px-20 pt-10">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-blue-600 text-xl mb-4 hover:underline"
                >
                    &larr; Volver
                </button>

                <div className="flex justify-between items-center mb-6">
                    <div className="text-3xl font-semibold">Equipos Registrados</div>
                    <div className="flex items-center gap-2">
                        <button onClick={generarCSV} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">Generar reporte</button>
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setMenuAbierto(p => !p)} className="bg-blue-600 text-white text-2xl px-4 py-1 rounded-full">+</button>
                            {menuAbierto && (
                                <div className="absolute flex flex-col gap-1 right-0 top-full mt-2 bg-white border rounded shadow-lg z-10">
                                    <button onClick={() => alert("Abrir formulario")} className="text-left px-4 py-2 hover:bg-gray-100 whitespace-nowrap">Registrar manualmente</button>
                                    <button onClick={() => { setMostrarCargarCSV(true); setMenuAbierto(false); }} className="text-left px-4 py-2 hover:bg-gray-100 whitespace-nowrap">Cargar CSV</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-xl shadow-md">
                    <table className="min-w-max w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="px-4 py-2 border-r">ID</th>
                                <th className="px-4 py-2 border-r">Nombre</th>
                                <th className="px-4 py-2 border-r">Tipo</th>
                                <th className="px-4 py-2 border-r">Estado</th>
                                <th className="px-4 py-2 border-r">Ubicación</th>
                                <th className="px-4 py-2 border-r">Fecha instalación</th>
                                <th className="px-4 py-2 border-r">Horas de uso</th>
                                <th className="px-4 py-2">Último mantenimiento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostrar.map((item, i) => (
                                <tr key={i} className="border-b cursor-pointer" onClick={() => navigate(`/maquina/${item.id}`)}>
                                    <td className="px-4 py-2 border-r">{item.id}</td>
                                    <td className="px-4 py-2 border-r">{item.nombre}</td>
                                    <td className="px-4 py-2 border-r">{item.tipo}</td>
                                    <td className="px-4 py-2 border-r">{item.estado}</td>
                                    <td className="px-4 py-2 border-r">{item.ubicacion}</td>
                                    <td className="px-4 py-2 border-r">{item.fechaInstalacion}</td>
                                    <td className="px-4 py-2 border-r">{item.usoHoras}</td>
                                    <td className="px-4 py-2">{item.ultimaMantencion}</td>
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

            {mostrarCargarCSV && (
                <ModalCargarCSV
                    titulo="Cargar equipos"
                    onClose={() => setMostrarCargarCSV(false)}
                    onUpload={(archivo) => {
                        console.log("Archivo de equipos cargado:", archivo);
                        setMostrarCargarCSV(false);
                    }}
                />
            )}
        </div>
    );
}