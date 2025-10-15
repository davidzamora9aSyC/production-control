import { useMemo, useState } from "react";
import { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";

const PERIODOS = [
  { value: "diario", label: "Día actual" },
  { value: "semanal", label: "Semana en curso" },
  { value: "mensual", label: "Mes en curso" },
];

const COMPARAR_CON_OPTS = [
  { value: "previo", label: "Comparar con periodo previo" },
  { value: "mismoPeriodoAnterior", label: "Comparar con mismo periodo del año anterior" },
  { value: "ninguno", label: "Sin comparación" },
];

const COMPARAR_CON_LABELS = COMPARAR_CON_OPTS.reduce((acc, opt) => {
  acc[opt.value] = opt.label;
  return acc;
}, {});

const INDICATOR_TITLES = {
  cumplimiento_plan: "Cumplimiento del plan",
  calidad_no_conforme: "Calidad · No conformes",
  npt: "NPT",
};

function formatNumber(value, fractionDigits = 2) {
  if (value == null || value === "") return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString("es-CO", {
    minimumFractionDigits: num % 1 === 0 ? 0 : Math.min(fractionDigits, 2),
    maximumFractionDigits: fractionDigits,
  });
}

function formatSigned(value, suffix = "") {
  if (value == null || value === "") return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  const base = num.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = num > 0 ? "+" : "";
  return `${sign}${base}${suffix}`;
}

function formatPercent(value) {
  if (value == null || value === "") return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return `${num.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function formatHours(value) {
  if (value == null || value === "") return "-";
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return `${num.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} h`;
}

function formatBrecha(indicador) {
  const isPercent = indicador.objetivo_pct != null || indicador.brecha_objetivo_pct != null;
  const raw = indicador.brecha_objetivo_pct ?? indicador.brecha_objetivo;
  if (raw == null) return "-";
  return formatSigned(raw, isPercent ? " p.p." : indicador.indicador === "npt" ? " h" : "");
}

function formatObjetivo(indicador) {
  if (indicador.objetivo_pct != null) return formatPercent(indicador.objetivo_pct);
  if (indicador.objetivo == null) return "-";
  if (indicador.indicador === "npt") return formatHours(indicador.objetivo);
  return formatPercent(indicador.objetivo);
}

function CumplimientoContent({ actual, comparativo }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div className="rounded-lg bg-white border p-3 shadow-sm">
        <div className="text-xs uppercase text-gray-500 mb-1">Actual</div>
        <div className="text-xl font-semibold text-gray-900">{formatPercent(actual?.cumplimiento_pct)}</div>
        <div className="text-gray-600 mt-1">
          Planeadas: {formatNumber(actual?.piezas_planeadas, 0)} · Producidas: {formatNumber(actual?.piezas_producidas, 0)}
        </div>
      </div>
      <div className="rounded-lg bg-gray-50 border border-dashed p-3">
        <div className="text-xs uppercase text-gray-500 mb-1">Comparativo</div>
        <div className="text-lg font-semibold text-gray-800">{formatPercent(comparativo?.cumplimiento_pct)}</div>
        <div className="text-gray-600 mt-1">
          Planeadas: {formatNumber(comparativo?.piezas_planeadas, 0)} · Producidas: {formatNumber(comparativo?.piezas_producidas, 0)}
        </div>
      </div>
    </div>
  );
}

function CalidadContent({ actual, comparativo }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div className="rounded-lg bg-white border p-3 shadow-sm">
        <div className="text-xs uppercase text-gray-500 mb-1">Actual</div>
        <div className="text-xl font-semibold text-gray-900">{formatPercent(actual?.porcentaje_no_conformes)}</div>
        <div className="text-gray-600 mt-1">
          Total piezas: {formatNumber(actual?.piezas_totales, 0)} · No conformes: {formatNumber(actual?.piezas_no_conformes, 0)}
        </div>
      </div>
      <div className="rounded-lg bg-gray-50 border border-dashed p-3">
        <div className="text-xs uppercase text-gray-500 mb-1">Comparativo</div>
        <div className="text-lg font-semibold text-gray-800">{formatPercent(comparativo?.porcentaje_no_conformes)}</div>
        <div className="text-gray-600 mt-1">
          Total piezas: {formatNumber(comparativo?.piezas_totales, 0)} · No conformes: {formatNumber(comparativo?.piezas_no_conformes, 0)}
        </div>
      </div>
    </div>
  );
}

function NptContent({ actual, comparativo }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg bg-white border p-3 shadow-sm">
          <div className="text-xs uppercase text-gray-500 mb-1">Actual</div>
          <div className="text-xl font-semibold text-gray-900">{formatHours(actual?.total_horas)}</div>
        </div>
        <div className="rounded-lg bg-gray-50 border border-dashed p-3">
          <div className="text-xs uppercase text-gray-500 mb-1">Comparativo</div>
          <div className="text-lg font-semibold text-gray-800">{formatHours(comparativo?.total_horas)}</div>
        </div>
      </div>
      {Array.isArray(actual?.pasos) && actual.pasos.length > 0 && (
        <div className="border rounded-lg bg-white p-3 shadow-sm">
          <div className="text-xs uppercase text-gray-500 mb-2">Distribución por paso</div>
          <ul className="space-y-1">
            {actual.pasos.map((paso) => (
              <li key={paso.pasoId || paso.nombre} className="flex items-center justify-between gap-3">
                <span className="text-gray-700 truncate">{paso.nombre || paso.pasoId || "Paso"}</span>
                <span className="text-gray-900 whitespace-nowrap">
                  {formatHours(paso.horas)} · {formatPercent(paso.porcentaje)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function IndicatorCard({ indicador }) {
  const title = INDICATOR_TITLES[indicador.indicador] || indicador.indicador;
  const variation = indicador.variacion_pct;
  const objetivo = formatObjetivo(indicador);
  const brecha = formatBrecha(indicador);
  const actual = indicador.valor_actual || {};
  const comparativo = indicador.comparativo || {};

  let content = null;
  if (indicador.indicador === "cumplimiento_plan") {
    content = <CumplimientoContent actual={actual} comparativo={comparativo} />;
  } else if (indicador.indicador === "calidad_no_conforme") {
    content = <CalidadContent actual={actual} comparativo={comparativo} />;
  } else if (indicador.indicador === "npt") {
    content = <NptContent actual={actual} comparativo={comparativo} />;
  }

  return (
    <div className={`border rounded-2xl p-5 bg-white shadow-md ${indicador.indicador === "npt" ? "lg:col-span-2" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-lg font-semibold text-gray-900">{title}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Variación vs comparativo</div>
          <div className="text-base text-gray-800">{formatSigned(variation, "%")}</div>
        </div>
        <div className="text-sm text-gray-700 space-y-1">
          <div>
            <span className="font-medium text-gray-900">Objetivo:</span> {objetivo}
          </div>
          <div>
            <span className="font-medium text-gray-900">Brecha vs objetivo:</span> {brecha}
          </div>
        </div>
      </div>
      {content}
      {!content && (
        <pre className="text-xs bg-gray-50 border rounded-lg p-3 overflow-auto">{JSON.stringify(indicador.valor_actual, null, 2)}</pre>
      )}
    </div>
  );
}

export default function IndicadoresProducto() {
  const { token } = useAuth();
  const [productoId, setProductoId] = useState("");
  const [periodo, setPeriodo] = useState("mensual");
  const [compararCon, setCompararCon] = useState("previo");
  const [targetCumplimiento, setTargetCumplimiento] = useState("0.92");
  const [targetNc, setTargetNc] = useState("2.5");
  const [targetNpt, setTargetNpt] = useState("8");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      return dateFormatter.format(new Date(value));
    } catch {
      return value;
    }
  };

  const handleConsultar = async () => {
    if (!productoId.trim()) {
      setError("Digita un identificador de producto.");
      setData(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("productoId", productoId.trim());
      if (periodo) params.append("periodo", periodo);
      if (compararCon) params.append("compararCon", compararCon);
      if (targetNc) params.append("targetNc", targetNc);
      if (targetNpt) params.append("targetNpt", targetNpt);
      if (targetCumplimiento) params.append("targetCumplimiento", targetCumplimiento);

      const url = `${API_BASE_URL}/indicadores/producto?${params.toString()}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo obtener el indicador.");
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || "Error al consultar el indicador.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleConsultar();
        }}
        className="border rounded-2xl shadow-md p-5 bg-white"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Producto</label>
            <input
              type="text"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              placeholder="Ej: PROD-123"
              className="border rounded px-3 py-2 text-sm min-w-[14rem]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Periodo</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="border rounded px-3 py-2 text-sm min-w-[10rem]"
            >
              {PERIODOS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Comparación</label>
            <select
              value={compararCon}
              onChange={(e) => setCompararCon(e.target.value)}
              className="border rounded px-3 py-2 text-sm min-w-[16rem]"
            >
              {COMPARAR_CON_OPTS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Objetivo % NC</label>
            <input
              type="number"
              step="0.01"
              value={targetNc}
              onChange={(e) => setTargetNc(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-24"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Objetivo NPT (h)</label>
            <input
              type="number"
              step="0.01"
              value={targetNpt}
              onChange={(e) => setTargetNpt(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-24"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Objetivo cumplimiento</label>
            <input
              type="number"
              step="0.01"
              value={targetCumplimiento}
              onChange={(e) => setTargetCumplimiento(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-24"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Consultando…" : "Consultar"}
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-3">
          Ajusta los objetivos para ver la brecha frente al producto en el periodo seleccionado. Si dejas un campo vacío no se enviará esa meta.
        </div>
        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
      </form>

      {data && (
        <div className="space-y-5">
          <div className="border rounded-2xl bg-white shadow-md p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-700">
              <div>
                <div className="text-xs uppercase text-gray-500">Producto</div>
                <div className="text-lg font-semibold text-gray-900">{data.producto || productoId}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500">Periodo actual</div>
                <div>{formatDateTime(data.periodo?.inicio)}</div>
                <div>{formatDateTime(data.periodo?.fin)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500">Comparativo</div>
                <div>{formatDateTime(data.comparativo?.inicio)}</div>
                <div>{formatDateTime(data.comparativo?.fin)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Tipo: {COMPARAR_CON_LABELS[data.comparativo?.tipo] || COMPARAR_CON_LABELS[compararCon] || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500">Metadatos</div>
                <div>{data.metadatos?.zonaHoraria ? `Zona horaria: ${data.metadatos.zonaHoraria}` : null}</div>
                <div>
                  {data.metadatos?.minutosInactividadParaNPT != null
                    ? `Min. inactividad: ${data.metadatos.minutosInactividadParaNPT}`
                    : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {(data.indicadores || []).map((indicador) => (
              <IndicatorCard key={indicador.indicador} indicador={indicador} />
            ))}
            {(!data.indicadores || data.indicadores.length === 0) && (
              <div className="border rounded-2xl bg-white shadow-md p-5 text-sm text-gray-600">
                Sin indicadores disponibles para los parámetros seleccionados.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
