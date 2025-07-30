import { useState } from "react";

export default function EditarAsignacion({ paso, asignacionesIniciales, onClose, onSave }) {
  const [filas, setFilas] = useState(
    asignacionesIniciales.map(a => ({
      id: a.id || null,
      nombreTrabajador: a.nombreTrabajador || "",
      cantidadAsignada: a.cantidadAsignada || 0,
      cantidadProducida: a.cantidadProducida || 0,
      estado: a.estado || "activo"
    }))
  );

  const agregarFila = () => setFilas([...filas, { nombreTrabajador: "", cantidadAsignada: 0, cantidadProducida: 0, estado: "activo" }]);

  const actualizar = (i, campo, valor) => {
    const copia = [...filas];
    copia[i][campo] = valor;
    setFilas(copia);
  };

  const total = filas.reduce((s, f) => s + Number(f.cantidadAsignada || 0), 0);
  const valido = total === paso.cantidadRequerida;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Asignaciones de {paso.nombre}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-r">Trabajador</th>
                <th className="px-4 py-2 border-r">Cant. producida</th>
                <th className="px-4 py-2">Cant. asignada</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 border-r">
                    <input
                      type="text"
                      value={f.nombreTrabajador}
                      onChange={e => actualizar(i, 'nombreTrabajador', e.target.value)}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                  <td className="px-4 py-2 border-r">{f.cantidadProducida}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={f.cantidadAsignada}
                      onChange={e => actualizar(i, 'cantidadAsignada', parseInt(e.target.value))}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={agregarFila} className="mt-4 px-3 py-2 text-sm bg-blue-600 text-white rounded">
          Añadir asignación
        </button>
        <div className="mt-4 text-sm">Total asignado: {total} / {paso.cantidadRequerida}</div>
        {!valido && (
          <div className="text-red-600 text-sm mt-1">La suma debe ser igual a la cantidad requerida.</div>
        )}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button
            onClick={() => valido && onSave(filas)}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            disabled={!valido}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
