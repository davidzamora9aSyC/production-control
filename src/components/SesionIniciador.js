import MaquinaSelector from "./MaquinaSelector";
import TrabajadorQrSelector from "./TrabajadorQrSelector";

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
  mostrarMensajeSeleccionMaquina,
  mostrarTrabajadorSelector,
  trabajadorSeleccionado,
  onTrabajadorSelect,
  pasoOrdenSeleccionado,
  onPasoOrdenClear,
  onOpenPasoModal,
  onSeleccionarSesionActiva,
  onIniciarSesion,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h1 className="text-2xl font-semibold mb-6">Iniciar o seleccionar sesión</h1>
      <form onSubmit={onIniciarSesion} className="flex flex-col gap-4">
        <div>
          <label className="block font-medium">Fecha y hora</label>
          <input
            type="text"
            value={fechaHora}
            readOnly
            className="w-full border rounded-full px-4 py-2 bg-gray-100"
          />
        </div>
        <div>
          <MaquinaSelector selected={maquinaSeleccionada} onSelect={onMaquinaSelect} />
          {maquinaError && <p className="text-red-600 mt-2">{maquinaError}</p>}
          {maquinaData && (
            <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
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
            <p className="text-sm text-gray-600 mt-2">Consultando sesión activa de la máquina…</p>
          )}
          {sesionMaquinaError && <p className="text-sm text-red-600 mt-2">{sesionMaquinaError}</p>}
          {sesionActivaMaquina && !sesionMaquinaError && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-900 space-y-2">
              <div>
                <p className="font-medium">Esta máquina ya tiene una sesión activa.</p>
                <p>Inicio: {sesionActivaMaquina.fechaInicio ?? "-"}</p>
              </div>
              {mostrarDatosSesionTrabajador ? (
                <div className="bg-white/70 rounded p-2 text-[13px] text-gray-800">
                  <p>
                    <strong>Operario:</strong> {sesionActivaMaquina.trabajador.nombre}
                  </p>
                  <p>
                    <strong>Identificación:</strong> {sesionActivaMaquina.trabajador.identificacion ?? "-"}
                  </p>
                  <p>
                    <strong>Grupo:</strong> {sesionActivaMaquina.trabajador.grupo ?? "-"}
                  </p>
                  <p>
                    <strong>Turno:</strong> {sesionActivaMaquina.trabajador.turno ?? "-"}
                  </p>
                </div>
              ) : (
                <p>No hay un operario asignado a esta sesión.</p>
              )}
            </div>
          )}
        </div>
        {mostrarMensajeSeleccionMaquina && (
          <div className="border rounded-xl p-4 bg-gray-50 text-sm text-gray-700">
            Selecciona una máquina para poder escanear al trabajador que iniciará la sesión.
          </div>
        )}
        {mostrarTrabajadorSelector && (
          <TrabajadorQrSelector selected={trabajadorSeleccionado} onSelect={onTrabajadorSelect} />
        )}
        {mostrarTrabajadorSelector && (
          <div className="border rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Paso de orden de producción</div>
                <p className="text-xs text-gray-600">
                  Escanea el QR de la orden para vincular la sesión a un paso específico.
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
        )}
        {sesionActivaMaquina ? (
          <button
            type="button"
            onClick={onSeleccionarSesionActiva}
            className="mt-2 bg-indigo-600 text-white py-2 px-6 rounded-full hover:bg-indigo-700 self-start"
          >
            Seleccionar sesión
          </button>
        ) : (
          <button
            type="submit"
            className="mt-2 bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 self-start"
          >
            Iniciar sesión
          </button>
        )}
      </form>
    </div>
  );
}
