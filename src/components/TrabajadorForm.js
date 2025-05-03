

import { useState } from "react";

export default function TrabajadorForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    nombre: "",
    documento: "",
    grupo: "",
    turno: "",
    estado: "Activo",
    maquinasAsignadas: 0,
    antiguedadMeses: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Registrar trabajador</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <input name="documento" placeholder="Documento" value={form.documento} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <input name="grupo" placeholder="Grupo" value={form.grupo} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <input name="turno" placeholder="Turno" value={form.turno} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <select name="estado" value={form.estado} onChange={handleChange} className="border px-3 py-2 rounded">
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Registrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}