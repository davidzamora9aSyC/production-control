import { useEffect, useState } from "react";
import BuscadorMaquina from "./BuscadorMaquina";
import BuscadorTrabajador from "./BuscadorTrabajador";

export default function EditarAsignacion({ paso, asignacionesIniciales = [], onClose, onSave }) {
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [indiceMaquina, setIndiceMaquina] = useState(null);
  const [indiceTrabajador, setIndiceTrabajador] = useState(null);

  const mapear = (arr) =>
    arr.map((a) => ({
      id: a.id || null,
      maquina: a.maquina || (a.nombreMaquina ? { nombre: a.nombreMaquina } : null),
      trabajador: a.trabajador || (a.nombreTrabajador ? { nombre: a.nombreTrabajador } : null),
      cantidadAsignada: a.cantidadAsignada ?? 0,
      cantidadProducida: a.cantidadProducida ?? 0,
      cantidadPedaleos: a.cantidadPedaleos ?? 0,
      estado: a.estado || "activo",
      sesionTrabajo: a.sesionTrabajo?.id || a.sesionTrabajo || null,
    }));

  useEffect(() => {
    if (asignacionesIniciales.length) {
      setFilas(mapear(asignacionesIniciales));
      return;
    }
    if (!paso?.id) return;
    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const res = await fetch(`https://smartindustries.org/sesion-trabajo-pasos/por-paso/${paso.id}`);
        if (!res.ok) throw new Error("No se pudieron cargar las asignaciones");
        const data = await res.json();
        setFilas(mapear(Array.isArray(data) ? data : []));
      } catch (e) {
        setError("Error cargando asignaciones");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [paso?.id, asignacionesIniciales]);

  const actualizar = (i, campo, valor) => {
    const copia = [...filas];
    copia[i][campo] = valor;
    setFilas(copia);
  };

  const total = filas.reduce((s, f) => s + Number(f.cantidadAsignada || 0), 0);
  const requerido = Number(paso?.cantidadRequerida || 0);
  const valido = total === requerido && filas.length > 0;

  const handleGuardar = async () => {
    if (!valido || guardando) return;
    setGuardando(true);
    setError("");
    try {
      const payload = filas.map((f) => ({ id: f.id, data: { cantidadAsignada: Number(f.cantidadAsignada || 0) } }));
      const res = await fetch("https://smartindustries.org/sesion-trabajo-pasos/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Fallo al guardar");
      const out = await res.json();
      onSave && onSave(out);
    } catch (e) {
      setError("No se pudieron guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Editar asignaciones de {paso?.nombre}</h2>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-r">Máquina</th>
                <th className="px-4 py-2 border-r">Trabajador</th>
                <th className="px-4 py-2 border-r">Producido</th>
                <th className="px-4 py-2 border-r">No conforme</th>
                <th className="px-4 py-2 border-r">Estado</th>
                <th className="px-4 py-2">Asignada</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center">Cargando…</td>
                </tr>
              ) : (
                filas.map((f, i) => (
                  <tr key={f.id || i} className="border-t">
                    <td className="px-4 py-2 border-r">
                      <div className="flex">
                        <input type="text" value={f.maquina?.nombre || ""} readOnly className="w-full border px-2 py-1 rounded-l" />
                        <button onClick={() => setIndiceMaquina(i)} className="px-2 bg-gray-200 rounded-r">🔍</button>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-r">
                      <div className="flex">
                        <input type="text" value={f.trabajador?.nombre || ""} readOnly className="w-full border px-2 py-1 rounded-l" />
                        <button onClick={() => setIndiceTrabajador(i)} className="px-2 bg-gray-200 rounded-r">🔍</button>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-r">{f.cantidadProducida}</td>
                    <td className="px-4 py-2 border-r">{Number(f.cantidadProducida || 0) - Number(f.cantidadPedaleos || 0)}</td>
                    <td className="px-4 py-2 border-r">{f.estado}</td>
                    <td className="px-4 py-2">
                      <input type="number" value={f.cantidadAsignada} onChange={(e) => actualizar(i, "cantidadAsignada", Number(e.target.value) || 0)} className="w-full border px-2 py-1 rounded" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm">Total asignado: {total} / {requerido}</div>
        {!valido && <div className="text-red-600 text-sm mt-1">La suma debe ser igual a la cantidad requerida.</div>}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" disabled={guardando}>Cancelar</button>
          <button onClick={handleGuardar} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60" disabled={!valido || guardando}>Guardar cambios</button>
        </div>
      </div>
      {indiceMaquina !== null && (
        <BuscadorMaquina
          onSelect={(m) => { actualizar(indiceMaquina, "maquina", m); setIndiceMaquina(null); }}
          onClose={() => setIndiceMaquina(null)}
        />
      )}
      {indiceTrabajador !== null && (
        <BuscadorTrabajador
          onSelect={(t) => { actualizar(indiceTrabajador, "trabajador", t); setIndiceTrabajador(null); }}
          onClose={() => setIndiceTrabajador(null)}
        />
      )}
    </div>
  );
}
