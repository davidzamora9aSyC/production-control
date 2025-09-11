import Navbar from "../components/Navbar";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJsonCached } from "../api";
import { useAuth } from "../context/AuthContext";
import AlertasUmbralesModal from "../components/AlertasUmbralesModal";
import TrabajadorSelector from "../components/TrabajadorSelector";

function hoyISO() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}

function formatInfo(alerta) {
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
}

function Alertas() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [fecha, setFecha] = useState(hoyISO());
    const [identificacion, setIdentificacion] = useState("");
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showUmbrales, setShowUmbrales] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const params = new URLSearchParams();
                if (fecha) params.set("fecha", fecha);
                if (identificacion) params.set("identificacion", identificacion);
                const url = `/alertas${params.toString() ? `?${params.toString()}` : ""}`;
                const data = await fetchJsonCached(
                  url,
                  { headers: token ? { Authorization: `Bearer ${token}` } : {} },
                  { force: true }
                );
                if (!cancelled) setAlertas(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!cancelled) setError("No se pudieron cargar las alertas");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [fecha, identificacion, token, reloadKey]);

    const tipos = useMemo(() => {
        const set = new Set(alertas.map(a => a?.tipo?.nombre || a?.tipo?.codigo || ""));
        return ["Todos", ...Array.from(set).filter(Boolean)];
    }, [alertas]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState("Todos");
    const alertasFiltradas = useMemo(() => (
        tipoSeleccionado === "Todos"
            ? alertas
            : alertas.filter(a => (a?.tipo?.nombre || a?.tipo?.codigo) === tipoSeleccionado)
    ), [alertas, tipoSeleccionado]);

    const generarCSV = () => {
        const headers = ["Tipo de alerta", "Fecha de alerta", "Detalles"];
        const rows = alertasFiltradas.map(a => [
            a?.tipo?.nombre || a?.tipo?.codigo || "",
            a?.fecha || "",
            formatInfo(a)
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "alertas_reporte.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white min-h-screen animate-slideLeft">

            <div className="px-20 pt-10">
                <button
                    onClick={() => navigate("/dashboard", { state: { entradaReturn: true } })}
                    className="text-blue-600 text-xl mb-4 hover:underline"
                >
                    &larr; Volver
                </button>
                <div className="text-3xl font-semibold mb-6">Alertas</div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <label className="font-medium mr-2">Tipo de alertas</label>
                        <select
                            className="border border-gray-300 px-2 py-1 rounded"
                            value={tipoSeleccionado}
                            onChange={(e) => setTipoSeleccionado(e.target.value)}
                        >
                            {tipos.map((tipo, idx) => (
                                <option key={idx} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span>Fecha</span>
                        <input type="date" className="border px-2 py-1 rounded" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                        <span>Trabajador</span>
                        <TrabajadorSelector value={identificacion} onChange={setIdentificacion} />
                        <button
                          onClick={() => setShowUmbrales(true)}
                          className="bg-gray-100 border px-3 py-1 rounded hover:bg-gray-200"
                        >
                          Configurar umbrales
                        </button>
                        <button
                            onClick={generarCSV}
                            className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                            Generar reporte
                        </button>
                    </div>
                </div>
                <table className="w-full text-left text-sm border-t border-b border-black">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2 text-blue-800">Tipo de alerta</th>
                            <th className="py-2">Fecha de alerta</th>
                            <th className="py-2">Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td className="py-4 text-gray-500" colSpan={3}>Cargando…</td></tr>
                        )}
                        {error && !loading && (
                            <tr><td className="py-4 text-red-600" colSpan={3}>{error}</td></tr>
                        )}
                        {!loading && !error && alertasFiltradas.length === 0 && (
                            <tr><td className="py-4 text-gray-500" colSpan={3}>Sin alertas para los filtros.</td></tr>
                        )}
                        {!loading && !error && alertasFiltradas.map((a, i) => (
                            <tr key={i} className="border-t">
                                <td className="text-blue-800 py-2">{a?.tipo?.nombre || a?.tipo?.codigo || ""}</td>
                                <td className="py-2">{a?.fecha || ""}</td>
                                <td className="py-2">{formatInfo(a)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showUmbrales && (
              <AlertasUmbralesModal
                onClose={() => setShowUmbrales(false)}
                onSaved={() => setReloadKey(k => k + 1)}
              />
            )}
        </div>
    );
}
export default Alertas;
