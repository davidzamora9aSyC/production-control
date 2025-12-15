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

export default function AccionesRapidas({
  accionesDisponibles = [],
  accionCard,
  accion,
  accionFinalizarPasoLabel = "",
  onAccionCardSeleccion,
  pasoManualSeleccionado,
  onOpenPasoModal,
  onAsignarPasoManual,
  asignandoPasoManual,
  sesionActiva,
  trabajadorAsignacion,
  sesionActivaId,
  asignacionesSesion = [],
  asignacionPasoFinalizarId = "",
  piezas,
  setPiezas,
  piezasDefectuosas,
  setPiezasDefectuosas,
  onOperacionSubmit,
}) {
  const hayAcciones = accionesDisponibles.length > 0;
  const requiereAsignacion = accion === accionFinalizarPasoLabel;
  const requiereReporteProduccion = [
    "Salir a descanso",
    "Inicio de mantenimiento",
    accionFinalizarPasoLabel,
  ].includes(accion);
  const asignacionActiva =
    asignacionesSesion.find((item) => {
      if (esAsignacionFinalizada(item)) return false;
      const estado = (item.estado || item.estadoSesionPaso || "").toLowerCase();
      const sinFin = item.fechaFin == null && item.fin == null;
      const estadoActivo =
        estado === "activo" ||
        estado === "en_produccion" ||
        estado === "en producción";
      return !esAsignacionFinalizada(item) && (sinFin || estadoActivo);
    }) || null;
  const disableSubmit =
    !accion ||
    (requiereAsignacion && (!asignacionActiva || !asignacionPasoFinalizarId));
  const handleNonNegativeChange = (setter) => (event) => {
    const raw = event.target.value;
    if (raw === "") {
      setter("");
      return;
    }
    const numeric = Number(raw);
    if (Number.isNaN(numeric)) return;
    setter(String(Math.max(0, numeric)));
  };
  const piezasOnChange = handleNonNegativeChange(setPiezas);
  const piezasDefectuosasOnChange =
    handleNonNegativeChange(setPiezasDefectuosas);

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold text-sm">
          ¿Qué deseas hacer?
        </label>
        {hayAcciones ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {accionesDisponibles.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onAccionCardSeleccion(opt.value)}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  accionCard === opt.value
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-2">
            No hay acciones disponibles para el estado actual de la sesión.
          </p>
        )}
      </div>
      {hayAcciones && !accionCard && (
        <p className="text-sm text-gray-600">
          Selecciona una acción para continuar.
        </p>
      )}
      {hayAcciones && accionCard === "asignar-paso" && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border rounded-xl p-4">
          <div className="text-sm text-gray-700">
            {pasoManualSeleccionado ? (
              <>
                <div>
                  <strong>Orden:</strong> {pasoManualSeleccionado.ordenId}
                </div>
                <div>
                  <strong>Paso:</strong> {pasoManualSeleccionado.paso.nombre} (#
                  {pasoManualSeleccionado.paso.numeroPaso ?? "-"})
                </div>
              </>
            ) : (
              <span>
                Selecciona una orden y un paso para asignarlo a la sesión
                activa.
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onOpenPasoModal("manual")}
              disabled={!trabajadorAsignacion}
              className="px-3 py-1.5 rounded-full border bg-white text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Seleccionar paso
            </button>
            <button
              type="button"
              onClick={onAsignarPasoManual}
              disabled={
                asignandoPasoManual ||
                !sesionActivaId ||
                !pasoManualSeleccionado?.paso?.id
              }
              className="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-sm disabled:opacity-50"
            >
              {asignandoPasoManual ? "Asignando..." : "Asignar a sesión"}
            </button>
          </div>
        </div>
      )}
      {hayAcciones && accionCard !== "asignar-paso" && accion && (
        <form
          onSubmit={onOperacionSubmit}
          className="border rounded-xl p-4 space-y-4"
        >
          <div className="text-sm font-medium text-gray-700">
            Acción seleccionada:{" "}
            <span className="text-indigo-700">{accion}</span>
          </div>
          {accion === "Finalizar sesión" && (
            <p className="text-sm text-gray-700">
              Usa el botón inferior para cerrar la sesión activa seleccionada.
              No se requieren más datos.
            </p>
          )}
          {accion === "Volver del descanso" && (
            <p className="text-sm text-gray-700">
              Cuando regreses del descanso, presiona el botón para notificar al
              sistema. No se requieren datos adicionales.
            </p>
          )}
          {accion === "Fin de mantenimiento" && (
            <p className="text-sm text-gray-700">
              Finaliza el mantenimiento cuando la máquina esté lista para volver
              a operar. No se requieren datos adicionales.
            </p>
          )}
          {requiereAsignacion && (
            <div>
              <div className="font-medium">Paso asignado</div>
              {asignacionActiva ? (
                <p className="text-sm text-gray-700">
                  {asignacionActiva.pasoOrden?.nombre ?? "Paso sin nombre"} ·
                  Orden{" "}
                  {asignacionActiva.pasoOrden?.orden?.codigo ??
                    asignacionActiva.pasoOrden?.ordenId ??
                    asignacionActiva.pasoOrden?.orden?.id ??
                    "-"}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  La sesión no tiene una asignación activa para finalizar.
                </p>
              )}
            </div>
          )}
          {requiereReporteProduccion && (
            <>
              <div>
                <label className="block font-medium">
                  Piezas buenas producidas
                </label>
                <input
                  type="number"
                  value={piezas}
                  min="0"
                  onChange={piezasOnChange}
                  onWheel={(e) => {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }}
                  className="w-full border rounded-full px-4 py-2"
                />
              </div>
              <div>
                <label className="block font-medium">Piezas defectuosas</label>
                <input
                  type="number"
                  value={piezasDefectuosas}
                  min="0"
                  onChange={piezasDefectuosasOnChange}
                  onWheel={(e) => {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }}
                  className="w-full border rounded-full px-4 py-2"
                />
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={disableSubmit}
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm self-start disabled:opacity-50"
          >
            Registrar acción
          </button>
        </form>
      )}
    </div>
  );
}
