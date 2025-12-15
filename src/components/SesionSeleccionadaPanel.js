import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";

const esAsignacionFinalizada = (item = {}) => {
  const finalizadoVal = item?.finalizado;
  const finalizadoBool =
    finalizadoVal === true ||
    finalizadoVal === 1 ||
    (typeof finalizadoVal === "string" &&
      ["true", "1"].includes(finalizadoVal.toLowerCase?.() || ""));
  const estado = (
    item?.estado ||
    item?.estadoSesionPaso ||
    item?.estadoSesion ||
    ""
  ).toLowerCase();
  return (
    finalizadoBool ||
    estado === "finalizada" ||
    estado === "finalizado" ||
    estado === "terminada"
  );
};

const getSesionId = (sesion) => {
  if (!sesion) return null;
  if (typeof sesion.sesionTrabajo === "object" && sesion.sesionTrabajo?.id) {
    return sesion.sesionTrabajo.id;
  }
  if (typeof sesion.sesionTrabajo === "string") return sesion.sesionTrabajo;
  if (sesion.id) return sesion.id;
  return null;
};

const getTrabajadorSesion = (sesion) => {
  if (!sesion) return null;
  if (sesion.trabajador) return sesion.trabajador;
  if (typeof sesion.sesionTrabajo === "object") {
    return sesion.sesionTrabajo.trabajador || null;
  }
  return null;
};

const getMaquinaSesion = (sesion) => {
  if (!sesion) return null;
  if (sesion.maquina) return sesion.maquina;
  if (typeof sesion.sesionTrabajo === "object") {
    return sesion.sesionTrabajo.maquina || null;
  }
  return null;
};

