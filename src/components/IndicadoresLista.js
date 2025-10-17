import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import ElementoIndicadoresModal from "./ElementoIndicadoresModal";
import { FaInfoCircle } from "react-icons/fa";
import INDICADOR_DESCRIPTIONS from "../utils/indicadorDescriptions";
import Tooltip from "./Tooltip";

const ALL_METRICS = [
  { key: "produccionTotal", label: "Producción total" },
  { key: "defectos", label: "Defectos" },
  { key: "porcentajeDefectos", label: "% Defectos" },
  { key: "avgSpeed", label: "Vel. promedio (sin NPT)" },
  { key: "avgSpeedSesion", label: "Vel. promedio (con NPT)" },
  { key: "nptMin", label: "NPT (min)" },
  { key: "nptPorInactividad", label: "NPT por inactividad" },
  { key: "porcentajeNPT", label: "% NPT" },
  { key: "pausasMin", label: "Pausas (min)" },
  { key: "pausasCount", label: "# Pausas" },
  { key: "porcentajePausa", label: "% Pausa" },
  { key: "duracionTotalMin", label: "Duración total (min)" },
  { key: "sesionesCerradas", label: "Sesiones cerradas" },
];

const RANGOS = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
  { value: "ultimos-30-dias", label: "Últimos 30 días" },
  { value: "ano", label: "Este año" },
  { value: "ultimos-12-meses", label: "Últimos 12 meses" },
];

const COMPARISON_OPTIONS = [
  { value: "previo", label: "Periodo previo" },
  { value: "mismo-periodo-anterior", label: "Mismo periodo anterior" },
  { value: "personalizado", label: "Fechas manuales" },
  { value: "ninguno", label: "Sin comparación" },
];

const MIN_METRICS = new Set([
  "defectos",
  "nptMin",
  "nptPorInactividad",
  "pausasMin",
  "pausasCount",
  "porcentajeDefectos",
  "porcentajeNPT",
  "porcentajePausa",
]);

const NEUTRAL_METRICS = new Set(["duracionTotalMin"]);

function trendClassForValue(metricKey, current, previous) {
  const base = "text-gray-900";
  if (previous == null || current == null) return base;
  const currNum = Number(current);
  const prevNum = Number(previous);
  if (!Number.isFinite(currNum) || !Number.isFinite(prevNum)) return base;
  if (currNum === prevNum) return base;
  if (NEUTRAL_METRICS.has(metricKey)) return base;
  const better = MIN_METRICS.has(metricKey) ? currNum < prevNum : currNum > prevNum;
  return better ? "text-green-600" : "text-red-600";
}

function comparisonLabel(value) {
  const found = COMPARISON_OPTIONS.find((opt) => opt.value === value);
  return found ? found.label : value;
}

function formatValue(key, val) {
  if (val == null) return "-";
  if (typeof val !== "number") return String(val);
  if (key.startsWith("porcentaje")) return `${val.toFixed(2)}%`;
  if (key === "avgSpeed" || key === "avgSpeedSesion") return val.toFixed(1);
  return val;
}

function MetricSelector({ selected, onChange }) {
  const allSelected = selected.length === ALL_METRICS.length;
  const toggleAll = (checked) => {
    if (checked) onChange(ALL_METRICS.map((m) => m.key));
    else onChange([]);
  };
  const toggleOne = (key) => {
    if (selected.includes(key)) onChange(selected.filter((k) => k !== key));
    else onChange([...selected, key]);
  };
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Métricas</div>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} /> Seleccionar todo
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {ALL_METRICS.map((m) => (
          <label key={m.key} className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(m.key)}
              onChange={() => toggleOne(m.key)}
            />
            <span className="inline-flex items-center gap-1">
              {m.label}
              {INDICADOR_DESCRIPTIONS[m.key] && (
                <Tooltip content={INDICADOR_DESCRIPTIONS[m.key]}>
                  <FaInfoCircle className="text-gray-500 cursor-help" size={12} />
                </Tooltip>
              )}
            </span>
          </label>
        ))}
      </div>
      <div className="text-[11px] text-gray-500 mt-2">Si no seleccionas ninguna, se mostrarán todas las métricas.</div>
    </div>
  );
}

