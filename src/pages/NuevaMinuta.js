import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import PasoOrdenSelectorModal from "../components/PasoOrdenSelectorModal";
import SesionSeleccionadaPanel from "../components/SesionSeleccionadaPanel";
import SesionIniciador from "../components/SesionIniciador";
import AccionesRapidas from "../components/AccionesRapidas";

const ACCION_FINALIZAR_PASO = "Finalizar trabajo de paso de producción";

const OPERACIONES_SESION = [
  "Finalizar sesión",
  "Salir a descanso",
  "Volver del descanso",
  "Inicio de mantenimiento",
  "Fin de mantenimiento",
  ACCION_FINALIZAR_PASO,
];

const ACCION_CARD_OPTIONS = [
  { value: "asignar-paso", label: "Trabajar nuevo paso de orden" },
  ...OPERACIONES_SESION.map((value) => ({ value, label: value })),
];

const ACCIONES_POR_ESTADO = {
  produccion: [
    "asignar-paso",
    "Finalizar sesión",
    "Salir a descanso",
    "Inicio de mantenimiento",
    ACCION_FINALIZAR_PASO,
  ],
  inactivo: ["asignar-paso", "Finalizar sesión"],
  descanso: ["Volver del descanso"],
  mantenimiento: ["Fin de mantenimiento"],
  finalizada: [],
  otro: ["asignar-paso", "Finalizar sesión"],
  default: ["asignar-paso", "Finalizar sesión"],
};

const obtenerSesionId = (sesion) => {
  if (!sesion) return null;
  if (typeof sesion.sesionTrabajo === "object" && sesion.sesionTrabajo?.id) {
    return sesion.sesionTrabajo.id;
  }
  if (typeof sesion.sesionTrabajo === "string") {
    return sesion.sesionTrabajo;
  }

  if (sesion.id) return sesion.id;

  return null;
};

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

const normalizarSesion = (sesion) => {
  if (!sesion) return null;
  const sesionObjeto =
    typeof sesion.sesionTrabajo === "object" ? sesion.sesionTrabajo : null;
  const normalizada = {
    ...(sesionObjeto || {}),
    ...sesion,
  };
  normalizada.id = obtenerSesionId(sesion);
  if (!normalizada.trabajador) {
    normalizada.trabajador =
      sesionObjeto?.trabajador || sesion.trabajador || null;
  }
  if (!normalizada.maquina) {
    normalizada.maquina = sesionObjeto?.maquina || sesion.maquina || null;
  }
  return normalizada;
};

