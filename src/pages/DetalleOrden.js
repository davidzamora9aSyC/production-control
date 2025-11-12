import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditarAsignacion from "../components/EditarAsignacion";
import ErrorPopup from "../components/ErrorPopup";
import QRCode from "qrcode";

const ESTADO_COLORES = {
  pendiente: "bg-gray-400",
  activa: "bg-green-500",
  activo: "bg-green-500",
  "en produccion": "bg-green-500",
  "en producción": "bg-green-500",
  pausado: "bg-yellow-400",
  "en pausa": "bg-yellow-400",
  pausada: "bg-yellow-400",
  finalizado: "bg-blue-500",
  finalizada: "bg-blue-500",
};

const normalizar = (str) =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function DetalleOrden() {
  const [pasos, setPasos] = useState([]);
  const [orden, setOrden] = useState(null);
  const [procesoIndex, setProcesoIndex] = useState(0);
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [pasoSeleccionado, setPasoSeleccionado] = useState(null);
  const [asignaciones, setAsignaciones] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetch(`https://smartindustries.org/ordenes/${id}/detalle`)
      .then(res => res.json())
      .then(data => {
        setOrden(data);
        setPasos(data.pasos || []);
        data.pasos.forEach(paso => {
          const adaptado = (paso.sesiones || []).map(d => ({
            ...d,
            nombreTrabajador: d.sesionTrabajo?.trabajador?.nombre || "N/A",
            nombreMaquina: d.sesionTrabajo?.maquina?.nombre || "N/A"
          }));
          setAsignaciones(prev => ({ ...prev, [paso.id]: adaptado }));
        });
      })
      .catch(err => console.error("Error al obtener detalle de orden:", err));
  }, [id]);

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
      const res = await fetch(`https://smartindustries.org/ordenes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) navigate("/ordenes");
      else setErrorMsg("Error al eliminar orden");
    } catch (err) {
      console.error("Error:", err);
      setErrorMsg("Error al eliminar orden");
    }
  };

  const imprimirQROrden = () => {
    if (!orden?.id) return;
    QRCode.toDataURL(String(orden.id))
      .then(url => {
        const ventana = window.open("", "_blank");
        if (!ventana) return;

        const imagen = new Image();
        imagen.src = url;
        imagen.onload = () => {
          ventana.document.body.innerHTML = `<img src="${url}" style="width:250px;height:250px" />`;
          ventana.document.title = `QR Orden ${orden.id}`;
          ventana.focus();
          ventana.print();
          ventana.close();
        };
      })
      .catch(err => {
        console.error("Error al imprimir QR:", err);
        setErrorMsg("Error al imprimir QR de la orden");
      });
  };

  const descargarQROrden = () => {
    if (!orden?.id) return;
    QRCode.toDataURL(String(orden.id))
      .then(url => {
        const a = document.createElement("a");
        a.href = url;
        a.download = `orden_${orden.id}.png`;
        a.click();
      })
      .catch(err => {
        console.error("Error al generar QR:", err);
        setErrorMsg("Error al generar QR de la orden");
      });
  };

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-800 font-medium">
          ID: {orden?.numero}
        </div>
        <div className="bg-indigo-100 px-4 py-2 rounded-full text-sm text-indigo-800 font-medium">
          Producto: {orden?.producto || "Sin producto"}
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-800 font-medium flex items-center gap-4">
          <span>Avance: {avance}% ({totalCompletado}/{totalAsignado})</span>
          <span
            className={`h-2 w-2 rounded-full ${
              ESTADO_COLORES[normalizar(orden?.estado)] || "bg-gray-400"
            }`}
          ></span>
          <span>Estado: {orden?.estado}</span>
          <span>{orden ? new Date(orden.fechaOrden).toLocaleString() : ''}</span>
        </div>
        {orden?.id && (
          <div className="ml-auto flex gap-2">
            <button
              className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
              onClick={descargarQROrden}
            >
              Descargar QR
            </button>
            <button
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
              onClick={imprimirQROrden}
            >
              Imprimir QR
            </button>
          </div>
        )}
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
                <th className="px-4 py-2 border-r">Cant. producto no conforme</th>
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
                  <td className="px-4 py-2 border-r">{(item.cantidadPedaleos ?? 0) - (item.cantidadProducida ?? 0)}</td>
                  <td className="px-4 py-2 border-r">
                    {
                      (asignaciones[item.id]?.[0]?.pasoOrden?.estado) ||
                      item.estado
                    }
                  </td>
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
              <th className="px-4 py-2 border-r">Máquina</th>
              <th className="px-4 py-2 border-r">Trabajador</th>
              <th className="px-4 py-2 border-r">Cant. producida</th>
              <th className="px-4 py-2 border-r">Cant. producto no conforme</th>
              <th className="px-4 py-2 border-r">Cant. asignada</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {datos.map(p => (
              (asignaciones[p.id] || []).map((a, i) => (
                <tr key={`${p.id}-${i}`} className="border-t">
                  <td className="px-4 py-2 border-r">{a.nombreMaquina}</td>
                  <td className="px-4 py-2 border-r">{a.nombreTrabajador}</td>
                  <td className="px-4 py-2 border-r">{a.cantidadProducida}</td>
                  <td className="px-4 py-2 border-r">{(a.cantidadPedaleos ?? 0) - (a.cantidadProducida ?? 0)}</td>
                  <td className="px-4 py-2 border-r">
                    {normalizar(a.estado) === 'finalizada' &&
                     (a.cantidadProducida ?? 0) + ((a.cantidadPedaleos ?? 0) - (a.cantidadProducida ?? 0)) < (a.cantidadAsignada ?? 0)
                      ? `${a.cantidadAsignada} - (${(a.cantidadProducida ?? 0) + ((a.cantidadPedaleos ?? 0) - (a.cantidadProducida ?? 0))} completados)`
                      : a.cantidadAsignada
                    }
                  </td>
                  <td className="px-4 py-2">
                    {a.estado}
                    {(() => {
                      const estado = normalizar(a.estado);
                      const completado = (a.cantidadProducida ?? 0) + ((a.cantidadPedaleos ?? 0) - (a.cantidadProducida ?? 0));
                      const asignado = a.cantidadAsignada ?? 0;

                      if (estado === 'inactivo') {
                        return <span className="ml-10 inline-block w-3 h-3 bg-gray-400 rounded-full"></span>;
                      }

                      if (estado === 'finalizada') {
                        if (completado < asignado) {
                          return <span className="ml-10 inline-block w-3 h-3 bg-red-500 rounded-full"></span>;
                        } else {
                          return <span className="ml-10 inline-block w-3 h-3 bg-gray-400 rounded-full"></span>;
                        }
                      }

                      if (estado === 'produccion' || estado === 'en producción') {
                        return <span className="ml-10 inline-block w-3 h-3 bg-green-500 rounded-full"></span>;
                      }

                      return null;
                    })()}
                  </td>
                </tr>
              ))
            ))}
            <tr className="font-semibold bg-gray-50">
              <td colSpan={2} className="px-4 py-2 text-right border-r">Total</td>
              <td className="px-4 py-2 border-r">{totalCompletado}</td>
              <td className="px-4 py-2 border-r">
                {
                  datos.reduce((sum, p) =>
                    sum + (asignaciones[p.id] || []).reduce(
                      (a, b) => a + ((b.cantidadPedaleos ?? 0) - (b.cantidadProducida ?? 0)), 0
                    ), 0)
                }
              </td>
              <td className="px-4 py-2 border-r">{
                datos.reduce((sum, p) =>
                  sum + (asignaciones[p.id] || []).reduce((a, b) => {
                    const estadoFinalizado = normalizar(b.estado) === 'finalizada';
                    const completado = (b.cantidadProducida ?? 0) + ((b.cantidadPedaleos ?? 0) - (b.cantidadProducida ?? 0));
                    return a + (
                      estadoFinalizado && completado < (b.cantidadAsignada ?? 0)
                        ? completado
                        : (b.cantidadAsignada ?? 0)
                    );
                  }, 0)
                , 0)
              }</td>
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
      {errorMsg && (
        <ErrorPopup mensaje={errorMsg} onClose={() => setErrorMsg(null)} />
      )}
    </div>
  );
}
