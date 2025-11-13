const DATE_REGEX = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
const DATE_REGEX_GLOBAL = new RegExp(DATE_REGEX.source, "g");

const normalizeText = (text) => (text || "")
  .replace(/\r/g, "\n")
  .replace(/\u00a0/g, " ")
  .replace(/\t/g, " ");

const sanitizeLine = (line) => (line || "")
  .replace(/,/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const parseDate = (raw) => {
  const match = DATE_REGEX.exec(raw || "");
  if (!match) return null;
  const [, d, m, y] = match;
  const day = d.padStart(2, "0");
  const month = m.padStart(2, "0");
  const iso = new Date(`${y}-${month}-${day}T00:00:00.000Z`);
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
    if (!/PRODUCTO/i.test(line)) continue;
    const match = line.replace(/PRODUCTO\s*[:-]?/i, "").trim();
    if (!match) continue;
    const code = match.split(/\s+/)[0];
    if (code) return code.trim();
  }
  return null;
};

const pickDatesFromLine = (line) => {
  const matches = line.match(DATE_REGEX_GLOBAL) || [];
  return matches.map((date) => parseDate(date));
};

const findNthDate = (lines, n) => {
  const collected = [];
  for (const line of lines) {
    const matches = line.match(DATE_REGEX_GLOBAL) || [];
    matches.forEach((m) => collected.push(parseDate(m)));
    if (collected.length > n) break;
  }
  return collected[n] || null;
};

const parseCantidad = (raw) => {
  if (!raw) return null;
  const trimmed = raw.replace(/\s+/g, "");
  const hasComma = trimmed.includes(",");
  const hasDot = trimmed.includes(".");
  let sanitized = trimmed;
  if (hasComma && hasDot) {
    if (trimmed.lastIndexOf(",") > trimmed.lastIndexOf(".")) {
      sanitized = trimmed.replace(/\./g, "").replace(/,/g, ".");
    } else {
      sanitized = trimmed.replace(/,/g, "");
    }
  } else if (hasComma) {
    sanitized = trimmed.replace(/,/g, ".");
  }
  const num = Number(sanitized);
  return Number.isFinite(num) ? num : null;
};

const extractFechasYCantidad = (lines) => {
  const result = { fechaOrden: null, fechaVencimiento: null, cantidad: null };

  const fechaOrdenLinea = lines.find((line) => /FECHA\s+ORDEN/i.test(line));
  if (fechaOrdenLinea) {
    const fechasLinea = pickDatesFromLine(fechaOrdenLinea);
    if (fechasLinea[0]) result.fechaOrden = fechasLinea[0];
    if (fechasLinea[1] && !result.fechaVencimiento) {
      result.fechaVencimiento = fechasLinea[1];
    }
    const cantidadMatch = fechaOrdenLinea.match(/CANT[.\s]*(?:IDA)?\s*(?:A\s+)?PRODUCIR[^0-9]*([\d.,]+)/i);
    if (cantidadMatch) {
      const cantidad = parseCantidad(cantidadMatch[1]);
      if (Number.isFinite(cantidad)) result.cantidad = cantidad;
    }
  }

  if (!result.fechaVencimiento) {
    const lineaVenc = lines.find((line) => /FECHA\s+(VENT|VENC)/i.test(line));
    if (lineaVenc) {
      const [fecha] = pickDatesFromLine(lineaVenc);
      if (fecha) result.fechaVencimiento = fecha;
    }
  }

  if (!Number.isFinite(result.cantidad)) {
    const lineaCantidad = lines.find((line) => /CANT[.\s]*(?:IDAD)?\s*(?:A\s+)?PRODUCIR/i.test(line));
    if (lineaCantidad) {
      const cantidadMatch = lineaCantidad.match(/CANT[.\s]*(?:IDAD)?\s*(?:A\s+)?PRODUCIR[^0-9]*([\d.,]+)/i);
      if (cantidadMatch) {
        const cantidad = parseCantidad(cantidadMatch[1]);
        if (Number.isFinite(cantidad)) result.cantidad = cantidad;
      }
    }
  }

  if (!result.fechaOrden) result.fechaOrden = findNthDate(lines, 0);
  if (!result.fechaVencimiento) result.fechaVencimiento = findNthDate(lines, 1);

  return result;
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
    const nombre = resto.trim();
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
  const rawLines = normalized.split("\n");
  const lines = rawLines.map(sanitizeLine).filter(Boolean);

  if (lines.length === 0) {
    throw new Error("Archivo inválido: no contiene información utilizable");
  }

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
