import MaquinaSelector from "./MaquinaSelector";
import TrabajadorQrSelector from "./TrabajadorQrSelector";

const obtenerSesionId = (sesion) => {
  if (!sesion) return null;
  if (typeof sesion.sesionTrabajo === "object" && sesion.sesionTrabajo?.id) {
    return sesion.sesionTrabajo.id;
  }
  if (typeof sesion.sesionTrabajo === "string") return sesion.sesionTrabajo;
  if (sesion.id) return sesion.id;
  return null;
};

export default function SesionIniciador({
  fechaHora,
  maquinaSeleccionada,
  onMaquinaSelect,
  maquinaData,
  maquinaError,
  buscandoSesionMaquina,
  sesionMaquinaError,
  sesionActivaMaquina,
  mostrarDatosSesionTrabajador,
  trabajadorSeleccionado,
  onTrabajadorSelect,
  sesionesTrabajador = [],
  sesionesTrabajadorLoading = false,
  sesionesTrabajadorError = "",
  pasosSesionesTrabajador = {},
  onSeleccionSesionTrabajador = () => {},
  pasoOrdenSeleccionado,
  onPasoOrdenClear,
  onOpenPasoModal,
  onSeleccionarSesionActiva,
  onIniciarSesion,
  requierePasoOrden = false,
}) {
  const pasoSeleccionado = Boolean(pasoOrdenSeleccionado?.paso?.id);
  const debeSeleccionarPaso = requierePasoOrden && !sesionActivaMaquina;
  const trabajadorDisponible = Boolean(
    trabajadorSeleccionado?.id || trabajadorSeleccionado?.trabajador?.id,
  );
  const maquinaDisponible = Boolean(
    maquinaData?.id ||
    maquinaSeleccionada?.id ||
    maquinaSeleccionada?.codigo ||
    maquinaSeleccionada?.maquinaId,
  );
  const botonInicioDeshabilitado =
    !trabajadorDisponible ||
    !maquinaDisponible ||
    (debeSeleccionarPaso && !pasoSeleccionado);
  const mostrarMensajeRequiereTrabajador = !trabajadorDisponible;
  const sesionesLista = Array.isArray(sesionesTrabajador)
    ? sesionesTrabajador
    : [];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Iniciar o seleccionar sesión
      </h1>
      <form onSubmit={onIniciarSesion} className="flex flex-col gap-5">
        <div>
          <label className="block font-medium">Fecha y hora</label>
          <input
            type="text"
            value={fechaHora}
            readOnly
            className="w-full border rounded-full px-4 py-2 bg-gray-100"
          />
        </div>

        <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
          <div>
            <div className="font-medium">Trabajador</div>
            <p className="text-xs text-gray-600">
              Escanea el QR del operario para continuar.
            </p>
          </div>
          <TrabajadorQrSelector
            selected={trabajadorSeleccionado}
            onSelect={onTrabajadorSelect}
          />
        </div>

        <div className="border rounded-xl p-4 bg-white space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-medium">Sesiones activas del trabajador</div>
              <p className="text-xs text-gray-600">
                Selecciona una sesión existente si el operario ya está
                trabajando en alguna máquina.
              </p>
            </div>
          </div>
          {!trabajadorDisponible && (
            <p className="text-sm text-gray-600">
              Escanea un trabajador para listar sus sesiones activas.
            </p>
          )}
          {trabajadorDisponible && (
            <>
              {sesionesTrabajadorLoading && (
                <p className="text-sm text-gray-600">Cargando sesiones…</p>
              )}
              {sesionesTrabajadorError && !sesionesTrabajadorLoading && (
                <p className="text-sm text-red-600">
                  {sesionesTrabajadorError}
                </p>
              )}
              {!sesionesTrabajadorLoading &&
                !sesionesTrabajadorError &&
                sesionesLista.length === 0 && (
                  <p className="text-sm text-gray-600">
                    El trabajador no tiene sesiones activas.
                  </p>
                )}
              {!sesionesTrabajadorLoading &&
                !sesionesTrabajadorError &&
                sesionesLista.length > 0 && (
                  <ul className="space-y-3">
                    {sesionesLista.map((sesion) => {
                      const sesionId = obtenerSesionId(sesion);
                      const pasoInfo = sesionId
                        ? pasosSesionesTrabajador[sesionId]
                        : null;
                      const pasoNombre =
                        pasoInfo?.paso?.nombre ?? "Sin paso asignado";
                      const ordenCodigo =
                        pasoInfo?.orden?.codigo || pasoInfo?.orden?.id;
                      return (
                        <li
                          key={sesion.id || sesionId}
                          className="border rounded-lg p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="text-sm text-gray-800 space-y-0.5">
                            <div className="font-semibold">
                              {sesion.maquina?.nombre || "Máquina sin nombre"}
                            </div>
                            <div className="text-xs text-gray-600">
                              {sesion.maquina?.codigo
                                ? `Código: ${sesion.maquina.codigo}`
                                : "Sin código"}{" "}
                              · Estado:{" "}
                              {(sesion.estadoSesion || "-").toLowerCase()}
                            </div>
                            <div className="text-xs text-gray-600">
                              Paso: {pasoNombre}
                              {ordenCodigo ? ` · Orden ${ordenCodigo}` : ""}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onSeleccionSesionTrabajador(sesion)}
                            className="px-3 py-1.5 rounded-full border bg-white text-sm hover:bg-gray-50"
                          >
                            Usar esta sesión
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
            </>
          )}
        </div>

        <div className="border rounded-xl p-4 bg-gray-50 space-y-3">
          <div>
            <div className="font-medium">Crear nueva sesión</div>
            <p className="text-xs text-gray-600">
              Selecciona una máquina y un paso para iniciar una sesión
              adicional.
            </p>
            {mostrarMensajeRequiereTrabajador && (
              <p className="text-xs text-yellow-700 mt-2">
                Debes seleccionar un trabajador para crear una nueva sesión.
              </p>
            )}
          </div>
          <MaquinaSelector
            selected={maquinaSeleccionada}
            onSelect={onMaquinaSelect}
          />
          {maquinaError && (
            <p className="text-red-600 text-sm">{maquinaError}</p>
          )}
          {maquinaData && (
            <div className="mt-2 text-sm bg-white p-2 rounded">
              <p>
                <strong>Nombre:</strong> {maquinaData.nombre}
              </p>
              <p>
                <strong>Código:</strong> {maquinaData.codigo}
              </p>
              <p>
                <strong>Ubicación:</strong> {maquinaData.ubicacion}
              </p>
              <p>
                <strong>Área:</strong> {maquinaData.area?.nombre}
              </p>
              <p>
                <strong>Tipo:</strong> {maquinaData.tipo}
              </p>
            </div>
          )}
          {buscandoSesionMaquina && (
            <p className="text-sm text-gray-600 mt-2">
              Consultando sesión activa de la máquina…
            </p>
          )}
          {sesionMaquinaError && (
            <p className="text-sm text-red-600 mt-1">{sesionMaquinaError}</p>
          )}
          {sesionActivaMaquina && !sesionMaquinaError && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-900 space-y-2">
              <div>
                <p className="font-medium">
                  Esta máquina ya tiene una sesión activa.
                </p>
                <p>Inicio: {sesionActivaMaquina.fechaInicio ?? "-"}</p>
              </div>
              {mostrarDatosSesionTrabajador ? (
                <div className="bg-white/70 rounded p-2 text-[13px] text-gray-800">
                  <p>
                    <strong>Operario:</strong>{" "}
                    {sesionActivaMaquina.trabajador.nombre}
                  </p>
                  <p>
                    <strong>Identificación:</strong>{" "}
                    {sesionActivaMaquina.trabajador.identificacion ?? "-"}
                  </p>
                  <p>
                    <strong>Grupo:</strong>{" "}
                    {sesionActivaMaquina.trabajador.grupo ?? "-"}
                  </p>
                  <p>
                    <strong>Turno:</strong>{" "}
                    {sesionActivaMaquina.trabajador.turno ?? "-"}
                  </p>
                </div>
              ) : (
                <p>No hay un operario asignado a esta sesión.</p>
              )}
              <button
                type="button"
                onClick={onSeleccionarSesionActiva}
                className="px-3 py-1.5 rounded-full border bg-white text-sm hover:bg-gray-100"
              >
                Seleccionar sesión existente
              </button>
            </div>
          )}

          <div className="border rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Paso de orden de producción</div>
                <p className="text-xs text-gray-600">
                  Escanea o busca el paso que quieres asignar a la nueva sesión.
                  {debeSeleccionarPaso && (
                    <span className="block text-red-600 mt-1">
                      Debes seleccionar un paso para poder iniciar la sesión.
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenPasoModal("inicio")}
                className="px-3 py-1.5 rounded-full border bg-white text-sm hover:bg-gray-100"
              >
                Trabajar en paso de orden
              </button>
            </div>
            {pasoOrdenSeleccionado && (
              <div className="mt-3 text-sm flex flex-col gap-1">
                <div>
                  <strong>Orden:</strong> {pasoOrdenSeleccionado.ordenId}
                </div>
                <div>
                  <strong>Paso:</strong> {pasoOrdenSeleccionado.paso.nombre} (#
                  {pasoOrdenSeleccionado.paso.numeroPaso ?? "-"})
                </div>
                <button
                  type="button"
                  onClick={onPasoOrdenClear}
                  className="text-xs text-blue-600 mt-1 self-start hover:underline"
                >
                  Quitar selección
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={botonInicioDeshabilitado}
            className={`mt-2 bg-blue-600 text-white py-2 px-6 rounded-full self-start ${
              botonInicioDeshabilitado
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            Iniciar nueva sesión
          </button>
        </div>
      </form>
    </div>
  );
}
