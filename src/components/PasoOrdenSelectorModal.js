import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../api";
import { apiFetch } from "../api";

export default function PasoOrdenSelectorModal({
  open,
  onClose = () => {},
  onSelected = () => {},
}) {
  const [ordenRef, setOrdenRef] = useState("");
  const [pasos, setPasos] = useState([]);
  const [selectedPasoId, setSelectedPasoId] = useState("");
  const [loadingPasos, setLoadingPasos] = useState(false);
  const [pasosError, setPasosError] = useState("");

  const hasSelection = useMemo(
    () => ordenRef.trim() && selectedPasoId,
    [ordenRef, selectedPasoId],
  );

  useEffect(() => {
    if (!open) {
      setOrdenRef("");
      setPasos([]);
      setSelectedPasoId("");
      setPasosError("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    if (typeof document === "undefined") return undefined;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [open]);

  const fetchPasos = async () => {
    const target = ordenRef.trim();
    if (!target) {
      setPasosError("Ingresa el numero de la orden.");
      return;
    }
    setLoadingPasos(true);
    setPasosError("");
    setPasos([]);
    setSelectedPasoId("");
    try {
      const res = await apiFetch(
        `${API_BASE_URL}/ordenes/${encodeURIComponent(target)}/pasos-mini`,
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          res.status === 404
            ? "No se encontro una orden con ese numero."
            : data?.message || data?.error || "No se pudieron obtener los pasos.";
        throw new Error(msg);
      }
      setPasos(Array.isArray(data) ? data : []);
      if (!Array.isArray(data) || data.length === 0) {
        setPasosError("La orden no tiene pasos disponibles.");
      }
    } catch (err) {
      setPasosError(err.message || "Error consultando los pasos.");
    } finally {
      setLoadingPasos(false);
    }
  };

  const handleConfirm = () => {
    if (!hasSelection) return;
    const paso = pasos.find((p) => p.id === selectedPasoId);
    if (!paso) return;
    onSelected({ ordenId: ordenRef.trim(), paso });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          x
        </button>
        <div>
          <h2 className="text-xl font-semibold">Seleccionar paso de orden</h2>
          <p className="text-sm text-gray-600">
            Ingresa el numero de la orden de produccion para elegir el paso que
            vas a trabajar.
          </p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Numero de orden</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ordenRef}
              onChange={(e) => setOrdenRef(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  fetchPasos();
                }
              }}
              className="flex-1 border rounded-full px-4 py-2"
              placeholder="Ej: 184522"
              autoFocus
            />
            <button
              type="button"
              onClick={fetchPasos}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm disabled:opacity-50"
              disabled={!ordenRef.trim() || loadingPasos}
            >
              Buscar pasos
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Pasos disponibles</label>
            {loadingPasos && (
              <span className="text-xs text-gray-500">Cargando...</span>
            )}
          </div>
          {pasosError && <p className="text-sm text-red-600">{pasosError}</p>}
          <div className="max-h-48 overflow-auto border rounded-lg">
            {pasos.length === 0 && !loadingPasos ? (
              <div className="p-4 text-sm text-gray-600">
                Consulta los pasos para mostrarlos aqui.
              </div>
            ) : (
              <ul>
                {pasos.map((paso) => (
                  <li key={paso.id} className="border-b last:border-b-0">
                    <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paso"
                        value={paso.id}
                        checked={selectedPasoId === paso.id}
                        onChange={() => setSelectedPasoId(paso.id)}
                      />
                      <div>
                        <div className="font-medium">{paso.nombre}</div>
                        <div className="text-xs text-gray-600">
                          Paso #{paso.numeroPaso ?? "-"}
                        </div>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!hasSelection}
            className="px-4 py-2 rounded-full bg-indigo-600 text-white disabled:opacity-50"
          >
            Confirmar paso
          </button>
        </div>
      </div>
    </div>
  );
}
