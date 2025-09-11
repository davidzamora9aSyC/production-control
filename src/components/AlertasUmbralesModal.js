import { useEffect, useState } from "react";
import { fetchJsonCached } from "../api";
import { useAuth } from "../context/AuthContext";

export default function AlertasUmbralesModal({ onClose, onSaved }) {
  const { token } = useAuth();
  const [orig, setOrig] = useState(null);
  const [form, setForm] = useState({
    maxDescansosDiariosPorTrabajador: "",
    maxDuracionPausaMinutos: "",
    minutosInactividadParaNPT: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchJsonCached(
          "/alertas/umbrales",
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
          { force: true }
        );
        if (cancelled) return;
        setOrig(data);
        setForm({
          maxDescansosDiariosPorTrabajador: String(data?.maxDescansosDiariosPorTrabajador ?? ""),
          maxDuracionPausaMinutos: String(data?.maxDuracionPausaMinutos ?? ""),
          minutosInactividadParaNPT: String(data?.minutosInactividadParaNPT ?? ""),
        });
      } catch (e) {
        if (!cancelled) setError("Error al cargar umbrales");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validateInt = (v) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1;
  };

  const handleSave = async () => {
    setError("");
    const patch = {};
    const keys = [
      "maxDescansosDiariosPorTrabajador",
      "maxDuracionPausaMinutos",
      "minutosInactividadParaNPT",
    ];
    for (const k of keys) {
      const val = form[k];
      if (!validateInt(val)) {
        setError("Todos los campos deben ser enteros >= 1");
        return;
      }
      const n = Number(val);
      if (!orig || n !== Number(orig[k])) {
        patch[k] = n;
      }
    }
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    try {
      setSaving(true);
      const updated = await fetchJsonCached(
        "/alertas/umbrales",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(patch),
        },
        { force: true }
      );
      setOrig(updated);
      if (onSaved) onSaved(updated);
      onClose();
    } catch (e) {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Configurar umbrales de alertas</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        {loading ? (
          <div className="py-8 text-center text-gray-600">Cargando…</div>
        ) : (
          <div className="space-y-4">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium">Máx. descansos diarios por trabajador</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full border px-3 py-2 rounded"
                value={form.maxDescansosDiariosPorTrabajador}
                onChange={(e) => setField("maxDescansosDiariosPorTrabajador", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Máx. duración de pausa (min)</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full border px-3 py-2 rounded"
                value={form.maxDuracionPausaMinutos}
                onChange={(e) => setField("maxDuracionPausaMinutos", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Minutos de inactividad para NPT</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full border px-3 py-2 rounded"
                value={form.minutosInactividadParaNPT}
                onChange={(e) => setField("minutosInactividadParaNPT", e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400" disabled={saving}>Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60" disabled={saving || loading}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

