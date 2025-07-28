import Navbar from "../components/Navbar";
import ModalCargarCSV from "../components/ModalCargarCSV";
import TrabajadorForm from "../components/TrabajadorForm";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { API_BASE_URL } from "../api";

const ITEMS_POR_PAGINA = 8;

export default function Personas() {
    const [pagina, setPagina] = useState(1);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [mostrarCargarCSV, setMostrarCargarCSV] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [trabajadores, setTrabajadores] = useState([]);
    const [progresos, setProgresos] = useState({});
    const [editar, setEditar] = useState(null);
    const navigate = useNavigate();
    const totalPaginas = Math.ceil(trabajadores.length / ITEMS_POR_PAGINA);
    const mostrar = trabajadores.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);
    const menuRef = useRef();

    useEffect(() => {
        fetch(`${API_BASE_URL}/trabajadores`)
            .then(res => res.json())
            .then(setTrabajadores)
            .catch(err => console.error("Error al obtener trabajadores:", err));
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

    const generarCSV = () => {
        const headers = ["ID", "Nombre", "Identificación", "Grupo", "Turno", "Estado", "Fecha de inicio"];
        const rows = mostrar.map(item => [
            item.id,
            item.nombre,
            item.identificacion,
            item.grupo,
            item.turno,
            item.estado,
            item.fechaInicio
        ]);
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        saveAs(blob, `trabajadores_pagina_${pagina}.csv`);
    };

    const tiempoBorrado = 10000;
    const timeoutRefs = useRef({});

    const iniciarBorrado = (id) => {
        timeoutRefs.current[id] = setTimeout(() => {
            fetch(`${API_BASE_URL}/trabajadores/${id}`, {
                method: 'DELETE',
            })
            .then(res => {
                if (!res.ok) throw new Error("Error al borrar trabajador");
                setTrabajadores(prevs => prevs.filter(t => t.id !== id));
            })
            .catch(err => console.error("Error al borrar:", err))
            .finally(() => {
                setProgresos(prev => ({ ...prev, [id]: 0 }));
            });
        }, tiempoBorrado);

        let inicio = Date.now();
        const intervalo = setInterval(() => {
            const transcurrido = Date.now() - inicio;
            setProgresos(prev => ({ ...prev, [id]: Math.min(transcurrido / tiempoBorrado, 1) }));
            if (transcurrido >= tiempoBorrado) clearInterval(intervalo);
        }, 100);
        timeoutRefs.current[`interval-${id}`] = intervalo;
    };

    const cancelarBorrado = (id) => {
        clearTimeout(timeoutRefs.current[id]);
        clearInterval(timeoutRefs.current[`interval-${id}`]);
        setProgresos(prev => ({ ...prev, [id]: 0 }));
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
                    <div className="text-3xl font-semibold">Trabajadores Registrados</div>
                    <div className="relative flex items-center gap-2" ref={menuRef}>
                        <button onClick={generarCSV} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">
                            Descargar CSV
                        </button>
                        <button onClick={() => setMenuAbierto(p => !p)} className="bg-blue-600 text-white text-2xl px-4 py-1 rounded-full">+</button>
                        {menuAbierto && (
                            <div className="absolute flex flex-col gap-1 right-0 top-full mt-2 bg-white border rounded shadow-lg z-10">
                                <button onClick={() => { setMostrarFormulario(true); setMenuAbierto(false); }} className="text-left px-4 py-2 hover:bg-gray-100 whitespace-nowrap">Registrar manualmente</button>
                                <button onClick={() => { setMostrarCargarCSV(true); setMenuAbierto(false); }} className="text-left px-4 py-2 hover:bg-gray-100 whitespace-nowrap">Cargar CSV</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-xl shadow-md">
                    <table className="min-w-max w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="px-4 py-2 border-r">ID</th>
                                <th className="px-4 py-2 border-r">Nombre</th>
                                <th className="px-4 py-2 border-r">Identificación</th>
                                <th className="px-4 py-2 border-r">Grupo</th>
                                <th className="px-4 py-2 border-r">Turno</th>
                                <th className="px-4 py-2 border-r">Estado</th>
                                <th className="px-4 py-2 border-r">Fecha de inicio</th>
                                <th className="px-4 py-2">Borrar</th>
                                <th className="px-4 py-2">Editar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostrar.map((item, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-2 border-r">{item.id}</td>
                                    <td className="px-4 py-2 border-r">{item.nombre}</td>
                                    <td className="px-4 py-2 border-r">{item.identificacion}</td>
                                    <td className="px-4 py-2 border-r">{item.grupo}</td>
                                    <td className="px-4 py-2 border-r">{item.turno}</td>
                                    <td className="px-4 py-2 border-r">{item.estado}</td>
                                    <td className="px-4 py-2">{item.fechaInicio}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onMouseDown={() => iniciarBorrado(item.id)}
                                            onMouseUp={() => cancelarBorrado(item.id)}
                                            onMouseLeave={() => cancelarBorrado(item.id)}
                                            className="relative bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                        >
                                            🗑️
                                            {progresos[item.id] > 0 && (
                                                <div className="absolute bottom-0 left-0 h-1 bg-white" style={{ width: `${progresos[item.id] * 100}%` }} />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => setEditar(item)}
                                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                        >
                                            ✏️
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
                    titulo="Cargar trabajadores"
                    onClose={() => setMostrarCargarCSV(false)}
                    onUpload={(archivo) => {
                        console.log("Archivo de trabajadores cargado:", archivo);
                        setMostrarCargarCSV(false);
                    }}
                />
            )}
            {mostrarFormulario && (
                <TrabajadorForm
                    onCancel={() => setMostrarFormulario(false)}
                    onSubmit={(data) => {
                        fetch(`${API_BASE_URL}/trabajadores`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        })
                        .then(res => {
                            if (!res.ok) throw new Error("Error al crear");
                            return res.json();
                        })
                        .then(() => {
                            fetch(`${API_BASE_URL}/trabajadores`)
                                .then(res => res.json())
                                .then(setTrabajadores)
                                .catch(err => console.error("Error al actualizar lista de trabajadores:", err));
                            setMostrarFormulario(false);
                        })
                        .catch(err => {
                            console.error("Error al crear trabajador:", err);
                        });
                    }}
                />
            )}
            {editar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-lg font-bold mb-4">Editar Trabajador</h2>
                        <div className="grid grid-cols-1 gap-2">
                            <input value={editar.nombre} onChange={e => setEditar({...editar, nombre: e.target.value})} placeholder="Nombre" className="border px-2 py-1 rounded" />
                            <input value={editar.identificacion} onChange={e => setEditar({...editar, identificacion: e.target.value})} placeholder="Identificación" className="border px-2 py-1 rounded" />
                            <select value={editar.grupo} onChange={e => setEditar({...editar, grupo: e.target.value})} className="border px-2 py-1 rounded">
                                <option value="produccion">produccion</option>
                                <option value="admin">admin</option>
                            </select>
                            <select value={editar.turno} onChange={e => setEditar({...editar, turno: e.target.value})} className="border px-2 py-1 rounded">
                                <option value="mañana">mañana</option>
                                <option value="tarde">tarde</option>
                                <option value="noche">noche</option>
                            </select>
                            <input type="date" value={editar.fechaInicio} onChange={e => setEditar({...editar, fechaInicio: e.target.value})} className="border px-2 py-1 rounded" />
                            <select value={editar.estado} onChange={e => setEditar({...editar, estado: e.target.value})} className="border px-2 py-1 rounded">
                                <option value="creado">creado</option>
                                <option value="en produccion">en produccion</option>
                                <option value="en descanso">en descanso</option>
                                <option value="fuera de turno">fuera de turno</option>
                                <option value="inactivo en turno">inactivo en turno</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setEditar(null)} className="border px-3 py-1 rounded">Cancelar</button>
                            <button onClick={() => {
                                const limpio = { ...editar };
                                delete limpio.createdAt;
                                delete limpio.updatedAt;
                                delete limpio.id;
                                console.log("Enviando trabajador editado:", limpio);
                                fetch(`${API_BASE_URL}/trabajadores/${editar.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(limpio)
                                })
                                .then(() => {
                                    setTrabajadores(prev => prev.map(t => t.id === editar.id ? editar : t));
                                    setEditar(null);
                                });
                            }} className="bg-blue-600 text-white px-3 py-1 rounded">Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
