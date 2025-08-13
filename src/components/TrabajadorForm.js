import { useState } from "react";

export default function TrabajadorForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    nombre: "",
    identificacion: "",
    grupo: "produccion",
    turno: "mañana",
    fechaInicio: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formLimpio = { ...form };
    delete formLimpio.id;
    delete formLimpio.createdAt;
    delete formLimpio.updatedAt;
    console.log("Enviando datos trabajador:", formLimpio);
    onSubmit(formLimpio);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Registrar trabajador</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label>Nombre</label>
          <input name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <label>Identificación</label>
          <input name="identificacion" placeholder="Identificación" value={form.identificacion} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <label>Grupo</label>
          <select name="grupo" value={form.grupo} onChange={handleChange} className="border px-3 py-2 rounded">
            <option value="produccion">produccion</option>
            <option value="admin">admin</option>
          </select>
          <label>Turno</label>
          <select name="turno" value={form.turno} onChange={handleChange} className="border px-3 py-2 rounded">
            <option value="mañana">mañana</option>
            <option value="tarde">tarde</option>
            <option value="noche">noche</option>
          </select>
          <label>Fecha de inicio</label>
          <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Registrar</button>
          </div>
        </form>
      </div>
    </div>
  );
}