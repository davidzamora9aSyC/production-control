

import { useState } from "react";

const trabajadoresDisponibles = ["Carlos Pérez", "Juan Pérez", "Laura Gómez", "Mario Díaz"];

export default function EditarAsignacion({ recursosIniciales, onClose, onSave }) {
  const [recursos, setRecursos] = useState(recursosIniciales);

  const handleChange = (index, field, value) => {
    const nuevos = [...recursos];
    nuevos[index][field] = value;
    setRecursos(nuevos);
  };

  const agregarRecurso = () => {
    setRecursos([...recursos, {
      maquina: "",
      trabajador: trabajadoresDisponibles[0],
      referencia: recursos[0]?.referencia || "N/A",
      completado: 0,
      asignado: 0,
    }]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Editar asignación de recursos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-r">Máquina</th>
                <th className="px-4 py-2 border-r">Trabajador</th>
                <th className="px-4 py-2 border-r">Referencia</th>
                <th className="px-4 py-2 border-r">Cantidad completada</th>
                <th className="px-4 py-2">Cantidad asignada</th>
              </tr>
            </thead>
            <tbody>
              {recursos.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 border-r">
                    <input type="text" value={r.maquina} onChange={e => handleChange(i, "maquina", e.target.value)} className="w-full border px-2 py-1 rounded" />
                  </td>
                  <td className="px-4 py-2 border-r">
                    <select value={r.trabajador} onChange={e => handleChange(i, "trabajador", e.target.value)} className="w-full border px-2 py-1 rounded">
                      {trabajadoresDisponibles.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 border-r">{r.referencia}</td>
                  <td className="px-4 py-2 border-r">{r.completado}</td>
                  <td className="px-4 py-2">
                    <input type="number" value={r.asignado} onChange={e => handleChange(i, "asignado", parseInt(e.target.value))} className="w-full border px-2 py-1 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={agregarRecurso} className="mt-4 px-3 py-2 text-sm bg-blue-600 text-white rounded">
          Añadir recurso
        </button>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button onClick={() => onSave(recursos)} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}