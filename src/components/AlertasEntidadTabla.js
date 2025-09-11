import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchJsonCached } from "../api";
import TrabajadorSelector from "./TrabajadorSelector";
import MaquinaSelector from "./MaquinaSelector";

// tipo: "trabajador" | "maquina"
export default function AlertasEntidadTabla({ tipo = "trabajador" }) {
  const { token } = useAuth();
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [identificacion, setIdentificacion] = useState(""); // trabajador
  const [maquinaClave, setMaquinaClave] = useState(""); // máquina (id/nombre/código según selector)
  const [maquinaValorKey, setMaquinaValorKey] = useState("id"); // "id" | "nombre" | "codigo"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Todos");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // Default últimos 7 días
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 7);
    setDesde(start.toISOString().slice(0, 10));
    setHasta(today.toISOString().slice(0, 10));
  }, []);

  const tipos = useMemo(() => {
    const set = new Set(rows.map(a => a?.tipo?.nombre || a?.tipo?.codigo || ""));
    return ["Todos", ...Array.from(set).filter(Boolean)];
  }, [rows]);

  const alertasFiltradas = useMemo(() => (
    tipoSeleccionado === "Todos"
      ? rows
      : rows.filter(a => (a?.tipo?.nombre || a?.tipo?.codigo) === tipoSeleccionado)
  ), [rows, tipoSeleccionado]);

  const totalPages = Math.max(1, Math.ceil(alertasFiltradas.length / pageSize));
  useEffect(() => {
    setPage(p => (p > totalPages ? totalPages : p));
  }, [totalPages]);

  const pageStart = (page - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, alertasFiltradas.length);
  const pageRows = alertasFiltradas.slice(pageStart, pageEnd);

  const formatInfo = (alerta) => {
    const codigo = alerta?.tipo?.codigo;
    const m = alerta?.metadata || {};
    if (!codigo) return "";
    switch (codigo) {
      case "TRABAJADOR_DEMASIADOS_DESCANSOS_EN_DIA":
        return `Total descansos: ${m.total ?? "-"} / Límite: ${m.limite ?? "-"}`;
      case "TRABAJADOR_PAUSA_LARGA":
        return `Pausa ${m.pausaId || "-"}: ${m.duracionMin ?? "-"} min${m.abierta ? " (abierta)" : ""} / Límite: ${m.limite ?? "-"}`;
      case "SIN_ACTIVIDAD":
        return `Sesión ${m.sesionId || "-"}: ${m.minutosSinActividad ?? "-"} min sin actividad / Límite: ${m.limite ?? "-"}${m.motivo ? ` — ${m.motivo}` : ""}`;
      default:
        try { return JSON.stringify(m); } catch { return ""; }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      setRows([]);
      setTotal(null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url = "";
      if (tipo === "trabajador") {
        const params = new URLSearchParams();
        if (identificacion) params.set("identificacion", identificacion);
        if (desde) params.set("desde", desde);
        if (hasta) params.set("hasta", hasta);
        url = `/alertas/trabajador/rango${params.toString() ? `?${params.toString()}` : ""}`;
        const data = await fetchJsonCached(url, { headers }, { force: true });
        const alertas = Array.isArray(data) ? data : (data?.alertas || []);
        setRows(alertas);
        setTotal(typeof data?.total === "number" ? data.total : alertas.length);
      } else {
        // Máquina: por ahora consumimos el endpoint de alertas por máquina vía query.
        // UI permite elegir por id/nombre/código. Si tu backend acepta path por nombre/código,
        // dime el camino exacto y lo adapto (p.ej. /alertas/maquina/<nombre>/rango).
        const params = new URLSearchParams();
        if (maquinaClave) {
          if (maquinaValorKey === "codigo") params.set("codigo", maquinaClave);
          else if (maquinaValorKey === "nombre") params.set("nombre", maquinaClave);
          else params.set("maquinaId", maquinaClave);
        }
        if (desde) params.set("desde", desde);
        if (hasta) params.set("hasta", hasta);
        url = `/alertas/maquina/rango${params.toString() ? `?${params.toString()}` : ""}`;
        const data = await fetchJsonCached(url, { headers }, { force: true });
        const alertas = Array.isArray(data) ? data : (data?.alertas || []);
        setRows(alertas);
        setTotal(typeof data?.total === "number" ? data.total : alertas.length);
      }
      setPage(1);
    } catch (e) {
      setError(e.message || "No se pudieron cargar las alertas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm">Desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        </div>
        {tipo === "trabajador" ? (
          <div className="flex items-center gap-2">
            <label className="text-sm">Trabajador</label>
            <TrabajadorSelector value={identificacion} onChange={setIdentificacion} className="border rounded px-2 py-1 text-sm min-w-[16rem]" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm">Buscar por</label>
              <select value={maquinaValorKey} onChange={(e) => setMaquinaValorKey(e.target.value)} className="border rounded px-2 py-1 text-sm">
                <option value="id">ID</option>
                <option value="nombre">Nombre</option>
                <option value="codigo">Código</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Máquina</label>
              <MaquinaSelector value={maquinaClave} onChange={setMaquinaClave} valueKey={maquinaValorKey} className="border rounded px-2 py-1 text-sm min-w-[16rem]" />
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={fetchData} className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">Cargar</button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-700">
          Total alertas: <span className="font-semibold">{total ?? (loading ? "-" : rows.length)}</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Tipo</label>
          <select className="border rounded px-2 py-1 text-sm" value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
            {tipos.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border rounded-2xl shadow-md overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left font-medium border-b">Tipo de alerta</th>
              <th className="px-3 py-2 text-left font-medium border-b">Fecha</th>
              <th className="px-3 py-2 text-left font-medium border-b">Sujeto</th>
              <th className="px-3 py-2 text-left font-medium border-b">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="px-3 py-3 text-gray-500" colSpan={4}>Cargando…</td></tr>
            )}
            {error && !loading && (
              <tr><td className="px-3 py-3 text-red-600" colSpan={4}>{error}</td></tr>
            )}
            {!loading && !error && pageRows.length === 0 && (
              <tr><td className="px-3 py-3 text-gray-500" colSpan={4}>Sin alertas para los filtros.</td></tr>
            )}
            {!loading && !error && pageRows.map((a, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 border-b text-blue-700">{a?.tipo?.nombre || a?.tipo?.codigo || ""}</td>
                <td className="px-3 py-2 border-b">{a?.fecha || ""}</td>
                <td className="px-3 py-2 border-b">{a?.sujeto?.nombre || a?.sujeto?.id || "-"}</td>
                <td className="px-3 py-2 border-b"><span className="truncate inline-block max-w-[40rem]" title={formatInfo(a)}>{formatInfo(a)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alertasFiltradas.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">Mostrando {pageStart + 1}–{pageEnd} de {alertasFiltradas.length}</div>
          <div className="flex items-center gap-1">
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >Anterior</button>
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
            >Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
