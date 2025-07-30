import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";

export default function BuscadorSesion({ onSelect, onClose }) {
  const [sesiones, setSesiones] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/sesiones-trabajo/actuales`)
      .then(res => res.json())
      .then(setSesiones)
      .catch(err => console.error("Error al obtener sesiones:", err));
  }, []);

  const filtradas = sesiones.filter(s => {
    const texto = `${s.maquina?.nombre || ""} ${s.trabajador?.nombre || ""}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Seleccionar sesión</h2>
        <input
          type="text"
          placeholder="Filtrar"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="border px-3 py-1 rounded w-full mb-4"
        />
        <div className="max-h-60 overflow-y-auto">
          {filtradas.map(s => (
            <div key={s.id} className="flex justify-between items-center border-b py-1">
              <span>{s.maquina?.nombre} - {s.trabajador?.nombre}</span>
              <button
                onClick={() => { onSelect(s); onClose(); }}
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