export default function IndicadoresLista({ tipo = "trabajadores" }) {
  // tipo: "trabajadores" | "maquinas"
  const { token } = useAuth();
  const [modoFecha, setModoFecha] = useState("rango"); // "rango" | "fechas"
  const [rango, setRango] = useState("mes");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [compararCon, setCompararCon] = useState("previo");
  const [compararInicio, setCompararInicio] = useState("");
  const [compararFin, setCompararFin] = useState("");
  const [metrics, setMetrics] = useState(["produccionTotal", "avgSpeed", "porcentajeDefectos"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [periodoInfo, setPeriodoInfo] = useState(null);
  const [comparativoInfo, setComparativoInfo] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortKey, setSortKey] = useState(null); // solo claves de métricas
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"
  const [modalRow, setModalRow] = useState(null); // fila seleccionada para ver serie

  useEffect(() => {
    // Default fechas: últimos 7 días
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 7);
    setInicio(start.toISOString().slice(0, 10));
    setFin(today.toISOString().slice(0, 10));
  }, []);

  const metaColumns = useMemo(() => {
    return tipo === "trabajadores"
      ? [
          { key: "id", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "identificacion", label: "Identificación" },
          { key: "grupo", label: "Grupo" },
          { key: "turno", label: "Turno" },
        ]
      : [
          { key: "id", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "tipo", label: "Tipo" },
          { key: "areaNombre", label: "Área" },
        ];
  }, [tipo]);

  const metricColumns = useMemo(() => {
    const keys = metrics.length ? metrics : ALL_METRICS.map((m) => m.key);
    return ALL_METRICS.filter((m) => keys.includes(m.key));
  }, [metrics]);
  const sortableMetaKeys = useMemo(
    () => (tipo === "trabajadores" ? ["nombre", "grupo", "turno"] : ["nombre", "tipo", "areaNombre"]),
    [tipo]
  );

  const fetchData = async () => {
    if (modoFecha === "fechas" && (!inicio || !fin)) {
      setError("Selecciona fecha de inicio y fin.");
      return;
    }
    if (compararCon === "personalizado" && (!compararInicio || !compararFin)) {
      setError("Selecciona fechas para la comparación.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (modoFecha === "rango") {
        if (rango) params.append("rango", rango);
      } else {
        if (inicio) params.append("inicio", inicio);
        if (fin) params.append("fin", fin);
      }
      if (metrics.length) params.append("metrics", metrics.join(","));
      if (compararCon) {
        params.append("compararCon", compararCon);
        if (compararCon === "personalizado") {
          params.append("compararInicio", compararInicio);
          params.append("compararFin", compararFin);
        }
      }

      const queryString = params.toString();
      const url = `${API_BASE_URL}/indicadores/${tipo}${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error("No se pudo cargar");
      const json = await res.json();
      if (json && !Array.isArray(json)) {
        setPeriodoInfo(json.periodo ?? null);
        setComparativoInfo(json.comparativo ?? null);
      } else {
        setPeriodoInfo(null);
        setComparativoInfo(null);
      }
      const dataRows = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      setRows(Array.isArray(dataRows) ? dataRows : []);
      setPage(1);
    } catch (e) {
      setRows([]);
      setPeriodoInfo(null);
      setComparativoInfo(null);
      setError(e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  const metricKeys = useMemo(() => (metrics.length ? metrics : ALL_METRICS.map((m) => m.key)), [metrics]);

  // Ordenación
  const finalSortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const isMetric = metricKeys.includes(sortKey);
    const isMeta = sortableMetaKeys.includes(sortKey);
    if (!isMetric && !isMeta) return rows;
    const dirMul = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      let av = a?.[sortKey];
      let bv = b?.[sortKey];
      const aNull = av == null || (isMetric && Number.isNaN(av));
      const bNull = bv == null || (isMetric && Number.isNaN(bv));
      if (aNull && bNull) return 0;
      if (aNull) return 1; // nulls last
      if (bNull) return -1;
      if (isMetric) {
        if (typeof av !== "number") av = Number(av);
        if (typeof bv !== "number") bv = Number(bv);
        if (Number.isNaN(av) && Number.isNaN(bv)) return 0;
        if (Number.isNaN(av)) return 1;
        if (Number.isNaN(bv)) return -1;
        if (av === bv) return 0;
        const base = av > bv ? 1 : -1;
        return base * dirMul;
      } else {
        const as = String(av ?? "");
        const bs = String(bv ?? "");
        const comp = as.localeCompare(bs, undefined, { sensitivity: "base" });
        return comp * dirMul;
      }
    });
  }, [rows, sortKey, sortDir, metricKeys, sortableMetaKeys]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(finalSortedRows.length / pageSize)), [finalSortedRows.length]);
  useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [totalPages]);

  const pageStart = (page - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, finalSortedRows.length);
  const pageRows = finalSortedRows.slice(pageStart, pageEnd);

  const toggleSort = (key) => {
    if (!metricKeys.includes(key) && !sortableMetaKeys.includes(key)) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="font-semibold text-2xl">Indicadores por {tipo === "trabajadores" ? "trabajadores" : "máquinas"}</div>
          <div className="text-xs text-gray-600">Selecciona rango y métricas para ver el resumen de indicadores.</div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-2">
            <label className="text-sm">Modo</label>
            <select value={modoFecha} onChange={(e) => setModoFecha(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option value="rango">Rango predefinido</option>
              <option value="fechas">Fechas</option>
            </select>
          </div>
          {modoFecha === "rango" ? (
            <div className="flex items-center gap-2">
              <label className="text-sm">Rango</label>
              <select value={rango} onChange={(e) => setRango(e.target.value)} className="border rounded px-2 py-1 text-sm">
                {RANGOS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm">Inicio</label>
                <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border rounded px-2 py-1 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Fin</label>
                <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="border rounded px-2 py-1 text-sm" />
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <label className="text-sm">Comparar con</label>
            <select value={compararCon} onChange={(e) => setCompararCon(e.target.value)} className="border rounded px-2 py-1 text-sm">
              {COMPARISON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {compararCon === "personalizado" && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm">Comparar inicio</label>
                <input type="date" value={compararInicio} onChange={(e) => setCompararInicio(e.target.value)} className="border rounded px-2 py-1 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Comparar fin</label>
                <input type="date" value={compararFin} onChange={(e) => setCompararFin(e.target.value)} className="border rounded px-2 py-1 text-sm" />
              </div>
            </>
          )}
          <button onClick={fetchData} className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Actualizar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <MetricSelector selected={metrics} onChange={setMetrics} />
        {(periodoInfo || comparativoInfo) && (
          <div className="text-xs text-gray-600 flex flex-wrap gap-4 px-1">
            {periodoInfo && (
              <span>
                Periodo: {periodoInfo.inicio ?? "-"} → {periodoInfo.fin ?? "-"}
              </span>
            )}
            {comparativoInfo && compararCon !== "ninguno" && (
              <span>
                Comparativo ({comparisonLabel(comparativoInfo.tipo ?? compararCon)}): {comparativoInfo.inicio ?? "-"} → {comparativoInfo.fin ?? "-"}
              </span>
            )}
          </div>
        )}
        <div className="border rounded-2xl shadow-md overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {metaColumns.map((c) => {
                  const sortable = sortableMetaKeys.includes(c.key);
                  const active = sortable && sortKey === c.key;
                  const arrow = active ? (sortDir === "asc" ? "▲" : "▼") : "";
                  if (!sortable) {
                    return (
                      <th key={c.key} className="px-3 py-2 text-left font-medium border-b">{c.label}</th>
                    );
                  }
                  return (
                    <th
                      key={c.key}
                      className="px-3 py-2 text-left font-medium border-b cursor-pointer select-none hover:bg-gray-100"
                      title="Ordenar"
                      onClick={() => toggleSort(c.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {arrow && <span className="text-gray-500 text-[10px]">{arrow}</span>}
                      </span>
                    </th>
                  );
                })}
                {metricColumns.map((c) => {
                  const active = sortKey === c.key;
                  const arrow = active ? (sortDir === "asc" ? "▲" : "▼") : "";
                  return (
                    <th
                      key={c.key}
                      className="px-3 py-2 text-left font-medium border-b cursor-pointer select-none hover:bg-gray-100"
                      title="Ordenar"
                      onClick={() => toggleSort(c.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {arrow && <span className="text-gray-500 text-[10px]">{arrow}</span>}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                  {metaColumns.map((c) => (
                    <td key={c.key} className="px-3 py-2 border-b">
                      {c.key === "id" ? (
                        <button
                          className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700"
                          title="Ver serie de indicadores"
                          onClick={() => setModalRow(r)}
                        >
                          Ver indicadores
                        </button>
                      ) : (
                        r[c.key] ?? "-"
                      )}
                    </td>
                  ))}
                  {metricColumns.map((c) => {
                    const prevKey = `${c.key}Anterior`;
                    const prevVal = r[prevKey];
                    const hasComparison = compararCon !== "ninguno" && prevVal != null && prevVal !== undefined;
                    const trendClass = hasComparison ? trendClassForValue(c.key, r[c.key], prevVal) : "text-gray-900";
                    return (
                      <td key={c.key} className="px-3 py-2 border-b">
                        <div className={`font-medium ${trendClass}`}>{formatValue(c.key, r[c.key])}</div>
                        {hasComparison && (
                          <div className="text-xs text-gray-500">Comparativo: {formatValue(c.key, prevVal)}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="px-3 py-3 text-gray-500" colSpan={metaColumns.length + metricColumns.length}>
                    {loading ? "Cargando…" : error ? error : "Sin datos. Ajusta los filtros y pulsa Actualizar."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        {rows.length > 0 && (
          <div className="flex items-center justify-between text-sm mt-2">
            <div className="text-gray-600">
              Mostrando {pageStart + 1}–{pageEnd} de {finalSortedRows.length}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              {(() => {
                const buttons = [];
                const max = totalPages;
                const showSimple = max <= 7;
                const pushBtn = (n) => buttons.push(
                  <button
                    key={n}
                    className={`px-2 py-1 border rounded ${page === n ? "bg-gray-200" : ""}`}
                    onClick={() => setPage(n)}
                  >{n}</button>
                );
                if (showSimple) {
                  for (let n = 1; n <= max; n++) pushBtn(n);
                } else {
                  pushBtn(1);
                  if (page > 3) buttons.push(<span key="l-ellipsis" className="px-1">…</span>);
                  const start = Math.max(2, page - 1);
                  const end = Math.min(max - 1, page + 1);
                  for (let n = start; n <= end; n++) pushBtn(n);
                  if (page < max - 2) buttons.push(<span key="r-ellipsis" className="px-1">…</span>);
                  pushBtn(max);
                }
                return buttons;
              })()}
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
        <div className="text-[11px] text-gray-500">En fechas manuales se toma todo el día de inicio y fin en zona America/Bogota.</div>
        {modalRow && (
          <ElementoIndicadoresModal
            tipo={tipo}
            id={modalRow.id}
            nombre={modalRow.nombre}
            onClose={() => setModalRow(null)}
          />
        )}
      </div>
    </div>
  );
}
