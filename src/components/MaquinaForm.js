import { useState, useEffect } from "react";
import { API_BASE_URL, apiFetch } from "../api";
import { useAreas } from "../context/AreasContext";

const TIPOS_MAQUINA_FALLBACK = [
  { value: "troqueladora", label: "Troqueladora" },
  { value: "taladro", label: "Taladro" },
  { value: "horno", label: "Horno" },
  { value: "vulcanizadora", label: "Vulcanizadora" },
  { value: "soldadura", label: "Soldadura" },
  { value: "prensa_hidraulica", label: "Prensa Hidráulica" },
  { value: "soldadura_mig", label: "Soldadura MIG" },
  { value: "soldadura_punto", label: "Soldadura punto" },
  { value: "selladora", label: "Selladora" },
  { value: "avellanadora", label: "Avellanadora" },
];

export default function MaquinaForm({ onSave, onClose, equipo, modo, onError }) {
  const [form, setForm] = useState({
    codigo: equipo?.codigo || "",
    nombre: equipo?.nombre || "",
    tipo: equipo?.tipo || TIPOS_MAQUINA_FALLBACK[0].value,
    ubicacion: equipo?.ubicacion || "",
    fechaInstalacion: equipo?.fechaInstalacion || "",
    observaciones: equipo?.observaciones || "",
    areaId: equipo?.areaId || equipo?.area?.id || ""
  });
  const [tiposMaquina, setTiposMaquina] = useState(TIPOS_MAQUINA_FALLBACK);

  const { areas, error: areasError } = useAreas();

  // Propagar error de áreas al consumidor como ocurría con el fetch local
  // (solo la primera vez que aparezca un error)
  const [areasNotified, setAreasNotified] = useState(false);
  useEffect(() => {
    if (!areasNotified && areasError) {
      onError && onError(areasError);
      setAreasNotified(true);
    }
  }, [areasError, areasNotified, onError]);

  useEffect(() => {
    let cancelado = false;

    apiFetch(`${API_BASE_URL}/maquinas/tipos`)
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudieron cargar los tipos de máquina");
        return res.json();
      })
      .then((tipos) => {
        if (!cancelado && Array.isArray(tipos) && tipos.length > 0) {
          setTiposMaquina(tipos);
          setForm((prev) => {
            if (prev.tipo) return prev;
            return { ...prev, tipo: tipos[0].value };
          });
        }
      })
      .catch((err) => {
        console.error("Error al cargar tipos de máquina:", err);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const esEdicion = modo === 'editar';
    const codigoNormalizado = (form.codigo ?? '').trim();
    if (!esEdicion && !codigoNormalizado) {
      onError && onError('El código es obligatorio');
      return;
    }
    if (!form.areaId) {
      onError && onError("Debes seleccionar un área");
      return;
    }
    const method = modo === 'editar' ? 'PUT' : 'POST';
    const url = modo === 'editar' ? `${API_BASE_URL}/maquinas/${equipo.id}` : `${API_BASE_URL}/maquinas`;

    const formLimpio = { ...form };
    if (esEdicion) {
      delete formLimpio.codigo;
    } else {
      formLimpio.codigo = codigoNormalizado;
    }
    delete formLimpio.createdAt;
    delete formLimpio.updatedAt;
    delete formLimpio.estado;

    console.log("Enviando datos:", formLimpio);

    apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formLimpio)
    })
    .then(async res => {
      if (!res.ok) {
        let errorMsg = "Error al guardar";
        try {
          const errData = await res.json();
          if (errData?.message) {
            if (Array.isArray(errData.message)) {
              errorMsg = errData.message.join(", ");
            } else {
              errorMsg = errData.message;
            }
          }
        } catch {}
        throw new Error(errorMsg);
      }
      return res.json();
    })
    .then(onSave)
    .catch(err => {
      console.error("Error al guardar máquina:", err);
      onError && onError(err.message || "Error al guardar máquina");
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{modo === 'editar' ? "Editar máquina" : "Registrar máquina"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label>Código</label>
          <input name="codigo" placeholder="Código" value={form.codigo} onChange={handleChange} className="border px-3 py-2 rounded" required disabled={modo === 'editar'} />
          <label>Nombre de la máquina</label>
          <input name="nombre" placeholder="Nombre de la máquina" value={form.nombre} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <label>Tipo</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} className="border px-3 py-2 rounded" required>
            {tiposMaquina.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
          <label>Área</label>
          <select name="areaId" value={form.areaId} onChange={handleChange} className="border px-3 py-2 rounded" required>
            <option value="" disabled>Selecciona un área</option>
            {areas.map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
          <label>Ubicación</label>
          <input name="ubicacion" placeholder="Ubicación" value={form.ubicacion} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <label>Fecha de instalación</label>
          <input type="date" name="fechaInstalacion" value={form.fechaInstalacion} onChange={handleChange} className="border px-3 py-2 rounded" required />
          <label>Observaciones</label>
          <textarea name="observaciones" placeholder="Observaciones" value={form.observaciones} onChange={handleChange} className="border px-3 py-2 rounded" rows={3} />
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {modo === 'editar' ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
