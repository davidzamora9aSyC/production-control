import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import TrabajadorQrSelector from "../components/TrabajadorQrSelector";
import MaquinaSelector from "../components/MaquinaSelector";
import PasoOrdenSelectorModal from "../components/PasoOrdenSelectorModal";

const OPERACIONES_SESION = [
  "Finalizar sesión",
  "Salir a descanso",
  "Volver del descanso",
  "Inicio de mantenimiento",
  "Fin de mantenimiento",
  "Terminar paso",
];

const ACCION_CARD_OPTIONS = [
  { value: "asignar-paso", label: "Asignar orden a sesión activa" },
  ...OPERACIONES_SESION.map((value) => ({ value, label: value })),
];

export default function NuevaMinuta() {
  const [fechaHora, setFechaHora] = useState("");
  const [piezas, setPiezas] = useState("");
  const [meta, setMeta] = useState("");
  const [npt, setNpt] = useState("");
  const [accion, setAccion] = useState("");
  const [codigoOrden, setCodigoOrden] = useState("");
  const [proceso, setProceso] = useState("");
  const [procesosDisponibles, setProcesosDisponibles] = useState([]);
  const [trabajadorData, setTrabajadorData] = useState(null);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState(null);
  const [maquinaData, setMaquinaData] = useState(null);
  const [maquinaError, setMaquinaError] = useState("");
  const [sesionActivaMaquina, setSesionActivaMaquina] = useState(null);
  const [buscandoSesionMaquina, setBuscandoSesionMaquina] = useState(false);
  const [sesionMaquinaError, setSesionMaquinaError] = useState("");
  const [pasoModalOpen, setPasoModalOpen] = useState(false);
  const [pasoModalContext, setPasoModalContext] = useState(null);
  const [pasoOrdenSeleccionado, setPasoOrdenSeleccionado] = useState(null);
  const [trabajadorAsignacion, setTrabajadorAsignacion] = useState(null);
  const [sesionActivaAsignacion, setSesionActivaAsignacion] = useState(null);
  const [asignacionSesionError, setAsignacionSesionError] = useState("");
  const [buscandoSesionActiva, setBuscandoSesionActiva] = useState(false);
  const [pasoManualSeleccionado, setPasoManualSeleccionado] = useState(null);
  const [asignandoPasoManual, setAsignandoPasoManual] = useState(false);
  const [modalMensaje, setModalMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [accionCard, setAccionCard] = useState("");
  const navigate = useNavigate();

  const openPasoModal = (context) => {
    setPasoModalContext(context);
    setPasoModalOpen(true);
  };

  const closePasoModal = () => {
    setPasoModalOpen(false);
    setPasoModalContext(null);
  };

  useEffect(() => {
    const options = {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const intervalId = setInterval(() => {
      const date = new Date();
      const format = new Intl.DateTimeFormat("es-CO", options).format(date);
      setFechaHora(format.replace(",", ""));
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const cumplimiento = meta ? ((piezas / meta) * 100).toFixed(1) : "";
  const nptPorcentaje = npt ? ((npt / 480) * 100).toFixed(1) : "";

  const handleTrabajadorSeleccion = (trabajador) => {
    if (!trabajador) {
      setTrabajadorSeleccionado(null);
      setTrabajadorData(null);
      return;
    }
    setTrabajadorSeleccionado(trabajador);
    setTrabajadorData(trabajador);
  };

  const consultarSesionActivaPorMaquina = async (maquinaId) => {
    if (!maquinaId) {
      setSesionActivaMaquina(null);
      setSesionMaquinaError("");
      setBuscandoSesionMaquina(false);
      return;
    }
    setBuscandoSesionMaquina(true);
    setSesionMaquinaError("");
    try {
      const res = await fetch(`${API_BASE_URL}/sesiones-trabajo/maquina/${maquinaId}/activa`);
      if (res.status === 404) {
        setSesionActivaMaquina(null);
        return;
      }
      if (!res.ok) {
        throw new Error("No se pudo obtener la sesión activa de la máquina.");
      }
      const data = await res.json();
      setSesionActivaMaquina(data);
    } catch (err) {
      setSesionActivaMaquina(null);
      setSesionMaquinaError(err?.message || "Error al buscar la sesión activa de la máquina.");
    } finally {
      setBuscandoSesionMaquina(false);
    }
  };

  const handleFetchMaquina = (overrideId) => {
    const target = (overrideId ?? "").toString().trim();
    if (!target) {
      setMaquinaError("Selecciona una máquina.");
      return;
    }
    setMaquinaError("");
    setMaquinaData(null);
    setSesionActivaMaquina(null);
    setSesionMaquinaError("");
    fetch(`${API_BASE_URL}/maquinas/${target}`)
      .then(res => {
        if (!res.ok) throw new Error('Máquina no encontrada');
        return res.json();
      })
      .then(data => {
        setMaquinaData(data);
        setMaquinaSeleccionada(data);
        consultarSesionActivaPorMaquina(data.id ?? target);
      })
      .catch(() => {
        setMaquinaSeleccionada(null);
        setMaquinaError("Máquina no encontrada");
        setSesionActivaMaquina(null);
        setSesionMaquinaError("");
        setBuscandoSesionMaquina(false);
      });
  };

  const handleMaquinaSeleccion = (maquina) => {
    if (!maquina) {
      setMaquinaSeleccionada(null);
      setMaquinaData(null);
      setMaquinaError("");
      setSesionActivaMaquina(null);
      setSesionMaquinaError("");
      setBuscandoSesionMaquina(false);
      return;
    }
    setMaquinaSeleccionada(maquina);
    const id = maquina.id ?? maquina.codigo ?? "";
    if (id) {
      handleFetchMaquina(id);
    } else {
      setMaquinaData(maquina);
    }
  };

  const handlePasoSeleccionadoDesdeModal = (payload) => {
    if (pasoModalContext === "manual") {
      setPasoManualSeleccionado(payload);
    } else {
      setPasoOrdenSeleccionado(payload);
    }
  };

  const handleAccionCardSeleccion = (valor) => {
    setAccionCard(valor);
    setAsignacionSesionError("");
    setPasoManualSeleccionado(null);
    setCodigoOrden("");
    setProceso("");
    setProcesosDisponibles([]);
    setPiezas("");
    setMeta("");
    setNpt("");
    if (valor === "asignar-paso") {
      setAccion("");
    } else {
      setAccion(valor);
    }
  };

  const handleTrabajadorAsignacionSeleccion = async (trabajador) => {
    setTrabajadorAsignacion(trabajador);
    setSesionActivaAsignacion(null);
    setAsignacionSesionError("");
    setPasoManualSeleccionado(null);
    setCodigoOrden("");
    setProceso("");
    setProcesosDisponibles([]);
    setPiezas("");
    setMeta("");
    setNpt("");
    if (!trabajador) return;
    setBuscandoSesionActiva(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sesiones-trabajo/activas`);
      if (!res.ok) throw new Error("No se pudieron obtener las sesiones activas.");
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];
      const match = lista.find(
        (s) =>
          s.trabajador?.id === trabajador.id ||
          (s.trabajador?.identificacion && s.trabajador.identificacion === trabajador.identificacion)
      );
      if (match) {
        setSesionActivaAsignacion(match);
      } else {
        setAsignacionSesionError("El trabajador no tiene una sesión activa.");
      }
    } catch (err) {
      setAsignacionSesionError(err?.message || "Error al buscar la sesión activa.");
    } finally {
      setBuscandoSesionActiva(false);
    }
  };

  const handleAsignarPasoManual = async () => {
    if (!sesionActivaAsignacion?.id || !pasoManualSeleccionado?.paso?.id || asignandoPasoManual) return;
    setAsignandoPasoManual(true);
    const resultado = await asignarPasoASesion(sesionActivaAsignacion.id, pasoManualSeleccionado.paso.id);
    setAsignandoPasoManual(false);
    if (resultado.ok) {
      setModalMensaje("Paso asignado a la sesión activa correctamente.");
      setPasoManualSeleccionado(null);
    } else {
      const detalle = resultado.error ? `: ${resultado.error}` : ".";
      setModalMensaje(`No se pudo asignar el paso${detalle}`);
    }
    setMostrarModal(true);
  };

  const handleSeleccionarSesionDesdeMaquina = () => {
    if (!sesionActivaMaquina) return;
    setTrabajadorAsignacion(sesionActivaMaquina.trabajador || null);
    setSesionActivaAsignacion(sesionActivaMaquina);
    setAsignacionSesionError("");
    setPasoManualSeleccionado(null);
    setPasoOrdenSeleccionado(null);
    setCodigoOrden("");
    setProceso("");
    setProcesosDisponibles([]);
    setPiezas("");
    setMeta("");
    setNpt("");
    if (typeof window !== "undefined" && window?.scrollTo) {
      const totalHeight = typeof document !== "undefined" ? document.body?.scrollHeight ?? 0 : 0;
      window.scrollTo({ top: totalHeight, behavior: "smooth" });
    }
  };

  const handleIniciarSesion = (e) => {
    e.preventDefault();
    if (sesionActivaMaquina) {
      setModalMensaje("Esta máquina ya tiene una sesión activa. Selecciónala para registrar acciones.");
      setMostrarModal(true);
      return;
    }
    const sesion = {
      trabajador: trabajadorData?.id,
      maquina: maquinaData?.id,
    };
    fetch(`${API_BASE_URL}/sesiones-trabajo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sesion)
    })
    .then(async res => {
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || 'Error al iniciar sesión';
        throw new Error(msg);
      }
      return data;
    })
    .then(async (data) => {
      let mensaje = 'Sesión iniciada correctamente';
      if (pasoOrdenSeleccionado?.paso?.id && data?.id) {
        const asignacionOk = await asignarPasoASesion(data.id, pasoOrdenSeleccionado.paso.id);
        if (!asignacionOk.ok) {
          mensaje = `${mensaje}. Sin embargo, no se pudo asignar el paso: ${asignacionOk.error}`;
        } else {
          mensaje = `${mensaje} y paso asignado correctamente.`;
        }
      }
      setTrabajadorSeleccionado(null);
      setTrabajadorData(null);
      setMaquinaSeleccionada(null);
      setMaquinaData(null);
      setMaquinaError("");
      setSesionActivaMaquina(null);
      setSesionMaquinaError("");
      setPasoOrdenSeleccionado(null);
      setModalMensaje(mensaje);
      setMostrarModal(true);
    })
    .catch(err => {
      setModalMensaje(err?.message || 'Error al iniciar sesión');
      setMostrarModal(true);
    });
  };

  const handleOperacionSubmit = (e) => {
    e.preventDefault();
    if (!sesionActivaAsignacion?.id) {
      setModalMensaje("Selecciona un trabajador con una sesión activa para registrar acciones.");
      setMostrarModal(true);
      return;
    }
    if (!accion) {
      setModalMensaje("Selecciona una acción para registrar.");
      setMostrarModal(true);
      return;
    }
    const minuta = {
      fechaHora,
      piezas,
      meta,
      cumplimiento,
      npt,
      nptPorcentaje,
      accion,
      codigoOrden,
      proceso
    };
    fetch(`${API_BASE_URL}/minutas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(minuta)
    })
    .then(res => {
      if (!res.ok) throw new Error('Error al enviar minuta');
      return res.json();
    })
    .then(() => {
      setPiezas("");
      setMeta("");
      setNpt("");
      setAccion("");
      setCodigoOrden("");
      setProceso("");
      setProcesosDisponibles([]);
      setModalMensaje('Acción registrada correctamente.');
      setMostrarModal(true);
    })
    .catch(err => {
      setModalMensaje(err?.message || 'Error al registrar la acción');
      setMostrarModal(true);
    });
  };

  const asignarPasoASesion = async (sesionId, pasoId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sesion-trabajo-pasos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sesionTrabajo: sesionId,
          pasoOrden: pasoId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = data?.message || data?.error || "Error al asignar paso";
        return { ok: false, error: message };
      }
      await res.json().catch(() => null);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || "Error al asignar paso" };
    }
  };

  const trabajadorDisplay = sesionActivaMaquina?.trabajador || trabajadorSeleccionado;
  const trabajadorSelectorDisabled = Boolean(sesionActivaMaquina);
  const trabajadorDisabledMessage = trabajadorSelectorDisabled
    ? "Esta máquina ya tiene una sesión activa. Cambia de máquina para iniciar una nueva sesión."
    : "";

  return (
    <div className="p-6 max-w-4xl mx-auto text-sm sm:text-base">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/login")}
          className="text-blue-600 font-medium hover:underline"
        >
          Administración
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-6">Iniciar nueva sesión</h1>
        <form onSubmit={handleIniciarSesion} className="flex flex-col gap-4">
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
            <MaquinaSelector
              selected={maquinaSeleccionada}
              onSelect={handleMaquinaSeleccion}
            />
            {maquinaError && (
              <p className="text-red-600 mt-2">{maquinaError}</p>
            )}
            {maquinaData && (
              <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
                <p><strong>Nombre:</strong> {maquinaData.nombre}</p>
                <p><strong>Código:</strong> {maquinaData.codigo}</p>
                <p><strong>Ubicación:</strong> {maquinaData.ubicacion}</p>
                <p><strong>Área:</strong> {maquinaData.area?.nombre}</p>
                <p><strong>Tipo:</strong> {maquinaData.tipo}</p>
              </div>
            )}
            {buscandoSesionMaquina && (
              <p className="text-sm text-gray-600 mt-2">Consultando sesión activa de la máquina…</p>
            )}
            {sesionMaquinaError && (
              <p className="text-sm text-red-600 mt-2">{sesionMaquinaError}</p>
            )}
            {sesionActivaMaquina && !sesionMaquinaError && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-900">
                <p className="font-medium">Esta máquina ya tiene una sesión activa.</p>
                <p>Operario: {sesionActivaMaquina.trabajador?.nombre ?? "Sin asignar"}</p>
                <p>Inicio: {sesionActivaMaquina.fechaInicio ?? "-"}</p>
              </div>
            )}
          </div>
          <TrabajadorQrSelector
            selected={trabajadorDisplay}
            onSelect={handleTrabajadorSeleccion}
            disabled={trabajadorSelectorDisabled}
            disabledMessage={trabajadorDisabledMessage}
          />
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
                onClick={() => openPasoModal("inicio")}
                className="px-3 py-1.5 rounded-full border bg-white text-sm hover:bg-gray-100"
              >
                Trabajar en paso de orden
              </button>
            </div>
            {pasoOrdenSeleccionado && (
              <div className="mt-3 text-sm flex flex-col gap-1">
                <div><strong>Orden:</strong> {pasoOrdenSeleccionado.ordenId}</div>
                <div>
                  <strong>Paso:</strong> {pasoOrdenSeleccionado.paso.nombre} (#{pasoOrdenSeleccionado.paso.numeroPaso ?? "-"})
                </div>
                <button
                  type="button"
                  onClick={() => setPasoOrdenSeleccionado(null)}
                  className="text-xs text-blue-600 mt-1 self-start hover:underline"
                >
                  Quitar selección
                </button>
              </div>
            )}
          </div>
          {sesionActivaMaquina ? (
            <button
              type="button"
              onClick={() => handleSeleccionarSesionDesdeMaquina()}
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
      <div className="bg-white rounded-xl shadow-md p-6 mt-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Sesiones activas</h2>
          <p className="text-sm text-gray-600">
            Selecciona la acción que necesitas realizar y luego escanea el QR del trabajador correspondiente.
          </p>
        </div>
        <div>
          <label className="block font-semibold text-sm">¿Qué deseas hacer?</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {ACCION_CARD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAccionCardSeleccion(opt.value)}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  accionCard === opt.value ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {!accionCard && (
          <p className="text-sm text-gray-600">Selecciona una acción para continuar.</p>
        )}
        {accionCard && (
          <>
            <TrabajadorQrSelector
              selected={trabajadorAsignacion}
              onSelect={handleTrabajadorAsignacionSeleccion}
              title="Trabajador con sesión activa"
            />
            {buscandoSesionActiva && <p className="text-sm text-gray-600">Buscando sesión activa…</p>}
            {asignacionSesionError && (
              <p className="text-sm text-red-600">{asignacionSesionError}</p>
            )}
            {sesionActivaAsignacion && (
              <div className="text-sm bg-gray-50 border rounded p-3 space-y-1">
                <div><strong>Sesión:</strong> {sesionActivaAsignacion.id}</div>
                <div><strong>Máquina:</strong> {sesionActivaAsignacion.maquina?.nombre ?? "-"}</div>
                <div><strong>Estado:</strong> {sesionActivaAsignacion.estadoSesion ?? sesionActivaAsignacion.estado ?? "-"}</div>
              </div>
            )}
            {accionCard === "asignar-paso" && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border rounded-xl p-4">
                <div className="text-sm text-gray-700">
                  {pasoManualSeleccionado ? (
                    <>
                      <div><strong>Orden:</strong> {pasoManualSeleccionado.ordenId}</div>
                      <div>
                        <strong>Paso:</strong> {pasoManualSeleccionado.paso.nombre} (#{pasoManualSeleccionado.paso.numeroPaso ?? "-"})
                      </div>
                    </>
                  ) : (
                    <span>Selecciona una orden y un paso para asignarlo a la sesión activa.</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openPasoModal("manual")}
                    disabled={!trabajadorAsignacion}
                    className="px-3 py-1.5 rounded-full border bg-white text-sm hover:bg-gray-100 disabled:opacity-50"
                  >
                    Seleccionar paso
                  </button>
                  <button
                    type="button"
                    onClick={handleAsignarPasoManual}
                    disabled={
                      asignandoPasoManual ||
                      !sesionActivaAsignacion?.id ||
                      !pasoManualSeleccionado?.paso?.id
                    }
                    className="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-sm disabled:opacity-50"
                  >
                    {asignandoPasoManual ? "Asignando..." : "Asignar a sesión"}
                  </button>
                </div>
              </div>
            )}
            {accionCard !== "asignar-paso" && accion && (
              <form onSubmit={handleOperacionSubmit} className="border rounded-xl p-4 mt-4 space-y-4">
                <div className="text-sm font-medium text-gray-700">
                  Acción seleccionada: <span className="text-indigo-700">{accion}</span>
                </div>
                {["Volver del descanso", "Fin de mantenimiento"].includes(accion) && (
                  <>
                    <div>
                      <label className="block font-medium">Código de orden de producción</label>
                      <input
                        type="text"
                        value={codigoOrden}
                        onChange={e => {
                          setCodigoOrden(e.target.value);
                          setProcesosDisponibles(["Corte", "Soldadura", "Ensamble"]);
                        }}
                        className="w-full border rounded-full px-4 py-2"
                        placeholder="Ingrese el código de la orden"
                      />
                    </div>
                    <div>
                      <label className="block font-medium">Proceso a realizar</label>
                      <select
                        value={proceso}
                        onChange={e => setProceso(e.target.value)}
                        className="w-full border rounded-full px-4 py-2"
                      >
                        <option value="">Seleccione un proceso</option>
                        {procesosDisponibles.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {["Finalizar sesión", "Salir a descanso", "Inicio de mantenimiento"].includes(accion) && (
                  <>
                    <div>
                      <label className="block font-medium">Cantidad de piezas hechas</label>
                      <input
                        type="number"
                        value={piezas}
                        onChange={e => setPiezas(e.target.value)}
                        className="w-full border rounded-full px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-medium">Meta</label>
                      <input
                        type="number"
                        value={meta}
                        onChange={e => setMeta(e.target.value)}
                        className="w-full border rounded-full px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-medium">% de cumplimiento</label>
                      <input
                        type="text"
                        value={cumplimiento ? `${cumplimiento}%` : ""}
                        readOnly
                        className="w-full border rounded-full px-4 py-2 bg-gray-100"
                        tabIndex={-1}
                      />
                    </div>
                    <div>
                      <label className="block font-medium">NPT (min)</label>
                      <input
                        type="number"
                        value={npt}
                        onChange={e => setNpt(e.target.value)}
                        className="w-full border rounded-full px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-medium">% de NPT</label>
                      <input
                        type="text"
                        value={nptPorcentaje ? `${nptPorcentaje}%` : ""}
                        readOnly
                        className="w-full border rounded-full px-4 py-2 bg-gray-100"
                        tabIndex={-1}
                      />
                    </div>
                  </>
                )}
                <button
                  type="submit"
                  disabled={!accion}
                  className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm self-start disabled:opacity-50"
                >
                  Registrar acción
                </button>
              </form>
            )}
          </>
        )}
      </div>
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>{modalMensaje}</p>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setMostrarModal(false);
                setModalMensaje("");
                setTrabajadorSeleccionado(null);
                setTrabajadorData(null);
                setMaquinaSeleccionada(null);
                setMaquinaData(null);
                setMaquinaError("");
                setPasoOrdenSeleccionado(null);
                setTrabajadorAsignacion(null);
                setSesionActivaAsignacion(null);
                setAsignacionSesionError("");
                setPasoManualSeleccionado(null);
                setAccion("");
                setAccionCard("");
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
      <PasoOrdenSelectorModal
        open={pasoModalOpen}
        onClose={closePasoModal}
        onSelected={handlePasoSeleccionadoDesdeModal}
      />
    </div>
  );
}
