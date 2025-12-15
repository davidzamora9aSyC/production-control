import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { API_BASE_URL } from "../api";

function extractTrabajadorId(text = "") {
  if (!text) return "";
  try {
    const url = new URL(text);
    const fromQuery =
      url.searchParams.get("trabajadorId") ||
      url.searchParams.get("workerId") ||
      url.searchParams.get("id");
    if (fromQuery) return fromQuery;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  } catch {
    // not a URL, ignore
  }
  return text.trim();
}

export default function TrabajadorQrSelector({
  selected,
  onSelect = () => {},
  className = "",
  title = "Trabajador",
  disabled = false,
  disabledMessage = "",
}) {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [scanError, setScanError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const lecturaEnCursoRef = useRef(false);
  const solicitandoPermisoRef = useRef(false);
  const permisoReintentadoRef = useRef(false);

  const stopScanner = () => {
    if (controlsRef.current && typeof controlsRef.current.stop === "function") {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    if (readerRef.current && typeof readerRef.current.reset === "function") {
      try {
        readerRef.current.reset();
      } catch (err) {
        console.warn("No se pudo resetear el lector", err);
      }
    }
    setCameraActive(false);
    solicitandoPermisoRef.current = false;
    permisoReintentadoRef.current = false;
  };

  useEffect(() => {
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (disabled) {
      stopScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

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

  const startScanner = async (esReintento = false) => {
    if (disabled) return;
    if (!esReintento) {
      permisoReintentadoRef.current = false;
    }
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
      lecturaEnCursoRef.current = false;
      controlsRef.current = await reader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          if (result) {
            if (lecturaEnCursoRef.current) return;
            lecturaEnCursoRef.current = true;
            const text = result.getText();
            stopScanner();
            const id = extractTrabajadorId(text);
            setScanMessage(`QR leído: ${text}`);
            setScanError("");
            fetchTrabajador(id);
          } else if (
            err &&
            !lecturaEnCursoRef.current &&
            !err.message?.includes("NotFoundException")
          ) {
            setScanError("Error al leer el código. Intenta de nuevo.");
          }
        },
      );
    } catch (err) {
      if (!permisoReintentadoRef.current && !solicitandoPermisoRef.current) {
        solicitandoPermisoRef.current = true;
        try {
          await solicitarPermisoCamara();
          solicitandoPermisoRef.current = false;
          permisoReintentadoRef.current = true;
          return startScanner(true);
        } catch {
          solicitandoPermisoRef.current = false;
        }
      }
      permisoReintentadoRef.current = true;
      setScanError(
        'No se pudo acceder a la cámara. Autoriza el uso y vuelve a presionar "Escanear QR".',
      );
      stopScanner();
    }
  };

  const fetchTrabajador = async (id) => {
    if (!id) {
      setFetchError("El QR no contiene un identificador válido.");
      return;
    }
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`${API_BASE_URL}/trabajadores/${id}`);
      if (!res.ok) throw new Error("Trabajador no encontrado");
      const data = await res.json();
      onSelect(data);
    } catch (err) {
      onSelect(null);
      setFetchError(
        err?.message || "No se pudo obtener la información del trabajador",
      );
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    if (disabled) return;
    stopScanner();
    lecturaEnCursoRef.current = false;
    permisoReintentadoRef.current = false;
    setScanMessage("");
    setScanError("");
    setFetchError("");
    onSelect(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-medium">{title}</label>
          <p className="text-xs text-gray-500">
            Escanea el QR del trabajador para continuar.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={cameraActive ? stopScanner : startScanner}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-full border text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
              disabled ? "cursor-not-allowed" : ""
            }`}
          >
            {cameraActive ? "Detener cámara" : "Escanear QR"}
          </button>
          {selected && (
            <button
              type="button"
              onClick={clearSelection}
              disabled={disabled}
              className="px-3 py-1.5 rounded-full border text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
      {disabled && (
        <p className="text-xs text-yellow-700">
          {disabledMessage || "La búsqueda está bloqueada temporalmente."}
        </p>
      )}
      <div
        className={`border rounded-lg overflow-hidden bg-black/70 ${disabled ? "opacity-40" : ""}`}
      >
        <video
          ref={videoRef}
          className="w-full h-48 object-cover"
          muted
          playsInline
        />
      </div>
      {scanMessage && <p className="text-xs text-green-600">{scanMessage}</p>}
      {scanError && <p className="text-xs text-red-600">{scanError}</p>}
      {loading && <p className="text-sm text-gray-600">Buscando trabajador…</p>}
      {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}
      {selected && (
        <div className="bg-gray-50 border rounded p-3 text-sm space-y-1">
          <div>
            <strong>Nombre:</strong> {selected.nombre}
          </div>
          <div>
            <strong>Identificación:</strong> {selected.identificacion ?? "-"}
          </div>
          <div>
            <strong>Grupo:</strong> {selected.grupo ?? "-"}
          </div>
          <div>
            <strong>Turno:</strong> {selected.turno ?? "-"}
          </div>
          <div>
            <strong>Estado:</strong> {selected.estado ?? "-"}
          </div>
        </div>
      )}
    </div>
  );
}
