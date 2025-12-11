import { useState } from "react";
import QRCode from "qrcode";

const WIFI_SECURITY = "WPA";
const WIFI_HIDDEN = "false";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

async function buildCredentialImage({ ssid, password, qr }) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 30px Arial";
  ctx.fillText("QR WiFi para tolva", 32, 60);
  ctx.font = "18px Arial";
  ctx.fillStyle = "#4b5563";
  ctx.fillText(`SSID: ${ssid}`, 32, 100);
  ctx.fillText(`Contraseña: ${password}`, 32, 130);
  ctx.fillText(`Seguridad: ${WIFI_SECURITY}`, 32, 160);

  const qrImg = await loadImage(qr);
  ctx.drawImage(qrImg, 95, 200, 450, 450);

  return canvas.toDataURL("image/png");
}

const buildWifiPayload = (ssid, password) =>
  `WIFI:T:${WIFI_SECURITY};P:${password};S:${ssid};H:${WIFI_HIDDEN};`;

export default function WifiQrGenerator() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");

  const puedeGenerar = ssid.trim().length > 0 && password.trim().length > 0 && !generando;

  const handleAction = async (accion) => {
    if (!puedeGenerar) return;
    setGenerando(true);
    setError("");
    try {
      const cleanSsid = ssid.trim();
      const cleanPassword = password.trim();
      const payload = buildWifiPayload(cleanSsid, cleanPassword);
      const qrUrl = await QRCode.toDataURL(payload, { margin: 1 });
      if (accion === "descargar") {
        const dataUrl = await buildCredentialImage({ ssid: cleanSsid, password: cleanPassword, qr: qrUrl });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `wifi_${cleanSsid}.png`;
        link.click();
      } else if (accion === "imprimir") {
        const html = `
          <div style="font-family:Arial,sans-serif;padding:24px;text-align:center">
            <h1>QR de WiFi</h1>
            <p style="margin:4px 0;font-size:18px;">SSID: ${cleanSsid}</p>
            <p style="margin:4px 0;font-size:18px;">Contraseña: ${cleanPassword}</p>
            <p style="margin:4px 0;font-size:16px;">Seguridad: ${WIFI_SECURITY} · Oculta: ${WIFI_HIDDEN}</p>
            <img src="${qrUrl}" alt="QR WiFi" style="width:320px;height:320px;margin-top:16px" />
          </div>
        `;
        const ventana = window.open("", "_blank", "width=900,height=600");
        if (!ventana) throw new Error("No se pudo abrir la ventana para imprimir");
        ventana.document.write(html);
        ventana.document.title = `Credenciales WiFi ${cleanSsid}`;
        ventana.focus();
        ventana.print();
        ventana.close();
      }
    } catch (err) {
      console.error("Error generando identificadores WiFi:", err);
      setError("No se pudo generar los QR, intenta nuevamente.");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="border rounded-xl p-6 shadow-sm bg-white space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-800">QR de red WiFi</h3>
        <p className="text-sm text-gray-600">
          Ingresa el usuario (SSID) y la contraseña. Se generará un único QR con la sintaxis estándar WIFI:... usando seguridad
          WPA y con la red marcada como visible (H:false).
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario / Nombre de red</label>
          <input
            type="text"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Ej. RedWifi3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Escribe la clave"
          />
        </div>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!puedeGenerar}
          onClick={() => handleAction("descargar")}
          className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm disabled:opacity-50"
        >
          {generando ? "Generando..." : "Descargar QR"}
        </button>
        <button
          type="button"
          disabled={!puedeGenerar}
          onClick={() => handleAction("imprimir")}
          className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm disabled:opacity-50"
        >
          {generando ? "Preparando..." : "Imprimir"}
        </button>
      </div>
    </div>
  );
}
