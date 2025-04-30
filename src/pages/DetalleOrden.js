import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditarAsignacion from "../components/EditarAsignacion";

const procesos = ["Embutido", "Corte", "Troquelado", "Alistamiento"];

const datosPorProceso = {
  Embutido: [
    { maquina: 2, trabajador: "Carlos Pérez", referencia: "NIF0TSMU8T", completado: 50, asignado: 200 },
    { maquina: 3, trabajador: "Juan Pérez", referencia: "NIF0TSMU8T", completado: 70, asignado: 200 },
  ],
  Corte: [
    { maquina: 4, trabajador: "Laura Gómez", referencia: "NIF0TSMU8T", completado: 80, asignado: 200 },
    { maquina: 5, trabajador: "Mario Díaz", referencia: "NIF0TSMU8T", completado: 60, asignado: 200 },
  ],
  Troquelado: [],
  Alistamiento: [],
};

export default function DetalleOrden() {
  const [procesoIndex, setProcesoIndex] = useState(0);
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const procesoActual = procesos[procesoIndex];
  const datos = datosPorProceso[procesoActual];
  const navigate = useNavigate();

  const totalCompletado = datos.reduce((a, b) => a + b.completado, 0);
  const totalAsignado = datos.reduce((a, b) => a + b.asignado, 0);

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-800 font-medium">
          ID: GG921IAEMC
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-800 font-medium flex items-center gap-4">
          <span>Avance: 25% (50/200)</span>
          <span className="h-2 w-2 bg-green-500 rounded-full"></span>
          <span>Estado: Activo</span>
          <span>06/01/2025 03:27 PM</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-semibold flex items-center gap-2">
          {procesoIndex > 0 && (
            <button onClick={() => setProcesoIndex(procesoIndex - 1)} className="text-gray-500">&lt;</button>
          )}
          {procesoActual}
          {procesoIndex < procesos.length - 1 && (
            <button onClick={() => setProcesoIndex(procesoIndex + 1)} className="text-gray-500">&gt;</button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl mb-2">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-r">Máquina</th>
              <th className="px-4 py-2 border-r">Trabajador</th>
              <th className="px-4 py-2 border-r">Referencia en producción</th>
              <th className="px-4 py-2 border-r">Cantidad completada</th>
              <th className="px-4 py-2">Cantidad asignada</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2 border-r">{item.maquina}</td>
                <td className="px-4 py-2 border-r">{item.trabajador}</td>
                <td className="px-4 py-2 border-r">{item.referencia}</td>
                <td className="px-4 py-2 border-r">{item.completado}</td>
                <td className="px-4 py-2">{item.asignado}</td>
              </tr>
            ))}
            <tr className="font-semibold bg-gray-50">
              <td colSpan={3} className="px-4 py-2 text-right border-r">Total</td>
              <td className="px-4 py-2 border-r">{totalCompletado}</td>
              <td className="px-4 py-2">{totalAsignado}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4 text-sm text-gray-700">
        Cantidad de piezas de salida: 450<br />
        Cantidad de piezas de inventario a utilizar: 50
      </div>

      <div className="flex gap-4">
        <button onClick={() => setMostrarEditor(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Editar asignación de proceso</button>
        <button className="bg-red-500 text-white px-4 py-2 rounded ml-auto">Eliminar orden</button>
      </div>
      {mostrarEditor && (
        <EditarAsignacion
          recursosIniciales={datos}
          onClose={() => setMostrarEditor(false)}
          onSave={(nuevosRecursos) => {
            console.log("Recursos actualizados:", nuevosRecursos);
            setMostrarEditor(false);
          }}
        />
      )}
    </div>
  );
}
