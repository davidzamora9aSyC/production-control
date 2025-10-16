const DATE_REGEX = /(\d{2})\/(\d{2})\/(\d{4})/;

const normalizeText = (text) => text.replace(/\r/g, "");

const parseDate = (raw) => {
  const match = DATE_REGEX.exec(raw || "");
  if (!match) return null;
  const [, d, m, y] = match;
  const iso = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
  return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
};

const extractNumero = (lines) => {
  for (const line of lines) {
    const match = line.match(/ORDEN\s+DE\s+PRODUCCION\s+No\.\s*(\d+)/i);
    if (match) return match[1].trim();
  }
  return null;
};

const extractProducto = (lines) => {
  for (const line of lines) {
    if (!line.includes("PRODUCTO:")) continue;
    const match = line.split("PRODUCTO:")[1];
    if (!match) continue;

    const codeMatch = match.trim().split(/\s+/)[0];
    if (codeMatch) return codeMatch.trim();
  }
  return null;
};

const extractFechasYCantidad = (lines) => {
  for (const line of lines) {
    if (!line.includes("FECHA ORDEN")) continue;
    const match = line.match(/FECHA\s+ORDEN:\s*(\d{2}\/\d{2}\/\d{4})\s+([\d.,]+)\s+(\d{2}\/\d{2}\/\d{4})/);
    if (!match) continue;

    const [, fechaOrdenRaw, cantidadRaw, fechaVencRaw] = match;
    const cantidad = Number(cantidadRaw.replace(",", "."));
    return {
      fechaOrden: parseDate(fechaOrdenRaw),
      fechaVencimiento: parseDate(fechaVencRaw),
      cantidad: Number.isFinite(cantidad) ? cantidad : null,
    };
  }
  return { fechaOrden: null, fechaVencimiento: null, cantidad: null };
};

const extractPasos = (lines, cantidadFallback = null) => {
  const procesosIdx = lines.findIndex((l) => l.toUpperCase().includes("PROCESOS"));
  if (procesosIdx === -1) return [];

  const pasos = [];
  for (let i = procesosIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    if (/PREPARADO\s+POR/i.test(line)) break;
    if (/^-+\s*$/.test(line)) continue;

    const trimmed = line.trim();
    const processMatch = trimmed.match(/^(\d{1,3})\s+(.+)/);
    if (!processMatch) continue;

    const numeroPaso = parseInt(processMatch[1], 10);
    if (!Number.isFinite(numeroPaso)) continue;

    const resto = processMatch[2];
    const nombre = resto.split(/\s{2,}/)[0].trim();
    if (!nombre) continue;

    pasos.push({
      numeroPaso,
      nombre,
      cantidadRequerida: cantidadFallback,
      cantidadProducida: 0,
    });
  }

  return pasos;
};

export function parseOrdenProduccionTxt(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Archivo inválido: contenido vacío");
  }

  const normalized = normalizeText(rawText);
  const lines = normalized.split("\n");

  const numero = extractNumero(lines);
  const producto = extractProducto(lines);
  const { fechaOrden, fechaVencimiento, cantidad } = extractFechasYCantidad(lines);

  if (!numero) throw new Error("No se encontró el número de orden en el archivo");
  if (!producto) throw new Error("No se encontró el código de producto en el archivo");
  if (!fechaOrden) throw new Error("No se encontró la fecha de la orden en el archivo");
  if (!fechaVencimiento) throw new Error("No se encontró la fecha de vencimiento en el archivo");
  if (!Number.isFinite(cantidad)) throw new Error("No se encontró la cantidad a producir en el archivo");

  const pasosBase = extractPasos(lines, cantidad);
  if (pasosBase.length === 0) throw new Error("No se encontraron procesos en el archivo");

  const pasos = pasosBase.map((p, idx) => {
    const numeroPaso = Number.isFinite(p.numeroPaso) ? p.numeroPaso : idx + 1;
    return {
      nombre: p.nombre,
      codigoInterno: `PASO-${String(numeroPaso).padStart(3, "0")}`,
      cantidadRequerida: Number.isFinite(p.cantidadRequerida) ? p.cantidadRequerida : cantidad,
      cantidadProducida: 0,
      cantidadPedaleos: undefined,
      estado: "pendiente",
      numeroPaso,
    };
  });

  return [
    {
      numero,
      producto,
      cantidadAProducir: cantidad,
      fechaOrden,
      fechaVencimiento,
      pasos,
    },
  ];
}

export default parseOrdenProduccionTxt;
