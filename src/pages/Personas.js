import Navbar from "../components/Navbar";
import ModalCargarCSV from "../components/ModalCargarCSV";
import TrabajadorForm from "../components/TrabajadorForm";
import ErrorPopup from "../components/ErrorPopup";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { API_BASE_URL } from "../api";
import QRCode from "qrcode";

const ITEMS_POR_PAGINA = 8;

export default function Personas() {
    const [pagina, setPagina] = useState(1);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [mostrarCargarCSV, setMostrarCargarCSV] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [trabajadores, setTrabajadores] = useState([]);
    const [editar, setEditar] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
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

    // Borrar trabajador con confirmación
    const borrar = (id) => {
        if (!window.confirm("¿Seguro que quieres borrar este trabajador?")) return;
        fetch(`${API_BASE_URL}/trabajadores/${id}`, { method: 'DELETE' })
          .then(res => {
              if (!res.ok) throw new Error("Error al borrar trabajador");
              setTrabajadores(prevs => prevs.filter(t => t.id !== id));
          })
          .catch(err => {
              console.error("Error al borrar:", err);
              setErrorMsg(err.message || "Error al borrar trabajador");
          });
    };

    const descargarQR = (id) => {
        QRCode.toDataURL(String(id))
            .then(url => {
                const a = document.createElement("a");
                a.href = url;
                const trabajador = trabajadores.find(t => t.id === id);
                a.download = `identificador_${trabajador?.nombre || id}.png`;
                a.click();
            })
            .catch(err => {
                console.error("Error al generar QR:", err);
                setErrorMsg("Error al generar identificador");
            });
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
                                <th className="px-4 py-2 border-r">Identificador</th>
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
                                    <td className="px-4 py-2 border-r">
                                        <div className="flex flex-col gap-1">
                                            <button
                                              onClick={() => descargarQR(item.id)}
                                              className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                                            >
                                              Descargar QR
                                            </button>
                                            <button
                                              onClick={() => {
                                                QRCode.toDataURL(String(item.id)).then(url => {
                                                  const ventana = window.open("", "_blank");
                                                  if (!ventana) return;
                                                  const imagen = new Image();
                                                  imagen.src = url;
                                                  imagen.onload = () => {
                                                    const trabajador = trabajadores.find(t => t.id === item.id);
                                                    ventana.document.body.innerHTML = `
                                                      <div style="text-align:center">
                                                        <p style="font-size:18px;margin-bottom:8px">${trabajador?.nombre || ''}</p>
                                                        <img src="${url}" style="width:250px;height:250px" />
                                                      </div>`;
                                                    ventana.document.title = `QR Trabajador ${item.id}`;
                                                    ventana.focus();
                                                    ventana.print();
                                                    ventana.close();
                                                  };
                                                }).catch(err => {
                                                  console.error("Error al imprimir QR:", err);
                                                  setErrorMsg("Error al imprimir QR del trabajador");
                                                });
                                              }}
                                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                            >
                                              Imprimir QR
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => borrar(item.id)}
                                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                        >
                                            🗑️
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
                    mostrarLabels={true}
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
                            setErrorMsg(err.message || "Error al crear trabajador");
                        });
                    }}
                />
            )}
            {editar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-lg font-bold mb-4">Editar Trabajador</h2>
                        <div className="grid grid-cols-1 gap-2">
                            <label>Nombre</label>
                            <input value={editar.nombre} onChange={e => setEditar({...editar, nombre: e.target.value})} placeholder="Nombre" className="border px-2 py-1 rounded" />
                            <label>Identificación</label>
                            <input value={editar.identificacion} onChange={e => setEditar({...editar, identificacion: e.target.value})} placeholder="Identificación" className="border px-2 py-1 rounded" />
                            <label>Grupo</label>
                            <select value={editar.grupo} onChange={e => setEditar({...editar, grupo: e.target.value})} className="border px-2 py-1 rounded">
                                <option value="produccion">produccion</option>
                                <option value="admin">admin</option>
                            </select>
                            <label>Turno</label>
                            <select value={editar.turno} onChange={e => setEditar({...editar, turno: e.target.value})} className="border px-2 py-1 rounded">
                                <option value="mañana">mañana</option>
                                <option value="tarde">tarde</option>
                                <option value="noche">noche</option>
                            </select>
                            <label>Fecha de inicio</label>
                            <input type="date" value={editar.fechaInicio} onChange={e => setEditar({...editar, fechaInicio: e.target.value})} className="border px-2 py-1 rounded" />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setEditar(null)} className="border px-3 py-1 rounded">Cancelar</button>
                            <button onClick={() => {
                                const limpio = { ...editar };
                                delete limpio.createdAt;
                                delete limpio.updatedAt;
                                delete limpio.id;
                                delete limpio.estado;
           
                                fetch(`${API_BASE_URL}/trabajadores/${editar.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(limpio)
                                })
                                .then(res => {
                                    if (!res.ok) throw new Error('Error al guardar trabajador');
                                })
                                .then(() => {
                                    setTrabajadores(prev => prev.map(t => t.id === editar.id ? editar : t));
                                    setEditar(null);
                                })
                                .catch(err => {
                                    console.error('Error al editar trabajador:', err);
                                    setErrorMsg(err.message || 'Error al editar trabajador');
                                });
                            }} className="bg-blue-600 text-white px-3 py-1 rounded">Guardar</button>
                        </div>
                    </div>
                </div>
            )}
            {errorMsg && (
                <ErrorPopup mensaje={errorMsg} onClose={() => setErrorMsg(null)} />
            )}
        </div>
    );
}
