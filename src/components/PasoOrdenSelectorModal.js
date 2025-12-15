import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { API_BASE_URL } from "../api";

function extractOrdenId(text = "") {
  if (!text) return "";
  try {
    const url = new URL(text);
    const fromQuery =
      url.searchParams.get("ordenId") ||
      url.searchParams.get("orden") ||
      url.searchParams.get("order");
    if (fromQuery) return fromQuery;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  } catch {
    // not a URL, fall through
  }
  return text.trim();
}

export default function PasoOrdenSelectorModal({
  open,
  onClose = () => {},
  onSelected = () => {},
}) {
  const [ordenId, setOrdenId] = useState("");
  const [pasos, setPasos] = useState([]);
  const [selectedPasoId, setSelectedPasoId] = useState("");
  const [loadingPasos, setLoadingPasos] = useState(false);
  const [pasosError, setPasosError] = useState("");
  const [scanError, setScanError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const solicitandoPermisoRef = useRef(false);

  const hasSelection = useMemo(
    () => ordenId && selectedPasoId,
    [ordenId, selectedPasoId],
  );

  useEffect(() => {
    if (!open) {
      stopScanner();
      setOrdenId("");
      setPasos([]);
      setSelectedPasoId("");
      setPasosError("");
      setScanError("");
      setScanMessage("");
    }
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stopScanner = () => {
    if (controlsRef.current && typeof controlsRef.current.stop === "function") {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    if (readerRef.current && typeof readerRef.current.reset === "function") {
      try {
        readerRef.current.reset();
      } catch (err) {
        // Algunos navegadores lanzan error al resetear si no se ha inicializado completamente
        console.warn("No se pudo resetear el lector", err);
      }
    }
    setCameraActive(false);
  };

  const startScanner = async () => {
    setScanError("");
    setScanMessage("");
    try {
      if (!readerRef.current) {
        readerRef.current = new BrowserMultiFormatReader();
      } else {
        readerRef.current.reset();
      }
      const reader = readerRef.current;
      setCameraActive(true);
      controlsRef.current = await reader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();
            stopScanner();
            const id = extractOrdenId(text);
            setOrdenId(id);
            setScanMessage(`QR leído: ${text}`);
            setScanError("");
          } else if (err && !err.message?.includes("NotFoundException")) {
            setScanError("Error al leer el código. Intenta de nuevo.");
          }
        },
      );
    } catch (err) {
      if (!solicitandoPermisoRef.current) {
        solicitandoPermisoRef.current = true;
        try {
          await solicitarPermisoCamara();
          solicitandoPermisoRef.current = false;
          return startScanner();
        } catch {
          solicitandoPermisoRef.current = false;
        }
      }
      setScanError(
        "No se pudo acceder a la cámara. Autoriza el acceso e intenta de nuevo.",
      );
      stopScanner();
    }
  };

  const solicitarPermisoCamara = async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      throw new Error("El navegador no soporta acceso a la cámara.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop());
  };

  const fetchPasos = async () => {
    if (!ordenId) {
      setPasosError("Escanea o ingresa el ID de la orden.");
      return;
    }
    setLoadingPasos(true);
    setPasosError("");
    setPasos([]);
    setSelectedPasoId("");
    try {
      const res = await fetch(`${API_BASE_URL}/ordenes/${ordenId}/pasos-mini`);
      if (!res.ok) throw new Error("No se pudieron obtener los pasos.");
      const data = await res.json();
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
    onSelected({ ordenId, paso });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <div>
          <h2 className="text-xl font-semibold">Seleccionar paso de orden</h2>
          <p className="text-sm text-gray-600">
            Escanea el código QR de la orden o ingresa el ID manualmente para
            elegir el paso que vas a trabajar.
          </p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">ID de la orden</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ordenId}
              onChange={(e) => setOrdenId(e.target.value)}
              className="flex-1 border rounded-full px-4 py-2"
              placeholder="Ej: 4b159c1e-..."
            />
            <button
              type="button"
              onClick={fetchPasos}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm disabled:opacity-50"
              disabled={!ordenId || loadingPasos}
            >
              Buscar pasos
            </button>
          </div>
          {scanMessage && (
            <p className="text-xs text-green-600">{scanMessage}</p>
          )}
          {scanError && <p className="text-xs text-red-600">{scanError}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Escanear QR</label>
            <button
              type="button"
              onClick={cameraActive ? stopScanner : startScanner}
              className="px-3 py-1 text-sm rounded-full border bg-white hover:bg-gray-50"
            >
              {cameraActive ? "Detener cámara" : "Activar cámara"}
            </button>
          </div>
          <div className="border rounded-lg overflow-hidden bg-black/70">
            <video
              ref={videoRef}
              className="w-full h-48 object-cover"
              muted
              playsInline
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Pasos disponibles</label>
            {loadingPasos && (
              <span className="text-xs text-gray-500">Cargando…</span>
            )}
          </div>
          {pasosError && <p className="text-sm text-red-600">{pasosError}</p>}
          <div className="max-h-48 overflow-auto border rounded-lg">
            {pasos.length === 0 && !loadingPasos ? (
              <div className="p-4 text-sm text-gray-600">
                Consulta los pasos para mostrarlos aquí.
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
            onClick={() => {
              stopScanner();
              onClose();
            }}
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