export default function SesionSeleccionadaPanel({
  sesion,
  onSeleccionarOtra = () => {},
  children,
  refreshKey = 0,
  onSesionDetalleChange = () => {},
  onAsignacionesChange = () => {},
}) {
  const [pasosAsignados, setPasosAsignados] = useState([]);
  const [cargandoPasos, setCargandoPasos] = useState(false);
  const [errorPasos, setErrorPasos] = useState("");
  const [detalleSesion, setDetalleSesion] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const sesionId = getSesionId(sesion);

  useEffect(() => {
    let cancelado = false;
    if (!sesionId) {
      setDetalleSesion(null);
      setErrorDetalle("");
      if (typeof onSesionDetalleChange === "function") {
        onSesionDetalleChange(null);
      }
      return;
    }
    setCargandoDetalle(true);
    setErrorDetalle("");
    fetch(`${API_BASE_URL}/sesiones-trabajo/${sesionId}`)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            "No se pudo obtener la información detallada de la sesión.",
          );
        return res.json();
      })
      .then((data) => {
        if (cancelado) return;
        setDetalleSesion(data);
        if (typeof onSesionDetalleChange === "function") {
          onSesionDetalleChange(data);
        }
      })
      .catch((err) => {
        if (cancelado) return;
        setDetalleSesion(null);
        setErrorDetalle(
          err?.message || "Error al obtener el detalle de la sesión.",
        );
        if (typeof onSesionDetalleChange === "function") {
          onSesionDetalleChange(null);
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoDetalle(false);
      });
    return () => {
      cancelado = true;
    };
  }, [sesionId, refreshKey, onSesionDetalleChange]);
  useEffect(() => {
    let cancelado = false;
    if (!sesionId) {
      setPasosAsignados([]);
      setErrorPasos("");
      if (typeof onAsignacionesChange === "function") {
        onAsignacionesChange([]);
      }
      return;
    }
    setCargandoPasos(true);
    setErrorPasos("");
    fetch(`${API_BASE_URL}/sesion-trabajo-pasos/por-sesion/${sesionId}`)
      .then((res) => {
        if (!res.ok)
          throw new Error("No se pudieron obtener las asignaciones activas.");
        return res.json();
      })
      .then((data) => {
        if (cancelado) return;
        const lista = Array.isArray(data) ? data : [];
        setPasosAsignados(lista);
        if (typeof onAsignacionesChange === "function") {
          onAsignacionesChange(lista);
        }
      })
      .catch((err) => {
        if (cancelado) return;
        setErrorPasos(err?.message || "Error al buscar las asignaciones.");
        setPasosAsignados([]);
        if (typeof onAsignacionesChange === "function") {
          onAsignacionesChange([]);
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoPasos(false);
      });
    return () => {
      cancelado = true;
    };
  }, [sesionId, refreshKey, onAsignacionesChange]);

  if (!sesion || !sesionId) return null;

  const trabajador =
    detalleSesion?.trabajador || getTrabajadorSesion(sesion) || {};
  const maquina = detalleSesion?.maquina || getMaquinaSesion(sesion) || {};
  const estadoActual =
    detalleSesion?.estadoSesion || sesion.estadoSesion || "Sin estado";
  const estadoMaquinaBase = maquina?.estado ?? maquina?.estadoActual ?? "-";
  const estadoMaquinaVisible =
    estadoActual?.toLowerCase() === "mantenimiento"
      ? "mantenimiento"
      : estadoMaquinaBase;
  const asignacionesActivas = pasosAsignados.filter(
    (item) => !esAsignacionFinalizada(item),
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sesión seleccionada</h2>
          <p className="text-sm text-gray-600 break-all">ID: {sesionId}</p>
        </div>
        <button
          type="button"
          onClick={onSeleccionarOtra}
          className="self-start px-3 py-1.5 rounded-full border text-sm hover:bg-gray-50"
        >
          Seleccionar otra sesión
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 text-sm text-gray-800">
        <div className="bg-gray-50 rounded p-3 space-y-1">
          <div className="text-xs font-medium text-gray-500">Trabajador</div>
          <div className="font-semibold">
            {trabajador.nombre ?? "Sin nombre"}
          </div>
          <div>Identificación: {trabajador.identificacion ?? "-"}</div>
          <div>Grupo: {trabajador.grupo ?? "-"}</div>
          <div>Turno: {trabajador.turno ?? "-"}</div>
        </div>
        <div className="bg-gray-50 rounded p-3 space-y-1">
          <div className="text-xs font-medium text-gray-500">Máquina</div>
          <div className="font-semibold">{maquina.nombre ?? "Sin nombre"}</div>
          <div>Código: {maquina.codigo ?? "-"}</div>
          <div>Área: {maquina.area?.nombre ?? "-"}</div>
          <div>Estado: {estadoMaquinaVisible}</div>
        </div>
        <div className="bg-gray-50 rounded p-3 space-y-1">
          <div className="text-xs font-medium text-gray-500">
            Estado de la sesión
          </div>
          {cargandoDetalle ? (
            <div className="text-gray-600">Cargando…</div>
          ) : errorDetalle ? (
            <div className="text-red-600">{errorDetalle}</div>
          ) : (
            <div className="font-semibold capitalize">{estadoActual}</div>
          )}
        </div>
      </div>
      <div className="border rounded-xl p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-medium">Asignaciones activas</div>
            <p className="text-xs text-gray-600">
              Pasos de orden vinculados a esta sesión.
            </p>
          </div>
        </div>
        {cargandoPasos && (
          <p className="text-sm text-gray-600">Cargando asignaciones…</p>
        )}
        {errorPasos && !cargandoPasos && (
          <p className="text-sm text-red-600">{errorPasos}</p>
        )}
        {!cargandoPasos && !errorPasos && asignacionesActivas.length === 0 && (
          <p className="text-sm text-gray-700">
            La sesión no tiene asignaciones activas.
          </p>
        )}
        {!cargandoPasos && !errorPasos && asignacionesActivas.length > 0 && (
          <ul className="space-y-2 text-sm">
            {asignacionesActivas.map((item) => (
              <li
                key={item.id}
                className="bg-white rounded border px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <div className="font-semibold">
                    {item.pasoOrden?.nombre ?? "Paso sin nombre"}
                  </div>
                  <div className="text-xs text-gray-600">
                    Orden:{" "}
                    {item.pasoOrden?.orden?.codigo ??
                      item.pasoOrden?.orden?.id ??
                      "-"}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Asignado: {item.cantidadAsignada ?? 0}
                  {" · "}
                  Producido: {item.cantidadProducida ?? 0}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
