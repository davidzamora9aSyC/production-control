import Navbar from "../components/Navbar";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ModalCargarCSV from "../components/ModalCargarCSV";
import MaquinaForm from "../components/MaquinaForm";

const ITEMS_POR_PAGINA = 8;

export default function Equipos() {
    const [pagina, setPagina] = useState(1);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [mostrarCargarCSV, setMostrarCargarCSV] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [equipos, setEquipos] = useState([]);
    const [progresos, setProgresos] = useState({});
    const [equipoEditar, setEquipoEditar] = useState(null);
    const timeoutRefs = useRef({});
    const navigate = useNavigate();
    const totalPaginas = Math.ceil(equipos.length / ITEMS_POR_PAGINA);
    const mostrar = equipos.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);
    const menuRef = useRef();

    const cargarEquipos = () => {
        fetch("https://smartindustries.org/maquinas")
            .then(res => res.json())
            .then(setEquipos)
            .catch(err => console.error("Error al obtener máquinas:", err)); 
    };

    useEffect(() => {
        cargarEquipos();
    }, []);

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

    const iniciarBorrado = (id) => {
        timeoutRefs.current[id] = setTimeout(() => {
            fetch(`https://smartindustries.org/maquinas/${id}`, { method: 'DELETE' })
                .then(() => {
                    setEquipos(prev => prev.filter(e => e.id !== id));
                })
                .catch(err => console.error("Error al borrar:", err));
            setProgresos(prev => ({ ...prev, [id]: 0 }));
        }, 10000);

        let inicio = Date.now();
        const intervalo = setInterval(() => {
            const transcurrido = Date.now() - inicio;
            setProgresos(prev => ({ ...prev, [id]: Math.min(transcurrido / 10000, 1) }));
            if (transcurrido >= 10000) clearInterval(intervalo);
        }, 100);
        timeoutRefs.current[`interval-${id}`] = intervalo;
    };

    const cancelarBorrado = (id) => {
        clearTimeout(timeoutRefs.current[id]);
        clearInterval(timeoutRefs.current[`interval-${id}`]);
        setProgresos(prev => ({ ...prev, [id]: 0 }));
    };

    const generarCSV = () => {
        const headers = ["ID", "Nombre", "Tipo", "Estado", "Ubicación", "Fecha instalación"];
        const rows = mostrar.map(item => [
            item.id,
            item.nombre,
            item.tipo,
            item.estado,
            item.ubicacion,
            item.fechaInstalacion
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
                                    <button onClick={() => { setEquipoEditar(null); setMostrarFormulario(true); setMenuAbierto(false); }} className="text-left px-4 py-2 hover:bg-gray-100 whitespace-nowrap">Registrar manualmente</button>
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
                                <th className="px-4 py-2 border-r">Observaciones</th>
                                <th className="px-4 py-2">Acciones</th>
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
                                    <td className="px-4 py-2 border-r">{item.observaciones || "-"}</td>
                                    <td className="px-4 py-2 flex gap-2 justify-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEquipoEditar(item); setMostrarFormulario(true); }}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onMouseDown={(e) => { e.stopPropagation(); iniciarBorrado(item.id); }}
                                            onMouseUp={(e) => { e.stopPropagation(); cancelarBorrado(item.id); }}
                                            onMouseLeave={(e) => { e.stopPropagation(); cancelarBorrado(item.id); }}
                                            className="relative bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                        >
                                            🗑️
                                            {progresos[item.id] > 0 && (
                                                <div className="absolute bottom-0 left-0 h-1 bg-white" style={{ width: `${progresos[item.id] * 100}%` }} />
                                            )}
                                        </button>
                                    </td>
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
                        cargarEquipos();
                    }}
                />
            )}

            {mostrarFormulario && (
                <MaquinaForm
                    modo={equipoEditar ? 'editar' : 'crear'}
                    equipo={equipoEditar}
                    onClose={() => { setMostrarFormulario(false); setEquipoEditar(null); }}
                    onSave={() => {
                        setMostrarFormulario(false);
                        setEquipoEditar(null);
                        cargarEquipos();
                    }}
                />
            )}
        </div>
    );
}