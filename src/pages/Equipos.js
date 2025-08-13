import Navbar from "../components/Navbar";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ModalCargarCSV from "../components/ModalCargarCSV";
import MaquinaForm from "../components/MaquinaForm";
import ErrorPopup from "../components/ErrorPopup";
import { API_BASE_URL } from "../api";

const ITEMS_POR_PAGINA = 8;

export default function Equipos() {
    const [pagina, setPagina] = useState(1);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [mostrarCargarCSV, setMostrarCargarCSV] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [equipos, setEquipos] = useState([]);
    const [equipoEditar, setEquipoEditar] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const navigate = useNavigate();
    const totalPaginas = Math.ceil(equipos.length / ITEMS_POR_PAGINA);
    const mostrar = equipos.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);
    const menuRef = useRef();

    const cargarEquipos = () => {
        fetch(`${API_BASE_URL}/maquinas`)
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

    const borrarMaquina = (id, e) => {
        e.stopPropagation();
        if (!window.confirm("¿Seguro que deseas borrar esta máquina?")) return;
        fetch(`${API_BASE_URL}/maquinas/${id}`, { method: "DELETE" })
          .then(res => {
            if (!res.ok) throw new Error("Error al borrar máquina");
            setEquipos(prev => prev.filter(eq => eq.id !== id));
          })
          .catch(err => {
            console.error("Error al borrar:", err);
            setErrorMsg(err.message || "Error al borrar máquina");
          });
    };

    const generarCSV = () => {
        const headers = ["Codigo de equipo", "Nombre", "Tipo", "Estado", "Ubicación", "Fecha instalación", "Observaciones"];
        const rows = mostrar.map(item => [
            item.codigo,
            item.nombre,
            item.tipo,
            item.estado,
            item.ubicacion,
            item.fechaInstalacion,
            item.observaciones || ""
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
                                <th className="px-4 py-2 border-r">Código</th>
                                <th className="px-4 py-2 border-r">Nombre</th>
                                <th className="px-4 py-2 border-r">Tipo</th>
                                <th className="px-4 py-2 border-r">Estado</th>
                                <th className="px-4 py-2 border-r">Ubicación</th>
                                <th className="px-4 py-2 border-r">Fecha instalación</th>
                                <th className="px-4 py-2 border-r">Observaciones</th>
                                <th className="px-4 py-2 border-r">Área</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostrar.map((item, i) => (
                                <tr key={i} className="border-b cursor-pointer" onClick={() => navigate(`/maquina/${item.id}`)}>
                                    <td
                                        className="px-4 py-2 border-r"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {item.id}
                                    </td>
                                    <td className="px-4 py-2 border-r">{item.codigo}</td>
                                    <td className="px-4 py-2 border-r">{item.nombre}</td>
                                    <td className="px-4 py-2 border-r">{item.tipo}</td>
                                    <td className="px-4 py-2 border-r">{item.estado}</td>
                                    <td className="px-4 py-2 border-r">{item.ubicacion}</td>
                                    <td className="px-4 py-2 border-r">{item.fechaInstalacion}</td>
                                    <td className="px-4 py-2 border-r">{item.observaciones || "-"}</td>
                                    <td className="px-4 py-2 border-r">{item.areaNombre || "-"}</td>
                                    <td className="px-4 py-2 flex gap-2 justify-center">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEquipoEditar(item); setMostrarFormulario(true); }}
                                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => borrarMaquina(item.id, e)}
                                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                        >
                                            🗑️
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
                    onError={(m) => setErrorMsg(m)}
                />
            )}
            {errorMsg && (
                <ErrorPopup mensaje={errorMsg} onClose={() => setErrorMsg(null)} />
            )}
        </div>
    );
}