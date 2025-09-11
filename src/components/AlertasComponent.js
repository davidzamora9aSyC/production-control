import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ExpandButton, ExpandContext } from "./ExpandableCard";
import AlertasUmbralesModal from "./AlertasUmbralesModal";
import { fetchJsonCached } from "../api";
import { useAuth } from "../context/AuthContext";
import TrabajadorSelector from "./TrabajadorSelector";

function hoyISO() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}

function sujetoLabel(sujeto) {
    if (!sujeto) return "-";
    return sujeto.nombre || sujeto.id || "-";
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

export default function Alertas() {
    const [fecha, setFecha] = useState(hoyISO());
    const [identificacion, setIdentificacion] = useState("");
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showUmbrales, setShowUmbrales] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const navigate = useNavigate();
    const { expanded } = useContext(ExpandContext);
    const { token } = useAuth();

    useEffect(() => {
        let cancelled = false;
        const fetchAlertas = async () => {
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
        fetchAlertas();
        return () => { cancelled = true; };
    }, [fecha, identificacion, token, reloadKey]);

    return (
        <div className={expanded ? "h-full flex flex-col" : ""}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Alertas</h2>
                <div className="flex gap-4 text-base items-center">
                    <label>Fecha <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="ml-1 border px-2 py-1 rounded" /></label>
                    <label className="flex items-center gap-2">Trabajador
                        <TrabajadorSelector value={identificacion} onChange={setIdentificacion} className="ml-1 border px-2 py-1 rounded" />
                    </label>
                    <button
                      onClick={() => setShowUmbrales(true)}
                      className="bg-gray-100 border px-3 py-1 rounded hover:bg-gray-200"
                    >
                      Configurar umbrales
                    </button>
                    <ExpandButton />
                </div>
            </div>
            <section className={`border rounded-xl p-4 bg-white shadow-md flex flex-col relative ${expanded ? "flex-1 min-h-0" : "h-[320px]"}`}>
                <div className="absolute top-1 right-1">
                    <button
                        onClick={() => navigate("/alertas")}
                        className="bg-blue-600 text-sm text-white px-4 py-1 rounded-2xl hover:bg-blue-700 transition-colors duration-300"
                    >
                        Ver detalle
                    </button>
                </div>
                <div className="text-base pr-2 pb-2 overflow-y-auto grow">
                    <div className="grid grid-cols-4 font-semibold border-b pb-2">
                        <span>Tipo</span>
                        <span>Sujeto</span>
                        <span>Fecha</span>
                        <span>Info</span>
                    </div>
                    {loading && (
                        <div className="py-4 text-gray-500">Cargando alertas…</div>
                    )}
                    {error && !loading && (
                        <div className="py-4 text-red-600">{error}</div>
                    )}
                    {!loading && !error && alertas.length === 0 && (
                        <div className="py-4 text-gray-500">Sin alertas para los filtros seleccionados.</div>
                    )}
                    {!loading && !error && alertas.map((a, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-4 py-2 border-b last:border-b-0"
                        >
                            <span className="text-blue-600">{a?.tipo?.nombre || a?.tipo?.codigo || "-"}</span>
                            <span>{sujetoLabel(a?.sujeto)}</span>
                            <span>{a?.fecha || "-"}</span>
                            <span className="truncate" title={formatInfo(a)}>{formatInfo(a)}</span>
                        </div>
                    ))}
                </div>
            </section>
            {showUmbrales && (
              <AlertasUmbralesModal
                onClose={() => setShowUmbrales(false)}
                onSaved={() => setReloadKey(k => k + 1)}
              />
            )}
        </div>
    );
}
