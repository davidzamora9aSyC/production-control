import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";

export default function BuscadorTrabajador({ onSelect, onClose }) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/trabajadores`)
      .then(res => res.json())
      .then(setTrabajadores)
      .catch(err => console.error("Error al obtener trabajadores:", err));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Seleccionar trabajador</h2>
        <div className="max-h-60 overflow-y-auto mb-4">
          {trabajadores.map(t => (
            <label key={t.id} className="flex items-center gap-2 border-b py-1">
              <input
                type="radio"
                name="trabajador"
                value={t.id}
                checked={seleccion?.id === t.id}
                onChange={() => setSeleccion(t)}
              />
              {t.nombre}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
          <button
            onClick={() => { if (seleccion) { onSelect(seleccion); onClose(); } }}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            disabled={!seleccion}
          >
            Guardar selección
          </button>
        </div>
      </div>
    </div>
  );
}

