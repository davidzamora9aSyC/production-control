import Navbar from "../components/Navbar";
import ModalCargarCSV from "../components/ModalCargarCSV";
import TrabajadorForm from "../components/TrabajadorForm";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const datos = Array(20).fill().map((_, i) => ({
    id: i + 1,
    nombre: "Nombre Apellido",
    documento: `CC${10000000 + i}`,
    grupo: "Producción",
    turno: "Mañana",
    estado: "Activo",
    antiguedadMeses: Math.floor(Math.random() * 60) + 1
}));

const ITEMS_POR_PAGINA = 8;

export default function Personas() {
    const [pagina, setPagina] = useState(1);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [mostrarCargarCSV, setMostrarCargarCSV] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
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
                    <div className="relative" ref={menuRef}>
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
                                <th className="px-4 py-2 border-r">Documento</th>
                                <th className="px-4 py-2 border-r">Grupo</th>
                                <th className="px-4 py-2 border-r">Turno</th>
                                <th className="px-4 py-2 border-r">Estado</th>
                                <th className="px-4 py-2">Antigüedad (meses)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostrar.map((item, i) => (
                                <tr key={i} className="border-b">
                                    <td className="px-4 py-2 border-r">{item.id}</td>
                                    <td className="px-4 py-2 border-r">{item.nombre}</td>
                                    <td className="px-4 py-2 border-r">{item.documento}</td>
                                    <td className="px-4 py-2 border-r">{item.grupo}</td>
                                    <td className="px-4 py-2 border-r">{item.turno}</td>
                                    <td className="px-4 py-2 border-r">{item.estado}</td>
                                    <td className="px-4 py-2">{item.antiguedadMeses}</td>
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
                        console.log("Nuevo trabajador registrado:", data);
                        setMostrarFormulario(false);
                    }}
                />
            )}
        </div>
    );
}
