import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import Tooltip from "./Tooltip";
import { apiFetch } from "../api";

function Stat({ label, value, suffix = "", desc, extra = null, tooltip = "" }) {
  return (
    <div className="p-3 border rounded-lg">
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <span>{label}</span>
        {tooltip ? (
          <Tooltip content={tooltip}>
            <button
              type="button"
              aria-label={`Info: ${label}`}
              className="h-4 w-4 rounded-full border border-gray-400 text-[10px] leading-none text-gray-600 hover:bg-gray-100"
            >
              i
            </button>
          </Tooltip>
        ) : null}
      </div>
      <div className="text-xl font-semibold flex items-baseline gap-2">
        <span>{value}{suffix}</span>
        {extra}
      </div>
    </div>
  );
}

export default function ResumenTrabajador() {
  const { token } = useAuth();
  const [trabajadores, setTrabajadores] = useState([]);
  const [id, setId] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 7);
    setInicio(start.toISOString().slice(0, 10));
    setFin(today.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/trabajadores`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((arr) => setTrabajadores(Array.isArray(arr) ? arr : []))
      .catch(() => setTrabajadores([]));
  }, [token]);

  const fetchData = async () => {
    if (!id || !inicio || !fin) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("inicio", new Date(inicio).toISOString());
      params.append("fin", new Date(fin).toISOString());
      const url = `${API_BASE_URL}/indicadores/trabajadores/${encodeURIComponent(id)}/resumen?${params.toString()}`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("No se pudo cargar el resumen");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || "Error al cargar");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="font-semibold text-2xl">Resumen por trabajador</div>
          <div className="text-xs text-gray-600">Agregado de producción, calidad y tiempos en el rango seleccionado.</div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <label className="text-sm">Trabajador</label>
            <select value={id} onChange={(e) => setId(e.target.value)} className="border-b border-black focus:outline-none">
              <option value="">Seleccionar…</option>
              {trabajadores.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Inicio</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Fin</label>
            <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </div>
          <button onClick={fetchData} className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Actualizar</button>
        </div>
      </div>

      <div className="border rounded-2xl shadow-md p-4">
        {!data && <div className="text-sm text-gray-600">Selecciona un trabajador y rango, luego pulsa Actualizar.</div>}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <Stat label="Producción total" value={data.produccionTotal ?? 0} desc="Suma de piezas contadas en el rango" />
            {(() => {
              const defectosRaw = data.defectos ?? 0;
              const isNeg = typeof defectosRaw === "number" && defectosRaw < 0;
              const sobrantes = isNeg ? Math.floor(Math.abs(defectosRaw)) : null;
              return (
                <Stat
                  label="Defectos"
                  value={isNeg ? 0 : defectosRaw}
                  desc="Total de piezas no conformes"
                  extra={isNeg ? (
                    <span className="text-xs text-gray-600">piezas sobrantes {sobrantes}</span>
                  ) : null}
                />
              );
            })()}
            <Stat label="% Defectos" value={(data.porcentajeDefectos ?? 0).toFixed(2)} suffix="%" desc="Defectos/(Producción+Defectos) * 100" />
            <Stat
              label="Tiempos muertos en minutos"
              value={data.nptMin ?? 0}
              desc="Minutos no productivos del periodo, calculados solo mientras las sesiones estuvieron en curso."
              tooltip="Minutos no productivos del periodo, calculados solo durante los minutos en que hubo sesiones en curso dentro del rango seleccionado. No incluye tiempo fuera de sesión."
            />
            <Stat
              label="Tiempos muertos por inactividad"
              value={data.nptPorInactividad ?? 0}
              desc="Minutos de inactividad continua sobre el umbral, contados solo mientras las sesiones estuvieron en curso."
              tooltip="Minutos de inactividad continua por encima del umbral configurado, contados solo durante los minutos en que las sesiones estuvieron en curso dentro del rango."
            />
            <Stat
              label="% Tiempos muertos"
              value={(data.porcentajeNPT ?? 0).toFixed(2)}
              suffix="%"
              desc="Porcentaje no productivo frente al tiempo total en que las sesiones estuvieron en curso."
              tooltip="Porcentaje de tiempo no productivo frente al tiempo total en que las sesiones estuvieron en curso dentro del rango seleccionado. No considera tiempo fuera de sesión."
            />
            <Stat
              label="Tiempo en pausas en minutos"
              value={data.pausasMin ?? 0}
              desc="Minutos registrados como pausa."
              tooltip="Minutos registrados como pausa en el periodo. Mide el tiempo de pausas declaradas."
            />
            <Stat
              label="% Tiempo en pausas"
              value={(data.porcentajePausa ?? 0).toFixed(2)}
              suffix="%"
              desc="Porcentaje del tiempo total dedicado a pausas."
              tooltip="Porcentaje del tiempo total dedicado a pausas en el periodo."
            />
            <Stat label="Sesiones" value={data.sesionesCerradas ?? 0} desc="Sesiones cerradas en el rango" />
            <Stat
              label="Velocidad productiva (sin tiempos muertos)"
              value={(data.avgSpeed ?? 0).toFixed(1)}
              desc="Velocidad real de trabajo productivo. Excluye del tiempo los minutos no productivos; sirve para comparar el rendimiento cuando sí se está produciendo."
              tooltip="Velocidad real de trabajo productivo. Excluye del tiempo los minutos no productivos; sirve para comparar el rendimiento cuando sí se está produciendo."
            />
            <Stat
              label="Velocidad global (con tiempos muertos)"
              value={(data.avgSpeedSesion ?? 0).toFixed(1)}
              desc="Velocidad global de la sesión completa. Incluye todo el tiempo transcurrido (productivo y no productivo); sirve para ver el desempeño operativo total."
              tooltip="Velocidad global de la sesión completa. Incluye todo el tiempo transcurrido (productivo y no productivo); sirve para ver el desempeño operativo total."
            />
          </div>
        )}
        {loading && <div className="text-sm text-gray-600 mt-2">Cargando…</div>}
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}