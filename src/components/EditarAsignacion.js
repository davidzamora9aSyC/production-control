import { useEffect, useState } from "react";
import BuscadorSesion from "./BuscadorSesion";

export default function EditarAsignacion({ paso, asignacionesIniciales = [], onClose, onSave }) {
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [indiceSesion, setIndiceSesion] = useState(null);
  const [eliminados, setEliminados] = useState([]);

  const mapear = (arr) =>
    arr.map((a) => {
      const sesionObj = typeof a.sesionTrabajo === "object" ? a.sesionTrabajo : null;
      return {
        id: a.id || null,
        maquina: a.maquina || sesionObj?.maquina || (a.nombreMaquina ? { nombre: a.nombreMaquina } : null),
        trabajador: a.trabajador || sesionObj?.trabajador || (a.nombreTrabajador ? { nombre: a.nombreTrabajador } : null),
        cantidadAsignada: a.cantidadAsignada ?? 0,
        cantidadProducida: a.cantidadProducida ?? 0,
        cantidadPedaleos: a.cantidadPedaleos ?? 0,
        estado: a.estado || "activo",
        sesionTrabajo: sesionObj?.id || a.sesionTrabajo || null,
      };
    });

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

  const agregarFila = () => {
    setFilas((prev) => [
      ...prev,
      {
        id: null,
        maquina: null,
        trabajador: null,
        cantidadAsignada: 0,
        cantidadProducida: 0,
        cantidadPedaleos: 0,
        estado: "activo",
        sesionTrabajo: null,
      },
    ]);
  };

  const eliminarFila = (index) => {
    const fila = filas[index];
    const producida = Number(fila.cantidadProducida || 0);
    const noConforme = producida - Number(fila.cantidadPedaleos || 0);
    if (producida > 0 || noConforme > 0) {
      setError("No se puede eliminar una asignación con producción registrada o no conformes.");
      return;
    }
    setFilas((prev) => {
      const copia = [...prev];
      const [removida] = copia.splice(index, 1);
      if (removida?.id) setEliminados((e) => [...e, removida.id]);
      return copia;
    });
  };

  const total = filas.reduce((s, f) => s + Number(f.cantidadAsignada || 0), 0);
  const requerido = Number(paso?.cantidadRequerida || 0);
  const valido =
    total === requerido &&
    filas.length > 0 &&
    filas.every((f) => Number(f.cantidadAsignada || 0) > 0);

  const handleGuardar = async () => {
    if (!valido || guardando) return;
    const invalidoPorProduccion = filas.some(f => Number(f.cantidadAsignada || 0) < Number(f.cantidadProducida || 0));
    if (invalidoPorProduccion) {
      setError("No se puede asignar una cantidad menor a la ya producida.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      // eliminar
      await Promise.all(
        eliminados.map((id) =>
          fetch(`https://smartindustries.org/sesion-trabajo-pasos/${id}`, { method: "DELETE" })
        )
      );

      // actualizar existentes
      await Promise.all(
        filas
          .filter((f) => f.id && Number(f.cantidadAsignada || 0) >= Number(f.cantidadProducida || 0))
          .map((f) =>
            fetch(`https://smartindustries.org/sesion-trabajo-pasos/${f.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cantidadAsignada: Number(f.cantidadAsignada || 0) }),
            })
          )
      );

      // crear nuevas
      await Promise.all(
        filas
          .filter((f) => !f.id)
          .map((f) =>
            fetch("https://smartindustries.org/sesion-trabajo-pasos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sesionTrabajo: f.sesionTrabajo,
                pasoOrden: paso.id,
                cantidadAsignada: Number(f.cantidadAsignada || 0),
                porAdministrador: true,
              }),
            })
          )
      );

      const recargar = await fetch(`https://smartindustries.org/sesion-trabajo-pasos/por-paso/${paso.id}`);
      const data = recargar.ok ? await recargar.json() : [];
      onSave && onSave(Array.isArray(data) ? data : []);
      window.location.reload();
    } catch (e) {
      setError("No se pudieron guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-fit max-w-[95vw] shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Editar asignaciones de {paso?.nombre}</h2>
        <div className="mb-3 flex justify-end">
          <button onClick={agregarFila} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">+ Añadir asignación</button>
        </div>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-2 border-r">Sesión</th>
                <th className="px-6 py-2 border-r">Máquina</th>
                <th className="px-6 py-2 border-r">Trabajador</th>
                <th className="px-4 py-2 border-r">Producido</th>
                <th className="px-4 py-2 border-r">No conforme</th>
                <th className="px-4 py-2 border-r">Estado</th>
                <th className="px-4 py-2 border-r">Asignada</th>
                <th className="px-4 py-2">Eliminar</th>
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
                    <td className="px-6 py-2 border-r">
                      {Number(f.cantidadProducida || 0) === 0 && (-Number(f.cantidadProducida || 0) + Number(f.cantidadPedaleos || 0)) === 0 ? (
                        <div className="flex">
                          <input type="text" value={f.sesionTrabajo || ""} readOnly className="w-[20rem] border px-2 py-1 rounded-l" />
                          <button onClick={() => setIndiceSesion(i)} className="px-2 bg-gray-200 rounded-r">🔍</button>
                        </div>
                      ) : (
                        <div className="w-[20rem] border px-2 py-1 rounded bg-gray-100 text-gray-500">{f.sesionTrabajo}</div>
                      )}
                    </td>
                    <td className="px-6 py-2 border-r">
                      <input type="text" value={f.maquina?.nombre || ""} readOnly className="w-[10rem] border px-2 py-1 rounded" />
                    </td>
                    <td className="px-6 py-2 border-r">
                      <input type="text" value={f.trabajador?.nombre || ""} readOnly className="w-[10rem] border px-2 py-1 rounded" />
                    </td>
                    <td className="px-4 py-2 border-r">{f.cantidadProducida}</td>
                    <td className="px-4 py-2 border-r">{-Number(f.cantidadProducida || 0) + Number(f.cantidadPedaleos || 0)}</td>
                    <td className="px-4 py-2 border-r">{f.estado}</td>
                    <td className="px-4 py-2 border-r">
                      <input
                        type="number"
                        value={f.cantidadAsignada}
                        min="0"
                        onChange={(e) =>
                          actualizar(i, "cantidadAsignada", Math.max(0, Number(e.target.value) || 0))
                        }
                        className="w-full border px-2 py-1 rounded"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => eliminarFila(i)} className="text-red-600 text-lg">✖</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm">Total asignado: {total} / {requerido}</div>
        {!valido && <div className="text-red-600 text-sm mt-1">La suma debe ser igual a la cantidad requerida.</div>}
        {filas.some((f) => Number(f.cantidadAsignada || 0) === 0) && <div className="text-red-600 text-sm mt-1">No se permiten asignaciones con cantidad 0.</div>}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" disabled={guardando}>Cancelar</button>
          <button onClick={handleGuardar} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60" disabled={!valido || guardando}>Guardar cambios</button>
        </div>
      </div>
      {indiceSesion !== null && (
        <BuscadorSesion
          endpoint="https://smartindustries.org/sesiones-trabajo/activas"
          onSelect={(s) => {
            actualizar(indiceSesion, "maquina", s.maquina);
            actualizar(indiceSesion, "trabajador", s.trabajador);
            actualizar(indiceSesion, "sesionTrabajo", s.id);
            setIndiceSesion(null);
          }}
          onClose={() => setIndiceSesion(null)}
        />
      )}
    </div>
  );
}
