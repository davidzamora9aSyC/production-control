import { useState } from "react";
import BuscadorMaquina from "./BuscadorMaquina";
import BuscadorTrabajador from "./BuscadorTrabajador";

export default function EditarAsignacion({ recursosIniciales, onClose, onSave }) {
  const [recursos, setRecursos] = useState(
    recursosIniciales.map(r => ({
      maquina: r.maquina || null,
      trabajador: r.trabajador || null,
      completado: r.cantidadProducida || 0,
      asignado: r.cantidadRequerida || 0,
    }))
  );
  const [indiceMaquina, setIndiceMaquina] = useState(null);
  const [indiceTrabajador, setIndiceTrabajador] = useState(null);

  const handleChange = (index, field, value) => {
    const nuevos = [...recursos];
    nuevos[index][field] = value;
    setRecursos(nuevos);
  };

  const agregarRecurso = () => {
    setRecursos([...recursos, {
      maquina: null,
      trabajador: null,
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
                <th className="px-4 py-2 border-r">Cantidad completada</th>
                <th className="px-4 py-2">Cantidad asignada</th>
              </tr>
            </thead>
            <tbody>
              {recursos.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 border-r">
                    <div className="flex">
                      <input
                        type="text"
                        value={r.maquina?.nombre || ""}
                        readOnly
                        className="w-full border px-2 py-1 rounded-l"
                      />
                      <button
                        onClick={() => setIndiceMaquina(i)}
                        className="px-2 bg-gray-200 rounded-r"
                      >
                        🔍
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 border-r">
                    <div className="flex">
                      <input
                        type="text"
                        value={r.trabajador?.nombre || ""}
                        readOnly
                        className="w-full border px-2 py-1 rounded-l"
                      />
                      <button
                        onClick={() => setIndiceTrabajador(i)}
                        className="px-2 bg-gray-200 rounded-r"
                      >
                        🔍
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 border-r">{r.completado}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={r.asignado}
                      onChange={e => handleChange(i, "asignado", parseInt(e.target.value))}
                      className="w-full border px-2 py-1 rounded"
                    />
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
      {indiceMaquina !== null && (
        <BuscadorMaquina
          onSelect={(m) => handleChange(indiceMaquina, "maquina", m)}
          onClose={() => setIndiceMaquina(null)}
        />
      )}
      {indiceTrabajador !== null && (
        <BuscadorTrabajador
          onSelect={(t) => handleChange(indiceTrabajador, "trabajador", t)}
          onClose={() => setIndiceTrabajador(null)}
        />
      )}
    </div>
 );
}
