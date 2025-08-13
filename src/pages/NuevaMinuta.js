import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

export default function NuevaMinuta() {
  const [fechaHora, setFechaHora] = useState("");
  const [piezas, setPiezas] = useState("");
  const [meta, setMeta] = useState("");
  const [npt, setNpt] = useState("");
  const [accion, setAccion] = useState("");
  const [codigoOrden, setCodigoOrden] = useState("");
  const [proceso, setProceso] = useState("");
  const [procesosDisponibles, setProcesosDisponibles] = useState([]);
  const [codigoTrabajador, setCodigoTrabajador] = useState("");
  const [trabajadorData, setTrabajadorData] = useState(null);
  const [trabajadorError, setTrabajadorError] = useState("");
  const [codigoMaquina, setCodigoMaquina] = useState("");
  const [maquinaData, setMaquinaData] = useState(null);
  const [maquinaError, setMaquinaError] = useState("");
  const [modalMensaje, setModalMensaje] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const navigate = useNavigate();

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

  const handleFetchTrabajador = () => {
    setTrabajadorError("");
    setTrabajadorData(null);
    fetch(`${API_BASE_URL}/trabajadores/${codigoTrabajador}`)
      .then(res => {
        if (!res.ok) throw new Error('Trabajador no encontrado');
        return res.json();
      })
      .then(data => setTrabajadorData(data))
      .catch(() => setTrabajadorError("Trabajador no encontrado"));
  };

  const handleFetchMaquina = () => {
    setMaquinaError("");
    setMaquinaData(null);
    fetch(`${API_BASE_URL}/maquinas/${codigoMaquina}`)
      .then(res => {
        if (!res.ok) throw new Error('Máquina no encontrada');
        return res.json();
      })
      .then(data => setMaquinaData(data))
      .catch(() => setMaquinaError("Máquina no encontrada"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (accion === "Iniciar sesión") {
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
      .then(() => {
        setModalMensaje('Sesión iniciada correctamente');
        setMostrarModal(true);
      })
      .catch(err => {
        setModalMensaje(err?.message || 'Error al iniciar sesión');
        setMostrarModal(true);
      });
    } else {
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
      .then(() => console.log('Minuta enviada'))
      .catch(err => console.error('Error al enviar minuta:', err));
    }
  };

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
        <h1 className="text-2xl font-semibold mb-6">Nueva Minuta</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div>
            <label className="block font-medium">Acción rápida</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                "Iniciar sesión",
                "Finalizar sesión",
                "Salir a descanso",
                "Volver del descanso",
                "Inicio de mantenimiento",
                "Fin de mantenimiento"
              ].map(op => (
                <button
                  type="button"
                  key={op}
                  onClick={() => setAccion(op)}
                  className={`px-4 py-2 rounded-full border ${accion === op ? "bg-blue-600 text-white" : "bg-white"}`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Fecha y hora actual */}
          <div>
            <label className="block font-medium">Fecha y hora</label>
            <input
              type="text"
              value={fechaHora}
              readOnly
              className="w-full border rounded-full px-4 py-2 bg-gray-100"
            />
          </div>

          {["Iniciar sesión", "Volver del descanso", "Fin de mantenimiento"].includes(accion) && (
            <div className="mt-2 space-y-4">
              {accion === "Iniciar sesión" ? (
                <>
                  <div>
                    <label className="block font-medium">Código del trabajador</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={codigoTrabajador}
                        onChange={e => setCodigoTrabajador(e.target.value)}
                        className="w-full border rounded-full px-4 py-2"
                        placeholder="Ingrese el código del trabajador"
                      />
                      <button
                        type="button"
                        onClick={handleFetchTrabajador}
                        className="bg-blue-600 text-white px-4 rounded-full hover:bg-blue-700"
                      >
                        Seleccionar
                      </button>
                    </div>
                    {trabajadorError && (
                      <p className="text-red-600 mt-1">{trabajadorError}</p>
                    )}
                    {trabajadorData && (
                      <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
                        <p><strong>Nombre:</strong> {trabajadorData.nombre}</p>
                        <p><strong>Identificación:</strong> {trabajadorData.identificacion}</p>
                        <p><strong>Grupo:</strong> {trabajadorData.grupo}</p>
                        <p><strong>Turno:</strong> {trabajadorData.turno}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block font-medium">Código de máquina</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={codigoMaquina}
                        onChange={e => setCodigoMaquina(e.target.value)}
                        className="w-full border rounded-full px-4 py-2"
                        placeholder="Ingrese el código de la máquina"
                      />
                      <button
                        type="button"
                        onClick={handleFetchMaquina}
                        className="bg-blue-600 text-white px-4 rounded-full hover:bg-blue-700"
                      >
                        Seleccionar
                      </button>
                    </div>
                    {maquinaError && (
                      <p className="text-red-600 mt-1">{maquinaError}</p>
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
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-medium">Código de orden de producción</label>
                    <input
                      type="text"
                      value={codigoOrden}
                      onChange={e => {
                        setCodigoOrden(e.target.value);
                        // Simula fetch de procesos
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
            </div>
          )}

          {!["Iniciar sesión", "Volver del descanso", "Fin de mantenimiento"].includes(accion) && (
            <>
              <div>
                <label className="block font-medium">Código del trabajador</label>
                <input
                  type="text"
                  className="w-full border rounded-full px-4 py-2"
                  placeholder="Ingrese el código del trabajador"
                />
              </div>

              {["Finalizar sesión", "Salir a descanso", "Inicio de mantenimiento"].includes(accion) && (
                <>
                  {/* 2. Cantidad de piezas hechas */}
                  <div>
                    <label className="block font-medium">Cantidad de piezas hechas</label>
                    <input
                      type="number"
                      value={piezas}
                      onChange={e => setPiezas(e.target.value)}
                      className="w-full border rounded-full px-4 py-2"
                    />
                  </div>

                  {/* Meta */}
                  <div>
                    <label className="block font-medium">Meta</label>
                    <input
                      type="number"
                      value={meta}
                      onChange={e => setMeta(e.target.value)}
                      className="w-full border rounded-full px-4 py-2"
                    />
                  </div>

                  {/* 4. % de cumplimiento (indicativo, no editable) */}
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

                  {/* 5. NPT (min) */}
                  <div>
                    <label className="block font-medium">NPT (min)</label>
                    <input
                      type="number"
                      value={npt}
                      onChange={e => setNpt(e.target.value)}
                      className="w-full border rounded-full px-4 py-2"
                    />
                  </div>

                  {/* 6. % de NPT (indicativo) */}
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
            </>
          )}

          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 self-start"
          >
            {accion === "Iniciar sesión" ? "Iniciar sesión" : "Enviar minuta"}
          </button>
        </form>
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
                setCodigoTrabajador("");
                setTrabajadorData(null);
                setCodigoMaquina("");
                setMaquinaData(null);
                setAccion("");
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}