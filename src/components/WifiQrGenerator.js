import { useState } from "react";
import QRCode from "qrcode";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

async function buildCredentialImage({ ssid, password, ssidQr, passwordQr }) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 420;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 28px Arial";
  ctx.fillText("Credenciales WiFi", 32, 48);

  const [ssidImg, passwordImg] = await Promise.all([loadImage(ssidQr), loadImage(passwordQr)]);

  const blockWidth = 400;
  const blockHeight = 320;
  const startY = 90;

  const drawBlock = ({ title, value, image, offsetX }) => {
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(offsetX, startY, blockWidth, blockHeight);
    ctx.strokeStyle = "#d1d5db";
    ctx.strokeRect(offsetX, startY, blockWidth, blockHeight);

    ctx.fillStyle = "#374151";
    ctx.font = "bold 20px Arial";
    ctx.fillText(title, offsetX + 20, startY + 35);
    ctx.font = "16px Arial";
    ctx.fillText(value, offsetX + 20, startY + 60);
    ctx.drawImage(image, offsetX + 75, startY + 80, 250, 250);
  };

  drawBlock({ title: "Nombre de red", value: ssid, image: ssidImg, offsetX: 40 });
  drawBlock({ title: "Contraseña", value: password, image: passwordImg, offsetX: 460 });

  return canvas.toDataURL("image/png");
}

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
      const [ssidQr, passwordQr] = await Promise.all([
        QRCode.toDataURL(ssid.trim(), { margin: 1 }),
        QRCode.toDataURL(password.trim(), { margin: 1 }),
      ]);
      if (accion === "descargar") {
        const dataUrl = await buildCredentialImage({ ssid: ssid.trim(), password: password.trim(), ssidQr, passwordQr });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `wifi_${ssid.trim()}.png`;
        link.click();
      } else if (accion === "imprimir") {
        const html = `
          <div style="font-family:Arial,sans-serif;padding:24px;text-align:center">
            <h1>Credenciales WiFi</h1>
            <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:16px">
              <div style="border:1px solid #d1d5db;border-radius:12px;padding:16px;width:280px;">
                <h2 style="margin-bottom:8px;">Nombre de red</h2>
                <p style="margin:0 0 12px 0">${ssid.trim()}</p>
                <img src="${ssidQr}" alt="QR SSID" style="width:230px;height:230px" />
              </div>
              <div style="border:1px solid #d1d5db;border-radius:12px;padding:16px;width:280px;">
                <h2 style="margin-bottom:8px;">Contraseña</h2>
                <p style="margin:0 0 12px 0">${password.trim()}</p>
                <img src="${passwordQr}" alt="QR Password" style="width:230px;height:230px" />
              </div>
            </div>
          </div>
        `;
        const ventana = window.open("", "_blank", "width=900,height=600");
        if (!ventana) throw new Error("No se pudo abrir la ventana para imprimir");
        ventana.document.write(html);
        ventana.document.title = `Credenciales WiFi ${ssid.trim()}`;
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
        <h3 className="text-xl font-semibold text-gray-800">Credenciales para tolva</h3>
        <p className="text-sm text-gray-600">
          Ingresa el usuario (SSID) y la contraseña de la red WiFi. Podrás descargar o imprimir un archivo que contiene los
          dos códigos QR identificados.
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
