import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NuevaMinuta() {
  const [fechaHora, setFechaHora] = useState("");
  const [piezas, setPiezas] = useState("");
  const [meta, setMeta] = useState("");
  const [npt, setNpt] = useState("");
  const [accion, setAccion] = useState("");
  const [mostrarMeta, setMostrarMeta] = useState(false);
  const [codigoOrden, setCodigoOrden] = useState("");
  const [proceso, setProceso] = useState("");
  const [procesosDisponibles, setProcesosDisponibles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const date = new Date();
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
    const format = new Intl.DateTimeFormat("es-CO", options).format(date);
    setFechaHora(format.replace(",", ""));
  }, []);

  const cumplimiento = meta ? ((piezas / meta) * 100).toFixed(1) : "";
  const nptPorcentaje = npt ? ((npt / 480) * 100).toFixed(1) : "";

  const handleSubmit = (e) => {
    e.preventDefault();
    const minuta = {
      fechaHora,
      piezas,
      meta,
      cumplimiento,
      npt,
      nptPorcentaje,
      accion
    };
    console.log("Minuta enviada:", minuta);
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
            <label className="block font-medium">Código del trabajador</label>
            <input
              type="text"
              className="w-full border rounded-full px-4 py-2"
              placeholder="Ingrese el código del trabajador"
            />
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

          <div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={mostrarMeta}
                onChange={() => setMostrarMeta(!mostrarMeta)}
              />
              Nueva orden de producción
            </label>
            {mostrarMeta ? (
              <div className="mt-2 space-y-4">
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
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-700">Orden actual: <strong>{codigoOrden || "No definida"}</strong></p>
                <p className="text-sm text-gray-700">Proceso actual: <strong>{proceso || "No definido"}</strong></p>
              </div>
            )}
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

          <div>
            <label className="block font-medium">Acción rápida</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {[
                "Iniciar turno",
                "Terminar turno",
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

          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 self-start"
          >
            Enviar minuta
          </button>
        </form>
      </div>
    </div>
  );
}