export default function NuevaMinuta() {
  const [fechaHora, setFechaHora] = useState("");
  const [piezas, setPiezas] = useState("");
  const [meta, setMeta] = useState("");
  const [npt, setNpt] = useState("");
  const [accion, setAccion] = useState("");
  const [codigoOrden, setCodigoOrden] = useState("");
  const [proceso, setProceso] = useState("");
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
  const [sesionAsignacionesVersion, setSesionAsignacionesVersion] = useState(0);
  const [sesionesTrabajador, setSesionesTrabajador] = useState([]);
  const [sesionesTrabajadorLoading, setSesionesTrabajadorLoading] =
    useState(false);
  const [sesionesTrabajadorError, setSesionesTrabajadorError] = useState("");
  const [sesionesTrabajadorVersion, setSesionesTrabajadorVersion] = useState(0);
  const [pasosSesionesTrabajador, setPasosSesionesTrabajador] = useState({});
  const [pasoManualSeleccionado, setPasoManualSeleccionado] = useState(null);
  const [asignandoPasoManual, setAsignandoPasoManual] = useState(false);
  const [asignacionesSesion, setAsignacionesSesion] = useState([]);
  const [asignacionPasoFinalizarId, setAsignacionPasoFinalizarId] =
    useState("");
  const [modalMensaje, setModalMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [accionCard, setAccionCard] = useState("");
  const [piezasDefectuosas, setPiezasDefectuosas] = useState("");
  const [sesionDetalle, setSesionDetalle] = useState(null);
  const navigate = useNavigate();

  const obtenerAsignacionActivaLocal = (lista = []) => {
    if (!Array.isArray(lista) || !lista.length) return null;
    return (
      lista.find((item) => {
        if (esAsignacionFinalizada(item)) return false;
        const estado = (
          item.estado ||
          item.estadoSesionPaso ||
          item.estadoSesion ||
          ""
        ).toLowerCase();
        const sinFin = item.fechaFin == null && item.fin == null;
        const estadoActivo =
          estado === "activo" ||
          estado === "en_produccion" ||
          estado === "en producción" ||
          (item.estadoSesionPaso || "").toLowerCase() === "activo";
        return !esAsignacionFinalizada(item) && (estadoActivo || sinFin);
      }) || null
    );
  };

  const openPasoModal = (context) => {
    setPasoModalContext(context);
    setPasoModalOpen(true);
  };

  const obtenerAccionesDisponiblesPorEstado = (estado) => {
    const estadoKey = (estado || "otro").toLowerCase();
    const permitidas =
      ACCIONES_POR_ESTADO[estadoKey] ?? ACCIONES_POR_ESTADO.default;
    return {
      permitidas,
      opciones: ACCION_CARD_OPTIONS.filter((opt) =>
        permitidas.includes(opt.value),
      ),
    };
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
      setSesionesTrabajador([]);
      setSesionesTrabajadorError("");
      setPasosSesionesTrabajador({});
      return;
    }
    setTrabajadorSeleccionado(trabajador);
    setTrabajadorData(trabajador);
    setSesionesTrabajadorVersion((prev) => prev + 1);
  };

  const consultarSesionActivaPorMaquina = useCallback(async (maquinaId) => {
    if (!maquinaId) {
      setSesionActivaMaquina(null);
      setSesionMaquinaError("");
      setBuscandoSesionMaquina(false);
      return null;
    }
    setBuscandoSesionMaquina(true);
    setSesionMaquinaError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/sesiones-trabajo/maquina/${maquinaId}/activa`,
      );
      if (res.status === 404) {
        setSesionActivaMaquina(null);
        return null;
      }
      if (!res.ok) {
        throw new Error("No se pudo obtener la sesión activa de la máquina.");
      }
      const data = await res.json();
      setSesionActivaMaquina(data);
      return data;
    } catch (err) {
      setSesionActivaMaquina(null);
      setSesionMaquinaError(
        err?.message || "Error al buscar la sesión activa de la máquina.",
      );
      return null;
    } finally {
      setBuscandoSesionMaquina(false);
    }
  }, []);

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
      .then((res) => {
        if (!res.ok) throw new Error("Máquina no encontrada");
        return res.json();
      })
      .then((data) => {
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

  const establecerSesionActiva = useCallback((sesion) => {
    const sesionFinal = normalizarSesion(sesion);
    if (!obtenerSesionId(sesionFinal)) return null;
    setSesionDetalle(null);
    setSesionActivaAsignacion(sesionFinal);
    setTrabajadorAsignacion(sesionFinal.trabajador || null);
    setSesionAsignacionesVersion((prev) => prev + 1);
    return sesionFinal;
  }, []);

  const refrescarSesionActiva = useCallback(async () => {
    const sesionId = obtenerSesionId(sesionActivaAsignacion);
    let sesionNueva = null;
    if (sesionId) {
      try {
        const res = await fetch(`${API_BASE_URL}/sesiones-trabajo/${sesionId}`);
        if (res.ok) {
          sesionNueva = await res.json().catch(() => null);
          if (sesionNueva) {
            sesionNueva = { ...sesionNueva, id: sesionId };
          }
        }
      } catch {
        // ignore
      }
    }
    if (!sesionNueva) {
      const candidatos = [
        sesionActivaAsignacion?.maquina,
        sesionDetalle?.maquina,
        sesionActivaMaquina?.maquina,
      ];
      let maquinaId = null;
      for (const candidato of candidatos) {
        if (!candidato) continue;
        if (typeof candidato === "string") {
          maquinaId = candidato;
          break;
        }
        if (typeof candidato?.id === "string") {
          maquinaId = candidato.id;
          break;
        }
      }
      if (maquinaId) {
        const refreshed = await consultarSesionActivaPorMaquina(maquinaId);
        if (refreshed) {
          sesionNueva = refreshed;
        }
      }
    }
    if (sesionNueva) {
      establecerSesionActiva(sesionNueva);
    }
  }, [
    sesionActivaAsignacion,
    sesionDetalle,
    sesionActivaMaquina,
    establecerSesionActiva,
    consultarSesionActivaPorMaquina,
  ]);

  const handleAccionCardSeleccion = (valor) => {
    setAccionCard(valor);
    setPasoManualSeleccionado(null);
    setCodigoOrden("");
    setProceso("");
    setPiezas("");
    setMeta("");
    setNpt("");
    setAsignacionPasoFinalizarId("");
    setPiezasDefectuosas("");
    if (valor === "asignar-paso") {
      setAccion("");
    } else {
      setAccion(valor);
    }
  };

  const resetCamposTrasSeleccionSesion = () => {
    setPasoManualSeleccionado(null);
    setPasoOrdenSeleccionado(null);
    setCodigoOrden("");
    setProceso("");
    setPiezas("");
    setMeta("");
    setNpt("");
    setPiezasDefectuosas("");
    setAccion("");
    setAccionCard("");
    setAsignacionPasoFinalizarId("");
  };

  const limpiarSesionSeleccionada = () => {
    setTrabajadorAsignacion(null);
    setSesionActivaAsignacion(null);
    setSesionDetalle(null);
    setAsignacionesSesion([]);
    setPasoManualSeleccionado(null);
    setCodigoOrden("");
    setProceso("");
    setPiezas("");
    setMeta("");
    setNpt("");
    setPiezasDefectuosas("");
    setAccion("");
    setAccionCard("");
    setAsignacionPasoFinalizarId("");
    setMaquinaSeleccionada(null);
    setMaquinaData(null);
    setMaquinaError("");
    setSesionActivaMaquina(null);
    setSesionMaquinaError("");
    setPasoOrdenSeleccionado(null);
    setSesionAsignacionesVersion(0);
  };

  const handleAsignarPasoManual = async () => {
    const sesionId = obtenerSesionId(sesionActivaAsignacion);
    if (!sesionId || !pasoManualSeleccionado?.paso?.id || asignandoPasoManual)
      return;
    setAsignandoPasoManual(true);
    const resultado = await asignarPasoASesion(
      sesionId,
      pasoManualSeleccionado.paso.id,
    );
    setAsignandoPasoManual(false);
    if (resultado.ok) {
      setModalMensaje("Paso asignado a la sesión activa correctamente.");
      setPasoManualSeleccionado(null);
      setSesionAsignacionesVersion((prev) => prev + 1);
      await refrescarSesionActiva();
    } else {
      const detalle = resultado.error ? `: ${resultado.error}` : ".";
      setModalMensaje(`No se pudo asignar el paso${detalle}`);
    }
    setMostrarModal(true);
  };

  const handleAsignacionesChange = useCallback((lista = []) => {
    setAsignacionesSesion(lista);
    const activa = obtenerAsignacionActivaLocal(lista);
    setAsignacionPasoFinalizarId(activa?.id || "");
  }, []);

  const handleSeleccionarSesionDesdeMaquina = async () => {
    if (!sesionActivaMaquina || !obtenerSesionId(sesionActivaMaquina)) {
      const fallbackId =
        maquinaData?.id ||
        maquinaSeleccionada?.id ||
        sesionActivaAsignacion?.maquina?.id;
      if (!fallbackId) return;
      const refreshed = await consultarSesionActivaPorMaquina(fallbackId);
      if (!refreshed || !obtenerSesionId(refreshed)) return;
      await establecerSesionActiva(refreshed);
    } else {
      const refreshed =
        (sesionActivaMaquina?.maquina?.id &&
          (await consultarSesionActivaPorMaquina(
            sesionActivaMaquina.maquina.id,
          ))) ||
        sesionActivaMaquina;
      await establecerSesionActiva(refreshed);
    }
    resetCamposTrasSeleccionSesion();
    if (typeof window !== "undefined" && window?.scrollTo) {
      const totalHeight =
        typeof document !== "undefined"
          ? (document.body?.scrollHeight ?? 0)
          : 0;
      window.scrollTo({ top: totalHeight, behavior: "smooth" });
    }
  };

  const handleSeleccionarSesionTrabajador = async (sesion) => {
    if (!sesion || !obtenerSesionId(sesion)) return;
    await establecerSesionActiva(sesion);
    resetCamposTrasSeleccionSesion();
    if (typeof window !== "undefined" && window?.scrollTo) {
      const totalHeight =
        typeof document !== "undefined"
          ? (document.body?.scrollHeight ?? 0)
          : 0;
      window.scrollTo({ top: totalHeight, behavior: "smooth" });
    }
  };

  const handleIniciarSesion = (e) => {
    e.preventDefault();
    if (sesionActivaMaquina) {
      setModalMensaje(
        "Esta máquina ya tiene una sesión activa. Selecciónala para registrar acciones.",
      );
      setMostrarModal(true);
      return;
    }
    if (!trabajadorData?.id) {
      setModalMensaje(
        "Debes seleccionar un trabajador antes de iniciar la sesión.",
      );
      setMostrarModal(true);
      return;
    }
    if (!pasoOrdenSeleccionado?.paso?.id) {
      setModalMensaje(
        "Debes seleccionar un paso de una orden de producción antes de iniciar la sesión.",
      );
      setMostrarModal(true);
      return;
    }
    const sesion = {
      trabajador: trabajadorData?.id,
      maquina: maquinaData?.id,
      desdeTablet: true,
    };
    fetch(`${API_BASE_URL}/sesiones-trabajo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sesion),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            (data && (data.message || data.error)) || "Error al iniciar sesión";
          throw new Error(msg);
        }
        return data;
      })
      .then(async (data) => {
        let mensaje = "Sesión iniciada correctamente";
        if (pasoOrdenSeleccionado?.paso?.id && data?.id) {
          const asignacionOk = await asignarPasoASesion(
            data.id,
            pasoOrdenSeleccionado.paso.id,
          );
          if (!asignacionOk.ok) {
            mensaje = `${mensaje}. Sin embargo, no se pudo asignar el paso: ${asignacionOk.error}`;
          } else {
            mensaje = `${mensaje} y paso asignado correctamente.`;
          }
        }
        const maquinaIdRef =
          data?.maquina?.id ||
          maquinaData?.id ||
          sesionActivaMaquina?.maquina?.id ||
          sesionActivaAsignacion?.maquina?.id ||
          sesionActivaAsignacion?.maquina ||
          trabajadorAsignacion?.ultimaSesionMaquinaId ||
          trabajadorData?.ultimaSesionMaquinaId ||
          trabajadorSeleccionado?.ultimaSesionMaquinaId;
        let sesionActual = data || null;
        if (maquinaIdRef) {
          const refreshed = await consultarSesionActivaPorMaquina(maquinaIdRef);
          if (refreshed) {
            sesionActual = refreshed;
          }
        }
        if (sesionActual) {
          await establecerSesionActiva(sesionActual);
        } else {
          const sesionFallback = normalizarSesion({
            trabajador: trabajadorData || null,
            maquina: maquinaData || sesionActivaMaquina?.maquina || null,
          });
          setSesionActivaAsignacion(sesionFallback);
          setTrabajadorAsignacion(sesionFallback?.trabajador || null);
        }
        setMaquinaSeleccionada(null);
        setMaquinaData(null);
        setMaquinaError("");
        setSesionActivaMaquina(null);
        setSesionMaquinaError("");
        setPasoOrdenSeleccionado(null);
        setAsignacionesSesion([]);
        setAsignacionPasoFinalizarId("");
        setPiezasDefectuosas("");
        setModalMensaje(mensaje);
        setMostrarModal(true);
        setSesionesTrabajadorVersion((prev) => prev + 1);
      })
      .catch((err) => {
        setModalMensaje(err?.message || "Error al iniciar sesión");
        setMostrarModal(true);
      });
  };

  const finalizarSesionTrabajo = async () => {
    const sesionId = obtenerSesionId(sesionActivaAsignacion);
    if (!sesionId) {
      setModalMensaje("No hay una sesión activa para finalizar.");
      setMostrarModal(true);
      return;
    }
    const maquinaSesionId = sesionActivaAsignacion.maquina?.id;
    try {
      const res = await fetch(
        `${API_BASE_URL}/sesiones-trabajo/${sesionId}/finalizar`,
        {
          method: "POST",
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data?.message || data?.error || "No se pudo finalizar la sesión.";
        throw new Error(msg);
      }
      setModalMensaje("Sesión finalizada correctamente.");
      if (maquinaSesionId && maquinaSeleccionada?.id === maquinaSesionId) {
        setSesionActivaMaquina(null);
        setMaquinaSeleccionada(null);
        setMaquinaData(null);
      }
      setSesionActivaAsignacion(null);
      setTrabajadorAsignacion(null);
      setSesionDetalle(null);
      setAsignacionesSesion([]);
      setAccion("");
      setAccionCard("");
      setPiezas("");
      setMeta("");
      setNpt("");
      setCodigoOrden("");
      setProceso("");
      setAsignacionPasoFinalizarId("");
      setMostrarModal(true);
      setSesionAsignacionesVersion(0);
      setSesionesTrabajadorVersion((prev) => prev + 1);
    } catch (err) {
      setModalMensaje(err?.message || "No se pudo finalizar la sesión.");
      setMostrarModal(true);
    }
  };

  const obtenerAsignacionActivaDeSesion = async (sesionId) => {
    if (!sesionId) return null;
    const res = await fetch(
      `${API_BASE_URL}/sesion-trabajo-pasos/por-sesion/${sesionId}`,
    );
    const data = await res.json().catch(() => []);
    if (!res.ok) {
      const msg =
        data?.message ||
        data?.error ||
        "No se pudieron obtener las asignaciones.";
      throw new Error(msg);
    }
    const lista = Array.isArray(data) ? data : [];
    if (!lista.length) return null;
    const activa = lista.find(
      (item) =>
        item.fechaFin == null ||
        item.fin == null ||
        item.estado === "ACTIVO" ||
        item.estadoSesionPaso === "ACTIVO",
    );
    return activa || lista[0];
  };

  const actualizarProduccionEnAsignacion = async (
    asignacionId,
    piezasBuenas,
    pedaleos,
    contextoError,
  ) => {
    if (!asignacionId) return;
    const resPaso = await fetch(
      `${API_BASE_URL}/sesion-trabajo-pasos/${asignacionId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cantidadProducida: piezasBuenas,
          cantidadPedaleos: pedaleos,
        }),
      },
    );
    if (!resPaso.ok) {
      const data = await resPaso.json().catch(() => null);
      const msg =
        data?.message ||
        data?.error ||
        `No se pudo actualizar el paso antes de ${contextoError || "la pausa"}.`;
      throw new Error(msg);
    }
    await resPaso.json().catch(() => null);
  };

  const actualizarProduccionAntesDePausar = async (
    sesionId,
    piezasBuenas,
    pedaleos,
    contextoError,
  ) => {
    if (!sesionId) return;
    const asignacion = await obtenerAsignacionActivaDeSesion(sesionId);
    if (!asignacion?.id) return;
    await actualizarProduccionEnAsignacion(
      asignacion.id,
      piezasBuenas,
      pedaleos,
      contextoError,
    );
  };

  const obtenerMaquinaIdDeSesionActiva = () => {
    const candidatos = [
      sesionActivaAsignacion?.maquina,
      sesionDetalle?.maquina,
      sesionActivaMaquina?.maquina,
    ];
    for (const candidato of candidatos) {
      if (!candidato) continue;
      if (typeof candidato === "string") return candidato;
      if (typeof candidato?.id === "string") return candidato.id;
    }
    return null;
  };

  const iniciarDescanso = async () => {
    const sesionId = obtenerSesionId(sesionActivaAsignacion);
    const trabajadorId = sesionActivaAsignacion?.trabajador?.id;
    if (!sesionId || !trabajadorId) {
      setModalMensaje(
        "No hay una sesión activa con trabajador para registrar el descanso.",
      );
      setMostrarModal(true);
      return;
    }
    const piezasBuenas = Number(piezas) || 0;
    const piezasMalas = Number(piezasDefectuosas) || 0;
    const pedaleos = piezasBuenas + piezasMalas;
    try {
      await actualizarProduccionAntesDePausar(
        sesionId,
        piezasBuenas,
        pedaleos,
        "salir a descanso",
      );
      const resDescanso = await fetch(`${API_BASE_URL}/estados-trabajador`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trabajador: trabajadorId,
          descanso: true,
        }),
      });
      if (!resDescanso.ok) {
        const data = await resDescanso.json().catch(() => null);
        const msg =
          data?.message || data?.error || "No se pudo iniciar el descanso.";
        throw new Error(msg);
      }
      await resDescanso.json().catch(() => null);
      setModalMensaje("Descanso iniciado correctamente.");
      setPiezas("");
      setPiezasDefectuosas("");
      setAccion("");
      setAccionCard("");
      setMostrarModal(true);
      setSesionAsignacionesVersion((prev) => prev + 1);
    } catch (err) {
      setModalMensaje(err?.message || "Error al iniciar el descanso.");
      setMostrarModal(true);
    }
  };

  const finalizarDescanso = async () => {
    const trabajadorId = sesionActivaAsignacion?.trabajador?.id;
    if (!trabajadorId) {
      setModalMensaje(
        "No hay un trabajador asociado para finalizar el descanso.",
      );
      setMostrarModal(true);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/estados-trabajador/trabajador/${trabajadorId}/finalizar-descanso`,
        {
          method: "POST",
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          res.status === 404
            ? "El trabajador no tiene descansos activos."
            : data?.message ||
              data?.error ||
              "No se pudo finalizar el descanso.";
        throw new Error(msg);
      }
      setModalMensaje("Descanso finalizado correctamente.");
      setAccion("");
      setAccionCard("");
      setPiezas("");
      setPiezasDefectuosas("");
      setSesionAsignacionesVersion((prev) => prev + 1);
      setMostrarModal(true);
    } catch (err) {
      setModalMensaje(err?.message || "Error al finalizar el descanso.");
      setMostrarModal(true);
    }
  };

  const iniciarMantenimiento = async () => {
    const sesionId = obtenerSesionId(sesionActivaAsignacion);
    const maquinaId = obtenerMaquinaIdDeSesionActiva();
    if (!sesionId || !maquinaId) {
      setModalMensaje(
        "No hay una sesión y máquina válidas para iniciar mantenimiento.",
      );
      setMostrarModal(true);
      return;
    }
    const piezasBuenas = Number(piezas) || 0;
    const piezasMalas = Number(piezasDefectuosas) || 0;
    const pedaleos = piezasBuenas + piezasMalas;
    try {
      await actualizarProduccionAntesDePausar(
        sesionId,
        piezasBuenas,
        pedaleos,
        "iniciar el mantenimiento",
      );
      const res = await fetch(`${API_BASE_URL}/estados-maquina`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maquina: maquinaId,
          mantenimiento: true,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "No se pudo iniciar el mantenimiento.";
        throw new Error(msg);
      }
      setModalMensaje("Mantenimiento iniciado correctamente.");
      setPiezas("");
      setPiezasDefectuosas("");
      setAccion("");
      setAccionCard("");
      setMostrarModal(true);
      setSesionAsignacionesVersion((prev) => prev + 1);
    } catch (err) {
      setModalMensaje(err?.message || "Error al iniciar el mantenimiento.");
      setMostrarModal(true);
    }
  };

  const finalizarMantenimiento = async () => {
    const maquinaId = obtenerMaquinaIdDeSesionActiva();
    if (!maquinaId) {
      setModalMensaje(
        "No se pudo identificar la máquina para finalizar el mantenimiento.",
      );
      setMostrarModal(true);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/estados-maquina/maquina/${maquinaId}/finalizar-mantenimiento`,
        { method: "POST" },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          res.status === 404
            ? "La máquina no tiene mantenimiento activo."
            : data?.message ||
              data?.error ||
              "No se pudo finalizar el mantenimiento.";
        throw new Error(msg);
      }
      setModalMensaje("Mantenimiento finalizado correctamente.");
      setAccion("");
      setAccionCard("");
      setPiezas("");
      setPiezasDefectuosas("");
      setMostrarModal(true);
      setSesionAsignacionesVersion((prev) => prev + 1);
    } catch (err) {
      setModalMensaje(err?.message || "Error al finalizar el mantenimiento.");
      setMostrarModal(true);
    }
  };

  const finalizarTrabajoPaso = async () => {
    if (!asignacionPasoFinalizarId) {
      setModalMensaje("Selecciona la asignación que deseas finalizar.");
      setMostrarModal(true);
      return;
    }
    const piezasBuenas = Number(piezas) || 0;
    const piezasMalas = Number(piezasDefectuosas) || 0;
    const pedaleos = piezasBuenas + piezasMalas;
    try {
      await actualizarProduccionEnAsignacion(
        asignacionPasoFinalizarId,
        piezasBuenas,
        pedaleos,
        "finalizar el trabajo del paso",
      );
      const res = await fetch(
        `${API_BASE_URL}/sesion-trabajo-pasos/${asignacionPasoFinalizarId}/finalizar`,
        { method: "POST" },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          "No se pudo finalizar la asignación seleccionada.";
        throw new Error(msg);
      }
      setModalMensaje("Trabajo del paso finalizado correctamente.");
      setAccion("");
      setAccionCard("");
      setPiezas("");
      setPiezasDefectuosas("");
      setAsignacionPasoFinalizarId("");
      setMostrarModal(true);
      setSesionAsignacionesVersion((prev) => prev + 1);
      await refrescarSesionActiva();
    } catch (err) {
      setModalMensaje(
        err?.message || "Error al finalizar el trabajo del paso.",
      );
      setMostrarModal(true);
    }
  };

  const handleOperacionSubmit = (e) => {
    e.preventDefault();
    if (!sesionActivaAsignacion?.id) {
      setModalMensaje(
        "Selecciona un trabajador con una sesión activa para registrar acciones.",
      );
      setMostrarModal(true);
      return;
    }
    if (!accion) {
      setModalMensaje("Selecciona una acción para registrar.");
      setMostrarModal(true);
      return;
    }
    if (accion === "Finalizar sesión") {
      finalizarSesionTrabajo();
      return;
    }
    if (accion === "Salir a descanso") {
      iniciarDescanso();
      return;
    }
    if (accion === "Volver del descanso") {
      finalizarDescanso();
      return;
    }
    if (accion === "Inicio de mantenimiento") {
      iniciarMantenimiento();
      return;
    }
    if (accion === "Fin de mantenimiento") {
      finalizarMantenimiento();
      return;
    }
    if (accion === ACCION_FINALIZAR_PASO) {
      finalizarTrabajoPaso();
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
      proceso,
    };
    fetch(`${API_BASE_URL}/minutas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(minuta),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al enviar minuta");
        return res.json();
      })
      .then(() => {
        setPiezas("");
        setPiezasDefectuosas("");
        setMeta("");
        setNpt("");
        setAccion("");
        setCodigoOrden("");
        setProceso("");
        setModalMensaje("Acción registrada correctamente.");
        setMostrarModal(true);
      })
      .catch((err) => {
        setModalMensaje(err?.message || "Error al registrar la acción");
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
          desdeTablet: true,
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

  const mostrarDatosSesionTrabajador = Boolean(sesionActivaMaquina?.trabajador);
  const sesionActivaId = obtenerSesionId(sesionActivaAsignacion);
  const estadoSesionActual = (
    sesionDetalle?.estadoSesion ||
    sesionActivaAsignacion?.estadoSesion ||
    "otro"
  ).toLowerCase();
  const { permitidas: accionesPermitidasEstado, opciones: accionesFiltradas } =
    obtenerAccionesDisponiblesPorEstado(estadoSesionActual);
  const accionesPermitidasKey = accionesPermitidasEstado.join("|");
  const asignacionActivaLocal =
    obtenerAsignacionActivaLocal(asignacionesSesion);
  const puedeAsignarPaso = !asignacionActivaLocal;
  const puedeFinalizarPaso = Boolean(asignacionActivaLocal);
  const accionesFiltradasPorAsignacion = accionesFiltradas.filter((opt) => {
    if (opt.value === "asignar-paso") {
      return puedeAsignarPaso;
    }
    if (opt.value === ACCION_FINALIZAR_PASO) {
      return puedeFinalizarPaso;
    }
    return true;
  });

  useEffect(() => {
    const trabajadorId =
      trabajadorSeleccionado?.id || trabajadorSeleccionado?.trabajador?.id;
    if (!trabajadorId) {
      setSesionesTrabajador([]);
      setSesionesTrabajadorError("");
      setPasosSesionesTrabajador({});
      setSesionesTrabajadorLoading(false);
      return;
    }
    let cancelado = false;
    const controller = new AbortController();
    setSesionesTrabajadorLoading(true);
    setSesionesTrabajadorError("");
    setPasosSesionesTrabajador({});
    fetch(
      `${API_BASE_URL}/sesiones-trabajo/activas?trabajador=${encodeURIComponent(trabajadorId)}`,
      {
        signal: controller.signal,
      },
    )
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) return [];
          const data = await res.json().catch(() => null);
          const msg =
            data?.message ||
            data?.error ||
            "No se pudieron obtener las sesiones activas del trabajador.";
          throw new Error(msg);
        }
        return res.json();
      })
      .then(async (data) => {
        if (cancelado) return;
        const lista = Array.isArray(data) ? data : [];
        setSesionesTrabajador(lista);
        if (!lista.length) return;
        const pasosMap = {};
        await Promise.all(
          lista.map(async (sesion) => {
            const sesionId = obtenerSesionId(sesion);
            if (!sesionId) return;
            try {
              const resPaso = await fetch(
                `${API_BASE_URL}/sesiones-trabajo/${sesionId}/orden-produccion`,
              );
              if (!resPaso.ok)
                throw new Error("No se encontró información del paso activo.");
              const detalle = await resPaso.json().catch(() => null);
              pasosMap[sesionId] = detalle || null;
            } catch (err) {
              pasosMap[sesionId] = null;
              if (!cancelado) {
                console.warn(
                  "No se pudo obtener el paso activo de la sesión",
                  err,
                );
              }
            }
          }),
        );
        if (!cancelado) {
          setPasosSesionesTrabajador(pasosMap);
        }
      })
      .catch((err) => {
        if (cancelado || err?.name === "AbortError") return;
        setSesionesTrabajador([]);
        setPasosSesionesTrabajador({});
        setSesionesTrabajadorError(
          err?.message || "Error al buscar sesiones del trabajador.",
        );
      })
      .finally(() => {
        if (!cancelado) setSesionesTrabajadorLoading(false);
      });
    return () => {
      cancelado = true;
      controller.abort();
    };
  }, [trabajadorSeleccionado?.id, sesionesTrabajadorVersion]);

  useEffect(() => {
    if (!accionCard) return;
    if (!accionesPermitidasEstado.includes(accionCard)) {
      setAccionCard("");
      setAccion("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accionCard, accionesPermitidasKey]);

  useEffect(() => {
    if (accionCard === "asignar-paso" && !puedeAsignarPaso) {
      setAccionCard("");
      setAccion("");
    }
  }, [accionCard, puedeAsignarPaso]);

  useEffect(() => {
    if (accionCard === ACCION_FINALIZAR_PASO && !puedeFinalizarPaso) {
      setAccionCard("");
      setAccion("");
      setAsignacionPasoFinalizarId("");
    }
  }, [accionCard, puedeFinalizarPaso]);

  useEffect(() => {
    if (accionCard === ACCION_FINALIZAR_PASO) {
      if (asignacionActivaLocal?.id) {
        setAsignacionPasoFinalizarId(asignacionActivaLocal.id);
      } else if (asignacionPasoFinalizarId) {
        setAsignacionPasoFinalizarId("");
      }
    }
  }, [
    accionCard,
    asignacionActivaLocal?.id,
    asignacionActivaLocal,
    asignacionPasoFinalizarId,
  ]);

  useEffect(() => {
    if (!asignacionesSesion.length) {
      setAsignacionPasoFinalizarId("");
      return;
    }
    const activa = obtenerAsignacionActivaLocal(asignacionesSesion);
    setAsignacionPasoFinalizarId(activa?.id || "");
  }, [asignacionesSesion]);

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
      {!sesionActivaAsignacion && (
        <>
          <SesionIniciador
            fechaHora={fechaHora}
            maquinaSeleccionada={maquinaSeleccionada}
            onMaquinaSelect={handleMaquinaSeleccion}
            maquinaData={maquinaData}
            maquinaError={maquinaError}
            buscandoSesionMaquina={buscandoSesionMaquina}
            sesionMaquinaError={sesionMaquinaError}
            sesionActivaMaquina={sesionActivaMaquina}
            mostrarDatosSesionTrabajador={mostrarDatosSesionTrabajador}
            trabajadorSeleccionado={trabajadorSeleccionado}
            onTrabajadorSelect={handleTrabajadorSeleccion}
            sesionesTrabajador={sesionesTrabajador}
            sesionesTrabajadorLoading={sesionesTrabajadorLoading}
            sesionesTrabajadorError={sesionesTrabajadorError}
            pasosSesionesTrabajador={pasosSesionesTrabajador}
            onSeleccionSesionTrabajador={handleSeleccionarSesionTrabajador}
            pasoOrdenSeleccionado={pasoOrdenSeleccionado}
            onPasoOrdenClear={() => setPasoOrdenSeleccionado(null)}
            onOpenPasoModal={openPasoModal}
            onSeleccionarSesionActiva={handleSeleccionarSesionDesdeMaquina}
            onIniciarSesion={handleIniciarSesion}
            requierePasoOrden
          />
          <div className="bg-white rounded-xl shadow-md p-6 mt-6 text-sm text-gray-700">
            <h2 className="text-xl font-semibold mb-2">Sesiones activas</h2>
            <p>
              Inicia o selecciona una sesión para acceder a las acciones
              rápidas.
            </p>
          </div>
        </>
      )}
      {sesionActivaAsignacion && (
        <SesionSeleccionadaPanel
          sesion={sesionActivaAsignacion}
          onSeleccionarOtra={limpiarSesionSeleccionada}
          refreshKey={sesionAsignacionesVersion}
          onSesionDetalleChange={setSesionDetalle}
          onAsignacionesChange={handleAsignacionesChange}
        >
          <AccionesRapidas
            accionesDisponibles={accionesFiltradasPorAsignacion}
            accionCard={accionCard}
            accion={accion}
            accionFinalizarPasoLabel={ACCION_FINALIZAR_PASO}
            onAccionCardSeleccion={handleAccionCardSeleccion}
            pasoManualSeleccionado={pasoManualSeleccionado}
            onOpenPasoModal={openPasoModal}
            onAsignarPasoManual={handleAsignarPasoManual}
            asignandoPasoManual={asignandoPasoManual}
            sesionActiva={sesionActivaAsignacion}
            sesionActivaId={sesionActivaId}
            trabajadorAsignacion={trabajadorAsignacion}
            asignacionesSesion={asignacionesSesion}
            asignacionPasoFinalizarId={asignacionPasoFinalizarId}
            piezas={piezas}
            setPiezas={setPiezas}
            piezasDefectuosas={piezasDefectuosas}
            setPiezasDefectuosas={setPiezasDefectuosas}
            onOperacionSubmit={handleOperacionSubmit}
          />
        </SesionSeleccionadaPanel>
      )}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>{modalMensaje}</p>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setMostrarModal(false);
                setModalMensaje("");
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
