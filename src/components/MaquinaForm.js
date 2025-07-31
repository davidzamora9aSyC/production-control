import { useState } from "react";
import { API_BASE_URL } from "../api";

export default function MaquinaForm({ onSave, onClose, equipo, modo, onError }) {
  const [form, setForm] = useState({
    nombre: equipo?.nombre || "",
    estado: equipo?.estado || "activa",
    tipo: equipo?.tipo || "troqueladora",
    ubicacion: equipo?.ubicacion || "",
    fechaInstalacion: equipo?.fechaInstalacion || "",
    observaciones: equipo?.observaciones || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = modo === 'editar' ? 'PUT' : 'POST';
    const url = modo === 'editar' ? `${API_BASE_URL}/maquinas/${equipo.id}` : `${API_BASE_URL}/maquinas`;

    const formLimpio = { ...form };
    delete formLimpio.createdAt;
    delete formLimpio.updatedAt;

    console.log("Enviando datos:", formLimpio);

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formLimpio)
    })
    .then(res => {
      if (!res.ok) throw new Error("Error al guardar");
      return res.json();
    })
    .then(onSave)
    .catch(err => {
      console.error("Error al guardar máquina:", err);
      onError && onError(err.message || "Error al guardar máquina");
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{modo === 'editar' ? "Editar máquina" : "Registrar máquina"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="nombre" placeholder="Nombre de la máquina" value={form.nombre} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <select name="estado" value={form.estado} onChange={handleChange} className="border px-3 py-2 rounded" required>
            <option value="activa">Activa</option>
            <option value="no activa">No activa</option>
          </select>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="border px-3 py-2 rounded" required>
            <option value="troqueladora">Troqueladora</option>
            <option value="taladro">Taladro</option>
            <option value="horno">Horno</option>
            <option value="vulcanizadora">Vulcanizadora</option>
          </select>
          <input name="ubicacion" placeholder="Ubicación" value={form.ubicacion} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <input type="date" name="fechaInstalacion" value={form.fechaInstalacion} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <textarea name="observaciones" placeholder="Observaciones" value={form.observaciones} onChange={handleChange} className="border px-3 py-2 rounded" rows={3} />
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {modo === 'editar' ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}