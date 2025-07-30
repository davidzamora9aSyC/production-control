import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";

export default function BuscadorMaquina({ onSelect, onClose }) {
  const [maquinas, setMaquinas] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/maquinas`)
      .then(res => res.json())
      .then(setMaquinas)
      .catch(err => console.error("Error al obtener máquinas:", err));
  }, []);

  const filtradas = maquinas.filter(m =>
    m.tipo?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Buscar máquina</h2>
        <input
          type="text"
          placeholder="Filtrar por tipo"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="border px-3 py-1 rounded w-full mb-4"
        />
        <div className="max-h-60 overflow-y-auto">
          {filtradas.map(m => (
            <div key={m.id} className="flex justify-between items-center border-b py-1">
              <span>{m.nombre} - {m.tipo}</span>
              <button
                onClick={() => { onSelect(m); onClose(); }}
                className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
              >
                Seleccionar
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

