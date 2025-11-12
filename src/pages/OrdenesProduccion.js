import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import ModalCargarCSV from "../components/ModalCargarCSV";
import { API_BASE_URL } from "../api";
import parseOrdenProduccionTxt from "../utils/parseOrdenProduccionTxt";

const ITEMS_POR_PAGINA = 8;

export default function OrdenesProduccion() {
  const [pagina, setPagina] = useState(1);
  const [tipo, setTipo] = useState("actuales");
  const [mostrarCargarOrden, setMostrarCargarOrden] = useState(false);
  const [ordenes, setOrdenes] = useState([]);
  const [respuestaCarga, setRespuestaCarga] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/ordenes`)
      .then(res => res.json())
      .then(setOrdenes)
      .catch(err => console.error("Error al obtener órdenes:", err));
  }, []);

  const totalPaginas = Math.ceil(ordenes.length / ITEMS_POR_PAGINA);
  const mostrar = ordenes.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);

  const generarCSV = () => {
    const headers = ["Número", "Producto", "Cantidad", "Fecha Orden", "Fecha Vencimiento", "Estado"];
    const rows = mostrar.map(item => [
      item.numero,
      item.producto,
      item.cantidadAProducir,
      item.fechaOrden,
      item.fechaVencimiento,
      item.estado,
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordenes_pagina_${pagina}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const construirCsvDesdeOrdenes = (ordenesParsed) => {
    const headers = ["numero", "producto", "cantidadAProducir", "fechaOrden", "fechaVencimiento", "nombre", "codigoInterno", "cantidadRequerida", "cantidadProducida", "estadoPaso", "numeroPaso"];
    const rows = ordenesParsed.flatMap(orden => {
      const base = [orden.numero, orden.producto, orden.cantidadAProducir, orden.fechaOrden, orden.fechaVencimiento];
      return (orden.pasos || []).map(paso => [
        ...base,
        paso.nombre,
        paso.codigoInterno || "",
        paso.cantidadRequerida ?? orden.cantidadAProducir,
        paso.cantidadProducida ?? 0,
        paso.estado ?? "pendiente",
        paso.numeroPaso ?? ""
      ]);
    });
    if (rows.length === 0) return null;
    return [headers, ...rows].map(cols => cols.map(col => `"${String(col ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  };

  const descargarCsvOrdenes = (ordenesParsed, nombreArchivo = "ordenes_parseadas.csv") => {
    const contenido = construirCsvDesdeOrdenes(ordenesParsed);
    if (!contenido) return;
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const construirOrdenesDesdeCsv = (texto) => {
    const filas = texto.split(/\r?\n/).map(f => f.trim()).filter(Boolean);
    if (filas.length <= 1) {
      throw new Error("El archivo CSV no contiene datos");
    }
    const headers = filas[0].split(',').map(h => h.trim());
    const idx = h => headers.indexOf(h);

    const data = filas.slice(1).map((f, i) => {
      const v = f.split(',').map(x => x.trim());
      const numero = v[idx('numero')];
      const producto = v[idx('producto')];
      const cantidadAProducir = parseInt(v[idx('cantidadAProducir')], 10);
      const fechaOrden = new Date(v[idx('fechaOrden')]);
      const fechaVencimiento = new Date(v[idx('fechaVencimiento')]);
      const nombre = v[idx('nombre')];
      const codigoInterno = v[idx('codigoInterno')];
      const cantidadRequerida = parseInt(v[idx('cantidadRequerida')], 10);
      const cantidadProducida = idx('cantidadProducida') >= 0 && v[idx('cantidadProducida')] !== '' ? parseInt(v[idx('cantidadProducida')], 10) : 0;
      const cantidadPedaleos = idx('cantidadPedaleos') >= 0 && v[idx('cantidadPedaleos')] !== '' ? parseInt(v[idx('cantidadPedaleos')], 10) : undefined;
      const estadoPaso = idx('estadoPaso') >= 0 ? v[idx('estadoPaso')] : 'pendiente';
      const numeroPasoValor = idx('numeroPaso') >= 0 && v[idx('numeroPaso')] !== '' ? parseInt(v[idx('numeroPaso')], 10) : undefined;

      return {
        linea: i + 2,
        numero,
        producto,
        cantidadAProducir,
        fechaOrden,
        fechaVencimiento,
        nombre,
        codigoInterno,
        cantidadRequerida,
        cantidadProducida,
        cantidadPedaleos,
        estadoPaso,
        numeroPaso: numeroPasoValor,
      };
    });

    const pasosAgrupados = {};
    for (const fila of data) {
      if (!pasosAgrupados[fila.numero]) {
        pasosAgrupados[fila.numero] = {
          numero: fila.numero,
          producto: fila.producto,
          cantidadAProducir: fila.cantidadAProducir,
          fechaOrden: fila.fechaOrden,
          fechaVencimiento: fila.fechaVencimiento,
          pasos: []
        };
      }
      pasosAgrupados[fila.numero].pasos.push({
        nombre: fila.nombre,
        codigoInterno: fila.codigoInterno,
        cantidadRequerida: fila.cantidadRequerida,
        cantidadProducida: fila.cantidadProducida,
        cantidadPedaleos: fila.cantidadPedaleos,
        estado: fila.estadoPaso || 'pendiente',
        numeroPaso: (typeof fila.numeroPaso === 'number' && !Number.isNaN(fila.numeroPaso)) ? fila.numeroPaso : (pasosAgrupados[fila.numero].pasos.length + 1)
      });
    }

    return Object.values(pasosAgrupados).map(o => ({
      numero: o.numero,
      producto: o.producto,
      cantidadAProducir: o.cantidadAProducir,
      fechaOrden: o.fechaOrden.toISOString(),
      fechaVencimiento: o.fechaVencimiento.toISOString(),
      pasos: o.pasos
    }));
  };

  const construirOrdenesDesdeExcel = async (archivoExcel) => {
    const buffer = await archivoExcel.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    if (!workbook.SheetNames.length) {
      throw new Error("El archivo Excel no contiene hojas.");
    }
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(hoja, { blankrows: false });
    if (!csv.trim()) {
      throw new Error("El archivo Excel está vacío.");
    }
    return construirOrdenesDesdeCsv(csv);
  };

  const onUpload = async (archivo) => {
    const loading = document.createElement("div");
    loading.textContent = "Cargando órdenes...";
    loading.className = "fixed top-0 left-0 w-full h-full bg-white bg-opacity-80 flex justify-center items-center text-2xl";
    loading.id = "cargando-ordenes";
    document.body.appendChild(loading);
    let ordenes = [];
    const extension = archivo.name.split(".").pop()?.toLowerCase();
    let descargarCsvNombre = archivo.name.replace(/\.[^.]+$/, "") + "-parseado.csv";

    try {
      if (extension === "txt") {
        const texto = await archivo.text();
        ordenes = parseOrdenProduccionTxt(texto);
        descargarCsvOrdenes(ordenes, descargarCsvNombre);
      } else if (extension === "xlsx" || extension === "xls") {
        ordenes = await construirOrdenesDesdeExcel(archivo);
      } else if (extension === "csv") {
        const texto = await archivo.text();
        ordenes = construirOrdenesDesdeCsv(texto);
      } else {
        throw new Error("Formato no soportado. Usa archivos TXT, CSV, XLS o XLSX.");
      }

      for (const orden of ordenes) {
        const res = await fetch(`${API_BASE_URL}/ordenes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(orden) });
        const text = await res.text();
        if (!res.ok) throw new Error(`${res.status} ${text}`);
      }
      setRespuestaCarga({ ok: true });
    } catch (e) {
      console.error("Error al cargar órdenes:", e);
      const mensaje = e?.message || "Error al cargar órdenes";
      setRespuestaCarga({ ok: false, mensaje });
    } finally {
      document.body.removeChild(loading);
    }
  };

  return (
    <div className="bg-white h-screen overflow-hidden animate-slideLeft">
      <div className="px-20 pt-10">
        <button
          onClick={() => navigate("/dashboard", { state: { entradaReturn: true } })}
          className="text-blue-600 text-xl mb-4 hover:underline"
        >
          &larr; Volver
        </button>

        <div className="flex justify-between items-center mb-6">
          <div className="text-3xl font-semibold">Órdenes de Producción</div>
          <div className="flex items-center">
            <button
              className="bg-blue-600 text-white text-2xl px-4 py-1 rounded-full"
              onClick={() => setMostrarCargarOrden(true)}
            >
              +
            </button>
            <button
              className="bg-gray-300 text-black text-base px-4 py-1 rounded-full ml-4"
              onClick={generarCSV}
            >
              Generar reporte
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-4 text-base py-4 items-center">
          <select value={tipo} onChange={e => setTipo(e.target.value)} className="border px-3 py-2 rounded">
            <option value="actuales">Actuales</option>
            <option value="pasadas">Pasadas</option>
          </select>
          {tipo === "pasadas" && (
            <>
              <label>De <input type="date" className="ml-1 border px-2 py-1 rounded" defaultValue="2024-01-01" /></label>
              <label>A <input type="date" className="ml-1 border px-2 py-1 rounded" defaultValue="2024-12-01" /></label>
            </>
          )}
        </div>

        <div className="overflow-x-auto border rounded-xl shadow-md">
          <table className="min-w-max w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 border-r">Número</th>
                <th className="px-4 py-2 border-r">Producto</th>
                <th className="px-4 py-2 border-r">Cantidad</th>
                <th className="px-4 py-2 border-r">Fecha Orden</th>
                <th className="px-4 py-2 border-r">Fecha Vencimiento</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {mostrar.map((item, i) => (
                <tr key={i} className="border-b cursor-pointer" onClick={() => navigate(`/ordenes/${item.id || item.numero}`)}>
                  <td className="px-4 py-2 border-r">{item.numero}</td>
                  <td className="px-4 py-2 border-r">{item.producto}</td>
                  <td className="px-4 py-2 border-r">{item.cantidadAProducir}</td>
                  <td className="px-4 py-2 border-r">{new Date(item.fechaOrden).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border-r">{new Date(item.fechaVencimiento).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{item.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Anterior</button>
          <span className="px-3 py-1">{pagina} / {totalPaginas}</span>
          <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} className="px-3 py-1 border rounded">Siguiente</button>
        </div>
      </div>
      {mostrarCargarOrden && (
        <ModalCargarCSV
          titulo="Cargar nueva orden"
          onClose={() => setMostrarCargarOrden(false)}
          onUpload={onUpload}
        />
      )}
      {respuestaCarga && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded shadow-md text-center max-w-md">
            <p className="text-lg font-semibold mb-4">
              {respuestaCarga.ok ? (
                <>
                  Órdenes cargadas exitosamente. Las órdenes se crean en estado <strong>pendiente</strong> y pasarán a <strong>en producción</strong> cuando el operario escanee la orden.
                </>
              ) : (
                respuestaCarga.mensaje || "Error al cargar órdenes"
              )}
            </p>
            <button onClick={() => { setRespuestaCarga(null); window.location.reload(); }} className="bg-blue-600 text-white px-4 py-2 rounded">
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
