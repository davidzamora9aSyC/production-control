import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditarAsignacion from "../components/EditarAsignacion";
import { API_BASE_URL } from "../api";

export default function DetalleOrden() {
  const [pasos, setPasos] = useState([]);
  const [orden, setOrden] = useState(null);
  const [procesoIndex, setProcesoIndex] = useState(0);
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [pasoSeleccionado, setPasoSeleccionado] = useState(null);
  const [asignaciones, setAsignaciones] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetch(`${API_BASE_URL}/ordenes/${id}`)
      .then(res => res.json())
      .then(setOrden)
      .catch(err => console.error("Error al obtener orden:", err));
    fetch(`${API_BASE_URL}/pasos/orden/${id}`)
      .then(res => res.json())
      .then(setPasos)
      .catch(err => console.error("Error al obtener pasos:", err));
  }, [id]);

  useEffect(() => {
    pasos.forEach(p => {
      fetch(`${API_BASE_URL}/sesion-trabajo-pasos/por-paso/${p.id}`)
        .then(res => res.json())
        .then(data => setAsignaciones(a => ({ ...a, [p.id]: data })))
        .catch(err => console.error('Error al obtener asignaciones:', err));
    });
  }, [pasos]);

  const procesos = Array.from(new Set(pasos.map(p => p.nombre)));
  const procesoActual = procesos[procesoIndex] || "";
  const datos = pasos.filter(p => p.nombre === procesoActual);
  const totalCompletado = datos.reduce((sum, p) =>
    sum + (asignaciones[p.id] || []).reduce((a, b) => a + (b.cantidadProducida || 0), 0)
  , 0);
  const totalAsignado = datos.reduce((sum, p) =>
    sum + (asignaciones[p.id] || []).reduce((a, b) => a + (b.cantidadAsignada || 0), 0)
  , 0);
  const avance = totalAsignado ? ((totalCompletado / totalAsignado) * 100).toFixed(0) : 0;

  const handleEliminar = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar esta orden?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/ordenes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) navigate("/ordenes");
      else alert("Error al eliminar orden");
    } catch (err) {
      console.error("Error:", err);
      alert("Error al eliminar orden");
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-800 font-medium">
          ID: {orden?.numero}
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-800 font-medium flex items-center gap-4">
          <span>Avance: {avance}% ({totalCompletado}/{totalAsignado})</span>
          <span
            className={`h-2 w-2 rounded-full ${
              {
                pendiente: "bg-gray-400",
                activo: "bg-green-500",
                pausado: "bg-yellow-400",
                finalizado: "bg-blue-500",
              }[orden?.estado?.toLowerCase() || ""] || "bg-gray-400"
            }`}
          ></span>
          <span>Estado: {orden?.estado}</span>
          <span>{orden ? new Date(orden.fechaOrden).toLocaleString() : ''}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-semibold flex items-center gap-2">
          {procesoIndex > 0 && (
            <button onClick={() => setProcesoIndex(procesoIndex - 1)} className="text-gray-500">&lt;</button>
          )}
          {procesoActual}
          {procesoIndex < procesos.length - 1 && (
            <button onClick={() => setProcesoIndex(procesoIndex + 1)} className="text-gray-500">&gt;</button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="font-bold text-black text-left mb-2">Paso</h2>
        <div className="overflow-x-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-r">Nombre</th>
                <th className="px-4 py-2 border-r">Código</th>
                <th className="px-4 py-2 border-r">Cantidad requerida</th>
                <th className="px-4 py-2 border-r">Cantidad producida</th>
                <th className="px-4 py-2 border-r">Estado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 border-r">{item.nombre}</td>
                  <td className="px-4 py-2 border-r">{item.codigoInterno}</td>
                  <td className="px-4 py-2 border-r">{item.cantidadRequerida}</td>
                  <td className="px-4 py-2 border-r">{item.cantidadProducida}</td>
                  <td className="px-4 py-2 border-r">{item.estado}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 underline"
                      onClick={() => { setPasoSeleccionado(item); setMostrarEditor(true); }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="font-bold text-black text-left mb-2">Asignación</h2>
      <div className="overflow-x-auto border rounded-xl mb-2">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-r">Paso</th>
              <th className="px-4 py-2 border-r">Trabajador</th>
              <th className="px-4 py-2 border-r">Cant. producida</th>
              <th className="px-4 py-2 border-r">Cant. asignada</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {datos.map(p => (
              (asignaciones[p.id] || []).map((a, i) => (
                <tr key={`${p.id}-${i}`} className="border-t">
                  <td className="px-4 py-2 border-r">{p.nombre}</td>
                  <td className="px-4 py-2 border-r">{a.nombreTrabajador}</td>
                  <td className="px-4 py-2 border-r">{a.cantidadProducida}</td>
                  <td className="px-4 py-2 border-r">{a.cantidadAsignada}</td>
                  <td className="px-4 py-2">{a.estado}</td>
                </tr>
              ))
            ))}
            <tr className="font-semibold bg-gray-50">
              <td colSpan={2} className="px-4 py-2 text-right border-r">Total</td>
              <td className="px-4 py-2 border-r">{totalCompletado}</td>
              <td className="px-4 py-2 border-r">{totalAsignado}</td>
              <td className="px-4 py-2"></td>
            </tr>
          </tbody>
        </table>
      </div>


      <div className="flex gap-4">
        <button onClick={handleEliminar} className="bg-red-500 text-white px-4 py-2 rounded ml-auto">Eliminar orden</button>
      </div>
      {mostrarEditor && pasoSeleccionado && (
        <EditarAsignacion
          paso={pasoSeleccionado}
          asignacionesIniciales={asignaciones[pasoSeleccionado.id] || []}
          onClose={() => { setMostrarEditor(false); setPasoSeleccionado(null); }}
          onSave={(nuevas) => {
            setAsignaciones(a => ({ ...a, [pasoSeleccionado.id]: nuevas }));
            setMostrarEditor(false);
            setPasoSeleccionado(null);
          }}
        />
      )}
    </div>
  );
}
