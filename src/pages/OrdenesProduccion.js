import Navbar from "../components/Navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalCargarCSV from "../components/ModalCargarCSV";

const procesos = ["troquelado", "corte", "embuticion", "alistamiento", "adhesivo", "vulcanizado", "refilado", "pintura", "almacenamiento"];

const datos = Array(20).fill().map((_, i) => {
    const denom = Math.floor(Math.random() * 4) + 5;
    const numer = Math.floor(Math.random() * (denom + 1));
    const proceso = procesos[Math.floor(Math.random() * procesos.length)];
    return {
        orden: `ORD-${1000 + i}`,
        producto: "Producto X",
        cantidad: 1000,
        estado: i % 2 === 0 ? "Activa" : "Finalizada",
        responsable: "Nombre Apellido",
        fechaInicio: "2024-01-01",
        procesoActual: proceso,
        avance: `${numer}/${denom}`
    };
});

const ITEMS_POR_PAGINA = 8;

export default function OrdenesProduccion() {
    const [pagina, setPagina] = useState(1);
    const [tipo, setTipo] = useState("actuales");
    const [mostrarCargarOrden, setMostrarCargarOrden] = useState(false);
    const navigate = useNavigate();
    const totalPaginas = Math.ceil(datos.length / ITEMS_POR_PAGINA);
    const mostrar = datos.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);

    return (
        <div className="bg-white h-screen overflow-hidden animate-slideLeft">
            <div className="px-20 pt-10">
                <button
                    onClick={() => navigate("/dashboard", { state: { entradaReturn: true } })}
                    className="text-blue-600 text-xl mb-4 hover:underline"
                >
                    &larr; Volver
                </button>

                <div className="flex justify-between items-center mb-6">
                    <div className="text-3xl font-semibold">Órdenes de Producción</div>
                    <div className="flex items-center">
                        <button
                            className="bg-blue-600 text-white text-2xl px-4 py-1 rounded-full"
                            onClick={() => setMostrarCargarOrden(true)}
                        >
                            +
                        </button>
                        <button
                            className="bg-gray-300 text-black text-base px-4 py-1 rounded-full ml-4"
                            onClick={() => {
                                const desde = document.querySelector('input[type="date"]:first-of-type')?.value;
                                const hasta = document.querySelector('input[type="date"]:last-of-type')?.value;
                                if (desde && hasta) {
                                    console.log(`Generando reporte desde ${desde} hasta ${hasta}`);
                                    // Aquí podrías llamar a una función que genere el reporte real
                                } else {
                                    alert("Selecciona un rango de fechas válido.");
                                }
                            }}
                        >
                            Generar reporte
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 mb-4 text-base py-4 items-center">
                    <select value={tipo} onChange={e => setTipo(e.target.value)} className="border px-3 py-2 rounded">
                        <option value="actuales">Actuales</option>
                        <option value="pasadas">Pasadas</option>
                    </select>
                    {tipo === "pasadas" && (
                        <>
                            <label>De <input type="date" className="ml-1 border px-2 py-1 rounded" defaultValue="2024-01-01" /></label>
                            <label>A <input type="date" className="ml-1 border px-2 py-1 rounded" defaultValue="2024-12-01" /></label>
                        </>
                    )}
                </div>

                <div className="overflow-x-auto border rounded-xl shadow-md">
                    <table className="min-w-max w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="px-4 py-2 border-r">Orden</th>
                                <th className="px-4 py-2 border-r">Producto</th>
                                <th className="px-4 py-2 border-r">Cantidad</th>
                                <th className="px-4 py-2 border-r">Estado</th>
                                <th className="px-4 py-2 border-r">Responsable proceso actual</th>
                                <th className="px-4 py-2 border-r">Fecha Inicio</th>
                                <th className="px-4 py-2 border-r">Proceso actual</th>
                                <th className="px-4 py-2">Avanzado hasta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mostrar.map((item, i) => (
                                <tr key={i} className="border-b cursor-pointer" onClick={() => navigate(`/ordenes/${item.orden}`)}>
                                    <td className="px-4 py-2 border-r">{item.orden}</td>
                                    <td className="px-4 py-2 border-r">{item.producto}</td>
                                    <td className="px-4 py-2 border-r">{item.cantidad}</td>
                                    <td className="px-4 py-2 border-r">{item.estado}</td>
                                    <td className="px-4 py-2 border-r">{item.responsable}</td>
                                    <td className="px-4 py-2 border-r">{item.fechaInicio}</td>
                                    <td className="px-4 py-2 border-r">{item.procesoActual}</td>
                                    <td className="px-4 py-2">{item.avance}</td>
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
            {mostrarCargarOrden && (
                <ModalCargarCSV
                    titulo="Cargar nueva orden"
                    onClose={() => setMostrarCargarOrden(false)}
                    onUpload={(archivo) => {
                        console.log("Archivo CSV cargado:", archivo);
                        // Aquí se asume que se genera un nuevo archivo para descargar
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(archivo);
                        a.download = archivo.name.replace(/\.csv$/, '') + "_Modificado.csv";
                        a.click();
                        URL.revokeObjectURL(a.href);
                        setMostrarCargarOrden(false);
                    }}
                />
            )}
        </div>
    );
}